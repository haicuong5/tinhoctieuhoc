import React, { useState, useEffect } from 'react';
import { 
  Assignment, 
  Question, 
  AssignmentSubmission, 
  User, 
  StudentAnswer 
} from '../../types';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Sparkles,
  Trophy,
  ArrowLeft,
  X
} from 'lucide-react';

interface QuizPlayerProps {
  assignment: Assignment;
  currentUser: User;
  onFinish: (submission: AssignmentSubmission) => void;
  onCancel: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  assignment,
  currentUser,
  onFinish,
  onCancel,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(
    (assignment.timeLimitMinutes || 20) * 60
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState<string>(new Date().toISOString());

  const questions = assignment.questions;
  const currentQ = questions[currentQuestionIndex];
  const isPractice = assignment.type === 'PRACTICE';

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const currentAnswer = answers[currentQ.id] || {
    questionId: currentQ.id,
    awardedPoints: 0,
    maxPoints: currentQ.points,
  };

  // Handlers for question answer changes
  const handleSelectSingleOption = (optId: string) => {
    const isCorrect = currentQ.correctOptionIds?.[0] === optId;
    setAnswers({
      ...answers,
      [currentQ.id]: {
        questionId: currentQ.id,
        selectedOptionIds: [optId],
        isCorrect: isCorrect,
        awardedPoints: isCorrect ? currentQ.points : 0,
        maxPoints: currentQ.points,
      },
    });
  };

  const handleToggleMultipleOption = (optId: string) => {
    const prev = currentAnswer.selectedOptionIds || [];
    const next = prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId];
    
    // Check multiple correct
    const correctSet = new Set(currentQ.correctOptionIds || []);
    const isExact = correctSet.size === next.length && [...correctSet].every((x) => next.includes(x));
    
    setAnswers({
      ...answers,
      [currentQ.id]: {
        questionId: currentQ.id,
        selectedOptionIds: next,
        isCorrect: isExact,
        awardedPoints: isExact ? currentQ.points : (next.length > 0 ? Number((currentQ.points / 2).toFixed(1)) : 0),
        maxPoints: currentQ.points,
      },
    });
  };

  const handleSelectTrueFalse = (boolVal: boolean) => {
    const isCorrect = currentQ.isTrue === boolVal;
    setAnswers({
      ...answers,
      [currentQ.id]: {
        questionId: currentQ.id,
        booleanAnswer: boolVal,
        isCorrect,
        awardedPoints: isCorrect ? currentQ.points : 0,
        maxPoints: currentQ.points,
      },
    });
  };

  const handleTextAnswerChange = (val: string) => {
    const keywords = currentQ.expectedKeywords || [];
    const hasKeyword = keywords.some((k) => val.toLowerCase().includes(k.toLowerCase()));
    setAnswers({
      ...answers,
      [currentQ.id]: {
        questionId: currentQ.id,
        textAnswer: val,
        isCorrect: hasKeyword,
        awardedPoints: hasKeyword ? currentQ.points : Number((currentQ.points * 0.7).toFixed(1)),
        maxPoints: currentQ.points,
        teacherComment: 'Đã ghi nhận câu trả lời. Giáo viên sẽ đọc và nhận xét chi tiết.',
      },
    });
  };

  const handleSubmitQuiz = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    // Compute total score
    let totalScore = 0;
    let maxScore = 0;
    questions.forEach((q) => {
      maxScore += q.points;
      const ans = answers[q.id];
      if (ans && ans.awardedPoints) {
        totalScore += ans.awardedPoints;
      }
    });

    const scaledScore = Number(((totalScore / Math.max(1, maxScore)) * 10).toFixed(1));

