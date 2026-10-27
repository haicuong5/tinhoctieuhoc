import React, { useState } from 'react';
import { 
  Lesson, 
  User, 
  ContentStatus 
} from '../../types';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  HelpCircle, 
  Send, 
  Award, 
  Terminal, 
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface LessonDetailModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  currentUser: User;
  onClose: () => void;
  onUpdateStatus?: (lessonId: string, status: ContentStatus, comment?: string) => void;
  onStartPractice?: (lesson: Lesson) => void;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  isOpen,
  currentUser,
  onClose,
  onUpdateStatus,
  onStartPractice
}) => {
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'PRACTICE' | 'QUESTIONS' | 'RUBRIC' | 'AI_NOTES'>('CONTENT');
  const [reviewComment, setReviewComment] = useState('');
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  if (!isOpen || !lesson) return null;

  const isTeacherOrAdmin = currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN';

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="text-emerald-700 font-semibold text-xs">● Đã công bố (Học sinh thấy được)</span>;
      case 'APPROVED':
        return <span className="text-blue-700 font-semibold text-xs">● Đã phê duyệt (Chưa công bố)</span>;
      case 'PENDING_REVIEW':
        return <span className="text-amber-700 font-semibold text-xs">● Chờ giáo viên duyệt</span>;
      case 'DRAFT':
        return <span className="text-slate-600 font-semibold text-xs">● Bản nháp AI mới tạo</span>;
      case 'REJECTED':
        return <span className="text-rose-700 font-semibold text-xs">● Từ chối phê duyệt</span>;
      case 'ARCHIVED':
        return <span className="text-slate-500 font-semibold text-xs">● Đã lưu trữ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Khối {lesson.grade}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-sky-700">{lesson.topic}</span>
              <span aria-hidden="true">·</span>
              <span>Mã: {lesson.code}</span>
              <span aria-hidden="true">·</span>
              <span>Phiên bản v{lesson.version}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {lesson.title}
            </h2>
            <div className="mt-1 flex items-center gap-3">
              {getStatusBadge(lesson.status)}
              {lesson.approvedByTeacherName && (
                <span className="text-xs text-slate-500">
                  Người duyệt: <strong className="text-slate-700">{lesson.approvedByTeacherName}</strong>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab('CONTENT')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'CONTENT'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Nội dung lý thuyết & Mục tiêu
          </button>
          <button
            onClick={() => setActiveTab('PRACTICE')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'PRACTICE'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Hướng dẫn Thực hành & Ví dụ ({lesson.practicalGuide.steps.length} bước)
          </button>
          <button
            onClick={() => setActiveTab('QUESTIONS')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'QUESTIONS'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Câu hỏi & Bài tập ({lesson.assessmentQuestions.length} câu)
          </button>
          <button
            onClick={() => setActiveTab('RUBRIC')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'RUBRIC'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Đáp án & Hướng dẫn chấm
          </button>
          {isTeacherOrAdmin && (
            <button
              onClick={() => setActiveTab('AI_NOTES')}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'AI_NOTES'
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-amber-700 hover:text-amber-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Ghi chú AI ({lesson.aiUncertainties.length})
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">

          {/* TAB 1: THEORY & OBJECTIVES */}
          {activeTab === 'CONTENT' && (
            <div className="space-y-6">
              
              {/* Learning Objectives (GDPT 2018) */}
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-600" />
                  Mục tiêu học tập (Yêu cầu cần đạt)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1.5">Về Kiến thức:</span>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      {lesson.learningObjectives.knowledge.map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1.5">Về Kỹ năng:</span>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      {lesson.learningObjectives.skills.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1.5">Về Phẩm chất & Thái độ:</span>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      {lesson.learningObjectives.attitudes.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Core Knowledge */}
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100">
                <h3 className="text-xs font-bold text-sky-950 uppercase tracking-wider mb-2">
                  Kiến thức trọng tâm bài học
                </h3>
                <ul className="space-y-1.5 text-xs text-sky-900">
                  {lesson.coreKnowledge.map((ck, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-sky-600">✓</span>
                      <span>{ck}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Theory Sections */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Nội dung bài giảng
                </h3>
                <p className="text-xs text-slate-600 italic bg-white p-3 rounded-lg border border-slate-200">
                  "{lesson.theoryContent.overview}"
                </p>

                {lesson.theoryContent.sections.map((section, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      {section.title}
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {section.body}
                    </p>
                    {section.keyPoints && section.keyPoints.length > 0 && (
                      <div className="pt-2 text-[11px] text-slate-600 flex flex-wrap gap-2">
                        <span className="font-semibold text-slate-700">Điểm cần nhớ:</span>
                        {section.keyPoints.map((pt, pIdx) => (
                          <span key={pIdx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {pt}
                          </span>
                        ))}
                      </div>
                    )}
                    {section.friendlyHint && (
                      <div className="mt-2 text-xs text-amber-800 bg-amber-50/80 p-2.5 rounded-lg border border-amber-100">
                        💡 <strong>Lời khuyên cho em:</strong> {section.friendlyHint}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Source Material Reference */}
              <div className="p-3 bg-slate-100/80 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Tài liệu nguồn của giáo viên: </span>
                  <span>{lesson.sourceMaterial.materialTitle} ({lesson.sourceMaterial.originalFileName})</span>
                </div>
                <span className="text-[11px] text-slate-500">{lesson.sourceMaterial.sectionsReferenced}</span>
              </div>
            </div>
          )}

          {/* TAB 2: PRACTICAL GUIDE & EXAMPLES */}
          {activeTab === 'PRACTICE' && (
            <div className="space-y-6">
              
              {/* Practical Guide */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-600" />
                      {lesson.practicalGuide.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Chuẩn bị: {lesson.practicalGuide.prerequisites}
                    </p>
                  </div>
                  {lesson.practicalGuide.safetyRules && (
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                      ⚠️ An toàn: {lesson.practicalGuide.safetyRules}
                    </span>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  {lesson.practicalGuide.steps.map((step) => (
                    <div key={step.step} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {step.step}
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="font-bold text-slate-900">{step.title}</div>
                        <div className="text-slate-700">{step.action}</div>
                        {step.tip && (
                          <div className="text-emerald-700 text-[11px]">
                            Mẹo nhỏ: {step.tip}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Illustrative Examples */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ví dụ minh họa gần gũi với lứa tuổi tiểu học
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.illustrativeExamples.map((ex, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                      <div className="font-bold text-slate-900 text-xs text-sky-800">{ex.title}</div>
                      <div className="text-slate-600 bg-slate-50 p-2 rounded">
                        <strong>Tình huống:</strong> {ex.situation}
                      </div>
                      <div className="text-slate-800">
                        <strong>Giải thích:</strong> {ex.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-life Application Exercises */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bài tập vận dụng thực tế
                </h3>
                {lesson.applicationExercises.map((appEx) => (
                  <div key={appEx.id} className="text-xs space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="font-semibold text-slate-900">{appEx.title}</div>
                    <p className="text-slate-700">Tình huống: {appEx.realLifeScenario}</p>
                    <p className="text-emerald-700 font-medium">Hoạt động gợi ý: {appEx.suggestedActivity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: QUESTIONS & EXERCISES */}
          {activeTab === 'QUESTIONS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Danh sách câu hỏi kiểm tra đính kèm bài học
                </h3>
                {onStartPractice && (
                  <button
                    onClick={() => {
                      onClose();
                      onStartPractice(lesson);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    Thử làm bài luyện tập này
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {lesson.assessmentQuestions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Câu {idx + 1}:</span>
                      <span className="text-slate-400 font-mono">{q.code}</span>
                      <span className="text-slate-500">· {q.difficulty}</span>
                      <span className="text-slate-500">· {q.points} điểm</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      Dạng: {q.type}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-900 text-sm">
                    {q.content}
                  </p>
                  {q.subPrompt && (
                    <p className="text-slate-500 text-xs italic">{q.subPrompt}</p>
                  )}

                  {/* Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="space-y-1.5 pl-2">
                      {q.options.map((opt) => {
                        const isCorrect = q.correctOptionIds?.includes(opt.id);
                        return (
                          <div 
                            key={opt.id}
                            className={`p-2 rounded-lg flex items-center justify-between ${
                              isCorrect && isTeacherOrAdmin 
                                ? 'bg-emerald-50 text-emerald-800 font-medium border border-emerald-200' 
                                : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span>{opt.text}</span>
                            {isCorrect && isTeacherOrAdmin && (
                              <span className="text-[11px] font-bold text-emerald-700">✓ Đáp án đúng</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Matching Pairs */}
                  {q.pairs && (
                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg">
                      {q.pairs.map((p, pI) => (
                        <React.Fragment key={pI}>
                          <div className="p-2 bg-white rounded border border-slate-200">{p.leftText}</div>
                          <div className="p-2 bg-white rounded border border-slate-200">{p.rightText}</div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Explanation for teachers */}
                  {isTeacherOrAdmin && q.explanation && (
                    <div className="mt-2 p-2.5 bg-slate-50 rounded-lg text-slate-600 text-[11px] border border-slate-200">
                      <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: RUBRIC & ANSWER KEY */}
          {activeTab === 'RUBRIC' && (
            <div className="space-y-6">
              
              {/* Grading Rubric */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hướng dẫn chấm & Thang điểm (Tổng: {lesson.gradingRubric.totalPoints} điểm)
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {lesson.gradingRubric.criteria.map((c, i) => (
                    <div key={i} className="py-2.5 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-slate-900">{c.criteriaName}</div>
                        <div className="text-slate-500 mt-0.5">{c.description}</div>
                      </div>
                      <span className="font-bold text-sky-700 shrink-0">{c.maxScore} điểm</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Answer Key */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Đáp án chuẩn xác được giáo viên lưu trữ
                </h3>
                <p className="text-xs text-slate-600 mb-2">{lesson.answerKey.summary}</p>
                <div className="space-y-2 text-xs">
                  {Object.entries(lesson.answerKey.questionAnswers).map(([qId, ans]) => (
                    <div key={qId} className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between">
                      <span className="font-mono text-slate-500">{qId}</span>
                      <span className="font-semibold text-emerald-700">{ans}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI UNCERTAINTIES & NOTES */}
          {activeTab === 'AI_NOTES' && isTeacherOrAdmin && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Kiểm soát độ tin cậy của AI (Transparency & Safety)
                </h3>
                <p className="text-xs text-amber-800">
                  Hệ thống phân biệt rõ thông tin lấy từ tài liệu của giáo viên và các nội dung AI đề xuất thêm. Giáo viên cần xem xét các điểm sau trước khi phê duyệt:
                </p>
              </div>

              {lesson.aiUncertainties.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                  ✓ Không có điểm nghi vấn nào. AI đã tạo nội dung bám sát 100% tài liệu gốc.
                </div>
              ) : (
                lesson.aiUncertainties.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 text-amber-800">
                      Phần cần kiểm tra: {item.field}
                    </div>
                    <p className="text-slate-700">
                      <strong>Vấn đề phát hiện:</strong> {item.issue}
                    </p>
                    <p className="text-emerald-700">
                      <strong>Khuyến nghị của hệ thống:</strong> {item.recommendation}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Teacher Approval Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {lesson.updatedAt && (
              <span>Cập nhật lần cuối: {new Date(lesson.updatedAt).toLocaleDateString('vi-VN')}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Đóng
            </button>

            {/* Approval Workflow Buttons for Teachers */}
            {isTeacherOrAdmin && onUpdateStatus && (
              <>
                {lesson.status === 'DRAFT' && (
                  <button
                    onClick={() => onUpdateStatus(lesson.id, 'PENDING_REVIEW', 'Gửi duyệt nội dung')}
                    className="px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                  >
                    Gửi chờ duyệt (PENDING_REVIEW)
                  </button>
                )}

                {(lesson.status === 'PENDING_REVIEW' || lesson.status === 'DRAFT') && (
                  <button
                    onClick={() => onUpdateStatus(lesson.id, 'APPROVED', 'Giáo viên đã kiểm tra và phê duyệt')}
                    className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                  >
                    Phê duyệt bài học (APPROVED)
                  </button>
                )}

                {lesson.status === 'APPROVED' && (
                  <button
                    onClick={() => onUpdateStatus(lesson.id, 'PUBLISHED', 'Công bố bài học cho học sinh')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    Công bố cho học sinh (PUBLISH)
                  </button>
                )}

                {lesson.status === 'PUBLISHED' && (
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn thu hồi bài học này về trạng thái chờ duyệt để chỉnh sửa?')) {
                        onUpdateStatus(lesson.id, 'PENDING_REVIEW', 'Thu hồi để cập nhật');
                      }
                    }}
                    className="px-4 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  >
                    Thu hồi bài học
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
