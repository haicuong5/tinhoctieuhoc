import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Server, Database, Key, HardDrive, RefreshCw } from 'lucide-react';
import { checkSystemStatus } from '../services/geminiService';
import { SYSTEM_SERVICES_STATUS } from '../mock/initialData';

interface SystemConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
}

export const SystemConfigModal: React.FC<SystemConfigModalProps> = ({
  isOpen,
  onClose,
  onResetData,
}) => {
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testingFirestore, setTestingFirestore] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  const fetchStatus = async () => {
    setLoading(true);
    const status = await checkSystemStatus();
    setServerStatus(status);
    setLoading(false);
  };

  const runFirestoreDiagnostic = async () => {
    setTestingFirestore(true);
    setDiagnosticResult(null);
    try {
      const res = await fetch('/api/system/test-firestore', { method: 'POST' });
      const data = await res.json();
      setDiagnosticResult(data.diagnostic || data);
      await fetchStatus();
    } catch (err: any) {
      setDiagnosticResult({ success: false, error: err.message });
    } finally {
      setTestingFirestore(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Trạng thái Tích hợp & Kiểm soát Dịch vụ Hệ thống
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Báo cáo minh bạch các thành phần đang hoạt động và các dịch vụ đám mây cần cấu hình thêm
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Stage notice */}
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-100">
            <div className="flex items-start gap-3">
              <Server className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-sky-950">
                  Giai đoạn 1 & 2: Kiến trúc Hệ thống, Giao diện chuẩn GDPT 2018 và AI Sinh nội dung
                </div>
                <p>
                  Toàn bộ nghiệp vụ trích xuất tài liệu (PDF, DOCX, PPTX), 17 trường bài học, ngân hàng 8 dạng câu hỏi, luồng phê duyệt (DRAFT → PUBLISHED) và cá nhân hóa đã được triển khai đầy đủ.
                </p>
              </div>
            </div>
          </div>

          {/* Services Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Danh sách dịch vụ & Trạng thái kết nối thực tế
              </h3>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>

            <div className="space-y-3">
              {/* Gemini API */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Gemini 3.8 Flash AI Engine
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {serverStatus?.gemini?.available 
                          ? 'Đã phát hiện khóa API máy chủ · Kết nối backend an toàn' 
                          : 'Đang dùng bộ máy quy tắc giáo dục GDPT 2018 (Chưa có GEMINI_API_KEY)'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {serverStatus?.gemini?.available ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Chế độ quy chuẩn GDPT 2018
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Firebase Authentication */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Firebase Authentication & Admin SDK
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {serverStatus?.firebaseAuth?.adminSdkInitialized
                          ? 'Firebase Admin SDK đã kích hoạt · Đang xác thực ID Token thực tế'
                          : 'Đang ở Chế độ Demo Security Guard (Bearer Token Session bảo vệ)'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {serverStatus?.firebaseAuth?.adminSdkInitialized ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã kết nối Admin SDK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Chế độ Demo Guard
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                  <div>
                    <span className="font-semibold text-slate-800">Cơ chế xác thực:</span> Mọi request tới API máy chủ được bảo vệ bởi middleware Bearer Token. Không chấp nhận header giả mạo <code className="font-mono text-slate-700 bg-white px-1 border rounded">x-user-role</code>.
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Để kích hoạt Cloud Identity thực tế: Thêm <code className="font-mono">VITE_FIREBASE_*</code> vào <code className="font-mono">.env</code> và cấu hình Service Account cho Backend.
                  </div>
                </div>
              </div>

              {/* Cloud Firestore */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Cloud Firestore (Cơ sở dữ liệu đám mây)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {serverStatus?.firestore?.connected
                          ? 'Đã kết nối trực tiếp Cloud Firestore'
                          : `Đang dùng ${serverStatus?.firestore?.engine === 'FIRESTORE' ? 'Cloud Firestore' : 'Bộ nhớ đệm RAM (In-Memory Cache)'}`}
                        {serverStatus?.firestore?.isMemoryVolatile && ' · Mất khi khởi động lại'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {serverStatus?.firestore?.connected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã kết nối Cloud
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Đệm RAM (Dự phòng)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-800">Trạng thái kết nối thực tế:</div>
                    <button
                      onClick={runFirestoreDiagnostic}
                      disabled={testingFirestore}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-600 hover:bg-sky-700 text-white transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${testingFirestore ? 'animate-spin' : ''}`} />
                      {testingFirestore ? 'Đang kiểm tra...' : 'Kiểm tra Ghi/Đọc Firestore'}
                    </button>
                  </div>
                  <div className="text-slate-600 text-[11px] leading-relaxed">
                    {serverStatus?.firestore?.status || 'Chờ tải trạng thái...'}
                  </div>

                  {serverStatus?.firestore?.lastWriteStatus && (
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                      <span className="font-semibold text-slate-700">Lần ghi gần nhất:</span>{' '}
                      {serverStatus.firestore.lastWriteStatus.target} ({serverStatus.firestore.lastWriteStatus.collection}/{serverStatus.firestore.lastWriteStatus.docId}) -{' '}
                      {serverStatus.firestore.lastWriteStatus.success ? (
                        <span className="text-emerald-600 font-semibold">Thành công</span>
                      ) : (
                        <span className="text-rose-600 font-semibold">Thất bại ({serverStatus.firestore.lastWriteStatus.error})</span>
                      )}
                    </div>
                  )}

                  {diagnosticResult && (
                    <div className={`p-2 rounded mt-1 text-[10px] ${diagnosticResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                      <div className="font-bold flex items-center gap-1">
                        {diagnosticResult.success ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-rose-600" />}
                        {diagnosticResult.success ? 'Kiểm thử Firestore ĐẠT (Ghi + Đọc + Xóa thành công)' : `Kiểm thử thất bại tại bước: [${diagnosticResult.step}]`}
                      </div>
                      {diagnosticResult.error && (
                        <div className="mt-0.5 text-[10px] leading-normal">{diagnosticResult.error}</div>
                      )}
                      {diagnosticResult.docId && (
                        <div className="mt-0.5 text-[9px] font-mono text-slate-500">Mã bản ghi thử: {diagnosticResult.docId} ({diagnosticResult.durationMs}ms)</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Cloud Storage */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Cloud Storage (Lưu trữ tệp PDF, DOCX, PPTX)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Hiện dùng: Bộ trích xuất tệp Express backend và kiểm tra lỗi tài liệu
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      Chưa cấu hình bên ngoài
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action to reset demo data */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-900">Khôi phục dữ liệu mẫu ban đầu</div>
              <div className="text-[11px] text-slate-500">
                Xóa các thay đổi tạm thời và tải lại dữ liệu chuẩn mẫu môn Tin học lớp 3, 4, 5
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Bạn có chắc muốn đặt lại toàn bộ dữ liệu về trạng thái mẫu ban đầu?')) {
                  onResetData();
                }
              }}
              className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              Đặt lại dữ liệu
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Đóng bảng kiểm tra
          </button>
        </div>
      </div>
    </div>
  );
};
