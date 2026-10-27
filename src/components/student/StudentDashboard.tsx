import React, { useState } from 'react';
import { 
  User, 
  Lesson, 
  Assignment, 
  AssignmentSubmission, 
  StudentPersonalProgress,
  InformaticsTopic 
} from '../../types';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Star, 
  Play, 
  TrendingUp, 
  AlertCircle,
  HelpCircle,
  Laptop,
  Trophy
} from 'lucide-react';
import { QuizPlayer } from './QuizPlayer';
import { LessonDetailModal } from '../common/LessonDetailModal';

interface StudentDashboardProps {
  currentUser: User;
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  studentProgress?: StudentPersonalProgress;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onSaveSubmission: (submission: AssignmentSubmission) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  lessons,
  assignments,
  submissions,
  studentProgress,
  activeTab,
  onNavigateTab,
  onSaveSubmission,
}) => {
  const [activeQuizAssignment, setActiveQuizAssignment] = useState<Assignment | null>(null);
  const [inspectingLesson, setInspectingLesson] = useState<Lesson | null>(null);

  // Student only sees PUBLISHED lessons of their grade
  const studentLessons = lessons.filter(l => l.status === 'PUBLISHED' && l.grade === currentUser.grade);

  // Student only sees assignments targeted to their class or id
  const studentAssignments = assignments.filter(a => {
    if (a.targetType === 'CLASS' && currentUser.classId && a.targetIds.includes(currentUser.classId)) return true;
    if (a.targetType === 'STUDENT' && a.targetIds.includes(currentUser.id)) return true;
    return false;
  });

  // Student's personal submissions
  const mySubmissions = submissions.filter(s => s.studentId === currentUser.id);

  const handleFinishQuiz = (submission: AssignmentSubmission) => {
    onSaveSubmission(submission);
    setActiveQuizAssignment(null);
    onNavigateTab('results');
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-100 font-medium mb-1">
            <span>Chào mừng bạn nhỏ</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.className || `Khối ${currentUser.grade}`}</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.schoolName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Chào {currentUser.fullName}! 🌟
          </h1>
          <p className="text-xs text-sky-100 mt-1 max-w-lg leading-relaxed">
            Hôm nay chúng mình cùng khám phá những bài học Tin học thú vị và hoàn thành các nhiệm vụ tuần nhé!
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center">
            <div className="text-lg font-black tabular-nums">
              {mySubmissions.length}
            </div>
            <div className="text-[10px] text-sky-100 font-medium uppercase tracking-wider">
              Bài đã làm
            </div>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center">
            <div className="text-lg font-black tabular-nums">
              {studentProgress?.overallScoreAverage ?? '8.5'}
            </div>
            <div className="text-[10px] text-sky-100 font-medium uppercase tracking-wider">
              Điểm trung bình
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: BÀI HỌC CỦA EM */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Bài học Tin học Khối Lớp {currentUser.grade}
              </h2>
              <p className="text-xs text-slate-500">
                Các bài giảng đã được thầy cô phê duyệt chính thức
              </p>
            </div>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              {studentLessons.length} bài học
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-sky-700">{lesson.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-400">{lesson.code}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {lesson.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {lesson.theoryContent.overview}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-700">
                    <span className="font-semibold block text-slate-800">Thực hành:</span>
                    <p className="line-clamp-1">{lesson.practicalGuide.title}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {lesson.assessmentQuestions.length} câu hỏi ôn tập
                  </span>

                  <button
                    onClick={() => setInspectingLesson(lesson)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-sm flex items-center gap-1"
                  >
                    Vào học bài
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: NHIỆM VỤ TUẦN NÀY & LUYỆN TẬP */}
      {(activeTab === 'tasks' || activeTab === 'practice') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Nhiệm vụ & Bài tập Tuần này
              </h2>
              <p className="text-xs text-slate-500">
                Hoàn thành đúng hạn để nhận sao tích lũy nhé!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentAssignments.map((assign) => {
              const mySub = mySubmissions.find(s => s.assignmentId === assign.id);
              const isDone = Boolean(mySub);
              const isTest = assign.type === 'OFFICIAL_TEST';

              return (
                <div
                  key={assign.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                    isDone 
                      ? 'bg-emerald-50/20 border-emerald-200' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold text-xs ${isTest ? 'text-purple-700' : 'text-emerald-700'}`}>
                        ● {isTest ? 'Bài kiểm tra chính thức' : 'Bài Luyện tập'}
                      </span>
                      <span className="text-slate-400 font-mono">{assign.code}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {assign.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {assign.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Hạn nộp: {new Date(assign.dueDate).toLocaleDateString('vi-VN')}
                      </span>
                      <span>Thời gian: {assign.timeLimitMinutes} phút</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {isDone ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Đã hoàn thành!
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                          ({mySub?.score} / 10 điểm)
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Chưa làm bài
                      </span>
                    )}

                    <button
                      onClick={() => setActiveQuizAssignment(assign)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${
                        isDone
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          : 'bg-sky-600 hover:bg-sky-700 text-white'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      {isDone ? 'Làm lại để nâng cao điểm' : 'Bắt đầu làm bài'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: KẾT QUẢ CỦA EM */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Kết quả Học tập của Em ({currentUser.fullName})
              </h2>
              <p className="text-xs text-slate-500">
                Xem lại điểm số, huy hiệu khen thưởng và lời nhận xét của thầy cô
              </p>
            </div>
          </div>

          {/* Badges / Achievements Strip */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Huy hiệu Chăm ngoan & Tiến bộ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(studentProgress?.recentAchievements || [
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
              ]).map((ach) => (
                <div key={ach.id} className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0">
                    ⭐
                  </div>
                  <div>
                    <div className="font-bold text-amber-950">{ach.title}</div>
                    <p className="text-amber-900 text-[11px] mt-0.5">{ach.description}</p>
                    <span className="text-[10px] text-amber-700 mt-1 block">Đạt ngày: {ach.dateEarned}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submissions History Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Lịch sử các lần làm bài ({mySubmissions.length})
              </h3>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {mySubmissions.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Em chưa nộp bài tập nào. Hãy vào mục "Nhiệm vụ tuần này" để làm bài nhé!
                </div>
              ) : (
                mySubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <span className={`font-bold ${sub.assignmentType === 'OFFICIAL_TEST' ? 'text-purple-700' : 'text-emerald-700'}`}>
                          {sub.assignmentType === 'OFFICIAL_TEST' ? 'Kiểm tra' : 'Luyện tập'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{sub.topic}</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(sub.submittedAt || sub.startedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {sub.assignmentTitle}
                      </h4>
                      {sub.feedback && (
                        <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                          💌 <strong>Cô giáo nhận xét:</strong> "{sub.feedback}"
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-slate-900 tabular-nums">
                        {sub.score} / {sub.maxScore} điểm
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Thời gian: {Math.round(sub.timeSpentSeconds / 60)} phút
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: GÓC ÔN TẬP ĐƯỢC ĐỀ XUẤT */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Góc Ôn tập Cá nhân hóa Dành riêng cho Em
              </h2>
              <p className="text-xs text-slate-500">
                Dựa trên những câu làm chưa đúng, hệ thống đề xuất bài học và bài tập để củng cố
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Nội dung gợi ý rèn luyện thêm:
            </h3>

            {/* Targeted Weakness card */}
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 space-y-2 text-xs">
              <div className="font-bold text-sky-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-sky-700" />
                Kiến thức cần lưu ý: Phân biệt Thiết bị vào và Thiết bị ra
              </div>
              <p className="text-sky-900 leading-relaxed">
                Ở bài luyện tập tuần trước, em có chút nhầm lẫn ở câu hỏi về Máy in và Màn hình. Hãy cùng xem lại bài giảng Bài 3 và ôn lại câu hỏi này để đạt điểm 10 tuyệt đối nhé!
              </p>
              
              <div className="pt-2 flex flex-wrap gap-2">
                {studentLessons.slice(0, 1).map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setInspectingLesson(l)}
                    className="px-3 py-1.5 bg-white text-sky-800 font-bold rounded-xl border border-sky-200 hover:bg-sky-100 transition-colors"
                  >
                    Đọc lại {l.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Mastery Topics summary */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-900 mb-2">
                Mức độ nắm vững theo Chủ đề Tin học GDPT 2018:
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>CHỦ ĐỀ A: MÁY TÍNH VÀ EM</span>
                    <span className="text-emerald-700">88% (Rất tốt)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>CHỦ ĐỀ B: MẠNG MÁY TÍNH VÀ INTERNET</span>
                    <span className="text-sky-700">75% (Đạt yêu cầu)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-600 h-full rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quiz Player Fullscreen/Modal when active */}
      {activeQuizAssignment && (
        <QuizPlayer
          assignment={activeQuizAssignment}
          currentUser={currentUser}
          onFinish={handleFinishQuiz}
          onCancel={() => setActiveQuizAssignment(null)}
        />
      )}

      {/* Lesson Reader Modal */}
      {inspectingLesson && (
        <LessonDetailModal
          lesson={inspectingLesson}
          isOpen={true}
          currentUser={currentUser}
          onClose={() => setInspectingLesson(null)}
          onStartPractice={(l) => {
            setInspectingLesson(null);
            onNavigateTab('tasks');
          }}
        />
      )}

    </div>
  );
};
