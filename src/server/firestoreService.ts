import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { App } from 'firebase-admin/app';

export interface UserProfileDoc {
  uid: string;
  displayName: string;
  email?: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  assignedGrades: number[];
  createdAt: string;
  updatedAt: string;
}

export interface TeachingMaterialDoc {
  id: string;
  ownerUid: string;
  ownerName?: string;
  title: string;
  fileName: string;
  mimeType: string;
  storagePath: string;
  fileSize: number;
  grade: 3 | 4 | 5;
  subject: string;
  topic?: string;
  relatedLessonName?: string;
  description?: string;
  processingStatus: 'PENDING' | 'PROCESSED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface LearningPlanDoc {
  id: string;
  ownerUid: string;
  materialId: string;
  title: string;
  grade: 3 | 4 | 5;
  subject: string;
  learningObjectives: string[];
  keyKnowledge: string[];
  sections: any[];
  status: 'draft' | 'approved' | 'archived';
  version: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface LessonDoc {
  id: string;
  ownerUid: string;
  learningPlanId?: string;
  title: string;
  grade: 3 | 4 | 5;
  subject: string;
  content: any;
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface LearningResultDoc {
  id: string;
  lessonId: string;
  activityId: string;
  studentUid: string;
  studentName?: string;
  grade: 3 | 4 | 5;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  attemptNumber: number;
  completedAt: string;
}

export interface StorageMetadata {
  _persisted: boolean;
  _storageEngine: 'FIRESTORE' | 'IN_MEMORY_CACHE';
  _isMemoryVolatile?: boolean;
  _warning?: string;
}

export type StoredEntity<T> = T & StorageMetadata;

export interface LastWriteStatus {
  success: boolean;
  target: 'FIRESTORE' | 'IN_MEMORY_CACHE';
  collection: string;
  docId: string;
  error?: string;
  warning?: string;
  timestamp: string;
}

export interface DiagnosticResult {
  success: boolean;
  step: 'INITIALIZE' | 'PING' | 'WRITE' | 'READ' | 'CLEANUP' | 'COMPLETED';
  docId?: string;
  readData?: any;
  durationMs: number;
  error?: string;
  errorCategory?: 'PERMISSION_DENIED_IAM' | 'DATABASE_NOT_FOUND' | 'API_NOT_ENABLED' | 'PROJECT_MISMATCH' | 'NETWORK_ERROR' | 'UNKNOWN';
  callerIdentity?: string;
}

class FirestoreRepository {
  private db: Firestore | null = null;
  private isConnectedToLiveFirestore: boolean = false;
  private connectionErrorReason: string | null = null;
  private connectionErrorCategory: string | null = null;
  private lastWriteStatus: LastWriteStatus | null = null;

  // In-memory fallback caches để bảo toàn dữ liệu khi Cloud Firestore chưa sẵn sàng
  private localUsers = new Map<string, UserProfileDoc>();
  private localMaterials = new Map<string, TeachingMaterialDoc>();
  private localPlans = new Map<string, LearningPlanDoc>();
  private localLessons = new Map<string, LessonDoc>();
  private localResults = new Map<string, LearningResultDoc>();

  private callerIdentity: string | null = null;
  private isPlatformSandboxWorker: boolean = false;

  public async initialize(adminApp: App) {
    try {
      this.db = getFirestore(adminApp);
      await this.detectRuntimeIdentity();
      await this.checkLiveConnection();
    } catch (err: any) {
      console.warn('[Firestore Service] Không thể khởi tạo Firestore client:', err.message);
      this.connectionErrorReason = err.message;
      this.connectionErrorCategory = 'UNKNOWN';
    }
  }

  public async detectRuntimeIdentity(): Promise<string | null> {
    if (process.env.FIREBASE_CLIENT_EMAIL) {
      this.callerIdentity = process.env.FIREBASE_CLIENT_EMAIL;
      this.isPlatformSandboxWorker = false;
      return this.callerIdentity;
    }
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        if (parsed.client_email && typeof parsed.client_email === 'string') {
          this.callerIdentity = parsed.client_email;
          this.isPlatformSandboxWorker = false;
          return this.callerIdentity;
        }
      } catch {
        // ignore
      }
    }
    // Kiểm tra Metadata Server của Google Cloud / Cloud Run container
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email', {
        headers: { 'Metadata-Flavor': 'Google' },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const email = (await res.text()).trim();
        this.callerIdentity = email;
        this.isPlatformSandboxWorker = email.includes('ais-sandbox');
        return email;
      }
    } catch {
      // metadata server không phản hồi
    }
    this.callerIdentity = 'Chưa xác định (Không có Service Account Key và không có Metadata Server)';
    return this.callerIdentity;
  }

  public classifyError(err: any): { reason: string; category: DiagnosticResult['errorCategory'] } {
    const msg = String(err?.message || '');
    const code = err?.code;

    if (msg.includes('Cloud Firestore API has not been used') || msg.includes('serviceusage.googleapis.com')) {
      return {
        category: 'API_NOT_ENABLED',
        reason: 'Cloud Firestore API chưa được kích hoạt trên Google Cloud Console cho dự án.',
      };
    }
    if (msg.includes('The database (default) does not exist') || (code === 5 && msg.includes('database'))) {
      return {
        category: 'DATABASE_NOT_FOUND',
        reason: 'Cơ sở dữ liệu Firestore (default) chưa được tạo trên Firebase Console.',
      };
    }
    if (code === 5 && (msg.includes('project') || msg.includes('Project'))) {
      return {
        category: 'PROJECT_MISMATCH',
        reason: 'Project ID không khớp hoặc không tìm thấy trên Google Cloud.',
      };
    }
    if (code === 7 || msg.includes('PERMISSION_DENIED')) {
      return {
        category: 'PERMISSION_DENIED_IAM',
        reason: 'Lỗi quyền truy cập (PERMISSION_DENIED - Mã lỗi 7): Danh tính thực thi của Backend chưa được cấp quyền IAM (Cloud Datastore User) trong dự án Firestore.',
      };
    }
    if (code === 14 || msg.includes('UNAVAILABLE') || msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED')) {
      return {
        category: 'NETWORK_ERROR',
        reason: 'Lỗi mạng hoặc dịch vụ Cloud Firestore tạm thời không sẵn sàng (UNAVAILABLE).',
      };
    }
    return {
      category: 'UNKNOWN',
      reason: msg || 'Lỗi kết nối Cloud Firestore không xác định.',
    };
  }

  public async checkLiveConnection(): Promise<boolean> {
    if (!this.db) {
      this.isConnectedToLiveFirestore = false;
      this.connectionErrorReason = 'Chưa khởi tạo Firestore Admin SDK instance.';
      this.connectionErrorCategory = 'UNKNOWN';
      return false;
    }
    try {
      // Ping kiểm tra quyền truy cập Firestore trên Cloud
      const pingRef = this.db.collection('system_check').doc('ping');
      await pingRef.get();
      this.isConnectedToLiveFirestore = true;
      this.connectionErrorReason = null;
      this.connectionErrorCategory = null;
      console.log('[Firestore Service] Đã kết nối thành công tới Cloud Firestore của dự án!');
      return true;
    } catch (err: any) {
      this.isConnectedToLiveFirestore = false;
      const { reason, category } = this.classifyError(err);
      this.connectionErrorReason = reason;
      this.connectionErrorCategory = category || 'UNKNOWN';
      console.info(`[Firestore Service] ${this.connectionErrorReason}. Kích hoạt chế độ đệm RAM dự phòng.`);
      return false;
    }
  }

  /**
   * Chạy bài kiểm thử độc lập: Ghi -> Đọc -> Xóa tài liệu kiểm tra thực tế
   */
  public async runLiveDiagnosticTest(): Promise<DiagnosticResult> {
    const startTime = Date.now();
    if (!this.db) {
      return {
        success: false,
        step: 'INITIALIZE',
        durationMs: Date.now() - startTime,
        error: 'Chưa khởi tạo Firestore Admin SDK.',
        errorCategory: 'UNKNOWN',
      };
    }

    const testId = `probe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const testDocRef = this.db.collection('system_check').doc(testId);

    // Bước 1: Ghi thử nghiệm
    try {
      await testDocRef.set({
        diagnostic: true,
        testId,
        createdAt: new Date().toISOString(),
        note: 'Kiểm thử thao tác ghi trực tiếp từ Express Backend',
      });
    } catch (writeErr: any) {
      const { reason, category } = this.classifyError(writeErr);
      this.lastWriteStatus = {
        success: false,
        target: 'FIRESTORE',
        collection: 'system_check',
        docId: testId,
        error: writeErr.message,
        timestamp: new Date().toISOString(),
      };
      return {
        success: false,
        step: 'WRITE',
        docId: testId,
        durationMs: Date.now() - startTime,
        error: reason,
        errorCategory: category,
        callerIdentity: this.callerIdentity || undefined,
      };
    }

    // Bước 2: Đọc lại thử nghiệm
    let readData: any = null;
    try {
      const snap = await testDocRef.get();
      if (!snap.exists) {
        return {
          success: false,
          step: 'READ',
          docId: testId,
          durationMs: Date.now() - startTime,
          error: 'Tài liệu đã ghi nhưng không đọc lại được (exists: false).',
          errorCategory: 'UNKNOWN',
          callerIdentity: this.callerIdentity || undefined,
        };
      }
      readData = snap.data();
    } catch (readErr: any) {
      const { reason, category } = this.classifyError(readErr);
      return {
        success: false,
        step: 'READ',
        docId: testId,
        durationMs: Date.now() - startTime,
        error: reason,
        errorCategory: category,
        callerIdentity: this.callerIdentity || undefined,
      };
    }

    // Bước 3: Dọn dẹp tài liệu thử nghiệm
    try {
      await testDocRef.delete();
    } catch (delErr: any) {
      console.warn('[Firestore Diagnostic] Cảnh báo: Không thể xóa tài liệu kiểm thử sau khi đọc:', delErr);
    }

    // Ghi nhận trạng thái ghi thành công
    this.isConnectedToLiveFirestore = true;
    this.connectionErrorReason = null;
    this.connectionErrorCategory = null;
    this.lastWriteStatus = {
      success: true,
      target: 'FIRESTORE',
      collection: 'system_check',
      docId: testId,
      timestamp: new Date().toISOString(),
    };

    return {
      success: true,
      step: 'COMPLETED',
      docId: testId,
      readData,
      durationMs: Date.now() - startTime,
      callerIdentity: this.callerIdentity || undefined,
    };
  }

  public getStatus() {
    return {
      connected: this.isConnectedToLiveFirestore,
      reason: this.connectionErrorReason,
      errorCategory: this.connectionErrorCategory,
      engine: this.isConnectedToLiveFirestore ? 'FIRESTORE' : 'IN_MEMORY_CACHE',
      isMemoryVolatile: !this.isConnectedToLiveFirestore,
      lastWriteStatus: this.lastWriteStatus,
      callerIdentity: this.callerIdentity,
      isPlatformSandboxWorker: this.isPlatformSandboxWorker,
      counts: {
        users: this.localUsers.size,
        materials: this.localMaterials.size,
        plans: this.localPlans.size,
        lessons: this.localLessons.size,
        results: this.localResults.size,
      },
    };
  }

  // --- 1. USER PROFILES ---
  public async getUserProfile(uid: string): Promise<StoredEntity<UserProfileDoc> | null> {
    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        const snap = await this.db.collection('users').doc(uid).get();
        if (snap.exists) {
          return {
            ...(snap.data() as UserProfileDoc),
            _persisted: true,
            _storageEngine: 'FIRESTORE',
          };
        }
      } catch (e: any) {
        console.warn('[Firestore] Lỗi đọc user từ Firestore:', e.message);
      }
    }
    const cached = this.localUsers.get(uid);
    if (cached) {
      return {
        ...cached,
        _persisted: false,
        _storageEngine: 'IN_MEMORY_CACHE',
        _isMemoryVolatile: true,
        _warning: 'Dữ liệu đang lấy từ bộ nhớ RAM dự phòng.',
      };
    }
    return null;
  }

  public async saveUserProfile(profile: UserProfileDoc): Promise<StoredEntity<UserProfileDoc>> {
    const updated = { ...profile, updatedAt: new Date().toISOString() };

    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        await this.db.collection('users').doc(profile.uid).set(updated, { merge: true });
        this.lastWriteStatus = {
          success: true,
          target: 'FIRESTORE',
          collection: 'users',
          docId: profile.uid,
          timestamp: new Date().toISOString(),
        };
        return {
          ...updated,
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        };
      } catch (e: any) {
        this.lastWriteStatus = {
          success: false,
          target: 'FIRESTORE',
          collection: 'users',
          docId: profile.uid,
          error: e.message,
          timestamp: new Date().toISOString(),
        };
        throw new Error(`Lưu Firestore thất bại (users/${profile.uid}): ${e.message}`);
      }
    }

    // Khi Firestore chưa kết nối: Lưu vào RAM dự phòng và đánh dấu rõ
    this.localUsers.set(profile.uid, updated);
    this.lastWriteStatus = {
      success: true,
      target: 'IN_MEMORY_CACHE',
      collection: 'users',
      docId: profile.uid,
      warning: 'Lưu tạm trong RAM máy chủ',
      timestamp: new Date().toISOString(),
    };
    return {
      ...updated,
      _persisted: false,
      _storageEngine: 'IN_MEMORY_CACHE',
      _isMemoryVolatile: true,
      _warning: 'Dữ liệu chỉ lưu tạm thời trong RAM (In-Memory Cache) và sẽ mất khi máy chủ khởi động lại.',
    };
  }

  // --- 2. MATERIALS ---
  public async getMaterials(filter?: { grade?: number; topic?: string; ownerUid?: string }): Promise<StoredEntity<TeachingMaterialDoc>[]> {
    let list: StoredEntity<TeachingMaterialDoc>[] = [];

    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        let q: any = this.db.collection('materials');
        if (filter?.grade) q = q.where('grade', '==', Number(filter.grade));
        if (filter?.topic) q = q.where('topic', '==', filter.topic);
        const snapshot = await q.get();
        list = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        }));
      } catch (e: any) {
        console.warn('[Firestore] Lỗi đọc materials từ Firestore, chuyển sang cache:', e.message);
        list = Array.from(this.localMaterials.values()).map(m => ({
          ...m,
          _persisted: false,
          _storageEngine: 'IN_MEMORY_CACHE',
          _isMemoryVolatile: true,
        }));
      }
    } else {
      list = Array.from(this.localMaterials.values()).map(m => ({
        ...m,
        _persisted: false,
        _storageEngine: 'IN_MEMORY_CACHE',
        _isMemoryVolatile: true,
      }));
    }

    if (filter?.grade) list = list.filter(m => m.grade === Number(filter.grade));
    if (filter?.topic) list = list.filter(m => m.topic === filter.topic);
    if (filter?.ownerUid) list = list.filter(m => m.ownerUid === filter.ownerUid);

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getMaterialById(id: string): Promise<StoredEntity<TeachingMaterialDoc> | null> {
    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        const snap = await this.db.collection('materials').doc(id).get();
        if (snap.exists) {
          return {
            id: snap.id,
            ...(snap.data() as any),
            _persisted: true,
            _storageEngine: 'FIRESTORE',
          };
        }
      } catch (e: any) {
        console.warn('[Firestore] Lỗi đọc material từ Firestore:', e.message);
      }
    }
    const cached = this.localMaterials.get(id);
    if (cached) {
      return {
        ...cached,
        _persisted: false,
        _storageEngine: 'IN_MEMORY_CACHE',
        _isMemoryVolatile: true,
      };
    }
    return null;
  }

  public async saveMaterial(data: Omit<TeachingMaterialDoc, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<StoredEntity<TeachingMaterialDoc>> {
    const now = new Date().toISOString();
    const id = data.id || `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const doc: TeachingMaterialDoc = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        await this.db.collection('materials').doc(id).set(doc);
        this.lastWriteStatus = {
          success: true,
          target: 'FIRESTORE',
          collection: 'materials',
          docId: id,
          timestamp: new Date().toISOString(),
        };
        return {
          ...doc,
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        };
      } catch (e: any) {
        this.lastWriteStatus = {
          success: false,
          target: 'FIRESTORE',
          collection: 'materials',
          docId: id,
          error: e.message,
          timestamp: new Date().toISOString(),
        };
        throw new Error(`Lưu Firestore thất bại (materials/${id}): ${e.message}`);
      }
    }

    this.localMaterials.set(id, doc);
    this.lastWriteStatus = {
      success: true,
      target: 'IN_MEMORY_CACHE',
      collection: 'materials',
      docId: id,
      warning: 'Lưu tạm trong RAM máy chủ',
      timestamp: new Date().toISOString(),
    };
    return {
      ...doc,
      _persisted: false,
      _storageEngine: 'IN_MEMORY_CACHE',
      _isMemoryVolatile: true,
      _warning: 'Dữ liệu chỉ lưu tạm thời trong RAM (In-Memory Cache) và sẽ mất khi máy chủ khởi động lại.',
    };
  }

  public async updateMaterial(id: string, updates: Partial<TeachingMaterialDoc>, callerUid: string, role: string): Promise<StoredEntity<TeachingMaterialDoc> | null> {
    const existing = await this.getMaterialById(id);
    if (!existing) return null;

    if (role !== 'ADMIN' && existing.ownerUid !== callerUid) {
      throw new Error('FORBIDDEN_OWNER');
    }

    const { ownerUid, id: _id, createdAt: _c, ...safeUpdates } = updates as any;
    const updatedDoc: TeachingMaterialDoc = {
      ...existing,
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };

    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        await this.db.collection('materials').doc(id).set(updatedDoc, { merge: true });
        this.lastWriteStatus = {
          success: true,
          target: 'FIRESTORE',
          collection: 'materials',
          docId: id,
          timestamp: new Date().toISOString(),
        };
        return {
          ...updatedDoc,
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        };
      } catch (e: any) {
        this.lastWriteStatus = {
          success: false,
          target: 'FIRESTORE',
          collection: 'materials',
          docId: id,
          error: e.message,
          timestamp: new Date().toISOString(),
        };
        throw new Error(`Cập nhật Firestore thất bại (materials/${id}): ${e.message}`);
      }
    }

    this.localMaterials.set(id, updatedDoc);
    return {
      ...updatedDoc,
      _persisted: false,
      _storageEngine: 'IN_MEMORY_CACHE',
      _isMemoryVolatile: true,
      _warning: 'Cập nhật chỉ lưu tạm thời trong RAM.',
    };
  }

  public async deleteMaterial(id: string, callerUid: string, role: string): Promise<boolean> {
    const existing = await this.getMaterialById(id);
    if (!existing) return false;

    if (role !== 'ADMIN' && existing.ownerUid !== callerUid) {
      throw new Error('FORBIDDEN_OWNER');
    }

    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        await this.db.collection('materials').doc(id).delete();
        this.lastWriteStatus = {
          success: true,
          target: 'FIRESTORE',
          collection: 'materials',
          docId: id,
          timestamp: new Date().toISOString(),
        };
      } catch (e: any) {
        this.lastWriteStatus = {
          success: false,
          target: 'FIRESTORE',
          collection: 'materials',
          docId: id,
          error: e.message,
          timestamp: new Date().toISOString(),
        };
        throw new Error(`Xóa tài liệu trên Firestore thất bại: ${e.message}`);
      }
    }

    this.localMaterials.delete(id);
    return true;
  }

  // --- 3. LEARNING PLANS ---
  public async getLearningPlans(filter?: { grade?: number; materialId?: string; ownerUid?: string }): Promise<StoredEntity<LearningPlanDoc>[]> {
    let list: StoredEntity<LearningPlanDoc>[] = [];
    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        let q: any = this.db.collection('learningPlans');
        if (filter?.grade) q = q.where('grade', '==', Number(filter.grade));
        if (filter?.materialId) q = q.where('materialId', '==', filter.materialId);
        const snapshot = await q.get();
        list = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        }));
      } catch (e: any) {
        list = Array.from(this.localPlans.values()).map(p => ({
          ...p,
          _persisted: false,
          _storageEngine: 'IN_MEMORY_CACHE',
          _isMemoryVolatile: true,
        }));
      }
    } else {
      list = Array.from(this.localPlans.values()).map(p => ({
        ...p,
        _persisted: false,
        _storageEngine: 'IN_MEMORY_CACHE',
        _isMemoryVolatile: true,
      }));
    }

    if (filter?.grade) list = list.filter(p => p.grade === Number(filter.grade));
    if (filter?.materialId) list = list.filter(p => p.materialId === filter.materialId);
    if (filter?.ownerUid) list = list.filter(p => p.ownerUid === filter.ownerUid);

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getLearningPlanById(id: string): Promise<StoredEntity<LearningPlanDoc> | null> {
    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        const snap = await this.db.collection('learningPlans').doc(id).get();
        if (snap.exists) {
          return {
            id: snap.id,
            ...(snap.data() as any),
            _persisted: true,
            _storageEngine: 'FIRESTORE',
          };
        }
      } catch (e: any) {
        console.warn('[Firestore] Lỗi đọc learningPlan:', e.message);
      }
    }
    const cached = this.localPlans.get(id);
    if (cached) {
      return {
        ...cached,
        _persisted: false,
        _storageEngine: 'IN_MEMORY_CACHE',
        _isMemoryVolatile: true,
      };
    }
    return null;
  }

  public async saveLearningPlan(data: Omit<LearningPlanDoc, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<StoredEntity<LearningPlanDoc>> {
    const now = new Date().toISOString();
    const id = data.id || `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const doc: LearningPlanDoc = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        await this.db.collection('learningPlans').doc(id).set(doc);
        this.lastWriteStatus = {
          success: true,
          target: 'FIRESTORE',
          collection: 'learningPlans',
          docId: id,
          timestamp: new Date().toISOString(),
        };
        return {
          ...doc,
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        };
      } catch (e: any) {
        this.lastWriteStatus = {
          success: false,
          target: 'FIRESTORE',
          collection: 'learningPlans',
          docId: id,
          error: e.message,
          timestamp: new Date().toISOString(),
        };
        throw new Error(`Lưu Firestore thất bại (learningPlans/${id}): ${e.message}`);
      }
    }

    this.localPlans.set(id, doc);
    this.lastWriteStatus = {
      success: true,
      target: 'IN_MEMORY_CACHE',
      collection: 'learningPlans',
      docId: id,
      warning: 'Lưu tạm trong RAM máy chủ',
      timestamp: new Date().toISOString(),
    };
    return {
      ...doc,
      _persisted: false,
      _storageEngine: 'IN_MEMORY_CACHE',
      _isMemoryVolatile: true,
      _warning: 'Dữ liệu chỉ lưu tạm thời trong RAM (In-Memory Cache) và sẽ mất khi máy chủ khởi động lại.',
    };
  }

  public async updateLearningPlan(id: string, updates: Partial<LearningPlanDoc>, callerUid: string, role: string): Promise<StoredEntity<LearningPlanDoc> | null> {
    const existing = await this.getLearningPlanById(id);
    if (!existing) return null;

    if (role !== 'ADMIN' && existing.ownerUid !== callerUid) {
      throw new Error('FORBIDDEN_OWNER');
    }

    const { ownerUid, id: _id, createdAt: _c, ...safeUpdates } = updates as any;
    const updatedDoc: LearningPlanDoc = {
      ...existing,
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
      approvedAt: updates.status === 'approved' ? (existing.approvedAt || new Date().toISOString()) : existing.approvedAt,
    };

    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        await this.db.collection('learningPlans').doc(id).set(updatedDoc, { merge: true });
        this.lastWriteStatus = {
          success: true,
          target: 'FIRESTORE',
          collection: 'learningPlans',
          docId: id,
          timestamp: new Date().toISOString(),
        };
        return {
          ...updatedDoc,
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        };
      } catch (e: any) {
        this.lastWriteStatus = {
          success: false,
          target: 'FIRESTORE',
          collection: 'learningPlans',
          docId: id,
          error: e.message,
          timestamp: new Date().toISOString(),
        };
        throw new Error(`Cập nhật Firestore thất bại (learningPlans/${id}): ${e.message}`);
      }
    }

    this.localPlans.set(id, updatedDoc);
    return {
      ...updatedDoc,
      _persisted: false,
      _storageEngine: 'IN_MEMORY_CACHE',
      _isMemoryVolatile: true,
      _warning: 'Cập nhật chỉ lưu tạm thời trong RAM.',
    };
  }

  public async deleteLearningPlan(id: string, callerUid: string, role: string): Promise<boolean> {
    const existing = await this.getLearningPlanById(id);
    if (!existing) return false;

    if (role !== 'ADMIN' && existing.ownerUid !== callerUid) {
      throw new Error('FORBIDDEN_OWNER');
    }

    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        await this.db.collection('learningPlans').doc(id).delete();
        this.lastWriteStatus = {
          success: true,
          target: 'FIRESTORE',
          collection: 'learningPlans',
          docId: id,
          timestamp: new Date().toISOString(),
        };
      } catch (e: any) {
        this.lastWriteStatus = {
          success: false,
          target: 'FIRESTORE',
          collection: 'learningPlans',
          docId: id,
          error: e.message,
          timestamp: new Date().toISOString(),
        };
        throw new Error(`Xóa kế hoạch trên Firestore thất bại: ${e.message}`);
      }
    }

    this.localPlans.delete(id);
    return true;
  }

  // --- 4. LESSONS ---
  public async getLessons(filter?: { grade?: number; status?: string; ownerUid?: string }): Promise<StoredEntity<LessonDoc>[]> {
    let list: StoredEntity<LessonDoc>[] = [];
    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        let q: any = this.db.collection('lessons');
        if (filter?.grade) q = q.where('grade', '==', Number(filter.grade));
        if (filter?.status) q = q.where('status', '==', filter.status);
        const snap = await q.get();
        list = snap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        }));
      } catch (e: any) {
        list = Array.from(this.localLessons.values()).map(l => ({
          ...l,
          _persisted: false,
          _storageEngine: 'IN_MEMORY_CACHE',
          _isMemoryVolatile: true,
        }));
      }
    } else {
      list = Array.from(this.localLessons.values()).map(l => ({
        ...l,
        _persisted: false,
        _storageEngine: 'IN_MEMORY_CACHE',
        _isMemoryVolatile: true,
      }));
    }

    if (filter?.grade) list = list.filter(l => l.grade === Number(filter.grade));
    if (filter?.status) list = list.filter(l => l.status === filter.status);
    if (filter?.ownerUid) list = list.filter(l => l.ownerUid === filter.ownerUid);

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getLessonById(id: string): Promise<StoredEntity<LessonDoc> | null> {
    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        const snap = await this.db.collection('lessons').doc(id).get();
        if (snap.exists) {
          return {
            id: snap.id,
            ...(snap.data() as any),
            _persisted: true,
            _storageEngine: 'FIRESTORE',
          };
        }
      } catch (e: any) {
        console.warn('[Firestore] Lỗi đọc lesson từ Firestore:', e.message);
      }
    }
    const cached = this.localLessons.get(id);
    if (cached) {
      return {
        ...cached,
        _persisted: false,
        _storageEngine: 'IN_MEMORY_CACHE',
        _isMemoryVolatile: true,
      };
    }
    return null;
  }

  public async saveLesson(data: Omit<LessonDoc, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<StoredEntity<LessonDoc>> {
    const now = new Date().toISOString();
    const id = data.id || `les-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const doc: LessonDoc = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      publishedAt: data.status === 'published' ? now : undefined,
    };

    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        await this.db.collection('lessons').doc(id).set(doc);
        this.lastWriteStatus = {
          success: true,
          target: 'FIRESTORE',
          collection: 'lessons',
          docId: id,
          timestamp: new Date().toISOString(),
        };
        return {
          ...doc,
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        };
      } catch (e: any) {
        this.lastWriteStatus = {
          success: false,
          target: 'FIRESTORE',
          collection: 'lessons',
          docId: id,
          error: e.message,
          timestamp: new Date().toISOString(),
        };
        throw new Error(`Lưu Firestore thất bại (lessons/${id}): ${e.message}`);
      }
    }

    this.localLessons.set(id, doc);
    this.lastWriteStatus = {
      success: true,
      target: 'IN_MEMORY_CACHE',
      collection: 'lessons',
      docId: id,
      warning: 'Lưu tạm trong RAM máy chủ',
      timestamp: new Date().toISOString(),
    };
    return {
      ...doc,
      _persisted: false,
      _storageEngine: 'IN_MEMORY_CACHE',
      _isMemoryVolatile: true,
      _warning: 'Dữ liệu chỉ lưu tạm thời trong RAM (In-Memory Cache) và sẽ mất khi máy chủ khởi động lại.',
    };
  }

  public async updateLesson(id: string, updates: Partial<LessonDoc>, callerUid: string, role: string): Promise<StoredEntity<LessonDoc> | null> {
    const existing = await this.getLessonById(id);
    if (!existing) return null;

    if (role !== 'ADMIN' && existing.ownerUid !== callerUid) {
      throw new Error('FORBIDDEN_OWNER');
    }

    const { ownerUid, id: _id, createdAt: _c, ...safeUpdates } = updates as any;
    const now = new Date().toISOString();
    const updatedDoc: LessonDoc = {
      ...existing,
      ...safeUpdates,
      updatedAt: now,
      publishedAt: updates.status === 'published' ? (existing.publishedAt || now) : existing.publishedAt,
    };

    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        await this.db.collection('lessons').doc(id).set(updatedDoc, { merge: true });
        this.lastWriteStatus = {
          success: true,
          target: 'FIRESTORE',
          collection: 'lessons',
          docId: id,
          timestamp: new Date().toISOString(),
        };
        return {
          ...updatedDoc,
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        };
      } catch (e: any) {
        this.lastWriteStatus = {
          success: false,
          target: 'FIRESTORE',
          collection: 'lessons',
          docId: id,
          error: e.message,
          timestamp: new Date().toISOString(),
        };
        throw new Error(`Cập nhật Firestore thất bại (lessons/${id}): ${e.message}`);
      }
    }

    this.localLessons.set(id, updatedDoc);
    return {
      ...updatedDoc,
      _persisted: false,
      _storageEngine: 'IN_MEMORY_CACHE',
      _isMemoryVolatile: true,
      _warning: 'Cập nhật chỉ lưu tạm thời trong RAM.',
    };
  }

  public async deleteLesson(id: string, callerUid: string, role: string): Promise<boolean> {
    const existing = await this.getLessonById(id);
    if (!existing) return false;

    if (role !== 'ADMIN' && existing.ownerUid !== callerUid) {
      throw new Error('FORBIDDEN_OWNER');
    }

    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        await this.db.collection('lessons').doc(id).delete();
        this.lastWriteStatus = {
          success: true,
          target: 'FIRESTORE',
          collection: 'lessons',
          docId: id,
          timestamp: new Date().toISOString(),
        };
      } catch (e: any) {
        this.lastWriteStatus = {
          success: false,
          target: 'FIRESTORE',
          collection: 'lessons',
          docId: id,
          error: e.message,
          timestamp: new Date().toISOString(),
        };
        throw new Error(`Xóa bài học trên Firestore thất bại: ${e.message}`);
      }
    }

    this.localLessons.delete(id);
    return true;
  }

  // --- 5. LEARNING RESULTS ---
  public async saveLearningResult(result: Omit<LearningResultDoc, 'id' | 'completedAt'> & { id?: string }): Promise<StoredEntity<LearningResultDoc>> {
    const now = new Date().toISOString();
    const id = result.id || `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const doc: LearningResultDoc = {
      ...result,
      id,
      completedAt: now,
    };

    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        await this.db.collection('learningResults').doc(id).set(doc);
        this.lastWriteStatus = {
          success: true,
          target: 'FIRESTORE',
          collection: 'learningResults',
          docId: id,
          timestamp: new Date().toISOString(),
        };
        return {
          ...doc,
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        };
      } catch (e: any) {
        this.lastWriteStatus = {
          success: false,
          target: 'FIRESTORE',
          collection: 'learningResults',
          docId: id,
          error: e.message,
          timestamp: new Date().toISOString(),
        };
        throw new Error(`Lưu kết quả học tập trên Firestore thất bại: ${e.message}`);
      }
    }

    this.localResults.set(id, doc);
    this.lastWriteStatus = {
      success: true,
      target: 'IN_MEMORY_CACHE',
      collection: 'learningResults',
      docId: id,
      warning: 'Lưu tạm trong RAM máy chủ',
      timestamp: new Date().toISOString(),
    };
    return {
      ...doc,
      _persisted: false,
      _storageEngine: 'IN_MEMORY_CACHE',
      _isMemoryVolatile: true,
      _warning: 'Dữ liệu chỉ lưu tạm thời trong RAM (In-Memory Cache) và sẽ mất khi máy chủ khởi động lại.',
    };
  }

  public async getResultsByStudent(studentUid: string): Promise<StoredEntity<LearningResultDoc>[]> {
    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        const snap = await this.db.collection('learningResults').where('studentUid', '==', studentUid).get();
        return snap.docs.map((d: any) => ({
          id: d.id,
          ...d.data(),
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        }));
      } catch (e: any) {
        console.warn('[Firestore] Lỗi đọc results từ Firestore:', e.message);
      }
    }
    return Array.from(this.localResults.values())
      .filter(r => r.studentUid === studentUid)
      .map(r => ({
        ...r,
        _persisted: false,
        _storageEngine: 'IN_MEMORY_CACHE',
        _isMemoryVolatile: true,
      }));
  }

  public async getResultsByLesson(lessonId: string): Promise<StoredEntity<LearningResultDoc>[]> {
    if (this.isConnectedToLiveFirestore && this.db) {
      try {
        const snap = await this.db.collection('learningResults').where('lessonId', '==', lessonId).get();
        return snap.docs.map((d: any) => ({
          id: d.id,
          ...d.data(),
          _persisted: true,
          _storageEngine: 'FIRESTORE',
        }));
      } catch (e: any) {
        console.warn('[Firestore] Lỗi đọc results từ Firestore:', e.message);
      }
    }
    return Array.from(this.localResults.values())
      .filter(r => r.lessonId === lessonId)
      .map(r => ({
        ...r,
        _persisted: false,
        _storageEngine: 'IN_MEMORY_CACHE',
        _isMemoryVolatile: true,
      }));
  }
}

export const firestoreRepo = new FirestoreRepository();
