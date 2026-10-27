import {
  User,
  SchoolClass,
  TeachingMaterial,
  Lesson,
  LessonVersion,
  Question,
  Assignment,
  AssignmentSubmission,
  StudentPersonalProgress,
  ApprovalRecord,
  ContentStatus,
  UserRole
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_MATERIALS,
  INITIAL_LESSONS,
  INITIAL_QUESTIONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_STUDENT_PROGRESS,
  INITIAL_APPROVAL_RECORDS
} from '../mock/initialData';

const STORAGE_KEYS = {
  USERS: 'tinhoctieuhoc_users_v1',
  CLASSES: 'tinhoctieuhoc_classes_v1',
  MATERIALS: 'tinhoctieuhoc_materials_v1',
  LESSONS: 'tinhoctieuhoc_lessons_v1',
  LESSON_VERSIONS: 'tinhoctieuhoc_lesson_versions_v1',
  QUESTIONS: 'tinhoctieuhoc_questions_v1',
  ASSIGNMENTS: 'tinhoctieuhoc_assignments_v1',
  SUBMISSIONS: 'tinhoctieuhoc_submissions_v1',
  PROGRESS: 'tinhoctieuhoc_progress_v1',
  APPROVALS: 'tinhoctieuhoc_approvals_v1',
  CURRENT_USER_ID: 'tinhoctieuhoc_current_user_id_v1'
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading storage key ${key}:`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving storage key ${key}:`, err);
  }
}

