/**
 * Hệ thống Quản lý và Học tập Môn Tin học Lớp 3, 4, 5 Ứng dụng AI
 * Định nghĩa cấu trúc dữ liệu theo Chuẩn Chương trình Giáo dục Phổ thông 2018
 */

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type GradeLevel = 3 | 4 | 5;

export type InformaticsTopic = 
  | 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM'
  | 'CHỦ ĐỀ B: MẠNG MÁY TÍNH VÀ INTERNET'
  | 'CHỦ ĐỀ C: TỔ CHỨC LƯU TRỮ, TÌM KIẾM VÀ TRAO ĐỔI THÔNG TIN'
  | 'CHỦ ĐỀ D: ĐẠO ĐỨC, PHÁP LUẬT VÀ VĂN HÓA TRONG MÔI TRƯỜNG SỐ'
  | 'CHỦ ĐỀ E: ỨNG DỤNG TIN HỌC'
  | 'CHỦ ĐỀ F: GIẢI QUYẾT VẤN ĐỀ VỚI SỰ TRỢ GIÚP CỦA MÁY TÍNH';

export type ContentStatus = 
  | 'DRAFT'           // Bản nháp
  | 'PROCESSING'      // Đang xử lý bởi AI
  | 'PENDING_REVIEW'  // Chờ giáo viên duyệt
  | 'APPROVED'        // Đã phê duyệt (chưa công bố)
  | 'PUBLISHED'       // Đã công bố (học sinh thấy được)
  | 'REJECTED'        // Không được duyệt
  | 'ARCHIVED';       // Đã lưu trữ / ngừng sử dụng

export type MaterialProcessingStatus = 
  | 'UPLOADED'
  | 'PROCESSING'
  | 'EXTRACTED'
  | 'EXTRACTION_ERROR';

export type QuestionType =
  | 'SINGLE_CHOICE'    // Trắc nghiệm 1 đáp án
  | 'MULTIPLE_CHOICE'  // Trắc nghiệm nhiều đáp án
  | 'TRUE_FALSE'       // Đúng hoặc sai
  | 'MATCHING'         // Ghép cặp
  | 'ORDERING'         // Sắp xếp thứ tự
  | 'FILL_BLANK'       // Điền từ
  | 'SHORT_ANSWER'     // Trả lời ngắn
  | 'GUIDED_PRACTICE'; // Bài tập thực hành theo hướng dẫn

export type DifficultyLevel = 
  | 'NHẬN BIẾT' 
  | 'THÔNG HIỂU' 
  | 'VẬN DỤNG' 
  | 'VẬN DỤNG CAO';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
  phone?: string;
  schoolName: string;
  // Dành cho giáo viên
  assignedGrades?: GradeLevel[];
  assignedClassIds?: string[];
  // Dành cho học sinh
  grade?: GradeLevel;
  classId?: string;
  className?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface SchoolClass {
  id: string;
  name: string; // ví dụ: "3A", "4B", "5C"
  grade: GradeLevel;
  academicYear: string; // ví dụ: "2026-2027"
  headTeacherId: string;
  headTeacherName: string;
  studentCount: number;
  room?: string;
  notes?: string;
}

export interface ExtractedSection {
  id: string;
  heading: string;
  level: number; // 1, 2, 3
  content: string;
  tables?: Array<{ headers: string[]; rows: string[][] }>;
  hasVisuals?: boolean;
}

export type MaterialUsageStatus = 'ACTIVE' | 'INACTIVE';

export interface TeachingMaterial {
  id: string;
  code: string; // ví dụ: TL-TIN4-CDA-01
  title: string;
  originalFileName: string;
  fileFormat: 'PDF' | 'DOCX' | 'PPTX';
  fileSizeBytes?: number; // Dung lượng dạng bytes
  fileSizeFormatted: string;
  grade: GradeLevel;
  topic: InformaticsTopic;
  relatedLessonName?: string; // Tên bài học liên quan dự kiến trong chương trình
  description: string;
  uploadedByTeacherId: string;
  uploadedByTeacherName: string;
  uploadedAt: string;
  lastProcessedAt?: string; // Thời điểm xử lý gần nhất
  processingStatus: MaterialProcessingStatus;
  usageStatus: MaterialUsageStatus; // Trạng thái sử dụng (ACTIVE, INACTIVE)
  isActive: boolean; // Tương thích ngược
  version: number;
  linkedLessonIds?: string[]; // Danh sách ID các bài học đã liên kết dùng tài liệu này
  extractedContent?: {
    summary: string;
    sections: ExtractedSection[];
    keyTerms: string[];
    unreadableNotes?: string; // Báo các phần không trích xuất được
  };
  fileStorageUrl?: string; // Đường dẫn an toàn trong storage (Cloud Storage)
  downloadUrl?: string; // URL tải xuống an toàn
  sampleFileBlobData?: string; // Nội dung văn bản xem trước khi tải về
}

