import {
  User,
  SchoolClass,
  TeachingMaterial,
  Lesson,
  Question,
  Assignment,
  AssignmentSubmission,
  StudentPersonalProgress,
  ApprovalRecord,
  SystemServiceStatus
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-01',
    username: 'admin',
    fullName: 'Thầy Vũ Hoàng Long',
    role: 'ADMIN',
    email: 'admin.long@tieuhoc.edu.vn',
    schoolName: 'Trường Tiểu học Ánh Dương - Hà Nội',
    createdAt: '2026-09-01T08:00:00Z',
    isActive: true,
  },
  {
    id: 'user-teacher-01',
    username: 'gv_mai',
    fullName: 'Cô Nguyễn Thị Mai',
    role: 'TEACHER',
    email: 'mai.nguyen@tieuhoc.edu.vn',
    phone: '0912 345 678',
    schoolName: 'Trường Tiểu học Ánh Dương - Hà Nội',
    assignedGrades: [4, 5],
    assignedClassIds: ['class-4a', 'class-4b', 'class-5a'],
    createdAt: '2026-09-02T08:30:00Z',
    isActive: true,
  },
  {
    id: 'user-teacher-02',
    username: 'gv_hung',
    fullName: 'Thầy Trần Văn Hùng',
    role: 'TEACHER',
    email: 'hung.tran@tieuhoc.edu.vn',
    phone: '0988 765 432',
    schoolName: 'Trường Tiểu học Ánh Dương - Hà Nội',
    assignedGrades: [3],
    assignedClassIds: ['class-3a', 'class-3b'],
    createdAt: '2026-09-02T09:00:00Z',
    isActive: true,
  },
  {
    id: 'user-student-01',
    username: 'hs_nam',
    fullName: 'Em Lê Bảo Nam',
    role: 'STUDENT',
    email: 'nam.le@tieuhoc.edu.vn',
    schoolName: 'Trường Tiểu học Ánh Dương - Hà Nội',
    grade: 4,
    classId: 'class-4a',
    className: 'Lớp 4A',
    createdAt: '2026-09-05T07:30:00Z',
    isActive: true,
  },
  {
    id: 'user-student-02',
    username: 'hs_maianh',
    fullName: 'Em Trần Mai Anh',
    role: 'STUDENT',
    email: 'maianh.tran@tieuhoc.edu.vn',
    schoolName: 'Trường Tiểu học Ánh Dương - Hà Nội',
    grade: 4,
    classId: 'class-4a',
    className: 'Lớp 4A',
    createdAt: '2026-09-05T07:35:00Z',
    isActive: true,
  },
  {
    id: 'user-student-03',
    username: 'hs_duc',
    fullName: 'Em Phạm Minh Đức',
    role: 'STUDENT',
    email: 'duc.pham@tieuhoc.edu.vn',
    schoolName: 'Trường Tiểu học Ánh Dương - Hà Nội',
    grade: 5,
    classId: 'class-5b',
    className: 'Lớp 5B',
    createdAt: '2026-09-05T07:40:00Z',
    isActive: true,
  },
  {
    id: 'user-student-04',
    username: 'hs_ha',
    fullName: 'Em Vũ Ngọc Hà',
    role: 'STUDENT',
    email: 'ha.vu@tieuhoc.edu.vn',
    schoolName: 'Trường Tiểu học Ánh Dương - Hà Nội',
    grade: 3,
    classId: 'class-3a',
    className: 'Lớp 3A',
    createdAt: '2026-09-05T07:45:00Z',
    isActive: true,
  }
];

export const INITIAL_CLASSES: SchoolClass[] = [
  {
    id: 'class-3a',
    name: 'Lớp 3A',
    grade: 3,
    academicYear: '2026-2027',
    headTeacherId: 'user-teacher-02',
    headTeacherName: 'Thầy Trần Văn Hùng',
    studentCount: 32,
    room: 'Phòng Tin học 1 (Tầng 2)',
    notes: 'Tiết học: Thứ 3 và Thứ 5 hàng tuần'
  },
  {
    id: 'class-3b',
    name: 'Lớp 3B',
    grade: 3,
    academicYear: '2026-2027',
    headTeacherId: 'user-teacher-02',
    headTeacherName: 'Thầy Trần Văn Hùng',
    studentCount: 30,
    room: 'Phòng Tin học 1 (Tầng 2)'
  },
  {
    id: 'class-4a',
    name: 'Lớp 4A',
    grade: 4,
    academicYear: '2026-2027',
    headTeacherId: 'user-teacher-01',
    headTeacherName: 'Cô Nguyễn Thị Mai',
    studentCount: 35,
    room: 'Phòng Tin học 2 (Tầng 3)',
    notes: 'Lớp trọng điểm ứng dụng Scratch'
  },
  {
    id: 'class-4b',
    name: 'Lớp 4B',
    grade: 4,
    academicYear: '2026-2027',
    headTeacherId: 'user-teacher-01',
    headTeacherName: 'Cô Nguyễn Thị Mai',
    studentCount: 34,
    room: 'Phòng Tin học 2 (Tầng 3)'
  },
  {
    id: 'class-5a',
    name: 'Lớp 5A',
    grade: 5,
    academicYear: '2026-2027',
    headTeacherId: 'user-teacher-01',
    headTeacherName: 'Cô Nguyễn Thị Mai',
    studentCount: 31,
    room: 'Phòng Tin học 2 (Tầng 3)'
  },
  {
    id: 'class-5b',
    name: 'Lớp 5B',
    grade: 5,
    academicYear: '2026-2027',
    headTeacherId: 'user-teacher-01',
    headTeacherName: 'Cô Nguyễn Thị Mai',
    studentCount: 33,
    room: 'Phòng Tin học 2 (Tầng 3)'
  }
];

