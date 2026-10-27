import React, { useState } from 'react';
import { Question, QuestionType, GradeLevel, DifficultyLevel, User } from '../../types';
import { 
  HelpCircle, 
  CheckCircle2, 
  Filter, 
  Plus, 
  Eye, 
  Sparkles, 
  Check, 
  X,
  Play
} from 'lucide-react';

interface QuestionBankProps {
  currentUser: User;
  questions: Question[];
  onSaveQuestion: (question: Question) => void;
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SINGLE_CHOICE: 'Trắc nghiệm 1 đáp án',
  MULTIPLE_CHOICE: 'Trắc nghiệm nhiều đáp án',
  TRUE_FALSE: 'Đúng / Sai',
  MATCHING: 'Ghép cặp đôi',
  ORDERING: 'Sắp xếp thứ tự',
  FILL_BLANK: 'Điền vào chỗ trống',
  SHORT_ANSWER: 'Tự luận trả lời ngắn',
  GUIDED_PRACTICE: 'Thực hành có hướng dẫn'
};

export const QuestionBank: React.FC<QuestionBankProps> = ({
  currentUser,
  questions,
  onSaveQuestion,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<QuestionType | 'ALL'>('ALL');
  const [inspectingQuestion, setInspectingQuestion] = useState<Question | null>(null);

  // Interactive Test Sandbox State for the active question
  const [userSelectedOptionIds, setUserSelectedOptionIds] = useState<string[]>([]);
  const [userBoolAnswer, setUserBoolAnswer] = useState<boolean | null>(null);
  const [userTextAnswer, setUserTextAnswer] = useState('');
  const [testResult, setTestResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

  const filteredQuestions = questions.filter((q) => {
    if (selectedGrade !== 'ALL' && q.grade !== selectedGrade) return false;
    if (selectedType !== 'ALL' && q.type !== selectedType) return false;
    return true;
  });

  const handleOpenTestModal = (q: Question) => {
    setInspectingQuestion(q);
    setUserSelectedOptionIds([]);
    setUserBoolAnswer(null);
    setUserTextAnswer('');
    setTestResult(null);
  };

  const handleVerifyInteractiveAnswer = () => {
    if (!inspectingQuestion) return;

    if (inspectingQuestion.type === 'SINGLE_CHOICE') {
      const correct = inspectingQuestion.correctOptionIds?.[0] === userSelectedOptionIds[0];
      setTestResult({
        isCorrect: Boolean(correct),
        feedback: correct ? 'Chính xác! Em đã chọn đúng đáp án.' : 'Chưa chính xác. Em hãy xem lời giải thích nhé.'
      });
    } else if (inspectingQuestion.type === 'MULTIPLE_CHOICE') {
      const correctSet = new Set(inspectingQuestion.correctOptionIds || []);
      const userSet = new Set(userSelectedOptionIds);
      const isCorrect = correctSet.size === userSet.size && [...correctSet].every(x => userSet.has(x));
      setTestResult({
        isCorrect,
        feedback: isCorrect ? 'Tuyệt vời! Em đã tìm đủ tất cả các đáp án đúng.' : 'Chưa đầy đủ hoặc có phương án chưa đúng.'
      });
    } else if (inspectingQuestion.type === 'TRUE_FALSE') {
      const isCorrect = inspectingQuestion.isTrue === userBoolAnswer;
      setTestResult({
        isCorrect,
        feedback: isCorrect ? 'Đúng rồi!' : 'Chưa đúng, phát biểu này ngược lại.'
      });
    } else if (inspectingQuestion.type === 'SHORT_ANSWER') {
      const keywords = inspectingQuestion.expectedKeywords || [];
      const hasKeywords = keywords.some(k => userTextAnswer.toLowerCase().includes(k.toLowerCase()));
      setTestResult({
        isCorrect: hasKeywords,
        feedback: hasKeywords ? 'Câu trả lời rất tốt, có chứa các ý chính cốt lõi.' : 'Cần bổ sung thêm các ý quan trọng nêu trong đáp án mẫu.'
      });
    } else {
      setTestResult({
        isCorrect: true,
        feedback: 'Đã hoàn thành kiểm tra dạng bài này!'
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Ngân hàng Câu hỏi & Đề thi Tin học (8 Dạng bài)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hỗ trợ đầy đủ các dạng bài tập trắc nghiệm, đúng/sai, ghép nối, sắp xếp, điền khuyết, tự luận và thực hành
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Tổng cộng: <strong>{questions.length}</strong> câu hỏi chuẩn hóa
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center gap-4 text-xs">
        
        {/* Grade filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Khối lớp:</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value) as GradeLevel)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
          >
            <option value="ALL">Tất cả các khối</option>
            <option value={3}>Lớp 3</option>
            <option value={4}>Lớp 4</option>
            <option value={5}>Lớp 5</option>
          </select>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Dạng câu hỏi:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
          >
            <option value="ALL">Tất cả 8 dạng bài</option>
            {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sky-700">Lớp {q.grade}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-400">{q.code}</span>
                  <span aria-hidden="true">·</span>
                  <span>{q.difficulty}</span>
                </div>
                <span className="font-bold text-slate-700 tabular-nums">{q.points} điểm</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  {QUESTION_TYPE_LABELS[q.type]}
                </span>
                <p className="text-sm font-bold text-slate-900 line-clamp-2">
                  {q.content}
                </p>
              </div>

              <div className="text-xs text-slate-500 line-clamp-1 italic">
                {q.topic}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                {q.isAiGenerated ? '✦ AI đề xuất' : 'Biên soạn thủ công'}
              </span>

              <button
                onClick={() => handleOpenTestModal(q)}
                className="px-3 py-1.5 font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" />
                Thử làm câu hỏi
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Question Sandbox Modal */}
      {inspectingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">
                  Lớp {inspectingQuestion.grade} · {QUESTION_TYPE_LABELS[inspectingQuestion.type]} · {inspectingQuestion.difficulty}
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Kiểm thử Tương tác Câu hỏi
                </h3>
              </div>
              <button
                onClick={() => setInspectingQuestion(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Đóng
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-relaxed">
                  {inspectingQuestion.content}
                </h4>
                {inspectingQuestion.subPrompt && (
                  <p className="text-slate-500 italic mt-1">{inspectingQuestion.subPrompt}</p>
                )}
              </div>

              {/* SINGLE_CHOICE */}
              {inspectingQuestion.type === 'SINGLE_CHOICE' && inspectingQuestion.options && (
                <div className="space-y-2">
                  {inspectingQuestion.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        userSelectedOptionIds.includes(opt.id)
                          ? 'border-sky-600 bg-sky-50/60 font-semibold text-slate-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="single_opt"
                        checked={userSelectedOptionIds.includes(opt.id)}
                        onChange={() => setUserSelectedOptionIds([opt.id])}
                        className="text-sky-600"
                      />
                      <span>{opt.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* MULTIPLE_CHOICE */}
              {inspectingQuestion.type === 'MULTIPLE_CHOICE' && inspectingQuestion.options && (
                <div className="space-y-2">
                  {inspectingQuestion.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        userSelectedOptionIds.includes(opt.id)
                          ? 'border-sky-600 bg-sky-50/60 font-semibold text-slate-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={userSelectedOptionIds.includes(opt.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserSelectedOptionIds([...userSelectedOptionIds, opt.id]);
                          } else {
                            setUserSelectedOptionIds(userSelectedOptionIds.filter(id => id !== opt.id));
                          }
                        }}
                        className="text-sky-600 rounded"
                      />
                      <span>{opt.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* TRUE_FALSE */}
              {inspectingQuestion.type === 'TRUE_FALSE' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => setUserBoolAnswer(true)}
                    className={`flex-1 py-3 rounded-xl border font-bold text-center transition-all ${
                      userBoolAnswer === true
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    ✓ ĐÚNG
                  </button>
                  <button
                    onClick={() => setUserBoolAnswer(false)}
                    className={`flex-1 py-3 rounded-xl border font-bold text-center transition-all ${
                      userBoolAnswer === false
                        ? 'border-rose-600 bg-rose-50 text-rose-800'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    ✗ SAI
                  </button>
                </div>
              )}

              {/* SHORT_ANSWER */}
              {inspectingQuestion.type === 'SHORT_ANSWER' && (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={userTextAnswer}
                    onChange={(e) => setUserTextAnswer(e.target.value)}
                    placeholder="Gõ câu trả lời của em vào đây..."
                    className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  {inspectingQuestion.sampleAnswer && (
                    <div className="p-2.5 bg-slate-50 rounded-lg text-slate-600 text-[11px]">
                      <strong>Đáp án mẫu của giáo viên:</strong> {inspectingQuestion.sampleAnswer}
                    </div>
                  )}
                </div>
              )}

              {/* MATCHING */}
              {inspectingQuestion.type === 'MATCHING' && inspectingQuestion.pairs && (
                <div className="space-y-2">
                  <span className="text-slate-500 block mb-1">Các cặp ghép chuẩn mực:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {inspectingQuestion.pairs.map((p, i) => (
                      <React.Fragment key={i}>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded font-medium">{p.leftText}</div>
                        <div className="p-2 bg-sky-50 border border-sky-100 rounded text-sky-900">{p.rightText}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* GUIDED_PRACTICE */}
              {inspectingQuestion.type === 'GUIDED_PRACTICE' && inspectingQuestion.practiceSteps && (
                <div className="space-y-2">
                  {inspectingQuestion.practiceSteps.map((s) => (
                    <div key={s.stepNumber} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        {s.stepNumber}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">{s.instruction}</div>
                        <div className="text-[11px] text-slate-500">Tiêu chí: {s.checkCriteria}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Result banner */}
              {testResult && (
                <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                  testResult.isCorrect ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}>
                  {testResult.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-bold">{testResult.feedback}</div>
                    {inspectingQuestion.explanation && (
                      <p className="text-[11px] mt-1 text-slate-600">
                        {inspectingQuestion.explanation}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Thang điểm: {inspectingQuestion.points} điểm
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleVerifyInteractiveAnswer}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
                >
                  Kiểm tra kết quả
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
