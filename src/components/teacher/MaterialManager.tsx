import React, { useState, useRef } from 'react';
import { TeachingMaterial, GradeLevel, InformaticsTopic, User, Lesson } from '../../types';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Eye, 
  Sparkles,
  RefreshCw,
  X,
  Search,
  Filter,
  Download,
  Edit3,
  Power,
  ShieldAlert,
  FileCheck,
  AlertTriangle,
  Info,
  BookOpen,
  Lock,
  Layers
} from 'lucide-react';
import { uploadTeachingMaterialFile, downloadTeachingMaterial } from '../../services/geminiService';
import { storageService } from '../../services/storageService';

interface MaterialManagerProps {
  currentUser: User;
  materials: TeachingMaterial[];
  onSaveMaterial: (material: TeachingMaterial) => void;
  onDeleteMaterial: (id: string) => void;
  onNavigateToAICreatorWithMaterial: (material: TeachingMaterial) => void;
}

const TOPICS: InformaticsTopic[] = [
  'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
  'CHỦ ĐỀ B: MẠNG MÁY TÍNH VÀ INTERNET',
  'CHỦ ĐỀ C: TỔ CHỨC LƯU TRỮ, TÌM KIẾM VÀ TRAO ĐỔI THÔNG TIN',
  'CHỦ ĐỀ D: ĐẠO ĐỨC, PHÁP LUẬT VÀ VĂN HÓA TRONG MÔI TRƯỜNG SỐ',
  'CHỦ ĐỀ E: ỨNG DỤNG TIN HỌC',
  'CHỦ ĐỀ F: GIẢI QUYẾT VẤN ĐỀ VỚI SỰ TRỢ GIÚP CỦA MÁY TÍNH',
];

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const MaterialManager: React.FC<MaterialManagerProps> = ({
  currentUser,
  materials,
  onSaveMaterial,
  onDeleteMaterial,
  onNavigateToAICreatorWithMaterial,
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'ALL'>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<InformaticsTopic | 'ALL'>('ALL');
  const [selectedUsageStatus, setSelectedUsageStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedProcessingStatus, setSelectedProcessingStatus] = useState<'ALL' | 'EXTRACTED' | 'EXTRACTION_ERROR'>('ALL');

  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [inspectingMaterial, setInspectingMaterial] = useState<TeachingMaterial | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<TeachingMaterial | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<TeachingMaterial | null>(null);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileFormat, setFileFormat] = useState<'PDF' | 'DOCX' | 'PPTX'>('PDF');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(2.5 * 1024 * 1024);
  const [grade, setGrade] = useState<GradeLevel>(4);
  const [topic, setTopic] = useState<InformaticsTopic>('CHỦ ĐỀ A: MÁY TÍNH VÀ EM');
  const [relatedLessonName, setRelatedLessonName] = useState('');
  const [description, setDescription] = useState('');
  const [fileContentPreview, setFileContentPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editGrade, setEditGrade] = useState<GradeLevel>(4);
  const [editTopic, setEditTopic] = useState<InformaticsTopic>('CHỦ ĐỀ A: MÁY TÍNH VÀ EM');
  const [editRelatedLessonName, setEditRelatedLessonName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUsageStatus, setEditUsageStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Download Feedback State
  const [downloadFeedback, setDownloadFeedback] = useState<{ id: string; message: string; isError?: boolean } | null>(null);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Student Protection Guard
  if (currentUser.role === 'STUDENT') {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3 max-w-xl mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-rose-900">Quyền truy cập bị giới hạn</h2>
        <p className="text-xs text-rose-700 leading-relaxed">
          Kho tài liệu giảng dạy gốc dành riêng cho Giáo viên và Quản trị viên. Học sinh chỉ được xem các bài học và bài tập đã được giáo viên phê duyệt và công bố chính thức.
        </p>
      </div>
    );
  }

  // Filter logic
  const filteredMaterials = materials.filter((m) => {
    if (selectedGrade !== 'ALL' && m.grade !== selectedGrade) return false;
    if (selectedTopic !== 'ALL' && m.topic !== selectedTopic) return false;
    if (selectedUsageStatus !== 'ALL') {
      const status = m.usageStatus || (m.isActive ? 'ACTIVE' : 'INACTIVE');
      if (status !== selectedUsageStatus) return false;
    }
    if (selectedProcessingStatus !== 'ALL' && m.processingStatus !== selectedProcessingStatus) return false;
    
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchFile = m.originalFileName.toLowerCase().includes(q);
      const matchCode = (m.code || '').toLowerCase().includes(q);
      const matchLesson = (m.relatedLessonName || '').toLowerCase().includes(q);
      const matchTeacher = (m.uploadedByTeacherName || '').toLowerCase().includes(q);
      if (!matchTitle && !matchFile && !matchCode && !matchLesson && !matchTeacher) return false;
    }
    return true;
  });

  // Handle Real File Selection from Disk
  const handleNativeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadNotice(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate File Extension
    const extension = file.name.split('.').pop()?.toUpperCase();
    if (!extension || !['PDF', 'DOCX', 'PPTX'].includes(extension)) {
      setUploadError(`Định dạng tệp "${file.name}" không được hỗ trợ. Vui lòng tải tệp có phần mở rộng: .pdf, .docx, .pptx.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate File Size (<= 20 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`Dung lượng tệp vượt quá giới hạn 20MB (${(file.size / (1024 * 1024)).toFixed(1)} MB). Vui lòng nén hoặc chọn tệp nhỏ hơn.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const detectedFormat = extension as 'PDF' | 'DOCX' | 'PPTX';
    setFileName(file.name);
    setFileFormat(detectedFormat);
    setFileSizeBytes(file.size);

    // Auto populate Title if empty
    if (!title) {
      const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(autoTitle);
    }

    // Preview snippet from text / simulation
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = typeof event.target?.result === 'string' ? event.target.result : '';
      setFileContentPreview(text.substring(0, 1000) || `Tệp ${file.name} dung lượng ${(file.size / 1024).toFixed(1)} KB đã sẵn sàng tải lên.`);
    };
    reader.onerror = () => {
      setFileContentPreview(`Tệp nhị phân ${file.name} đã được chọn.`);
    };
    if (file.type.includes('text') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      setFileContentPreview(`Tệp ${detectedFormat} chuẩn: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB). Sẵn sàng trích xuất.`);
    }
  };

  // Quick Sample File Handler for Testing
  const handleSelectSample = (format: 'PDF' | 'DOCX' | 'PPTX', sampleName: string, sampleGrade: GradeLevel, sampleTopic: InformaticsTopic, sampleLesson: string, sampleContent: string, isBuggy = false) => {
    setFileFormat(format);
    setFileName(sampleName);
    setGrade(sampleGrade);
    setTopic(sampleTopic);
    setRelatedLessonName(sampleLesson);
    setTitle(sampleName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    setFileSizeBytes(isBuggy ? 150 * 1024 : 2.4 * 1024 * 1024);
    setFileContentPreview(sampleContent);
    setUploadError(null);
    setUploadNotice(isBuggy ? 'Đã nạp mẫu tệp scan mờ/lỗi để kiểm thử cơ chế cảnh báo' : 'Đã nạp mẫu tài liệu chuẩn thành công');
  };

  // Upload Form Submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName || !title.trim()) {
      setUploadError('Vui lòng nhập tên tài liệu và đính kèm tệp tin hợp lệ (.pdf, .docx, .pptx).');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);

    // Call server upload endpoint with role verification
    const result = await uploadTeachingMaterialFile({
      title: title.trim(),
      grade,
      topic,
      relatedLessonName: relatedLessonName.trim() || undefined,
      description: description.trim() || 'Tài liệu giảng dạy môn Tin học cấp Tiểu học chuẩn GDPT 2018.',
      originalFileName: fileName,
      fileFormat,
      fileSizeBytes,
      fileContentPreview,
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      userRole: currentUser.role,
    });

    setIsProcessing(false);

    if (!result.success || !result.material) {
      setUploadError(result.error || 'Lỗi khi tải tài liệu lên hệ thống.');
      return;
    }

    onSaveMaterial(result.material);
    setIsUploadModalOpen(false);

    // Reset Form
    setTitle('');
    setFileName('');
    setRelatedLessonName('');
    setDescription('');
    setFileContentPreview('');
    setUploadNotice(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Edit Material Trigger
  const handleOpenEdit = (material: TeachingMaterial) => {
    const perm = storageService.canManageMaterial(currentUser, material);
    if (!perm.canEdit) {
      alert(perm.reason || 'Bạn không có quyền sửa tài liệu này.');
      return;
    }
    setEditingMaterial(material);
    setEditTitle(material.title);
    setEditGrade(material.grade);
    setEditTopic(material.topic);
    setEditRelatedLessonName(material.relatedLessonName || '');
    setEditDescription(material.description || '');
    setEditUsageStatus(material.usageStatus || (material.isActive ? 'ACTIVE' : 'INACTIVE'));
  };

  // Save Edited Material
  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;

    const updated: TeachingMaterial = {
      ...editingMaterial,
      title: editTitle.trim(),
      grade: editGrade,
      topic: editTopic,
      relatedLessonName: editRelatedLessonName.trim() || undefined,
      description: editDescription.trim(),
      usageStatus: editUsageStatus,
      isActive: editUsageStatus === 'ACTIVE',
      lastProcessedAt: new Date().toISOString(),
    };

    onSaveMaterial(updated);
    setEditingMaterial(null);
  };

  // Toggle Active/Inactive Quick Handler
  const handleToggleStatus = (material: TeachingMaterial) => {
    const perm = storageService.canManageMaterial(currentUser, material);
    if (!perm.canEdit) {
      alert(perm.reason || 'Bạn không có quyền thay đổi trạng thái tài liệu này.');
      return;
    }
    const updated = storageService.toggleMaterialUsageStatus(material.id, currentUser);
    if (updated) {
      onSaveMaterial(updated);
    }
  };

  // Safe Delete Trigger
  const handleRequestDelete = (material: TeachingMaterial) => {
    const perm = storageService.canManageMaterial(currentUser, material);
    if (!perm.canDelete) {
      alert(perm.reason || 'Bạn không có quyền xóa tài liệu này.');
      return;
    }
    setDeletingMaterial(material);
  };

  // Confirm Permanent Deletion
  const handleConfirmPermanentDelete = () => {
    if (!deletingMaterial) return;
    onDeleteMaterial(deletingMaterial.id);
    setDeletingMaterial(null);
  };

  // Switch to Inactive Instead of Delete
  const handleDeactivateInsteadOfDelete = () => {
    if (!deletingMaterial) return;
    const updated: TeachingMaterial = {
      ...deletingMaterial,
      usageStatus: 'INACTIVE',
      isActive: false,
      lastProcessedAt: new Date().toISOString(),
    };
    onSaveMaterial(updated);
    setDeletingMaterial(null);
  };

  // Download Handler with RBAC Check
  const handleDownload = async (material: TeachingMaterial) => {
    setDownloadFeedback({ id: material.id, message: 'Đang chuẩn bị tệp...' });
    const res = await downloadTeachingMaterial(material.id, currentUser.role, material.originalFileName);
    if (res.success) {
      setDownloadFeedback({ id: material.id, message: 'Đã tải xuống thành công!' });
      setTimeout(() => setDownloadFeedback(null), 3500);
    } else {
      setDownloadFeedback({ id: material.id, message: res.error || 'Lỗi khi tải xuống.', isError: true });
      setTimeout(() => setDownloadFeedback(null), 5000);
    }
  };

  // Get linked lessons for a material
  const getLinkedLessons = (materialId: string): Lesson[] => {
    return storageService.getLinkedLessonsForMaterial(materialId);
  };

  return (
    <div className="space-y-6">
      
      {/* Test Mode / Storage Architecture Disclosure Notice */}
      <div className="p-4 bg-gradient-to-r from-sky-50 via-indigo-50 to-amber-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800">
              Kiến trúc Lưu trữ & Phân quyền: Kho tài liệu Giáo viên
            </span>
            <p className="text-slate-600 leading-relaxed">
              <strong>Chế độ hiện tại:</strong> Đang hoạt động trên Lớp Lưu trữ Repository Cục bộ kết hợp xác thực Express Backend (Hỗ trợ nạp tệp thật ≤ 20MB: PDF, DOCX, PPTX). Khi kết nối <strong>Firebase Storage</strong> và <strong>Firestore</strong> thật, tệp tin nhị phân sẽ được lưu trữ trên Cloud Storage Bucket với token ký xác thực bảo mật đa tầng.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
          <span className="px-2.5 py-1 bg-white/80 rounded-lg font-mono text-[11px] text-sky-800 border border-sky-200 shadow-2xs font-semibold">
            {materials.length} tài liệu trong kho
          </span>
        </div>
      </div>

      {/* Header and Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-600" />
            Kho Tài liệu Giảng dạy (Lớp 3, 4, 5)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý giáo án, SGK điện tử, slide bài giảng bám sát Chương trình GDPT 2018 làm nguồn duy nhất để AI sinh bài học
          </p>
        </div>

        <button
          onClick={() => {
            setUploadError(null);
            setUploadNotice(null);
            setIsUploadModalOpen(true);
          }}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Tải lên tài liệu mới</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên tài liệu, tên tệp gốc, bài học liên quan..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 overflow-x-auto">
            <button
              onClick={() => setSelectedGrade('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedGrade === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả khối ({materials.length})
            </button>
            {([3, 4, 5] as GradeLevel[]).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  selectedGrade === g
                    ? 'bg-white text-sky-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Khối {g} ({materials.filter(m => m.grade === g).length})
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc chi tiết:</span>
          </div>

          {/* Topic Select */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 max-w-[220px] truncate"
          >
            <option value="ALL">Tất cả chủ đề GDPT 2018</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Usage Status Filter */}
          <select
            value={selectedUsageStatus}
            onChange={(e) => setSelectedUsageStatus(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">Tất cả trạng thái sử dụng</option>
            <option value="ACTIVE">Đang sử dụng (ACTIVE)</option>
            <option value="INACTIVE">Ngừng sử dụng (INACTIVE)</option>
          </select>

          {/* Processing Status Filter */}
          <select
            value={selectedProcessingStatus}
            onChange={(e) => setSelectedProcessingStatus(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">Tất cả trạng thái xử lý</option>
            <option value="EXTRACTED">Đã trích xuất cấu trúc</option>
            <option value="EXTRACTION_ERROR">Lỗi trích xuất (Không thể đọc)</option>
          </select>

          {(selectedGrade !== 'ALL' || selectedTopic !== 'ALL' || selectedUsageStatus !== 'ALL' || selectedProcessingStatus !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedGrade('ALL');
                setSelectedTopic('ALL');
                setSelectedUsageStatus('ALL');
                setSelectedProcessingStatus('ALL');
                setSearchTerm('');
              }}
              className="px-2 py-1 text-slate-500 hover:text-slate-800 text-[11px] underline ml-auto cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Materials Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Hiển thị <strong>{filteredMaterials.length}</strong> / {materials.length} tài liệu</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Đang sử dụng
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Ngừng sử dụng
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Lỗi xử lý
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filteredMaterials.length === 0 && (
        <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Không tìm thấy tài liệu phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Không có tài liệu nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại. Thầy cô vui lòng thay đổi điều kiện lọc hoặc tải lên tài liệu mới.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Tải lên tài liệu
          </button>
        </div>
      )}

      {/* Material Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {filteredMaterials.map((mat) => {
          const isError = mat.processingStatus === 'EXTRACTION_ERROR';
          const isExtracted = mat.processingStatus === 'EXTRACTED';
          const isInactive = mat.usageStatus === 'INACTIVE' || mat.isActive === false;
          const perm = storageService.canManageMaterial(currentUser, mat);
          const linkedLessons = getLinkedLessons(mat.id);

          return (
            <div
              key={mat.id}
              className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs relative ${
                isError 
                  ? 'border-rose-200 bg-rose-50/20' 
                  : isInactive
                  ? 'border-slate-200 bg-slate-50/60 opacity-85'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                
                {/* Header Metadata Strip */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sky-700 px-2 py-0.5 bg-sky-50 rounded-md border border-sky-100">
                      Lớp {mat.grade}
                    </span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                      {mat.fileFormat}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {mat.fileSizeFormatted || '2.4 MB'}
                    </span>
                  </div>

                  {/* Usage Status Pill */}
                  <button
                    onClick={() => handleToggleStatus(mat)}
                    disabled={!perm.canEdit}
                    title={!perm.canEdit ? perm.reason : 'Bấm để chuyển trạng thái sử dụng'}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                      isInactive
                        ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    } ${!perm.canEdit ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isInactive ? 'bg-slate-400' : 'bg-emerald-600'}`}></span>
                    {isInactive ? 'Ngừng sử dụng' : 'Đang sử dụng'}
                  </button>
                </div>

                {/* Title & Filename */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {mat.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1 truncate">
                    <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{mat.originalFileName}</span>
                  </div>
                </div>

                {/* Related Lesson Name if present */}
                {mat.relatedLessonName && (
                  <div className="text-[11px] px-2 py-1 bg-indigo-50/70 border border-indigo-100 rounded-lg text-indigo-900 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-indigo-600 shrink-0" />
                    <span className="font-medium truncate">Bài học liên quan: {mat.relatedLessonName}</span>
                  </div>
                )}

                {/* Topic & Description */}
                <div className="space-y-1">
                  <div className="text-[11px] font-medium text-slate-500 truncate" title={mat.topic}>
                    {mat.topic}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {mat.description}
                  </div>
                </div>

                {/* Linked Lessons Indicator */}
                {linkedLessons.length > 0 && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-150 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-sky-600" />
                      <span>Bài học tham chiếu:</span>
                    </span>
                    <span className="font-semibold text-sky-700 bg-sky-100/80 px-1.5 py-0.2 rounded text-[10px]">
                      {linkedLessons.length} bài
                    </span>
                  </div>
                )}

                {/* Teacher Upload & Date */}
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Tải lên bởi: <strong>{mat.uploadedByTeacherName}</strong></span>
                  <span>{new Date(mat.uploadedAt).toLocaleDateString('vi-VN')}</span>
                </div>

                {/* Processing Status Banner */}
                <div className="pt-1">
                  {isExtracted ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Đã trích xuất cấu trúc văn bản & bảng biểu</span>
                    </div>
                  ) : isError ? (
                    <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 space-y-1">
                      <div className="font-semibold flex items-center gap-1 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        Lỗi trích xuất cấu trúc tài liệu
                      </div>
                      <p className="text-[11px] text-rose-600 leading-tight">
                        {mat.extractedContent?.unreadableNotes || 'Không thể trích xuất do chất lượng tệp kém.'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium pt-0.5">
                        ⚠️ Quy tắc hệ thống: Khóa tạo bài học AI với tài liệu lỗi này.
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-sky-600" />
                      <span>Đang xử lý phân tích tài liệu...</span>
                    </div>
                  )}
                </div>

                {/* Permission Notice if teacher cannot manage */}
                {!perm.canEdit && (
                  <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                    <span className="truncate">{perm.reason || 'Chế độ chỉ xem'}</span>
                  </div>
                )}

                {/* Download Feedback message */}
                {downloadFeedback && downloadFeedback.id === mat.id && (
                  <div className={`text-[11px] p-2 rounded-lg font-medium ${
                    downloadFeedback.isError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {downloadFeedback.message}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between">
                
                <div className="flex items-center gap-1.5">
                  {/* View Details */}
                  <button
                    onClick={() => setInspectingMaterial(mat)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Xem chi tiết nội dung đã trích xuất"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Download */}
                  <button
                    onClick={() => handleDownload(mat)}
                    className="p-1.5 text-slate-500 hover:text-sky-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Tải xuống tệp tài liệu"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Edit (Checked by RBAC) */}
                  <button
                    disabled={!perm.canEdit}
                    onClick={() => handleOpenEdit(mat)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      perm.canEdit
                        ? 'text-slate-500 hover:text-amber-700 hover:bg-slate-100 cursor-pointer'
                        : 'text-slate-300 cursor-not-allowed'
                    }`}
                    title={perm.canEdit ? 'Sửa thông tin mô tả và trạng thái' : perm.reason}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete (Checked by RBAC) */}
                  <button
                    disabled={!perm.canDelete}
                    onClick={() => handleRequestDelete(mat)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      perm.canDelete
                        ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer'
                        : 'text-slate-300 cursor-not-allowed'
                    }`}
                    title={perm.canDelete ? 'Xóa tài liệu (Có cảnh báo bài học liên kết)' : perm.reason}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* AI Creator button (Disabled if extraction error or inactive) */}
                <button
                  disabled={isError || isInactive}
                  onClick={() => onNavigateToAICreatorWithMaterial(mat)}
                  title={
                    isError 
                      ? 'Không thể dùng tài liệu lỗi để tạo bài học' 
                      : isInactive 
                      ? 'Tài liệu đang ở trạng thái ngừng sử dụng' 
                      : 'Sử dụng tài liệu này để AI sinh cấu trúc bài học'
                  }
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isError || isInactive
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-sky-600 hover:bg-sky-700 text-white shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tạo bài học AI</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          MODAL 1: TẢI LÊN TÀI LIỆU MỚI (VỚI FILE INPUT THẬT & MẪU TEST)
          ======================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-sky-600" />
                  Tải lên Tài liệu Giảng dạy (PDF, DOCX, PPTX)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dung lượng tối đa 20MB. Hệ thống sẽ bóc tách cấu trúc tiêu đề, nội dung và bảo toàn bảng biểu.
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleUploadSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Quick Sample Selector for Rapid Testing */}
              <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    Thử nghiệm nhanh với tài liệu mẫu GDPT 2018:
                  </span>
                  <span className="text-[10px] text-sky-700">1 click để điền nhanh</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectSample(
                      'PDF',
                      'SGK_TinHoc4_KetNoiTriThuc_Bai4.pdf',
                      4,
                      'CHỦ ĐỀ E: ỨNG DỤNG TIN HỌC',
                      'Bài 4: Chèn hình ảnh và định dạng văn bản',
                      'Chương 4: Soạn thảo văn bản với phần mềm Word. Học sinh làm quen với việc gõ văn bản tiếng Việt kiểu Telex, chèn hình ảnh minh họa từ máy tính và trình bày trang văn bản đẹp mắt.'
                    )}
                    className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-800 rounded-lg border border-sky-200 font-medium cursor-pointer shadow-2xs text-[11px]"
                  >
                    📄 PDF Chuẩn Lớp 4 (Word)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSample(
                      'DOCX',
                      'GiaoAn_LuyenGoBanPhim_Lop3.docx',
                      3,
                      'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
                      'Bài 2: Em tập gõ bàn phím đúng cách',
                      'Bài tập thực hành rèn luyện kỹ năng gõ mười ngón với hàng phím cơ sở và các phím Shift. Quy tắc ngồi thẳng lưng, khoảng cách mắt đến màn hình từ 50-70cm.'
                    )}
                    className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-800 rounded-lg border border-sky-200 font-medium cursor-pointer shadow-2xs text-[11px]"
                  >
                    📝 Word DOCX Lớp 3 (Gõ phím)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSample(
                      'PPTX',
                      'BaiGiang_Scratch_TaoTroChoi_Lop5.pptx',
                      5,
                      'CHỦ ĐỀ F: GIẢI QUYẾT VẤN ĐỀ VỚI SỰ TRỢ GIÚP CỦA MÁY TÍNH',
                      'Bài 6: Lập trình Scratch - Trò chơi nhặt bóng',
                      'Slide bài giảng lập trình kéo thả Scratch: Nhân vật chú mèo di chuyển theo phím mũi tên và bắt quả bóng rơi. Khái niệm vòng lặp liên tục và câu lệnh điều kiện nếu... thì.'
                    )}
                    className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-800 rounded-lg border border-sky-200 font-medium cursor-pointer shadow-2xs text-[11px]"
                  >
                    📊 Slide PPTX Lớp 5 (Scratch)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSample(
                      'PDF',
                      'Scan_Loi_KhongDocDuoc_2026.pdf',
                      4,
                      'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
                      'Bài tập scan cũ',
                      '',
                      true
                    )}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200 font-medium cursor-pointer shadow-2xs text-[11px]"
                  >
                    ⚠️ Tệp Scan Lỗi (Thử cơ chế khóa AI)
                  </button>
                </div>
              </div>

              {/* Native File Upload Area */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chọn tệp từ máy tính của thầy cô (.pdf, .docx, .pptx): <span className="text-rose-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-xl p-4 text-center bg-slate-50/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={handleNativeFileChange}
                    className="hidden"
                    id="material-file-input"
                  />
                  <label
                    htmlFor="material-file-input"
                    className="cursor-pointer flex flex-col items-center gap-1.5"
                  >
                    <Upload className="w-6 h-6 text-sky-600" />
                    <span className="font-semibold text-sky-700 hover:text-sky-800">
                      Bấm vào đây để chọn tệp từ máy
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Hỗ trợ PDF, Microsoft Word (.docx), PowerPoint (.pptx) · Tối đa 20MB
                    </span>
                  </label>

                  {fileName && (
                    <div className="mt-3 p-2 bg-white rounded-lg border border-slate-200 text-left flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{fileName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({(fileSizeBytes / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">
                        {fileFormat}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên tài liệu hiển thị: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: SGK Tin học 4 - Bài 4: Chèn hình ảnh vào văn bản"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              {/* Related Lesson Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên bài học liên quan (nếu có):
                </label>
                <input
                  type="text"
                  value={relatedLessonName}
                  onChange={(e) => setRelatedLessonName(e.target.value)}
                  placeholder="Ví dụ: Bài 4: Chèn hình ảnh và định dạng văn bản"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              {/* Grade and Format */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Khối lớp: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                  >
                    <option value={3}>Lớp 3</option>
                    <option value={4}>Lớp 4</option>
                    <option value={5}>Lớp 5</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Định dạng tệp: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                  >
                    <option value="PDF">PDF (.pdf)</option>
                    <option value="DOCX">Word (.docx)</option>
                    <option value="PPTX">PowerPoint (.pptx)</option>
                  </select>
                </div>
              </div>

              {/* Topic Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chủ đề theo GDPT 2018: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as InformaticsTopic)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mô tả / Ghi chú sư phạm của giáo viên:
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi chú về nguồn gốc tài liệu, đối tượng học sinh, mục tiêu trọng tâm..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              {/* Alerts & Feedback */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Không thể tải lên:</span>
                    <span>{uploadError}</span>
                  </div>
                </div>
              )}

              {uploadNotice && (
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{uploadNotice}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {isProcessing ? 'Đang trích xuất cấu trúc & bảng biểu...' : 'Tải lên & Phân tích cấu trúc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: SỬA THÔNG TIN TÀI LIỆU
          ======================================================== */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  Chỉnh sửa Thông tin Tài liệu
                </h2>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Mã: {editingMaterial.code} · Tệp gốc: {editingMaterial.originalFileName}
                </div>
              </div>
              <button
                onClick={() => setEditingMaterial(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên tài liệu: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên bài học liên quan:
                </label>
                <input
                  type="text"
                  value={editRelatedLessonName}
                  onChange={(e) => setEditRelatedLessonName(e.target.value)}
                  placeholder="Gắn tên bài học để giáo viên dễ tìm kiếm..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Khối lớp:
                  </label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                  >
                    <option value={3}>Lớp 3</option>
                    <option value={4}>Lớp 4</option>
                    <option value={5}>Lớp 5</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Trạng thái sử dụng:
                  </label>
                  <select
                    value={editUsageStatus}
                    onChange={(e) => setEditUsageStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white font-semibold"
                  >
                    <option value="ACTIVE">Đang sử dụng (ACTIVE)</option>
                    <option value="INACTIVE">Ngừng sử dụng (INACTIVE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chủ đề GDPT 2018:
                </label>
                <select
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value as InformaticsTopic)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs bg-white"
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mô tả / Ghi chú sư phạm:
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-sm cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: CẢNH BÁO XÓA TÀI LIỆU CÓ BẢO TOÀN NGUỒN BÀI HỌC
          ======================================================== */}
      {deletingMaterial && (() => {
        const linkedLessons = getLinkedLessons(deletingMaterial.id);
        const hasLinkedLessons = linkedLessons.length > 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden flex flex-col shadow-2xl border border-slate-200">
              
              <div className="px-6 py-4 border-b border-slate-200 bg-rose-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  Xác nhận Xóa hoặc Ngừng sử dụng Tài liệu
                </div>
                <button
                  onClick={() => setDeletingMaterial(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{deletingMaterial.title}</h3>
                  <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                    Mã: {deletingMaterial.code} · Tệp: {deletingMaterial.originalFileName}
                  </div>
                </div>

                {hasLinkedLessons ? (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      Cảnh báo: Tài liệu này đang được {linkedLessons.length} bài học sử dụng làm nguồn căn cứ!
                    </div>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      Các bài học sau đây được AI xây dựng dựa trên tài liệu này:
                    </p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {linkedLessons.map((l) => (
                        <div key={l.id} className="p-2 bg-white rounded-lg border border-amber-200 text-slate-800">
                          <div className="font-semibold text-slate-900">{l.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Mã: {l.code} · Lớp {l.grade} · Trạng thái: <strong>{l.status}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium pt-1">
                      💡 <strong>Khuyến nghị sư phạm:</strong> Thầy cô nên chọn <strong>"Ngừng sử dụng (INACTIVE)"</strong> để ẩn tài liệu khỏi danh mục tải mới, đồng thời bảo đảm các bài học đã tạo không bị gián đoạn hay mất nguồn gốc tham chiếu.
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 leading-relaxed">
                    Tài liệu này hiện chưa có bài học nào liên kết. Thầy cô có chắc chắn muốn xóa vĩnh viễn tài liệu này khỏi kho dữ liệu của trường?
                  </p>
                )}

                {hasLinkedLessons ? (
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setDeletingMaterial(null)}
                      className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleDeactivateInsteadOfDelete}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Power className="w-3.5 h-3.5" />
                      Chuyển sang Ngừng sử dụng (Khuyên dùng)
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmPermanentDelete}
                      className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl cursor-pointer font-medium"
                    >
                      Vẫn xóa (Bảo lưu snapshot)
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDeletingMaterial(null)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmPermanentDelete}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                    >
                      Xóa vĩnh viễn
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          MODAL 4: XEM CHI TIẾT CẤU TRÚC ĐÃ TRÍCH XUẤT TÀI LIỆU
          ======================================================== */}
      {inspectingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  Chi tiết Tài liệu & Cấu trúc đã Trích xuất
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Mã: {inspectingMaterial.code} · Khối {inspectingMaterial.grade} · {inspectingMaterial.fileFormat} · Dung lượng: {inspectingMaterial.fileSizeFormatted || '2.4 MB'}
                </div>
              </div>
              <button
                onClick={() => setInspectingMaterial(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{inspectingMaterial.title}</h3>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">{inspectingMaterial.originalFileName}</p>
              </div>

              {inspectingMaterial.relatedLessonName && (
                <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900">
                  <strong>Bài học liên quan:</strong> {inspectingMaterial.relatedLessonName}
                </div>
              )}

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 space-y-1.5">
                <div className="text-slate-600"><strong>Chủ đề:</strong> {inspectingMaterial.topic}</div>
                <div className="text-slate-600"><strong>Giáo viên tải lên:</strong> {inspectingMaterial.uploadedByTeacherName} ({inspectingMaterial.uploadedByTeacherId})</div>
                <div className="text-slate-600"><strong>Thời điểm tải lên:</strong> {new Date(inspectingMaterial.uploadedAt).toLocaleString('vi-VN')}</div>
                {inspectingMaterial.lastProcessedAt && (
                  <div className="text-slate-600"><strong>Xử lý lần cuối:</strong> {new Date(inspectingMaterial.lastProcessedAt).toLocaleString('vi-VN')}</div>
                )}
                <div className="text-slate-600">
                  <strong>Trạng thái sử dụng:</strong>{' '}
                  <span className={`font-semibold ${inspectingMaterial.usageStatus === 'INACTIVE' ? 'text-slate-600' : 'text-emerald-700'}`}>
                    {inspectingMaterial.usageStatus === 'INACTIVE' ? 'Ngừng sử dụng (INACTIVE)' : 'Đang sử dụng (ACTIVE)'}
                  </span>
                </div>
              </div>

              {/* Linked Lessons in Details */}
              {(() => {
                const linked = getLinkedLessons(inspectingMaterial.id);
                if (linked.length === 0) return null;
                return (
                  <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-xl space-y-1.5">
                    <span className="font-bold text-sky-950 block">Các bài học đang tham chiếu tài liệu này ({linked.length}):</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {linked.map((l) => (
                        <li key={l.id} className="text-[11px]">
                          <strong>{l.code}</strong>: {l.title} (Khối {l.grade} · {l.status})
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Extracted Sections Preview */}
              {inspectingMaterial.extractedContent && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Nội dung văn bản & bảng biểu đã trích xuất:
                  </h4>
                  
                  {inspectingMaterial.extractedContent.summary && (
                    <p className="p-3 bg-sky-50/70 rounded-xl text-sky-950 border border-sky-100 leading-relaxed">
                      {inspectingMaterial.extractedContent.summary}
                    </p>
                  )}

                  {inspectingMaterial.extractedContent.sections?.map((sec) => (
                    <div key={sec.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                      <div className="font-bold text-slate-900">{sec.heading}</div>
                      <p className="text-slate-700 leading-relaxed">{sec.content}</p>
                      
                      {sec.tables && sec.tables.map((tbl, tI) => (
                        <div key={tI} className="mt-2 overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200 border border-slate-200 text-[11px] rounded-lg overflow-hidden">
                            <thead className="bg-slate-100">
                              <tr>
                                {tbl.headers.map((h, hI) => (
                                  <th key={hI} className="px-2.5 py-1.5 text-left font-bold text-slate-700">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {tbl.rows.map((r, rI) => (
                                <tr key={rI} className="hover:bg-slate-50">
                                  {r.map((c, cI) => (
                                    <td key={cI} className="px-2.5 py-1.5 text-slate-600">{c}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Key Terms */}
                  {inspectingMaterial.extractedContent.keyTerms && inspectingMaterial.extractedContent.keyTerms.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 text-[11px] block mb-1.5">Thuật ngữ cốt lõi:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {inspectingMaterial.extractedContent.keyTerms.map((term, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded-md text-[10px] font-medium">
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {inspectingMaterial.extractedContent.unreadableNotes && (
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 space-y-1">
                      <strong>Cảnh báo trích xuất:</strong>
                      <p>{inspectingMaterial.extractedContent.unreadableNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleDownload(inspectingMaterial)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-sky-700 bg-white border border-slate-200 hover:border-sky-300 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải xuống tệp gốc
              </button>

              <button
                onClick={() => setInspectingMaterial(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