export const INITIAL_MATERIALS: TeachingMaterial[] = [
  {
    id: 'mat-01',
    code: 'TL-TIN4-CDA-01',
    title: 'SGK Tin học 4 - Bài 3: Phần cứng và phần mềm máy tính',
    originalFileName: 'SGK_TinHoc4_Bai3_PhanCungPhanMem.pdf',
    fileFormat: 'PDF',
    fileSizeBytes: 3565158,
    fileSizeFormatted: '3.4 MB',
    grade: 4,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    relatedLessonName: 'Bài 3: Phần cứng và phần mềm máy tính',
    description: 'Tài liệu chuẩn theo Chương trình GDPT 2018, giới thiệu các thiết bị phần cứng nhập/xuất và các loại phần mềm cơ bản.',
    uploadedByTeacherId: 'user-teacher-01',
    uploadedByTeacherName: 'Cô Nguyễn Thị Mai',
    uploadedAt: '2026-10-10T14:20:00Z',
    lastProcessedAt: '2026-10-10T14:22:15Z',
    processingStatus: 'EXTRACTED',
    usageStatus: 'ACTIVE',
    isActive: true,
    version: 1,
    linkedLessonIds: ['lesson-01', 'lesson-04'],
    extractedContent: {
      summary: 'Bài học giúp học sinh phân biệt được phần cứng (hardware) và phần mềm (software). Nêu ví dụ về thiết bị vào, thiết bị ra và ứng dụng thực tế.',
      sections: [
        {
          id: 'sec-1',
          heading: '1. Khái niệm phần cứng máy tính',
          level: 1,
          content: 'Phần cứng là những bộ phận vật lý của máy tính mà em có thể nhìn thấy và chạm tay vào được như: thân máy, màn hình, bàn phím, chuột máy tính, tai nghe, loa và máy in.',
          hasVisuals: true
        },
        {
          id: 'sec-2',
          heading: '2. Khái niệm phần mềm máy tính',
          level: 1,
          content: 'Phần mềm là các chương trình được cài đặt bên trong máy tính giúp con người điều khiển máy tính làm việc. Em không thể chạm trực tiếp vào phần mềm.',
          tables: [
            {
              headers: ['Loại phần mềm', 'Ví dụ', 'Công dụng'],
              rows: [
                ['Hệ điều hành', 'Windows, macOS, Linux', 'Điều khiển toàn bộ máy tính hoạt động'],
                ['Phần mềm soạn thảo', 'Word, Google Docs', 'Gõ bài tập làm văn, làm báo tường'],
                ['Phần mềm luyện tập', 'RapidTyping, Scratch', 'Luyện gõ bàn phím, học lập trình vui vẻ']
              ]
            }
          ]
        },
        {
          id: 'sec-3',
          heading: '3. Mối quan hệ giữa phần cứng và phần mềm',
          level: 1,
          content: 'Phần cứng và phần mềm luôn đồng hành với nhau. Phần cứng như thể xác, còn phần mềm như linh hồn trí tuệ của máy tính. Không có phần mềm, máy tính không thể hoạt động được.'
        }
      ],
      keyTerms: ['Phần cứng', 'Phần mềm', 'Thiết bị vào (Input)', 'Thiết bị ra (Output)', 'Hệ điều hành']
    }
  },
  {
    id: 'mat-02',
    code: 'TL-TIN3-CDA-02',
    title: 'Giáo trình thực hành Tin học 3: Bàn phím và Chuột máy tính',
    originalFileName: 'GiaoTrinh_TinHoc3_ChuotVaBanPhim.docx',
    fileFormat: 'DOCX',
    fileSizeBytes: 1887436,
    fileSizeFormatted: '1.8 MB',
    grade: 3,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    relatedLessonName: 'Bài 2: Làm quen với Bàn phím và Chuột máy tính',
    description: 'Hướng dẫn các thao tác cơ bản với chuột (nháy đơn, nháy đúp, cuộn, kéo thả) và khu vực hàng phím cơ sở.',
    uploadedByTeacherId: 'user-teacher-02',
    uploadedByTeacherName: 'Thầy Trần Văn Hùng',
    uploadedAt: '2026-10-12T09:15:00Z',
    lastProcessedAt: '2026-10-12T09:16:30Z',
    processingStatus: 'EXTRACTED',
    usageStatus: 'ACTIVE',
    isActive: true,
    version: 1,
    linkedLessonIds: ['lesson-02'],
    extractedContent: {
      summary: 'Hình thành kỹ năng cầm chuột đúng tư thế, các thao tác nháy chuột và nhận biết hai phím có gờ F và J trên hàng phím cơ sở.',
      sections: [
        {
          id: 'sec-t3-1',
          heading: '1. Chuột máy tính và các thao tác',
          level: 1,
          content: 'Chuột máy tính thường có nút trái, nút phải và nút cuộn. Các thao tác gồm: Cầm chuột, Di chuyển chuột, Nháy chuột trái, Nháy đúp chuột, Nháy nút phải và Kéo thả chuột.'
        },
        {
          id: 'sec-t3-2',
          heading: '2. Bàn phím máy tính và hàng phím cơ sở',
          level: 1,
          content: 'Hàng phím cơ sở chứa hai phím đặc biệt có gờ là F và J. Đây là nơi đặt hai ngón tay trỏ của bàn tay trái và bàn tay phải để bắt đầu gõ 10 ngón.'
        }
      ],
      keyTerms: ['Nút trái chuột', 'Nút phải chuột', 'Nút cuộn', 'Phím có gờ F-J', 'Hàng phím cơ sở']
    }
  },
  {
    id: 'mat-03',
    code: 'TL-TIN5-CDB-03',
    title: 'Bài giảng điện tử: Tìm kiếm thông tin an toàn trên Internet',
    originalFileName: 'BaiGiang_TinHoc5_TimKiemInternetAnToan.pptx',
    fileFormat: 'PPTX',
    fileSizeBytes: 5452595,
    fileSizeFormatted: '5.2 MB',
    grade: 5,
    topic: 'CHỦ ĐỀ B: MẠNG MÁY TÍNH VÀ INTERNET',
    relatedLessonName: 'Bài 5: Tìm kiếm thông tin an toàn và có trách nhiệm trên Internet',
    description: 'Slide hướng dẫn chọn từ khóa tìm kiếm chính xác, nhận diện trang web an toàn và nguyên tắc bảo vệ thông tin cá nhân.',
    uploadedByTeacherId: 'user-teacher-01',
    uploadedByTeacherName: 'Cô Nguyễn Thị Mai',
    uploadedAt: '2026-10-18T16:00:00Z',
    lastProcessedAt: '2026-10-18T16:02:40Z',
    processingStatus: 'EXTRACTED',
    usageStatus: 'ACTIVE',
    isActive: true,
    version: 1,
    linkedLessonIds: ['lesson-03'],
    extractedContent: {
      summary: 'Cách dùng máy tìm kiếm Google an toàn, quy tắc SMART khi dùng Internet, không chia sẻ mật khẩu và địa chỉ nhà.',
      sections: [
        {
          id: 'sec-t5-1',
          heading: '1. Kỹ năng tìm kiếm với từ khóa',
          level: 1,
          content: 'Đặt từ khóa ngắn gọn, rõ ràng. Có thể dùng dấu ngoặc kép để tìm kiếm cụm từ chính xác.'
        },
        {
          id: 'sec-t5-2',
          heading: '2. Nhận biết thông tin tin cậy và an toàn',
          level: 1,
          content: 'Trang web có biểu tượng ổ khóa, địa chỉ bắt đầu bằng https://. Cẩn thận với các liên kết lạ hoặc thông báo trúng thưởng giả mạo.'
        }
      ],
      keyTerms: ['Từ khóa (Keyword)', 'Máy tìm kiếm', 'Bảo mật cá nhân', 'Quy tắc an toàn mạng']
    }
  },
  {
    id: 'mat-04',
    code: 'TL-TIN4-CDE-04',
    title: 'Tài liệu hướng dẫn thực hành Soạn thảo văn bản Word (Bản quét cũ)',
    originalFileName: 'Scan_BaiTap_Word_ThucHanh_2022.pdf',
    fileFormat: 'PDF',
    fileSizeBytes: 12687769,
    fileSizeFormatted: '12.1 MB',
    grade: 4,
    topic: 'CHỦ ĐỀ E: ỨNG DỤNG TIN HỌC',
    relatedLessonName: 'Bài 6: Định dạng đoạn văn bản',
    description: 'Tài liệu bản scan chất lượng thấp, hệ thống OCR báo lỗi không trích xuất đủ văn bản.',
    uploadedByTeacherId: 'user-teacher-01',
    uploadedByTeacherName: 'Cô Nguyễn Thị Mai',
    uploadedAt: '2026-10-22T11:45:00Z',
    lastProcessedAt: '2026-10-22T11:46:10Z',
    processingStatus: 'EXTRACTION_ERROR',
    usageStatus: 'INACTIVE',
    isActive: false,
    version: 1,
    linkedLessonIds: [],
    extractedContent: {
      summary: '',
      sections: [],
      keyTerms: [],
      unreadableNotes: 'LỖI TRÍCH XUẤT: Tệp PDF scan độ phân giải thấp (dưới 150 DPI), chữ bị nhòe và nghiêng trang. Hệ thống không thể nhận diện chính xác cấu trúc mục và bảng biểu. Đề nghị giáo viên tải lên bản DOCX gốc hoặc PDF có định dạng văn bản để AI phân tích.'
    }
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  // 1. SINGLE_CHOICE (Khối 4)
  {
    id: 'q-01',
    code: 'CH-TIN4-001',
    type: 'SINGLE_CHOICE',
    grade: 4,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    difficulty: 'NHẬN BIẾT',
    points: 1.0,
    content: 'Thiết bị nào sau đây thuộc về PHẦN CỨNG của máy tính?',
    subPrompt: 'Em hãy chọn 1 đáp án đúng nhất nhé.',
    options: [
      { id: 'opt-a', text: 'Phần mềm luyện gõ mười ngón RapidTyping' },
      { id: 'opt-b', text: 'Bàn phím máy tính' },
      { id: 'opt-c', text: 'Hệ điều hành Windows 11' },
      { id: 'opt-d', text: 'Trò chơi rèn luyện trí nhớ trực tuyến' }
    ],
    correctOptionIds: ['opt-b'],
    explanation: 'Bàn phím máy tính là vật thể vật lý mà em có thể nhìn thấy và chạm tay vào được, do đó nó là phần cứng. Các đáp án còn lại là chương trình cài đặt, tức phần mềm.',
    sourceMaterialId: 'mat-01',
    sourceReferenceNote: 'Mục 1 - Khái niệm phần cứng máy tính (trang 1)',
    status: 'PUBLISHED',
    isAiGenerated: true,
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-15T09:00:00Z'
  },
  // 2. MULTIPLE_CHOICE (Khối 4)
  {
    id: 'q-02',
    code: 'CH-TIN4-002',
    type: 'MULTIPLE_CHOICE',
    grade: 4,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    difficulty: 'THÔNG HIỂU',
    points: 1.5,
    content: 'Trong các thiết bị sau, những thiết bị nào là THIẾT BỊ RA (Output Device) giúp đưa kết quả xử lý từ máy tính tới em?',
    subPrompt: 'Câu hỏi có thể có nhiều hơn 1 đáp án đúng. Em hãy tích chọn tất cả.',
    options: [
      { id: 'opt-2a', text: 'Màn hình máy tính' },
      { id: 'opt-2b', text: 'Loa máy tính' },
      { id: 'opt-2c', text: 'Chuột máy tính' },
      { id: 'opt-2d', text: 'Máy in giấy' }
    ],
    correctOptionIds: ['opt-2a', 'opt-2b', 'opt-2d'],
    explanation: 'Màn hình (hiển thị hình ảnh/chữ), Loa (phát ra âm thanh) và Máy in (in tài liệu ra giấy) đều là thiết bị ra. Chuột là thiết bị vào (nhập lệnh).',
    sourceMaterialId: 'mat-01',
    sourceReferenceNote: 'Mục 1 & Bảng phân loại thiết bị',
    status: 'PUBLISHED',
    isAiGenerated: true,
    createdAt: '2026-10-15T09:05:00Z',
    updatedAt: '2026-10-15T09:05:00Z'
  },
  // 3. TRUE_FALSE (Khối 4)
  {
    id: 'q-03',
    code: 'CH-TIN4-003',
    type: 'TRUE_FALSE',
    grade: 4,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    difficulty: 'NHẬN BIẾT',
    points: 1.0,
    content: 'Phát biểu sau đây là Đúng hay Sai: "Máy tính chỉ cần có phần cứng là có thể hoạt động soạn thảo văn bản và chơi trò chơi mà không cần cài đặt phần mềm nào."',
    isTrue: false,
    explanation: 'Sai! Phần cứng không thể tự hoạt động nếu không có phần mềm hướng dẫn và điều khiển. Cần có hệ điều hành và các ứng dụng tương ứng.',
    sourceMaterialId: 'mat-01',
    sourceReferenceNote: 'Mục 3 - Mối quan hệ giữa phần cứng và phần mềm',
    status: 'PUBLISHED',
    isAiGenerated: true,
    createdAt: '2026-10-15T09:10:00Z',
    updatedAt: '2026-10-15T09:10:00Z'
  },
  // 4. MATCHING (Khối 4)
  {
    id: 'q-04',
    code: 'CH-TIN4-004',
    type: 'MATCHING',
    grade: 4,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    difficulty: 'VẬN DỤNG',
    points: 2.0,
    content: 'Em hãy ghép nối mỗi loại phần mềm ở cột bên trái với công dụng tương ứng ở cột bên phải:',
    pairs: [
      { id: 'pair-1', leftText: 'Phần mềm Microsoft Word', rightText: 'Soạn thảo văn bản và trình bày đoạn văn' },
      { id: 'pair-2', leftText: 'Phần mềm Paint', rightText: 'Vẽ tranh và tô màu các hình ngộ nghĩnh' },
      { id: 'pair-3', leftText: 'Phần mềm Scratch', rightText: 'Học lập trình kéo thả và tạo câu chuyện hoạt hình' },
      { id: 'pair-4', leftText: 'Hệ điều hành Windows', rightText: 'Quản lý và điều khiển hoạt động chung của máy tính' }
    ],
    explanation: 'Mỗi phần mềm được sinh ra để phục vụ một công việc cụ thể trong học tập và giải trí của các em.',
    sourceMaterialId: 'mat-01',
    sourceReferenceNote: 'Bảng tổng hợp phần mềm phổ biến',
    status: 'PUBLISHED',
    isAiGenerated: true,
    createdAt: '2026-10-15T09:15:00Z',
    updatedAt: '2026-10-15T09:15:00Z'
  },
  // 5. ORDERING (Khối 3)
  {
    id: 'q-05',
    code: 'CH-TIN3-005',
    type: 'ORDERING',
    grade: 3,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    difficulty: 'THÔNG HIỂU',
    points: 1.5,
    content: 'Em hãy sắp xếp các bước bật máy tính bàn đúng thứ tự chuẩn an toàn:',
    options: [
      { id: 'step-a', text: '1. Kiểm tra phích cắm nguồn điện an toàn' },
      { id: 'step-b', text: '2. Bấm nút công tắc trên Thân máy (CPU)' },
      { id: 'step-c', text: '3. Bấm nút nguồn Màn hình' },
      { id: 'step-d', text: '4. Chờ màn hình khởi động vào giao diện chính' }
    ],
    correctOrder: ['step-a', 'step-b', 'step-c', 'step-d'],
    explanation: 'Quy trình khởi động an toàn: kiểm tra nguồn -> bật thân máy -> bật màn hình -> chờ hệ điều hành tải xong.',
    sourceMaterialId: 'mat-02',
    status: 'PUBLISHED',
    isAiGenerated: false,
    createdAt: '2026-10-14T08:00:00Z',
    updatedAt: '2026-10-14T08:00:00Z'
  },
  // 6. FILL_BLANK (Khối 3)
  {
    id: 'q-06',
    code: 'CH-TIN3-006',
    type: 'FILL_BLANK',
    grade: 3,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    difficulty: 'NHẬN BIẾT',
    points: 1.0,
    content: 'Trên bàn phím máy tính, hai phím đặc biệt có gờ ở hàng phím cơ sở là phím [BLANK_1] và phím [BLANK_2].',
    blanks: [
      { index: 1, correctWord: 'F', hints: ['chữ F'] },
      { index: 2, correctWord: 'J', hints: ['chữ J'] }
    ],
    explanation: 'Phím F (cho ngón trỏ tay trái) và phím J (cho ngón trỏ tay phải) có gờ giúp định vị vị trí tay gõ mười ngón mà không cần nhìn bàn phím.',
    sourceMaterialId: 'mat-02',
    status: 'PUBLISHED',
    isAiGenerated: false,
    createdAt: '2026-10-14T08:15:00Z',
    updatedAt: '2026-10-14T08:15:00Z'
  },
  // 7. SHORT_ANSWER (Khối 5)
  {
    id: 'q-07',
    code: 'CH-TIN5-007',
    type: 'SHORT_ANSWER',
    grade: 5,
    topic: 'CHỦ ĐỀ B: MẠNG MÁY TÍNH VÀ INTERNET',
    difficulty: 'VẬN DỤNG CAO',
    points: 2.0,
    content: 'Nếu có một người lạ trên mạng Internet nhắn tin hỏi em tên trường, lớp học và số điện thoại của bố mẹ để gửi quà tặng, em sẽ xử lý như thế nào?',
    expectedKeywords: ['không trả lời', 'không cung cấp', 'báo cho bố mẹ', 'báo cho thầy cô', 'người lạ'],
    sampleAnswer: 'Em tuyệt đối không cung cấp thông tin cá nhân (tên trường, lớp, số điện thoại) cho người lạ trên mạng. Em sẽ chụp màn hình và báo ngay cho bố mẹ hoặc thầy cô giáo để được hỗ trợ.',
    explanation: 'Bảo vệ thông tin cá nhân là nguyên tắc vàng khi tham gia môi trường số.',
    sourceMaterialId: 'mat-03',
    status: 'PUBLISHED',
    isAiGenerated: true,
    aiConfidenceNote: 'Câu hỏi tự luận cần giáo viên xem xét câu trả lời của học sinh hoặc dùng thang điểm đề xuất của AI.',
    createdAt: '2026-10-19T10:00:00Z',
    updatedAt: '2026-10-19T10:00:00Z'
  },
  // 8. GUIDED_PRACTICE (Khối 4)
  {
    id: 'q-08',
    code: 'CH-TIN4-008',
    type: 'GUIDED_PRACTICE',
    grade: 4,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    difficulty: 'VẬN DỤNG',
    points: 2.0,
    content: 'Bài thực hành: Em hãy thực hiện tạo một thư mục mới trên màn hình nền (Desktop) có tên "BaiTap_TinHoc4".',
    practiceSteps: [
      { stepNumber: 1, instruction: 'Di chuyển chuột tới vùng trống trên màn hình nền Desktop.', checkCriteria: 'Con trỏ chuột nằm ở vùng không có biểu tượng' },
      { stepNumber: 2, instruction: 'Nhấn nút chuột phải để mở menu ngữ cảnh.', checkCriteria: 'Menu xuất hiện' },
      { stepNumber: 3, instruction: 'Di chuyển chuột chọn "New", sau đó chọn "Folder".', checkCriteria: 'Thư mục mới hiển thị với tên "New folder"' },
      { stepNumber: 4, instruction: 'Gõ tên "BaiTap_TinHoc4" và nhấn phím Enter.', checkCriteria: 'Thư mục được đổi tên thành công' }
    ],
    explanation: 'Thao tác tạo thư mục giúp các em biết cách tổ chức và lưu trữ tài liệu học tập ngăn nắp trên máy tính.',
    sourceMaterialId: 'mat-01',
    status: 'PUBLISHED',
    isAiGenerated: false,
    createdAt: '2026-10-16T14:00:00Z',
    updatedAt: '2026-10-16T14:00:00Z'
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'lesson-01',
    code: 'BH-TIN4-03',
    createdAt: '2026-10-15T08:30:00Z',
    updatedAt: '2026-10-16T10:00:00Z',
    createdByTeacherId: 'user-teacher-01',
    createdByTeacherName: 'Cô Nguyễn Thị Mai',
    grade: 4,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    title: 'Bài 3: Phần cứng và Phần mềm máy tính',
    learningObjectives: {
      knowledge: [
        'Nêu được tên và chức năng cơ bản của các thiết bị phần cứng máy tính.',
        'Hiểu được phần mềm là gì và kể tên được một số phần mềm học tập quen thuộc.',
        'Nhận biết được mối quan hệ mật thiết giữa phần cứng và phần mềm.'
      ],
      skills: [
        'Phân loại chính xác các thiết bị vào (chuột, bàn phím) và thiết bị ra (màn hình, loa, máy in).',
        'Khởi động được phần mềm học tập trên hệ điều hành máy tính.'
      ],
      attitudes: [
        'Có ý thức bảo vệ, giữ gìn các thiết bị phần cứng cẩn thận trong phòng máy tính.',
        'Tuân thủ nội quy an toàn khi sử dụng thiết bị điện tử.'
      ]
    },
    coreKnowledge: [
      'Phần cứng (Hardware) là những bộ phận vật lý sờ chạm được.',
      'Phần mềm (Software) là các chương trình máy tính hướng dẫn máy hoạt động.',
      'Không có phần mềm, phần cứng máy tính không thể làm việc được.'
    ],
    theoryContent: {
      overview: 'Chào các bạn học sinh Lớp 4! Hôm nay chúng mình sẽ cùng khám phá hai thế giới kỳ diệu bên trong chiếc máy tính: Thế giới Phần cứng và Thế giới Phần mềm nhé!',
      sections: [
        {
          title: '1. Khám phá Thế giới Phần cứng',
          body: 'Phần cứng giống như cơ thể của chúng ta vậy. Nó bao gồm tất cả các thiết bị bên ngoài và bên trong mà em có thể nhìn thấy, sờ thấy được: màn hình hiển thị hình ảnh rực rỡ, bàn phím với những phím bấm xinh xắn, chú chuột máy tính nhanh nhẹn, và thân máy chứa bộ xử lý thông minh.',
          keyPoints: ['Sờ chạm được', 'Có hình dáng cụ thể', 'Gồm thiết bị vào và thiết bị ra'],
          friendlyHint: 'Ghi nhớ nhanh: Cái gì chạm tay vào được là PHẦN CỨNG!'
        },
        {
          title: '2. Khám phá Thế giới Phần mềm',
          body: 'Nếu phần cứng là cơ thể, thì phần mềm chính là suy nghĩ và trí thông minh của máy tính! Phần mềm là những dòng lệnh và chương trình được các kỹ sư viết ra, được nạp vào máy tính. Em không thể dùng tay chạm vào phần mềm, nhưng có thể điều khiển và sử dụng nó trên màn hình.',
          keyPoints: ['Không chạm tay trực tiếp được', 'Gồm hệ điều hành và các ứng dụng', 'Ví dụ: Word để viết văn, Paint để vẽ tranh'],
          friendlyHint: 'Ghi nhớ nhanh: Các chương trình, trò chơi trên màn hình là PHẦN MỀM!'
        },
        {
          title: '3. Đôi bạn thân Phần cứng và Phần mềm',
          body: 'Phần cứng và phần mềm như hình với bóng. Chiếc loa (phần cứng) không thể phát ra bài hát nếu không có chương trình phát nhạc (phần mềm). Ngược lại, chương trình phát nhạc cũng chẳng thể kêu lên nếu máy tính không gắn loa hoặc tai nghe.',
          keyPoints: ['Cần kết hợp nhịp nhàng', 'Phần mềm điều khiển phần cứng làm việc']
        }
      ]
    },
    illustrativeExamples: [
      {
        title: 'Ví dụ 1: Chiếc xe đạp và người lái xe',
        situation: 'Chiếc xe đạp có khung xe, bánh xe, bàn đạp (như Phần cứng). Nếu không có em bé biết kỹ năng lái xe (như Phần mềm), chiếc xe sẽ đứng yên không thể chạy được.',
        explanation: 'Máy tính cũng vậy, thân máy và màn hình cần phần mềm điều khiển để bắt đầu làm việc.'
      },
      {
        title: 'Ví dụ 2: Tô màu tranh vui nhộn',
        situation: 'Em dùng chuột máy tính (phần cứng) để bấm chọn màu đỏ trong phần mềm Paint (phần mềm), rồi tô lên mái nhà trên màn hình (phần cứng).',
        explanation: 'Phần cứng tiếp nhận thao tác tay của em, phần mềm xử lý màu sắc và đưa kết quả ra màn hình.'
      }
    ],
    practicalGuide: {
      title: 'Thực hành nhận diện và phân loại thiết bị trong phòng máy',
      prerequisites: 'Học sinh ngồi đúng tư thế tại bàn máy tính, mắt cách màn hình 50-70cm.',
      steps: [
        {
          step: 1,
          title: 'Quan sát máy tính trước mặt',
          action: 'Nhìn xung quanh bàn học và chỉ tay vào 4 bộ phận chính: Thân máy, Màn hình, Bàn phím, Chuột.',
          tip: 'Không rung lắc mạnh dây cắm phía sau thân máy nhé.'
        },
        {
          step: 2,
          title: 'Khởi động phần mềm Paint',
          action: 'Dùng chuột nháy đúp vào biểu tượng bảng màu Paint trên màn hình nền Desktop.',
          tip: 'Nháy đúp là nhấn nút chuột trái hai lần thật nhanh và dứt khoát.'
        },
        {
          step: 3,
          title: 'Phân loại',
          action: 'Viết vào vở bài tập tên 2 thiết bị phần cứng và 2 phần mềm em vừa sử dụng.',
          tip: 'Chuột và màn hình là phần cứng; Paint và Windows là phần mềm.'
        }
      ],
      safetyRules: 'Luôn giữ tay khô ráo khi chạm vào bàn phím và công tắc nguồn điện máy tính.'
    },
    assessmentQuestions: [
      INITIAL_QUESTIONS[0],
      INITIAL_QUESTIONS[1],
      INITIAL_QUESTIONS[2],
      INITIAL_QUESTIONS[3]
    ],
    practiceExercises: [
      {
        id: 'ex-01',
        title: 'Thử tài quan sát',
        task: 'Em hãy kể tên 3 thiết bị phần cứng xuất hiện trong phòng học Tin học của trường em.',
        hint: 'Nhớ lại những đồ vật em có thể sờ chạm được trên bàn học máy tính nhé.'
      },
      {
        id: 'ex-02',
        title: 'Đố vui phần mềm',
        task: 'Khi muốn viết một bài thơ tặng mẹ trên máy tính, em sẽ nhờ sự trợ giúp của phần mềm nào?',
        hint: 'Phần mềm soạn thảo văn bản có biểu tượng chữ W màu xanh dương.'
      }
    ],
    applicationExercises: [
      {
        id: 'app-01',
        title: 'Em là kỹ sư nhỏ tuổi',
        realLifeScenario: 'Bố mua về một chiếc máy in mới để in tài liệu ở nhà nhưng khi cắm dây vào máy tính vẫn chưa in được. Bố bảo cần cài "Driver máy in".',
        suggestedActivity: 'Em hãy giải thích cho bố nghe vì sao chiếc máy in (phần cứng) cần thêm phần mềm (driver) thì mới hoạt động được nhé!'
      }
    ],
    answerKey: {
      summary: 'Đáp án chi tiết các câu hỏi 1-4 trong bài học',
      questionAnswers: {
        'q-01': 'Bàn phím máy tính (opt-b)',
        'q-02': 'Màn hình, Loa, Máy in (opt-2a, opt-2b, opt-2d)',
        'q-03': 'Sai',
        'q-04': 'Word -> Soạn thảo; Paint -> Vẽ; Scratch -> Lập trình; Windows -> Điều khiển máy'
      }
    },
    gradingRubric: {
      totalPoints: 10,
      criteria: [
        { criteriaName: 'Nhận biết phần cứng và phần mềm', maxScore: 3, description: 'Phân biệt đúng không nhầm lẫn giữa vật lý và chương trình' },
        { criteriaName: 'Phân loại thiết bị vào / thiết bị ra', maxScore: 3, description: 'Kể đúng ít nhất 2 thiết bị vào và 2 thiết bị ra' },
        { criteriaName: 'Thực hành an toàn và chuẩn xác', maxScore: 4, description: 'Cầm chuột đúng tư thế, mở được ứng dụng Paint, giữ gìn vệ sinh phòng máy' }
      ]
    },
    sourceMaterial: {
      materialId: 'mat-01',
      materialTitle: 'SGK Tin học 4 - Bài 3: Phần cứng và phần mềm máy tính',
      originalFileName: 'SGK_TinHoc4_Bai3_PhanCungPhanMem.pdf',
      sectionsReferenced: 'Trang 12 - 16, toàn bộ mục 1, 2, 3 và bảng tra cứu'
    },
    aiUncertainties: [
      {
        field: 'Ví dụ minh họa xe đạp',
        issue: 'Nội dung ví dụ xe đạp được AI đề xuất bổ sung để học sinh lớp 4 dễ hình dung, trong tài liệu gốc của giáo viên chỉ có ví dụ máy in.',
        recommendation: 'Giáo viên kiểm tra xem ví dụ này có phù hợp với tiết dạy trên lớp không.'
      }
    ],
    status: 'PUBLISHED',
    version: 1,
    publishedAt: '2026-10-16T10:00:00Z',
    approvedAt: '2026-10-16T09:30:00Z',
    approvedByTeacherName: 'Cô Nguyễn Thị Mai'
  },
  {
    id: 'lesson-02',
    code: 'BH-TIN3-02',
    createdAt: '2026-10-12T10:00:00Z',
    updatedAt: '2026-10-13T11:00:00Z',
    createdByTeacherId: 'user-teacher-02',
    createdByTeacherName: 'Thầy Trần Văn Hùng',
    grade: 3,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    title: 'Bài 2: Làm quen với Bàn phím và Chuột máy tính',
    learningObjectives: {
      knowledge: ['Biết được vị trí 2 phím có gờ F và J', 'Hiểu 4 thao tác với chuột máy tính'],
      skills: ['Cầm chuột đúng cách', 'Đặt tay đúng hàng phím cơ sở'],
      attitudes: ['Rèn tính kiên nhẫn khi tập gõ']
    },
    coreKnowledge: [
      'Chuột có nút trái, nút phải, nút cuộn.',
      'Hàng phím cơ sở là ngôi nhà xuất phát của mười ngón tay.',
      'Hai phím F và J có gờ để ngón trỏ tìm đúng chỗ.'
    ],
    theoryContent: {
      overview: 'Chào các bạn nhỏ lớp 3! Chúng mình cùng bắt tay làm quen với hai trợ thủ đắc lực nhất của máy tính: Bạn Chuột và Bạn Bàn Phím nhé!',
      sections: [
        {
          title: '1. Bạn Chuột máy tính thông minh',
          body: 'Chuột máy tính có hình dáng nhỏ xinh vừa vặn trong lòng bàn tay. Em dùng ngón trỏ đặt lên nút chuột trái, ngón giữa đặt lên nút chuột phải.',
          keyPoints: ['Nút trái để chọn và nháy đúp', 'Nút phải mở menu', 'Bánh xe cuộn trang']
        },
        {
          title: '2. Bạn Bàn phím và Hàng phím Cơ sở',
          body: 'Bàn phím có rất nhiều phím chữ và phím số. Ở hàng giữa có hai phím đặc biệt mang tên F và J với chiếc gờ nhỏ nhô lên.',
          keyPoints: ['Hàng phím cơ sở', 'Phím F cho tay trái', 'Phím J cho tay phải']
        }
      ]
    },
    illustrativeExamples: [
      {
        title: 'Ngón tay tìm nhà',
        situation: 'Khi không nhìn bàn phím, hai ngón tay trỏ chỉ cần sờ thấy hai cái gờ nhỏ là biết mình đã về đúng nhà F và J.',
        explanation: 'Giúp bé gõ chữ nhanh và chuẩn mười ngón.'
      }
    ],
    practicalGuide: {
      title: 'Thực hành nháy chuột và đặt tay gõ phím',
      prerequisites: 'Ngồi thẳng lưng, hai chân đặt thoải mái trên sàn.',
      steps: [
        { step: 1, title: 'Cầm chuột đúng cách', action: 'Đặt bàn tay phải ôm nhẹ lưng chuột, ngón trỏ ở nút trái.' },
        { step: 2, title: 'Thử nháy chuột', action: 'Nhấn nhẹ ngón trỏ vào nút trái một lần (nghe tiếng tách nhẹ).' }
      ]
    },
    assessmentQuestions: [
      INITIAL_QUESTIONS[4],
      INITIAL_QUESTIONS[5]
    ],
    practiceExercises: [
      { id: 'ex-t3-1', title: 'Đi tìm phím F và J', task: 'Em hãy nhắm mắt lại và dùng hai ngón trỏ tìm hai phím có gờ trên bàn phím.', hint: 'Sờ nhẹ ở hàng phím giữa.' }
    ],
    applicationExercises: [
      { id: 'app-t3-1', title: 'Trò chơi tập gõ', realLifeScenario: 'Em mở phần mềm RapidTyping để tập gõ các phím ASDF JKL;', suggestedActivity: 'Thi đua gõ đúng cùng bạn cùng bàn.' }
    ],
    answerKey: {
      summary: 'Đáp án bài 2 lớp 3',
      questionAnswers: {
        'q-05': '1 -> 2 -> 3 -> 4',
        'q-06': 'F và J'
      }
    },
    gradingRubric: {
      totalPoints: 10,
      criteria: [{ criteriaName: 'Tư thế cầm chuột và đặt tay', maxScore: 10, description: 'Thực hiện chuẩn' }]
    },
    sourceMaterial: {
      materialId: 'mat-02',
      materialTitle: 'Giáo trình thực hành Tin học 3: Bàn phím và Chuột máy tính',
      originalFileName: 'GiaoTrinh_TinHoc3_ChuotVaBanPhim.docx',
      sectionsReferenced: 'Mục 1 và 2'
    },
    aiUncertainties: [],
    status: 'PUBLISHED',
    version: 1,
    publishedAt: '2026-10-13T11:00:00Z',
    approvedAt: '2026-10-13T10:30:00Z',
    approvedByTeacherName: 'Thầy Trần Văn Hùng'
  },
  {
    id: 'lesson-03',
    code: 'BH-TIN5-05',
    createdAt: '2026-10-20T14:00:00Z',
    updatedAt: '2026-10-21T09:00:00Z',
    createdByTeacherId: 'user-teacher-01',
    createdByTeacherName: 'Cô Nguyễn Thị Mai',
    grade: 5,
    topic: 'CHỦ ĐỀ B: MẠNG MÁY TÍNH VÀ INTERNET',
    title: 'Bài 5: Tìm kiếm thông tin an toàn và có trách nhiệm trên Internet',
    learningObjectives: {
      knowledge: ['Biết cách chọn từ khóa tìm kiếm chính xác', 'Nêu được 3 nguyên tắc bảo vệ thông tin cá nhân'],
      skills: ['Thực hiện tìm kiếm thông tin bằng Google', 'Nhận diện website có mã hóa bảo mật https'],
      attitudes: ['Có tinh thần cảnh giác với các nội dung độc hại trên mạng']
    },
    coreKnowledge: [
      'Từ khóa tìm kiếm cần ngắn gọn, rõ ràng.',
      'Không chia sẻ mật khẩu, địa chỉ nhà, tên trường lớp cho người lạ.',
      'Báo ngay cho người lớn khi gặp thông tin đáng ngờ.'
    ],
    theoryContent: {
      overview: 'Internet là kho tàng tri thức khổng lồ của nhân loại, nhưng cũng tiềm ẩn nhiều cạm bẫy. Chúng mình hãy trở thành những công dân số thông thái và dũng cảm nhé!',
      sections: [
        {
          title: '1. Kỹ năng tìm kiếm với từ khóa ma thuật',
          body: 'Khi tìm kiếm bài hát hoặc kiến thức khoa học, em không nên gõ cả một câu dài lủng củng. Hãy chọn lọc các danh từ và cụm từ quan trọng nhất. Nếu muốn tìm chính xác tên một bài thơ, hãy đặt câu thơ đó trong dấu ngoặc kép ""',
          keyPoints: ['Từ khóa cô đọng', 'Dùng dấu ngoặc kép khi cần']
        },
        {
          title: '2. Lá chắn bảo vệ bản thân trên mạng',
          body: 'Thông tin cá nhân của em quý giá như chiếc chìa khóa nhà. Tuyệt đối không gửi ảnh gia đình, số điện thoại, mật khẩu tài khoản cho bất kỳ ai trên mạng xã hội.',
          keyPoints: ['Giữ kín bí mật cá nhân', 'Không tin người lạ trên mạng']
        }
      ]
    },
    illustrativeExamples: [
      {
        title: 'Cái bẫy trúng thưởng kim cương trong game',
        situation: 'Một trang web hiện lên thông báo "Chúc mừng bé đã trúng 1000 kim cương, hãy nhập số điện thoại của mẹ để nhận ngay!".',
        explanation: 'Đây là cái bẫy lừa đảo lấy tiền cước điện thoại. Em phải đóng ngay trang web lại.'
      }
    ],
    practicalGuide: {
      title: 'Thực hành tìm kiếm tư liệu học tập',
      prerequisites: 'Mở trình duyệt web Google Chrome hoặc Cốc Cốc.',
      steps: [
        { step: 1, title: 'Mở máy tìm kiếm', action: 'Gõ google.com vào thanh địa chỉ.' },
        { step: 2, title: 'Tìm kiếm với từ khóa', action: 'Gõ từ khóa "Tháp Rùa Hồ Gươm" và nhấn Enter.' }
      ]
    },
    assessmentQuestions: [
      INITIAL_QUESTIONS[6]
    ],
    practiceExercises: [
      { id: 'ex-t5-1', title: 'Chọn từ khóa hay', task: 'Nếu muốn tìm ảnh loài chim công ở vườn thú, em sẽ gõ từ khóa gì?', hint: 'Gõ ngắn gọn: "chim công ảnh đẹp"' }
    ],
    applicationExercises: [
      { id: 'app-t5-1', title: 'Xây dựng quy tắc gia đình', realLifeScenario: 'Cùng bố mẹ thảo luận thời gian sử dụng máy tính mỗi ngày không quá 45 phút.', suggestedActivity: 'Vẽ bảng quy ước gia đình dán cạnh máy tính.' }
    ],
    answerKey: {
      summary: 'Đáp án câu hỏi tìm kiếm an toàn',
      questionAnswers: { 'q-07': 'Không cung cấp thông tin, báo bố mẹ/thầy cô' }
    },
    gradingRubric: {
      totalPoints: 10,
      criteria: [{ criteriaName: 'Kỹ năng tìm kiếm & Đạo đức số', maxScore: 10, description: 'Hiểu và thực hiện an toàn' }]
    },
    sourceMaterial: {
      materialId: 'mat-03',
      materialTitle: 'Bài giảng điện tử: Tìm kiếm thông tin an toàn trên Internet',
      originalFileName: 'BaiGiang_TinHoc5_TimKiemInternetAnToan.pptx',
      sectionsReferenced: 'Slide 1 - Slide 12'
    },
    aiUncertainties: [
      {
        field: 'Quy tắc SMART',
        issue: 'Trong slide giáo viên có nhắc đến quy tắc SMART nhưng chưa giải thích chi tiết chữ R và T.',
        recommendation: 'Giáo viên kiểm tra và bổ sung định nghĩa trước khi phê duyệt công bố cho học sinh.'
      }
    ],
    status: 'PENDING_REVIEW', // Đang chờ giáo viên duyệt
    version: 1
  },
  {
    id: 'lesson-04',
    code: 'BH-TIN4-07',
    createdAt: '2026-10-24T16:00:00Z',
    updatedAt: '2026-10-24T16:00:00Z',
    createdByTeacherId: 'user-teacher-01',
    createdByTeacherName: 'Cô Nguyễn Thị Mai',
    grade: 4,
    topic: 'CHỦ ĐỀ E: ỨNG DỤNG TIN HỌC',
    title: 'Bài 7: Em làm quen với phần mềm Trình chiếu PowerPoint',
    learningObjectives: {
      knowledge: ['Biết biểu tượng phần mềm PowerPoint', 'Tạo được trang chiếu mới'],
      skills: ['Gõ tiêu đề và nội dung ngắn trên trang chiếu'],
      attitudes: ['Hứng thú sáng tạo bài thuyết trình']
    },
    coreKnowledge: ['PowerPoint giúp trình bày ý tưởng bằng hình ảnh và chữ sinh động.'],
    theoryContent: {
      overview: 'Bản nháp do AI khởi tạo từ tài liệu bài giảng PowerPoint của giáo viên...',
      sections: [
        {
          title: 'Khởi động PowerPoint',
          body: 'Nháy đúp chuột vào biểu tượng chữ P màu cam đỏ trên màn hình.'
        }
      ]
    },
    illustrativeExamples: [],
    practicalGuide: {
      title: 'Tạo trang chiếu đầu tiên',
      prerequisites: 'Mở máy tính',
      steps: [{ step: 1, title: 'Mở bài mới', action: 'Chọn Blank Presentation' }]
    },
    assessmentQuestions: [],
    practiceExercises: [],
    applicationExercises: [],
    answerKey: { summary: '', questionAnswers: {} },
    gradingRubric: { totalPoints: 10, criteria: [] },
    sourceMaterial: {
      materialId: 'mat-01',
      materialTitle: 'SGK Tin học 4',
      originalFileName: 'SGK_TinHoc4.pdf',
      sectionsReferenced: 'Bài 7'
    },
    aiUncertainties: [
      {
        field: 'Cấu trúc bài tập',
        issue: 'Bài học mới tạo ở dạng phác thảo thô DRAFT, chưa bổ sung đủ câu hỏi kiểm tra và bài tập vận dụng.',
        recommendation: 'Giáo viên nhấn "Tạo bài tập" hoặc tự tay bổ sung câu hỏi vào ngân hàng.'
      }
    ],
    status: 'DRAFT', // Bản nháp mới tạo
    version: 1
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-01',
    code: 'NV-TIN4-TUAN8',
    title: 'Nhiệm vụ tuần 8: Luyện tập Phần cứng và Phần mềm máy tính',
    description: 'Các em hãy hoàn thành 4 câu hỏi trắc nghiệm và ghép nối để củng cố kiến thức Bài 3 vừa học nhé!',
    lessonId: 'lesson-01',
    grade: 4,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    type: 'PRACTICE',
    targetType: 'CLASS',
    targetIds: ['class-4a'],
    targetNames: ['Lớp 4A'],
    assignedByTeacherId: 'user-teacher-01',
    assignedByTeacherName: 'Cô Nguyễn Thị Mai',
    assignedAt: '2026-10-18T08:00:00Z',
    dueDate: '2026-10-28T23:59:59Z',
    timeLimitMinutes: 20,
    questions: [
      INITIAL_QUESTIONS[0],
      INITIAL_QUESTIONS[1],
      INITIAL_QUESTIONS[2],
      INITIAL_QUESTIONS[3]
    ],
    totalPoints: 10,
    passingScore: 5.0,
    status: 'ACTIVE'
  },
  {
    id: 'assign-02',
    code: 'KT-TIN4-GIUAKY',
    title: 'Bài kiểm tra Định kỳ Giữa Học kỳ 1 - Môn Tin học 4',
    description: 'Bài kiểm tra chính thức tính điểm sổ liên lạc. Các em làm bài nghiêm túc, thời gian 30 phút.',
    lessonId: 'lesson-01',
    grade: 4,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    type: 'OFFICIAL_TEST',
    targetType: 'CLASS',
    targetIds: ['class-4a', 'class-4b'],
    targetNames: ['Lớp 4A', 'Lớp 4B'],
    assignedByTeacherId: 'user-teacher-01',
    assignedByTeacherName: 'Cô Nguyễn Thị Mai',
    assignedAt: '2026-10-20T08:00:00Z',
    dueDate: '2026-10-30T17:00:00Z',
    timeLimitMinutes: 30,
    questions: [
      INITIAL_QUESTIONS[0],
      INITIAL_QUESTIONS[1],
      INITIAL_QUESTIONS[2],
      INITIAL_QUESTIONS[3],
      INITIAL_QUESTIONS[7]
    ],
    totalPoints: 10,
    passingScore: 5.0,
    status: 'ACTIVE'
  }
];

export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub-01',
    assignmentId: 'assign-01',
    assignmentTitle: 'Nhiệm vụ tuần 8: Luyện tập Phần cứng và Phần mềm máy tính',
    assignmentType: 'PRACTICE',
    studentId: 'user-student-01',
    studentName: 'Em Lê Bảo Nam',
    classId: 'class-4a',
    className: 'Lớp 4A',
    grade: 4,
    topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
    attemptNumber: 1,
    startedAt: '2026-10-20T19:15:00Z',
    submittedAt: '2026-10-20T19:28:00Z',
    timeSpentSeconds: 780,
    status: 'GRADED',
    isAutoGraded: true,
    score: 8.5,
    maxScore: 10,
    reviewedByTeacherId: 'user-teacher-01',
    reviewedAt: '2026-10-21T08:30:00Z',
    feedback: 'Em làm bài rất tốt! Cần chú ý kỹ câu hỏi nhiều đáp án về thiết bị ra để đạt điểm tuyệt đối nhé.',
    answers: {
      'q-01': {
        questionId: 'q-01',
        selectedOptionIds: ['opt-b'],
        isCorrect: true,
        awardedPoints: 1.0,
        maxPoints: 1.0
      },
      'q-02': {
        questionId: 'q-02',
        selectedOptionIds: ['opt-2a', 'opt-2b'], // Thiếu opt-2d máy in
        isCorrect: false,
        awardedPoints: 1.0,
        maxPoints: 1.5,
        teacherComment: 'Đúng màn hình và loa, còn thiếu máy in giấy cũng là thiết bị ra em nhé.'
      },
      'q-03': {
        questionId: 'q-03',
        booleanAnswer: false,
        isCorrect: true,
        awardedPoints: 1.0,
        maxPoints: 1.0
      },
      'q-04': {
        questionId: 'q-04',
        matchedPairs: [
          { leftId: 'pair-1', rightText: 'Soạn thảo văn bản và trình bày đoạn văn' },
          { leftId: 'pair-2', rightText: 'Vẽ tranh và tô màu các hình ngộ nghĩnh' },
          { leftId: 'pair-3', rightText: 'Học lập trình kéo thả và tạo câu chuyện hoạt hình' },
          { leftId: 'pair-4', rightText: 'Quản lý và điều khiển hoạt động chung của máy tính' }
        ],
        isCorrect: true,
        awardedPoints: 2.0,
        maxPoints: 2.0
      }
    }
  }
];

