import React, { useState } from 'react';
import { 
  TeachingMaterial, 
  Lesson, 
  GradeLevel, 
  InformaticsTopic, 
  User, 
  AIGenerateRequest 
} from '../../types';
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  RefreshCw, 
  Eye, 
  Send,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { requestAILessonGeneration } from '../../services/geminiService';

interface AILessonCreatorProps {
  currentUser: User;
  materials: TeachingMaterial[];
  preselectedMaterial?: TeachingMaterial | null;
  onLessonCreated: (lesson: Lesson) => void;
  onOpenLessonPreview: (lesson: Lesson) => void;
}

export const AILessonCreator: React.FC<AILessonCreatorProps> = ({
  currentUser,
  materials,
  preselectedMaterial,
  onLessonCreated,
  onOpenLessonPreview,
}) => {
  // Available valid materials (excluding extraction errors)
  const validMaterials = materials.filter(m => m.processingStatus === 'EXTRACTED');
  
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    preselectedMaterial?.id || (validMaterials.length > 0 ? validMaterials[0].id : '')
  );

  const [generationMode, setGenerationMode] = useState<AIGenerateRequest['mode']>('FULL_LESSON');
  const [customTeacherNote, setCustomTeacherNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedLesson, setGeneratedLesson] = useState<Lesson | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

  const handleStartGeneration = async () => {
    if (!selectedMaterial) {
      setGenerationError('Vui lòng chọn một tài liệu nguồn hợp lệ để AI phân tích.');
      return;
    }

    if (selectedMaterial.processingStatus === 'EXTRACTION_ERROR') {
      setGenerationError('Tài liệu đã chọn có lỗi trích xuất. Quy tắc an toàn không cho phép sử dụng tài liệu lỗi.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedLesson(null);
    setAiNote(null);

    const req: AIGenerateRequest = {
      materialId: selectedMaterial.id,
      grade: selectedMaterial.grade,
      topic: selectedMaterial.topic,
      mode: generationMode,
      customTeacherNote,
    };

    const response = await requestAILessonGeneration(
      req, 
      selectedMaterial, 
      currentUser.id, 
      currentUser.fullName
    );

    setIsGenerating(false);

    if (!response.success || !response.lesson) {
      setGenerationError(response.error || 'Đã xảy ra lỗi khi tạo bài học.');
      return;
    }

    setGeneratedLesson(response.lesson);
    setAiNote(response.note || (response.isRealAI ? 'Được tạo bởi Gemini 3.8 Flash' : 'Được tạo bởi Bộ máy Sư phạm Tin học'));
    
    // Lưu vào kho ở trạng thái DRAFT
    onLessonCreated(response.lesson);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-600" />
          AI Xây dựng Bài học Tin học từ Tài liệu Giáo viên
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Sử dụng Gemini API bám sát 100% tài liệu do cô tải lên, tự động chia sẻ 17 trường thông tin có cấu trúc
        </p>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Generation Parameters */}
        <div className="lg:col-span-2 space-y-5 bg-white p-6 rounded-2xl border border-slate-200">
          
          {/* Step 1: Material Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              1. Chọn tài liệu giảng dạy nguồn:
            </label>
            {validMaterials.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200">
                Chưa có tài liệu nào được trích xuất thành công. Vui lòng vào mục "Tài liệu" để tải lên tệp PDF/Word/PPTX trước.
              </div>
            ) : (
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white text-slate-900 font-medium"
              >
                {validMaterials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    [Lớp {mat.grade}] {mat.title} ({mat.fileFormat})
                  </option>
                ))}
              </select>
            )}

            {selectedMaterial && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-100">
                <div className="font-semibold text-slate-800">{selectedMaterial.topic}</div>
                <div>Tệp gốc: <span className="font-mono text-slate-500">{selectedMaterial.originalFileName}</span></div>
                <div className="line-clamp-2 italic text-slate-500">
                  {selectedMaterial.extractedContent?.summary || selectedMaterial.description}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Generation Mode */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              2. Chế độ tạo nội dung theo yêu cầu giáo viên:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'FULL_LESSON', label: 'Toàn bộ bài học', desc: '17 trường thông tin trọn vẹn' },
                { id: 'THEORY_ONLY', label: 'Tạo riêng lý thuyết', desc: 'Mục tiêu, tóm tắt và ghi nhớ' },
                { id: 'QUIZ_ONLY', label: 'Tạo câu hỏi trắc nghiệm', desc: 'Các dạng câu hỏi kiểm tra' },
                { id: 'PRACTICE_ONLY', label: 'Bài tập thực hành', desc: 'Hướng dẫn từng bước trên máy' },
                { id: 'TEST_ONLY', label: 'Tạo đề kiểm tra', desc: 'Đề kiểm tra kèm thang điểm' },
                { id: 'REVIEW_ONLY', label: 'Nội dung ôn tập', desc: 'Củng cố kiến thức trọng tâm' },
              ].map((mode) => {
                const isSelected = generationMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setGenerationMode(mode.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/50 text-sky-950 font-semibold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="text-xs">{mode.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Teacher's Custom pedagogical instructions */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              3. Ghi chú sư phạm riêng của cô (Tùy chọn):
            </label>
            <textarea
              rows={3}
              value={customTeacherNote}
              onChange={(e) => setCustomTeacherNote(e.target.value)}
              placeholder="Ví dụ: Chú ý nhấn mạnh thao tác phím F và J cho học sinh lớp 3; Tạo ví dụ minh họa về các tình huống an toàn số khi xem YouTube..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
            />
          </div>

          {generationError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
              {generationError}
            </div>
          )}

          {/* Trigger button */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              * Nội dung sau khi sinh sẽ được lưu ở trạng thái <strong>DRAFT (Bản nháp)</strong>. Học sinh chỉ thấy được khi cô nhấn <strong>Phê duyệt & Công bố</strong>.
            </div>

            <button
              onClick={handleStartGeneration}
              disabled={isGenerating || !selectedMaterial}
              className="px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  AI đang phân tích tài liệu...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Yêu cầu AI Xây dựng Bài học
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Pedagogical & Safety Governance Rules */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cam kết Sư phạm & Bảo mật dữ liệu
            </h3>
            <ul className="text-xs text-slate-600 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="font-bold text-sky-600">•</span>
                <span><strong>Ngôn ngữ chuẩn mực:</strong> Tiếng Việt dễ hiểu, trong sáng, phù hợp tâm lý học sinh tiểu học.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-sky-600">•</span>
                <span><strong>Tuyệt đối trung thực:</strong> Không bịa đặt nguồn gốc hay dẫn chứng không có trong tài liệu của giáo viên.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-sky-600">•</span>
                <span><strong>Minh bạch nghi vấn:</strong> Báo cáo rõ ràng mọi suy luận bổ sung tại mục <em>Những nội dung AI chưa chắc chắn</em>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-sky-600">•</span>
                <span><strong>Quyền kiểm soát thuộc giáo viên:</strong> Giáo viên có toàn quyền sửa đáp án, biên tập lại trước khi duyệt.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Quy tắc phê duyệt
            </div>
            <p className="text-[11px] leading-relaxed">
              Bài học AI tạo ra không bao giờ tự động gửi tới học sinh. Hệ thống ghi nhật ký phê duyệt (Approval Records) đầy đủ theo thời gian.
            </p>
          </div>
        </div>

      </div>

      {/* Generated Lesson Result Preview Card */}
      {generatedLesson && (
        <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI đã tạo thành công bài học (Trạng thái: DRAFT - Bản nháp)</span>
                {aiNote && <span className="text-slate-500 font-normal">· {aiNote}</span>}
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {generatedLesson.title}
              </h2>
              <div className="text-xs text-slate-500">
                Mã: {generatedLesson.code} · Khối {generatedLesson.grade} · {generatedLesson.assessmentQuestions.length} câu hỏi đánh giá kèm theo
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenLessonPreview(generatedLesson)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                Xem toàn bộ 17 trường
              </button>
            </div>
          </div>

          {/* Quick breakdown preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">Kiến thức trọng tâm:</span>
              <ul className="text-slate-600 space-y-1 list-disc list-inside">
                {generatedLesson.coreKnowledge.slice(0, 3).map((ck, i) => (
                  <li key={i} className="truncate">{ck}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">Hướng dẫn thực hành:</span>
              <p className="text-slate-700 font-medium">{generatedLesson.practicalGuide.title}</p>
              <p className="text-slate-500 text-[11px]">{generatedLesson.practicalGuide.steps.length} bước thực hiện trên máy tính</p>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-xl space-y-1 border border-amber-100">
              <span className="font-bold text-amber-900 block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                Lưu ý AI ({generatedLesson.aiUncertainties.length}):
              </span>
              {generatedLesson.aiUncertainties.length > 0 ? (
                <p className="text-amber-800 text-[11px] line-clamp-2">
                  {generatedLesson.aiUncertainties[0].issue}
                </p>
              ) : (
                <p className="text-emerald-700 text-[11px]">Không có điểm nghi vấn.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