export interface QuestionOption {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface MatchingPair {
  id: string;
  leftText: string;
  rightText: string;
}

export interface Question {
  id: string;
  code: string;
  type: QuestionType;
  grade: GradeLevel;
  topic: InformaticsTopic;
  difficulty: DifficultyLevel;
  points: number; // Điểm số chuẩn, ví dụ 1.0 hoặc 2.0
  content: string; // Đề bài
  subPrompt?: string; // Hướng dẫn bổ sung cho học sinh tiểu học
  options?: QuestionOption[]; // Cho SINGLE_CHOICE, MULTIPLE_CHOICE
  correctOptionIds?: string[]; // Cho SINGLE_CHOICE, MULTIPLE_CHOICE
  isTrue?: boolean; // Cho TRUE_FALSE
  pairs?: MatchingPair[]; // Cho MATCHING
  correctOrder?: string[]; // Cho ORDERING: danh sách ID hoặc nhãn theo thứ tự đúng
  blanks?: Array<{ index: number; correctWord: string; hints?: string[] }>; // Cho FILL_BLANK
  expectedKeywords?: string[]; // Cho SHORT_ANSWER (tự luận ngắn)
  sampleAnswer?: string;
  practiceSteps?: Array<{ stepNumber: number; instruction: string; checkCriteria: string }>; // Cho GUIDED_PRACTICE
  explanation: string; // Lời giải thích dễ hiểu cho học sinh lớp 3-5
  sourceMaterialId?: string; // Tài liệu nguồn
  sourceReferenceNote?: string;
  status: ContentStatus;
  isAiGenerated: boolean;
  aiConfidenceNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticalInstructionStep {
  step: number;
  title: string;
  action: string;
  tip?: string;
}

/**
 * 17 trường thông tin của bài học theo đặc tả yêu cầu
 */
export interface Lesson {
  // 1. Thông tin bài học
  id: string;
  code: string; // Mã bài học, ví dụ: BH-TIN4-03
  createdAt: string;
  updatedAt: string;
  createdByTeacherId: string;
  createdByTeacherName: string;

  // 2. Khối lớp
  grade: GradeLevel;

  // 3. Chủ đề
  topic: InformaticsTopic;

  // 4. Tên bài
  title: string;

  // 5. Mục tiêu học tập (Kiến thức, Kỹ năng, Phẩm chất)
  learningObjectives: {
    knowledge: string[];
    skills: string[];
    attitudes: string[];
  };

  // 6. Kiến thức trọng tâm
  coreKnowledge: string[];

  // 7. Nội dung lý thuyết (định dạng Markdown / cấu trúc các phần)
  theoryContent: {
    overview: string;
    sections: Array<{
      title: string;
      body: string;
      keyPoints?: string[];
      friendlyHint?: string;
    }>;
  };

  // 8. Ví dụ minh họa (gần gũi với lứa tuổi tiểu học)
  illustrativeExamples: Array<{
    title: string;
    situation: string;
    explanation: string;
  }>;

  // 9. Hướng dẫn thực hành (trên máy tính: chuột, gõ phím, phần mềm hoặc Scratch)
  practicalGuide: {
    title: string;
    prerequisites: string;
    steps: PracticalInstructionStep[];
    safetyRules?: string; // An toàn khi dùng máy tính
  };

  // 10. Câu hỏi kiểm tra (danh sách ID hoặc đối tượng câu hỏi)
  assessmentQuestions: Question[];

  // 11. Bài tập luyện tập
  practiceExercises: Array<{
    id: string;
    title: string;
    task: string;
    hint: string;
  }>;

  // 12. Bài tập vận dụng (liên hệ thực tế cuộc sống, gia đình, nhà trường)
  applicationExercises: Array<{
    id: string;
    title: string;
    realLifeScenario: string;
    suggestedActivity: string;
  }>;

  // 13. Đáp án
  answerKey: {
    summary: string;
    questionAnswers: Record<string, string>; // questionId -> đáp án
  };

  // 14. Hướng dẫn chấm (Rubric rõ ràng)
  gradingRubric: {
    totalPoints: number;
    criteria: Array<{
      criteriaName: string;
      maxScore: number;
      description: string;
    }>;
  };