export const INITIAL_STUDENT_PROGRESS: Record<string, StudentPersonalProgress> = {
  'user-student-01': {
    studentId: 'user-student-01',
    studentName: 'Em Lê Bảo Nam',
    grade: 4,
    className: 'Lớp 4A',
    overallScoreAverage: 8.5,
    totalAssignmentsSubmitted: 4,
    completionRate: 85,
    topics: {
      'CHỦ ĐỀ A: MÁY TÍNH VÀ EM': {
        topic: 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
        masteryPercentage: 88,
        lessonsCompleted: 3,
        totalLessons: 4,
        exercisesDone: 15,
        averageScore: 8.5,
        weakPoints: ['Phân biệt thiết bị vào và thiết bị ra dạng máy in/máy quét'],
        recommendedLessonIds: ['lesson-01'],
        recommendedQuestionIds: ['q-02']
      },
      'CHỦ ĐỀ B: MẠNG MÁY TÍNH VÀ INTERNET': {
        topic: 'CHỦ ĐỀ B: MẠNG MÁY TÍNH VÀ INTERNET',
        masteryPercentage: 75,
        lessonsCompleted: 1,
        totalLessons: 2,
        exercisesDone: 5,
        averageScore: 7.8,
        weakPoints: ['Từ khóa tìm kiếm dấu ngoặc kép'],
        recommendedLessonIds: [],
        recommendedQuestionIds: []
      }
    },
    recentAchievements: [
      {
        id: 'ach-01',
        title: 'Bàn Tay Vàng Lớp 4',
        description: 'Hoàn thành bài tập luyện gõ phím nhanh đạt 95% độ chính xác',
        dateEarned: '2026-10-15',
        icon: 'keyboard'
      },
      {
        id: 'ach-02',
        title: 'Nhà Thám Hiểm Máy Tính',
        description: 'Đạt điểm tối đa phần thi nhận diện phần cứng máy tính',
        dateEarned: '2026-10-20',
        icon: 'cpu'
      }
    ],
    weeklyProgress: [
      { week: 'Tuần 5', tasksDone: 2, avgScore: 8.0 },
      { week: 'Tuần 6', tasksDone: 3, avgScore: 8.2 },
      { week: 'Tuần 7', tasksDone: 2, avgScore: 8.8 },
      { week: 'Tuần 8', tasksDone: 3, avgScore: 8.5 }
    ]
  }
};