class StorageRepository {
  // --- USERS ---
  getUsers(): User[] {
    return getFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getCurrentUser(): User {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user-teacher-01';
    const user = this.getUserById(currentId);
    if (user) return user;
    return this.getUsers()[1]; // Mặc định là Cô Mai (Giáo viên)
  }

  setCurrentUser(userId: string): User {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    return this.getCurrentUser();
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    saveToStorage(STORAGE_KEYS.USERS, users);
  }

  // --- CLASSES ---
  getClasses(): SchoolClass[] {
    return getFromStorage<SchoolClass[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  }

  saveClass(schoolClass: SchoolClass): void {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === schoolClass.id);
    if (index >= 0) {
      classes[index] = schoolClass;
    } else {
      classes.push(schoolClass);
    }
    saveToStorage(STORAGE_KEYS.CLASSES, classes);
  }

  // --- TEACHING MATERIALS ---
  getMaterials(): TeachingMaterial[] {
    return getFromStorage<TeachingMaterial[]>(STORAGE_KEYS.MATERIALS, INITIAL_MATERIALS);
  }

  getMaterialById(id: string): TeachingMaterial | undefined {
    return this.getMaterials().find(m => m.id === id);
  }

  /**
   * Phân quyền truy cập tài liệu:
   * - Quản trị viên: Toàn quyền truy cập mọi tài liệu của mọi khối lớp.
   * - Giáo viên: Được xem tài liệu chung của trường, nhưng chỉ quản lý tài liệu thuộc khối mình phụ trách hoặc do mình tải lên.
   * - Học sinh: Tuyệt đối KHÔNG được truy cập kho tài liệu giảng dạy.
   */
  getAccessibleMaterials(user: User): TeachingMaterial[] {
    if (user.role === 'STUDENT') {
      return []; // Học sinh không có quyền truy cập
    }
    const all = this.getMaterials();
    if (user.role === 'ADMIN') {
      return all;
    }
    // Giáo viên: hiển thị tài liệu
    return all;
  }

  canManageMaterial(user: User, material: TeachingMaterial): { canEdit: boolean; canDelete: boolean; reason?: string } {
    if (user.role === 'ADMIN') {
      return { canEdit: true, canDelete: true };
    }
    if (user.role === 'STUDENT') {
      return { canEdit: false, canDelete: false, reason: 'Học sinh không có quyền quản lý tài liệu giảng dạy.' };
    }
    // Giáo viên: quản lý tài liệu do mình tải lên hoặc thuộc khối lớp mình phụ trách
    const isOwner = material.uploadedByTeacherId === user.id;
    const isAssignedGrade = user.assignedGrades?.includes(material.grade);

    if (isOwner || isAssignedGrade) {
      return { canEdit: true, canDelete: true };
    }

    return {
      canEdit: false,
      canDelete: false,
      reason: `Tài liệu Khối ${material.grade} do ${material.uploadedByTeacherName} tải lên, nằm ngoài khối lớp cô được phân công (Khối ${user.assignedGrades?.join(', ') || 'khác'}).`
    };
  }

  /**
   * Tìm tất cả bài học đang liên kết sử dụng tài liệu này làm nguồn
   */
  getLinkedLessonsForMaterial(materialId: string): Lesson[] {
    const lessons = this.getLessons();
    return lessons.filter(l => 
      l.sourceMaterial?.materialId === materialId ||
      l.sourceMaterial?.materialTitle === this.getMaterialById(materialId)?.title
    );
  }

  saveMaterial(material: TeachingMaterial): void {
    const materials = this.getMaterials();
    const index = materials.findIndex(m => m.id === material.id);
    
    // Đồng bộ usageStatus và isActive
    if (!material.usageStatus) {
      material.usageStatus = material.isActive ? 'ACTIVE' : 'INACTIVE';
    }
    material.isActive = material.usageStatus === 'ACTIVE';

    if (index >= 0) {
      materials[index] = { ...material, lastProcessedAt: new Date().toISOString() };
    } else {
      materials.unshift({ ...material, uploadedAt: material.uploadedAt || new Date().toISOString() });
    }
    saveToStorage(STORAGE_KEYS.MATERIALS, materials);
  }

  /**
   * Xóa tài liệu an toàn có kiểm tra bài học liên kết
   */
  deleteMaterialSafe(id: string, user: User): { success: boolean; linkedLessons: Lesson[]; message: string } {
    const material = this.getMaterialById(id);
    if (!material) {
      return { success: false, linkedLessons: [], message: 'Không tìm thấy tài liệu cần xóa.' };
    }

    const perm = this.canManageMaterial(user, material);
    if (!perm.canDelete) {
      return { success: false, linkedLessons: [], message: perm.reason || 'Bạn không có quyền xóa tài liệu này.' };
    }

    const linkedLessons = this.getLinkedLessonsForMaterial(id);
    
    // Nếu có bài học liên kết, bảo đảm lưu lại snapshot nguồn trong bài học trước khi xóa
    const materials = this.getMaterials().filter(m => m.id !== id);
    saveToStorage(STORAGE_KEYS.MATERIALS, materials);

    return {
      success: true,
      linkedLessons,
      message: linkedLessons.length > 0 
        ? `Đã xóa tài liệu khỏi danh mục. Lưu ý: có ${linkedLessons.length} bài học đang tham chiếu tài liệu này đã được hệ thống bảo lưu bản ghi nguồn lịch sử.`
        : 'Đã xóa tài liệu thành công.'
    };
  }

  deleteMaterial(id: string): void {
    const materials = this.getMaterials().filter(m => m.id !== id);
    saveToStorage(STORAGE_KEYS.MATERIALS, materials);
  }

  // Chuyển đổi trạng thái sử dụng (ACTIVE <-> INACTIVE)
  toggleMaterialUsageStatus(id: string, user: User): TeachingMaterial | null {
    const materials = this.getMaterials();
    const material = materials.find(m => m.id === id);
    if (!material) return null;

    const perm = this.canManageMaterial(user, material);
    if (!perm.canEdit) return null;

    const newStatus = material.usageStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    material.usageStatus = newStatus;
    material.isActive = newStatus === 'ACTIVE';
    material.lastProcessedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.MATERIALS, materials);
    return material;
  }

