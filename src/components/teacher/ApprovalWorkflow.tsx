import React, { useState } from 'react';
import { Lesson, ContentStatus, User, ApprovalRecord, LessonVersion } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Send, 
  Archive, 
  RotateCcw, 
  History,
  FileEdit,
  XCircle,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface ApprovalWorkflowProps {
  currentUser: User;
  lessons: Lesson[];
  approvalRecords: ApprovalRecord[];
  onOpenLesson: (lesson: Lesson) => void;
  onUpdateLessonStatus: (lessonId: string, status: ContentStatus, comment?: string) => void;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  currentUser,
  lessons,
  approvalRecords,
  onOpenLesson,
  onUpdateLessonStatus,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<ContentStatus | 'ALL'>('ALL');
  const [selectedLessonForVersions, setSelectedLessonForVersions] = useState<Lesson | null>(null);
  const [lessonVersions, setLessonVersions] = useState<LessonVersion[]>([]);
  const [actionComment, setActionComment] = useState('');
  const [pendingActionLessonId, setPendingActionLessonId] = useState<string | null>(null);

  const filteredLessons = lessons.filter((l) => {
    if (selectedFilter !== 'ALL' && l.status !== selectedFilter) return false;
    return true;
  });

  const handleShowVersions = (lesson: Lesson) => {
    setSelectedLessonForVersions(lesson);
    const versions = storageService.getLessonVersions(lesson.id);
    setLessonVersions(versions);
  };

  const executeStatusChange = (status: ContentStatus) => {
    if (!pendingActionLessonId) return;
    onUpdateLessonStatus(pendingActionLessonId, status, actionComment || undefined);
    setPendingActionLessonId(null);
    setActionComment('');
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="text-emerald-700 font-semibold text-xs">● Đã công bố</span>;
      case 'APPROVED':
        return <span className="text-blue-700 font-semibold text-xs">● Đã phê duyệt</span>;
      case 'PENDING_REVIEW':
        return <span className="text-amber-700 font-semibold text-xs">● Chờ duyệt</span>;
      case 'DRAFT':
        return <span className="text-slate-600 font-semibold text-xs">● Bản nháp</span>;
      case 'REJECTED':
        return <span className="text-rose-700 font-semibold text-xs">● Từ chối</span>;
      case 'ARCHIVED':
        return <span className="text-slate-500 font-semibold text-xs">● Đã lưu trữ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Quy trình Phê duyệt & Quản lý Phiên bản Bài học
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kiểm soát nghiêm ngặt từng giai đoạn từ bản nháp AI (DRAFT) đến khi công bố chính thức (PUBLISHED) cho học sinh
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'ALL', label: `Tất cả (${lessons.length})` },
          { id: 'PENDING_REVIEW', label: `Chờ duyệt (${lessons.filter(l => l.status === 'PENDING_REVIEW').length})` },
          { id: 'DRAFT', label: `Bản nháp AI (${lessons.filter(l => l.status === 'DRAFT').length})` },
          { id: 'APPROVED', label: `Đã duyệt (${lessons.filter(l => l.status === 'APPROVED').length})` },
          { id: 'PUBLISHED', label: `Đã công bố (${lessons.filter(l => l.status === 'PUBLISHED').length})` },
          { id: 'ARCHIVED', label: `Lưu trữ (${lessons.filter(l => l.status === 'ARCHIVED').length})` },
        ].map((tab) => {
          const isSelected = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Lessons Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {filteredLessons.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Không có bài học nào trong trạng thái này.
            </div>
          ) : (
            filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">Khối {lesson.grade}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-400">{lesson.code}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-sky-700">{lesson.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span>v{lesson.version}</span>
                  </div>

                  <h3 
                    onClick={() => onOpenLesson(lesson)}
                    className="text-sm font-bold text-slate-900 hover:text-sky-600 cursor-pointer"
                  >
                    {lesson.title}
                  </h3>

                  <div className="text-xs text-slate-600 line-clamp-1">
                    {lesson.theoryContent.overview}
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                    <span>Tài liệu: {lesson.sourceMaterial.materialTitle}</span>
                    {lesson.aiUncertainties.length > 0 && (
                      <span className="text-amber-700 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {lesson.aiUncertainties.length} lưu ý AI
                      </span>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                  <div className="text-left sm:text-right">
                    {getStatusBadge(lesson.status)}
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {lesson.publishedAt ? `Công bố: ${new Date(lesson.publishedAt).toLocaleDateString('vi-VN')}` : `Tạo: ${new Date(lesson.createdAt).toLocaleDateString('vi-VN')}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenLesson(lesson)}
                      title="Xem chi tiết & duyệt"
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShowVersions(lesson)}
                      title="Lịch sử phiên bản"
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <History className="w-4 h-4" />
                    </button>

                    {/* Quick status actions */}
                    {lesson.status === 'PENDING_REVIEW' && (
                      <button
                        onClick={() => onUpdateLessonStatus(lesson.id, 'APPROVED', 'Cô đã kiểm duyệt')}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        Duyệt
                      </button>
                    )}

                    {lesson.status === 'APPROVED' && (
                      <button
                        onClick={() => onUpdateLessonStatus(lesson.id, 'PUBLISHED', 'Công bố cho học sinh học')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                      >
                        Công bố
                      </button>
                    )}

                    {lesson.status === 'PUBLISHED' && (
                      <button
                        onClick={() => onUpdateLessonStatus(lesson.id, 'PENDING_REVIEW', 'Thu hồi để biên tập lại')}
                        className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                      >
                        Thu hồi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Audit Log (Approval Records) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Nhật ký Hoạt động Phê duyệt & Công bố (Audit Trail)
        </h2>
        
        <div className="divide-y divide-slate-100 text-xs">
          {approvalRecords.slice(0, 5).map((record) => (
            <div key={record.id} className="py-2.5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{record.actorName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-medium text-sky-700">{record.action}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-700">{record.entityTitle}</span>
                </div>
                {record.comment && (
                  <p className="text-slate-500 text-[11px] mt-0.5 italic">
                    Ghi chú: "{record.comment}"
                  </p>
                )}
              </div>
              <span className="text-slate-400 text-[11px] shrink-0 font-mono">
                {new Date(record.timestamp).toLocaleString('vi-VN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Version History Modal */}
      {selectedLessonForVersions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lịch sử Phiên bản Bài học</h3>
                <p className="text-xs text-slate-500">{selectedLessonForVersions.title}</p>
              </div>
              <button
                onClick={() => setSelectedLessonForVersions(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Đóng
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 text-xs">
              {lessonVersions.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  Đây là phiên bản v1 khởi tạo đầu tiên, chưa có chỉnh sửa trước đó.
                </div>
              ) : (
                lessonVersions.map((ver) => (
                  <div key={ver.id} className="p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Phiên bản v{ver.versionNumber} ({ver.status})</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {new Date(ver.changedAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="text-slate-600">Thực hiện bởi: {ver.changedBy}</div>
                    <div className="text-slate-500 text-[11px] italic">Lý do: {ver.changeSummary}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