    const submission: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      assignmentType: assignment.type,
      studentId: currentUser.id,
      studentName: currentUser.fullName,
      classId: currentUser.classId || 'class-4a',
      className: currentUser.className || 'Lớp 4A',
      grade: currentUser.grade || 4,
      topic: assignment.topic,
      attemptNumber: 1,
      startedAt: startTime,
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: ((assignment.timeLimitMinutes || 20) * 60) - secondsRemaining,
      status: 'GRADED',
      isAutoGraded: true,
      score: scaledScore,
      maxScore: 10,
      answers,
      feedback: scaledScore >= 8 
        ? 'Chúc mừng em! Em đã nắm rất vững kiến thức bài học.' 
        : scaledScore >= 5 
        ? 'Em làm bài khá tốt. Hãy xem lại những câu làm chưa đúng ở góc Ôn tập nhé!' 
        : 'Em cần đọc lại bài học và nhờ thầy cô hỗ trợ thêm nhé.'
    };

    onFinish(submission);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Top bar with timer and progress */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Em có chắc muốn dừng làm bài không? Kết quả hiện tại sẽ không được lưu.')) {
                  onCancel();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className={`font-semibold ${isPractice ? 'text-emerald-700' : 'text-purple-700'}`}>
                  ● {isPractice ? 'Bài Luyện tập' : 'Bài Kiểm tra chính thức'}
                </span>
                <span aria-hidden="true">·</span>
                <span>Khối {assignment.grade}</span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 line-clamp-1">
                {assignment.title}
              </h2>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-800 shadow-sm shrink-0">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Progress questions pill bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {questions.map((q, idx) => {
            const hasAnswer = answers[q.id] !== undefined;
            const isCurrent = idx === currentQuestionIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center justify-center ${
                  isCurrent
                    ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                    : hasAnswer
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-600">
                Câu {currentQuestionIndex + 1} / {questions.length}
              </span>
              <span>{currentQ.points} điểm</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {currentQ.content}
            </h3>

            {currentQ.subPrompt && (
              <p className="text-xs text-sky-700 bg-sky-50 p-2.5 rounded-xl border border-sky-100 font-medium">
                💡 {currentQ.subPrompt}
              </p>
            )}
          </div>

          {/* Formats */}
          {/* 1. SINGLE_CHOICE */}
          {currentQ.type === 'SINGLE_CHOICE' && currentQ.options && (
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = currentAnswer.selectedOptionIds?.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectSingleOption(opt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-xs ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/70 text-slate-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. MULTIPLE_CHOICE */}
          {currentQ.type === 'MULTIPLE_CHOICE' && currentQ.options && (
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((opt) => {
                const isSelected = currentAnswer.selectedOptionIds?.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleToggleMultipleOption(opt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-xs ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/70 text-slate-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <span className="text-[11px] font-bold">✓</span>}
                    </div>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. TRUE_FALSE */}
          {currentQ.type === 'TRUE_FALSE' && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => handleSelectTrueFalse(true)}
                className={`py-4 px-6 rounded-2xl border text-sm font-bold transition-all text-center flex flex-col items-center gap-1 ${
                  currentAnswer.booleanAnswer === true
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xl">👍</span>
                <span>ĐÚNG</span>
              </button>
              <button
                onClick={() => handleSelectTrueFalse(false)}
                className={`py-4 px-6 rounded-2xl border text-sm font-bold transition-all text-center flex flex-col items-center gap-1 ${
                  currentAnswer.booleanAnswer === false
                    ? 'border-rose-600 bg-rose-50 text-rose-800 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xl">👎</span>
                <span>SAI</span>
              </button>
            </div>
          )}

          {/* 4. SHORT_ANSWER */}
          {currentQ.type === 'SHORT_ANSWER' && (
            <div className="space-y-2 pt-2 text-xs">
              <textarea
                rows={4}
                value={currentAnswer.textAnswer || ''}
                onChange={(e) => handleTextAnswerChange(e.target.value)}
                placeholder="Em hãy gõ câu trả lời của mình tại đây nhé..."
                className="w-full p-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>
          )}

          {/* 5. MATCHING / ORDERING / GUIDED_PRACTICE preview for student */}
          {(currentQ.type === 'MATCHING' || currentQ.type === 'ORDERING' || currentQ.type === 'GUIDED_PRACTICE') && (
            <div className="space-y-3 pt-2 text-xs">
              {currentQ.pairs && (
                <div className="space-y-2">
                  <span className="font-semibold text-slate-700">Các phần cần ghi nhớ ghép đôi:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {currentQ.pairs.map((p, i) => (
                      <React.Fragment key={i}>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">{p.leftText}</div>
                        <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100 text-sky-950 font-medium">{p.rightText}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {currentQ.practiceSteps && (
                <div className="space-y-2">
                  <span className="font-semibold text-slate-700">Các bước thực hành trên máy tính:</span>
                  {currentQ.practiceSteps.map((s) => (
                    <div key={s.stepNumber} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {s.stepNumber}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{s.instruction}</div>
                        <div className="text-[11px] text-slate-500">{s.checkCriteria}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Immediate feedback for Practice mode */}
          {isPractice && answers[currentQ.id] && currentQ.explanation && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Giải thích học tập:
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-30 rounded-xl transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Câu trước
          </button>

          <div className="flex items-center gap-2">
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
              >
                Câu tiếp theo
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Nộp bài hoàn thành
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