  // 15. Tài liệu nguồn
  sourceMaterial: {
    materialId: string;
    materialTitle: string;
    originalFileName: string;
    sectionsReferenced: string;
  };

  // 16. Những nội dung AI chưa chắc chắn (cần giáo viên xem xét trước khi duyệt)
  aiUncertainties: Array<{
    field: string;
    issue: string;
    recommendation: string;
  }>;

  // 17. Trạng thái phê duyệt
  status: ContentStatus;
  version: number;
  publishedAt?: string;
  approvedAt?: string;
  approvedByTeacherName?: string;
}

export interface LessonVersion {
  id: string;
  lessonId: string;
  versionNumber: number;
  status: ContentStatus;
  changedBy: string;
  changedAt: string;
  changeSummary: string;
  snapshot: Partial<Lesson>;
}

export interface ApprovalRecord {
  id: string;
  entityType: 'LESSON' | 'QUESTION' | 'ASSIGNMENT';
  entityId: string;
  entityTitle: string;
  action: 'CREATE' | 'REQUEST_REVIEW' | 'APPROVE' | 'PUBLISH' | 'REJECT' | 'WITHDRAW' | 'ARCHIVE';
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
  comment?: string;
}

export interface Assignment {
  id: string;
  code: string;
  title: string;
  description: string;
  lessonId?: string;
  grade: GradeLevel;
  topic: InformaticsTopic;
  type: 'PRACTICE' | 'OFFICIAL_TEST'; // Phân biệt luyện tập vs kiểm tra chính thức
  targetType: 'CLASS' | 'STUDENT';
  targetIds: string[]; // Danh sách classId hoặc studentId
  targetNames: string[];
  assignedByTeacherId: string;
  assignedByTeacherName: string;
  assignedAt: string;
  dueDate: string;
  timeLimitMinutes?: number; // 15, 30, 45 phút
  questions: Question[];
  totalPoints: number;
  passingScore: number;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
}

export interface StudentAnswer {
  questionId: string;
  selectedOptionIds?: string[];
  booleanAnswer?: boolean;
  textAnswer?: string;
  matchedPairs?: Array<{ leftId: string; rightText: string }>;
  orderedItems?: string[];
  isCorrect?: boolean;
  awardedPoints: number;
  maxPoints: number;
  teacherComment?: string;
  aiSuggestedScore?: number;
  aiEvaluationNote?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  assignmentType: 'PRACTICE' | 'OFFICIAL_TEST';
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  grade: GradeLevel;
  topic: InformaticsTopic;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  answers: Record<string, StudentAnswer>;
  score?: number;
  maxScore: number;
  isAutoGraded: boolean;
  reviewedByTeacherId?: string;
  reviewedAt?: string;
  feedback?: string;
}

export interface TopicProgress {
  topic: InformaticsTopic;
  masteryPercentage: number; // 0 - 100
  lessonsCompleted: number;
  totalLessons: number;
  exercisesDone: number;
  averageScore: number;
  weakPoints: string[];
  recommendedLessonIds: string[];
  recommendedQuestionIds: string[];
}

export interface StudentPersonalProgress {
  studentId: string;
  studentName: string;
  grade: GradeLevel;
  className: string;
  overallScoreAverage: number;
  totalAssignmentsSubmitted: number;
  completionRate: number; // %
  topics: Record<string, TopicProgress>;
  recentAchievements: Array<{
    id: string;
    title: string;
    description: string;
    dateEarned: string;
    icon: string;
  }>;
  weeklyProgress: Array<{
    week: string;
    tasksDone: number;
    avgScore: number;
  }>;
}

export interface SystemServiceStatus {
  service: 'FIREBASE_AUTH' | 'CLOUD_FIRESTORE' | 'CLOUD_STORAGE' | 'GEMINI_API';
  name: string;
  isConnected: boolean;
  statusText: string;
  configuredEnvVar?: string;
  setupInstructions: string;
}

export interface AIGenerateRequest {
  materialId: string;
  grade: GradeLevel;
  topic: InformaticsTopic;
  mode: 
    | 'FULL_LESSON'          // Toàn bộ bài học
    | 'THEORY_ONLY'          // Chỉ lý thuyết
    | 'QUIZ_ONLY'            // Chỉ câu hỏi trắc nghiệm
    | 'PRACTICE_ONLY'        // Chỉ bài tập thực hành
    | 'TEST_ONLY'            // Chỉ bài kiểm tra
    | 'REVIEW_ONLY'          // Chỉ bài ôn tập
    | 'REGENERATE_SECTION';  // Tạo lại một phần
  targetSection?: string;
  customTeacherNote?: string;
}
