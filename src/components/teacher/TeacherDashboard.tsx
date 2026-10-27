import React from 'react';
import { User, Lesson, TeachingMaterial, Assignment, AssignmentSubmission, SchoolClass } from '../../types';
import { 
  FileText, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Users, 
  BookOpen, 
  ArrowUpRight, 
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface TeacherDashboardProps {
  currentUser: User;
  materials: TeachingMaterial[];
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  classes: SchoolClass[];
  onNavigateTab: (tab: string) => void;
  onOpenLesson: (lesson: Lesson) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  materials,
  lessons,
  assignments,
  submissions,
  classes,
  onNavigateTab,
  onOpenLesson,
}) => {
  // Compute key stats for teacher
  const pendingLessons = lessons.filter(l => l.status === 'PENDING_REVIEW' || l.status === 'DRAFT');
  const publishedLessons = lessons.filter(l => l.status === 'PUBLISHED');
  const teacherClasses = classes.filter(c => currentUser.assignedClassIds?.includes(c.id));
  
  // Average score across submissions
  const avgScore = submissions.length > 0 
    ? (submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length).toFixed(1)
    : '0';

  const completionRate = assignments.length > 0
    ? Math.round((submissions.length / (assignments.length * 30)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Giáo viên Tin học</span>
            <span aria-hidden="true">·</span>
            <span>Khối phụ trách: {currentUser.assignedGrades?.map(g => `Lớp ${g}`).join(', ') || '3, 4, 5'}</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.schoolName}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Xin chào, {currentUser.fullName}!
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Hệ thống hỗ trợ soạn bài học Tin học chuẩn GDPT 2018 bằng AI từ tài liệu của cô, kiểm soát quy trình phê duyệt và theo dõi kết quả học sinh.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('materials')}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            Tải tài liệu mới
          </button>
          <button
            onClick={() => onNavigateTab('ai-creator')}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Tạo bài học AI
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div 
          onClick={() => onNavigateTab('materials')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Tài liệu giảng dạy</span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {materials.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {materials.filter(m => m.processingStatus === 'EXTRACTED').length} tệp đã trích xuất cấu trúc
          </div>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => onNavigateTab('approval')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Bài học chờ duyệt</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {pendingLessons.length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Cần cô kiểm tra & duyệt nội dung
          </div>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => onNavigateTab('classes')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Bài tập & Nhiệm vụ</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {assignments.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Đang giao cho {teacherClasses.map(c => c.name).join(', ') || 'các lớp'}
          </div>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => onNavigateTab('reports')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Điểm trung bình</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {avgScore} / 10
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Dựa trên {submissions.length} bài nộp của học sinh
          </div>
        </div>
      </div>

      {/* Main 2-column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Lesson Approval Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Bài học môn Tin học (Quy trình kiểm soát chất lượng)
            </h2>
            <button
              onClick={() => onNavigateTab('approval')}
              className="text-xs font-medium text-sky-600 hover:text-sky-800 flex items-center gap-1"
            >
              Xem tất cả ({lessons.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {lessons.slice(0, 4).map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => onOpenLesson(lesson)}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Khối {lesson.grade}</span>
                    <span aria-hidden="true">·</span>
                    <span>{lesson.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-400">{lesson.code}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {lesson.title}
                  </h3>
                  <div className="text-xs text-slate-600 line-clamp-1">
                    {lesson.theoryContent.overview}
                  </div>
                  {lesson.aiUncertainties && lesson.aiUncertainties.length > 0 && (
                    <div className="pt-1 text-[11px] text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Có {lesson.aiUncertainties.length} lưu ý AI cần cô xem xét
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                    lesson.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    lesson.status === 'APPROVED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    lesson.status === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {lesson.status === 'PUBLISHED' ? 'Đã công bố' :
                     lesson.status === 'APPROVED' ? 'Đã duyệt' :
                     lesson.status === 'PENDING_REVIEW' ? 'Chờ duyệt' : 'Bản nháp AI'}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">
                    v{lesson.version} · {lesson.assessmentQuestions.length} câu hỏi
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Workflow Guides & Recent Submissions */}
        <div className="space-y-6">
          
          {/* Quick Action Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50/50 border border-sky-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900">
              Quy trình chuẩn bị bài giảng
            </h3>
            <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside">
              <li>Tải tệp bài giảng (PDF / Word / Slide)</li>
              <li>Hệ thống trích xuất cấu trúc văn bản</li>
              <li>AI sinh bài học bám sát tài liệu</li>
              <li>Giáo viên rà soát, chỉnh sửa & phê duyệt</li>
              <li>Công bố cho các lớp hoặc học sinh</li>
            </ol>
            <button
              onClick={() => onNavigateTab('ai-creator')}
              className="w-full mt-2 py-2 px-3 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              Bắt đầu tạo bài mới
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Submissions */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Bài nộp gần đây của học sinh
              </h3>
              <button
                onClick={() => onNavigateTab('reports')}
                className="text-[11px] text-sky-600 hover:underline"
              >
                Báo cáo đầy đủ
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {submissions.slice(0, 3).map((sub) => (
                <div key={sub.id} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{sub.studentName}</span>
                    <span className="font-bold text-emerald-600 tabular-nums">
                      {sub.score} / {sub.maxScore} điểm
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{sub.className} · {sub.assignmentType === 'OFFICIAL_TEST' ? 'Kiểm tra' : 'Luyện tập'}</span>
                    <span>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