export const INITIAL_APPROVAL_RECORDS: ApprovalRecord[] = [
  {
    id: 'apr-01',
    entityType: 'LESSON',
    entityId: 'lesson-01',
    entityTitle: 'Bài 3: Phần cứng và Phần mềm máy tính (Lớp 4)',
    action: 'PUBLISH',
    actorId: 'user-teacher-01',
    actorName: 'Cô Nguyễn Thị Mai',
    actorRole: 'TEACHER',
    timestamp: '2026-10-16T10:00:00Z',
    comment: 'Đã kiểm tra kỹ các câu hỏi trắc nghiệm, bổ sung phần thực hành Paint và duyệt công bố cho các lớp 4A, 4B học.'
  },
  {
    id: 'apr-02',
    entityType: 'LESSON',
    entityId: 'lesson-03',
    entityTitle: 'Bài 5: Tìm kiếm thông tin an toàn trên Internet (Lớp 5)',
    action: 'REQUEST_REVIEW',
    actorId: 'user-teacher-01',
    actorName: 'Cô Nguyễn Thị Mai',
    actorRole: 'TEACHER',
    timestamp: '2026-10-21T09:00:00Z',
    comment: 'AI vừa tạo xong từ Slide giảng dạy. Cần rà soát lại phần câu hỏi tự luận tình huống trước khi duyệt.'
  }
];