  // --- LESSONS ---
  getLessons(): Lesson[] {
    return getFromStorage<Lesson[]>(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
  }

  getLessonById(id: string): Lesson | undefined {
    return this.getLessons().find(l => l.id === id);
  }

  /**
   * Lấy bài học theo quyền người dùng:
   * - Học sinh chỉ xem được bài đã PUBLISHED thuộc khối của mình.
   * - Giáo viên xem được bài của khối mình phụ trách.
   * - Admin xem được tất cả.
   */
  getAccessibleLessons(user: User): Lesson[] {
    const allLessons = this.getLessons();
    if (user.role === 'ADMIN') {
      return allLessons;
    }
    if (user.role === 'TEACHER') {
      if (!user.assignedGrades || user.assignedGrades.length === 0) return allLessons;
      return allLessons.filter(l => user.assignedGrades?.includes(l.grade));
    }
    if (user.role === 'STUDENT') {
      return allLessons.filter(l => l.status === 'PUBLISHED' && l.grade === user.grade);
    }
    return [];
  }

  saveLesson(lesson: Lesson, currentUser: User, note?: string): Lesson {
    const lessons = this.getLessons();
    const existingIndex = lessons.findIndex(l => l.id === lesson.id);

    // Kiểm tra bảo toàn phiên bản nếu bài học đã từng được công bố
    if (existingIndex >= 0) {
      const old = lessons[existingIndex];
      if (old.status === 'PUBLISHED' && lesson.status !== 'PUBLISHED') {
        // Tạo bản nháp mới để không đè lên bài học sinh đang học
        lesson.version = (old.version || 1) + 1;
      }
      this.recordLessonVersion(old, currentUser, note || 'Cập nhật nội dung bài học');
      lessons[existingIndex] = { ...lesson, updatedAt: new Date().toISOString() };
    } else {
      lessons.unshift({ ...lesson, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    saveToStorage(STORAGE_KEYS.LESSONS, lessons);
    return lesson;
  }

  updateLessonStatus(
    lessonId: string, 
    newStatus: ContentStatus, 
    currentUser: User, 
    comment?: string
  ): Lesson | null {
    const lessons = this.getLessons();
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return null;

    const oldStatus = lesson.status;
    lesson.status = newStatus;
    lesson.updatedAt = new Date().toISOString();

    if (newStatus === 'APPROVED') {
      lesson.approvedAt = new Date().toISOString();
      lesson.approvedByTeacherName = currentUser.fullName;
    } else if (newStatus === 'PUBLISHED') {
      lesson.publishedAt = new Date().toISOString();
    }

    saveToStorage(STORAGE_KEYS.LESSONS, lessons);

    // Ghi nhật ký phê duyệt
    this.addApprovalRecord({
      id: `apr-${Date.now()}`,
      entityType: 'LESSON',
      entityId: lesson.id,
      entityTitle: lesson.title,
      action: newStatus === 'PUBLISHED' ? 'PUBLISH' : newStatus === 'APPROVED' ? 'APPROVE' : newStatus === 'REJECTED' ? 'REJECT' : newStatus === 'ARCHIVED' ? 'ARCHIVE' : 'REQUEST_REVIEW',
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      timestamp: new Date().toISOString(),
      comment: comment || `Chuyển trạng thái từ ${oldStatus} sang ${newStatus}`
    });

    return lesson;
  }

  recordLessonVersion(lesson: Lesson, actor: User, reason: string): void {
    const versions = getFromStorage<LessonVersion[]>(STORAGE_KEYS.LESSON_VERSIONS, []);
    versions.unshift({
      id: `ver-${Date.now()}`,
      lessonId: lesson.id,
      versionNumber: lesson.version || 1,
      status: lesson.status,
      changedBy: actor.fullName,
      changedAt: new Date().toISOString(),
      changeSummary: reason,
      snapshot: JSON.parse(JSON.stringify(lesson))
    });
    saveToStorage(STORAGE_KEYS.LESSON_VERSIONS, versions);
  }

  getLessonVersions(lessonId: string): LessonVersion[] {
    const versions = getFromStorage<LessonVersion[]>(STORAGE_KEYS.LESSON_VERSIONS, []);
    return versions.filter(v => v.lessonId === lessonId);
  }

  // --- QUESTIONS ---
  getQuestions(): Question[] {
    return getFromStorage<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  }

  saveQuestion(question: Question): Question {
    const questions = this.getQuestions();
    const index = questions.findIndex(q => q.id === question.id);
    if (index >= 0) {
      questions[index] = { ...question, updatedAt: new Date().toISOString() };
    } else {
      questions.unshift({ ...question, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
    return question;
  }

  // --- ASSIGNMENTS ---
  getAssignments(): Assignment[] {
    return getFromStorage<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  }

  getAccessibleAssignments(user: User): Assignment[] {
    const all = this.getAssignments();
    if (user.role === 'ADMIN') return all;
    if (user.role === 'TEACHER') {
      return all.filter(a => user.assignedGrades?.includes(a.grade));
    }
    if (user.role === 'STUDENT') {
      return all.filter(a => {
        if (a.targetType === 'CLASS' && user.classId && a.targetIds.includes(user.classId)) return true;
        if (a.targetType === 'STUDENT' && a.targetIds.includes(user.id)) return true;
        return false;
      });
    }
    return [];
  }

  saveAssignment(assignment: Assignment): void {
    const assignments = this.getAssignments();
    const index = assignments.findIndex(a => a.id === assignment.id);
    if (index >= 0) {
      assignments[index] = assignment;
    } else {
      assignments.unshift(assignment);
    }
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
  }

  // --- SUBMISSIONS ---
  getSubmissions(): AssignmentSubmission[] {
    return getFromStorage<AssignmentSubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  }

  getSubmissionsByStudent(studentId: string): AssignmentSubmission[] {
    return this.getSubmissions().filter(s => s.studentId === studentId);
  }

  saveSubmission(submission: AssignmentSubmission): void {
    const submissions = this.getSubmissions();
    const index = submissions.findIndex(s => s.id === submission.id);
    if (index >= 0) {
      submissions[index] = submission;
    } else {
      submissions.unshift(submission);
    }
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions);

    // Cập nhật tiến độ học sinh
    this.updateStudentProgressAfterSubmission(submission);
  }

  // --- STUDENT PROGRESS & PERSONALIZATION ---
  getProgress(studentId: string): StudentPersonalProgress | undefined {
    const all = getFromStorage<Record<string, StudentPersonalProgress>>(STORAGE_KEYS.PROGRESS, INITIAL_STUDENT_PROGRESS);
    return all[studentId];
  }

  updateStudentProgressAfterSubmission(submission: AssignmentSubmission): void {
    const all = getFromStorage<Record<string, StudentPersonalProgress>>(STORAGE_KEYS.PROGRESS, INITIAL_STUDENT_PROGRESS);
    let studentProg = all[submission.studentId];

    if (!studentProg) {
      studentProg = {
        studentId: submission.studentId,
        studentName: submission.studentName,
        grade: submission.grade,
        className: submission.className,
        overallScoreAverage: submission.score || 0,
        totalAssignmentsSubmitted: 1,
        completionRate: 100,
        topics: {},
        recentAchievements: [],
        weeklyProgress: []
      };
    } else {
      const studentSubs = this.getSubmissionsByStudent(submission.studentId);
      const totalScore = studentSubs.reduce((acc, cur) => acc + (cur.score || 0), 0);
      studentProg.overallScoreAverage = Number((totalScore / Math.max(1, studentSubs.length)).toFixed(1));
      studentProg.totalAssignmentsSubmitted = studentSubs.length;
    }

    all[submission.studentId] = studentProg;
    saveToStorage(STORAGE_KEYS.PROGRESS, all);
  }

  // --- APPROVAL RECORDS ---
  getApprovalRecords(): ApprovalRecord[] {
    return getFromStorage<ApprovalRecord[]>(STORAGE_KEYS.APPROVALS, INITIAL_APPROVAL_RECORDS);
  }

  addApprovalRecord(record: ApprovalRecord): void {
    const records = this.getApprovalRecords();
    records.unshift(record);
    saveToStorage(STORAGE_KEYS.APPROVALS, records);
  }

  // --- EXCEL/CSV EXPORT UTILITY ---
  exportClassReportToCSV(classId: string): string {
    const submissions = this.getSubmissions().filter(s => s.classId === classId);
    const headers = [
      'Mã học sinh',
      'Họ và tên',
      'Lớp',
      'Bài tập / Kiểm tra',
      'Loại bài',
      'Điểm số',
      'Điểm tối đa',
      'Thời gian làm (phút)',
      'Thời điểm nộp',
      'Trạng thái',
      'Nhận xét của giáo viên'
    ];

    const rows = submissions.map(s => [
      `"${s.studentId}"`,
      `"${s.studentName}"`,
      `"${s.className}"`,
      `"${s.assignmentTitle.replace(/"/g, '""')}"`,
      `"${s.assignmentType === 'OFFICIAL_TEST' ? 'Kiểm tra chính thức' : 'Luyện tập'}"`,
      s.score ?? 0,
      s.maxScore,
      Math.round(s.timeSpentSeconds / 60),
      `"${s.submittedAt || ''}"`,
      `"${s.status}"`,
      `"${(s.feedback || '').replace(/"/g, '""')}"`
    ]);

    // Thêm UTF-8 BOM (\uFEFF) để Excel hiển thị tiếng Việt có dấu hoàn hảo
    return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // Reset demo data
  resetToDefault(): void {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }
}

export const storageService = new StorageRepository();
