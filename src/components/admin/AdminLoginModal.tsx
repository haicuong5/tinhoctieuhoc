import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, AlertCircle, X, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (adminUser: any) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        // Store session authentication token
        sessionStorage.setItem('admin_auth_token', data.adminToken);
        onLoginSuccess(data.user);
        onClose();
        setPassword('');
      } else {
        setErrorMessage(data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch (err: any) {
      setIsLoading(false);
      // Fallback verification if offline / network error
      if (username.trim().toLowerCase() === 'admin' && password === 'Tp@2026') {
        sessionStorage.setItem('admin_auth_token', `offline_token_${Date.now()}`);
        onLoginSuccess({
          id: 'user-admin-01',
          username: 'admin',
          fullName: 'Thầy Vũ Hoàng Long',
          role: 'ADMIN',
          email: 'admin.long@tieuhoc.edu.vn',
          schoolName: 'Trường Tiểu học Ánh Dương - Hà Nội',
          isActive: true,
        });
        onClose();
        setPassword('');
      } else {
        setErrorMessage('Tên đăng nhập hoặc mật khẩu quản trị viên không chính xác. Vui lòng thử lại.');
      }
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('Tp@2026');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                Xác thực bảo mật hệ thống
              </div>
              <h2 className="text-lg font-bold text-white">
                Đăng nhập Quản trị viên
              </h2>
            </div>
          </div>
          
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Quyền Quản trị viên quản lý toàn bộ tài khoản, lớp học và phân quyền. Cần xác thực mật khẩu bảo vệ để truy cập.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Username */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Tên đăng nhập:
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-slate-900 font-medium"
            />
          </div>

          {/* Password */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Mật khẩu:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu quản trị viên"
                className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-slate-900 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Helper credentials box */}
          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1 text-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-950 text-[11px]">Thông tin xác thực Quản trị viên:</span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] text-purple-700 hover:text-purple-900 font-bold underline"
              >
                Điền nhanh mẫu
              </button>
            </div>
            <div className="text-[11px] text-slate-600 font-mono">
              Tài khoản: <strong className="text-slate-900">admin</strong> · Mật khẩu: <strong className="text-purple-900 font-bold">Tp@2026</strong>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold transition-all shadow-md flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Xác nhận Đăng nhập
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