export const SYSTEM_SERVICES_STATUS: SystemServiceStatus[] = [
  {
    service: 'GEMINI_API',
    name: 'Gemini 3.8 Flash AI Engine',
    isConnected: true, // Được tự động tiêm qua GEMINI_API_KEY ở môi trường AI Studio
    statusText: 'Sẵn sàng xử lý tài liệu và sinh cấu trúc bài học',
    configuredEnvVar: 'GEMINI_API_KEY',
    setupInstructions: 'Đã sẵn sàng. Sử dụng server proxy Express kết nối SDK @google/genai.'
  },
  {
    service: 'FIREBASE_AUTH',
    name: 'Firebase Authentication (Xác thực)',
    isConnected: false,
    statusText: 'Đang dùng bộ máy xác thực phân quyền nội bộ (Giai đoạn 1)',
    setupInstructions: 'Sẽ cấu hình ở Giai đoạn triển khai với công cụ set_up_firebase khi được xác nhận.'
  },
  {
    service: 'CLOUD_FIRESTORE',
    name: 'Cloud Firestore Database (Cơ sở dữ liệu đám mây)',
    isConnected: false,
    statusText: 'Đang dùng Local Data Layer với đầy đủ Repository Pattern',
    setupInstructions: 'Toàn bộ schema đã thiết kế chuẩn Firestore collections (users, classes, lessons, assignments, submissions).'
  },
  {
    service: 'CLOUD_STORAGE',
    name: 'Firebase Cloud Storage (Lưu trữ tệp PDF/DOCX/PPTX)',
    isConnected: false,
    statusText: 'Đang dùng bộ lưu trữ tệp cục bộ có kiểm soát quyền truy cập',
    setupInstructions: 'Tích hợp Google Cloud Storage bucket khi chuyển sang môi trường Cloud Run Production.'
  }
];
