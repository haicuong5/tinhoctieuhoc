import { TeachingMaterial, Lesson, GradeLevel, InformaticsTopic, AIGenerateRequest } from '../types';
import { getCurrentBearerToken } from './firebase';

export interface GenerateLessonResponse {
  success: boolean;
  lesson?: Lesson;
  error?: string;
  isRealAI?: boolean;
  note?: string;
}

export interface ExtractMaterialResponse {
  success: boolean;
  status: 'EXTRACTED' | 'EXTRACTION_ERROR';
  data?: any;
  error?: string;
  errorDetails?: string;
  message?: string;
}

export async function requestAILessonGeneration(
  request: AIGenerateRequest,
  material: TeachingMaterial,
  teacherId: string,
  teacherName: string
): Promise<GenerateLessonResponse> {
  try {
    const bearerToken = await getCurrentBearerToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    const res = await fetch('/api/gemini/generate-lesson', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        material,
        grade: request.grade,
        topic: request.topic,
        mode: request.mode,
        customTeacherNote: request.customTeacherNote,
        teacherId,
        teacherName
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Lỗi khi yêu cầu AI tạo bài học.',
      };
    }
    return data;
  } catch (err: any) {
    console.error('Fetch generate-lesson error:', err);
    return {
      success: false,
      error: err.message || 'Không thể kết nối đến máy chủ xử lý AI.',
    };
  }
}

export async function requestMaterialExtraction(
  fileName: string,
  fileFormat: string,
  grade: GradeLevel,
  topic: InformaticsTopic,
  fileContentPreview?: string
): Promise<ExtractMaterialResponse> {
  try {
    const bearerToken = await getCurrentBearerToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    const res = await fetch('/api/materials/extract', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fileName,
        fileFormat,
        grade,
        topic,
        fileContent: fileContentPreview,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        status: 'EXTRACTION_ERROR',
        error: data.error || 'Lỗi trích xuất tài liệu',
      };
    }
    return data;
  } catch (err: any) {
    console.error('Fetch material extraction error:', err);
    return {
      success: false,
      status: 'EXTRACTION_ERROR',
      error: err.message || 'Không thể kết nối tới dịch vụ trích xuất tài liệu.',
    };
  }
}

export interface UploadMaterialPayload {
  title: string;
  grade: GradeLevel;
  topic: InformaticsTopic;
  relatedLessonName?: string;
  description: string;
  originalFileName: string;
  fileFormat: 'PDF' | 'DOCX' | 'PPTX';
  fileSizeBytes: number;
  fileContentPreview?: string;
  teacherId: string;
  teacherName: string;
  userRole: string;
}

export async function uploadTeachingMaterialFile(payload: UploadMaterialPayload): Promise<{
  success: boolean;
  material?: TeachingMaterial;
  error?: string;
  modeNotice?: string;
}> {
  try {
    const bearerToken = await getCurrentBearerToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    const res = await fetch('/api/materials/upload', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Lỗi khi tải tệp lên máy chủ.',
      };
    }
    return data;
  } catch (err: any) {
    console.error('Lỗi khi gọi API upload tài liệu:', err);
    return {
      success: false,
      error: err.message || 'Không thể kết nối đến máy chủ lưu trữ tệp.',
    };
  }
}

export async function downloadTeachingMaterial(materialId: string, userRole: string, fileName: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (userRole === 'STUDENT') {
      return {
        success: false,
        error: 'Truy cập bị từ chối: Học sinh không được phép tải xuống tài liệu gốc của giáo viên.',
      };
    }

    const bearerToken = await getCurrentBearerToken();
    const headers: Record<string, string> = {};
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    const res = await fetch(`/api/materials/${materialId}/download`, {
      headers,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errJson.error || `Tải xuống thất bại với mã lỗi HTTP ${res.status}`,
      };
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true };
  } catch (err: any) {
    console.error('Lỗi tải tệp:', err);
    return {
      success: false,
      error: err.message || 'Không thể tải xuống tệp vào lúc này.',
    };
  }
}

export async function checkSystemStatus() {
  try {
    const res = await fetch('/api/system/status');
    if (!res.ok) throw new Error('Không thể kiểm tra trạng thái máy chủ');
    return await res.json();
  } catch (err) {
    return {
      gemini: { available: false, status: 'Ngoại tuyến / Chưa sẵn sàng' },
      firebaseAuth: { available: false, status: 'Chưa kết nối' },
      firestore: { available: false, status: 'Chưa kết nối' },
      cloudStorage: { available: false, status: 'Chưa kết nối' }
    };
  }
}

