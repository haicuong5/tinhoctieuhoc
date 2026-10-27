import React, { useState } from 'react';
import { 
  Key, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  Lock,
  Mail,
  Info
} from 'lucide-react';
import { 
  isFirebaseConfigured, 
  loginWithFirebase, 
  registerWithFirebase,
  logoutUser, 
  auth 
} from '../../services/firebase';

interface FirebaseLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (firebaseUser: any) => void;
}

export const FirebaseLoginModal: React.FC<FirebaseLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const configured = isFirebaseConfigured();
  const currentFirebaseUser = auth?.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setErrorMessage('Firebase Client SDK chưa được cấu hình biến môi trường VITE_FIREBASE_*. Vui lòng xem hướng dẫn bên dưới.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = authMode === 'LOGIN' 
      ? await loginWithFirebase(email, password)
      : await registerWithFirebase(email, password);

    setIsLoading(false);

    if (res.success && res.user) {
      setSuccessMessage(
        authMode === 'LOGIN'
          ? `Đăng nhập Firebase thành công với tài khoản: ${res.user.email}`
          : `Đăng ký tài khoản Firebase thành công: ${res.user.email}`
      );
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMessage(res.error || (authMode === 'LOGIN' ? 'Đăng nhập thất bại.' : 'Đăng ký thất bại.'));
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setSuccessMessage('Đã đăng xuất tài khoản Firebase thành công.');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Xác thực Firebase Authentication
              </h2>
              <p className="text-[11px] text-slate-400">
                Đăng nhập tài khoản định danh đám mây thực tế
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Status Banner */}
          <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
            configured 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {configured ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <div className="font-bold">
                {configured 
                  ? 'Firebase Client SDK đã được cấu hình trong .env' 
                  : 'Chưa cấu hình thông số Firebase Client SDK'}
              </div>
              <p className="text-[11px] leading-relaxed">
                {configured 
                  ? 'Sẵn sàng xác thực tài khoản giáo viên và học sinh qua máy chủ Firebase Auth.' 
                  : 'Hệ thống đang hoạt động ở Chế độ Demo Sư phạm. Để kích hoạt tài khoản thật, vui lòng thêm các biến VITE_FIREBASE_* vào tệp .env.'}
              </p>
            </div>
          </div>

          {/* If already logged in to Firebase */}
          {currentFirebaseUser ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-800">Tài khoản đang đăng nhập:</span>
              </div>
              <div className="text-slate-600 font-mono text-[11px] bg-white p-2.5 rounded-xl border border-slate-200">
                Email: <strong>{currentFirebaseUser.email}</strong><br />
                UID: {currentFirebaseUser.uid}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất Firebase</span>
              </button>
            </div>
          ) : (
            /* Login & Register Form */
            <div className="space-y-3.5">
              {/* Tab Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setAuthMode('LOGIN'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'LOGIN' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('REGISTER'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'REGISTER' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tạo tài khoản mới
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email tài khoản:
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="giaovien@truongtieuhoc.edu.vn"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Mật khẩu:
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authMode === 'REGISTER' ? 'Tạo mật khẩu (tối thiểu 6 ký tự)' : 'Nhập mật khẩu tài khoản'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs text-slate-900"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    {isLoading ? 'Đang xử lý...' : authMode === 'LOGIN' ? 'Đăng nhập' : 'Tạo tài khoản'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Setup Guide for User */}
          {!configured && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                Hướng dẫn cấu hình Firebase Auth trên máy của bạn:
              </div>
              <p>
                1. Truy cập <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-sky-600 underline font-semibold">Firebase Console</a>, tạo dự án và bật <strong>Authentication (Email/Password)</strong>.
              </p>
              <p>
                2. Sao chép thông số cấu hình Web App và điền vào tệp <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">.env</code> (tham khảo <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">.env.example</code>).
              </p>
              <p>
                3. Khởi động lại ứng dụng để tự động kích hoạt tính năng đăng nhập bảo mật.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
