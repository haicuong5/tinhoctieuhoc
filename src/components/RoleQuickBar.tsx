import React from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, GraduationCap, BookOpen, Users, ArrowRightLeft, Lock, LogOut, Key } from 'lucide-react';

interface RoleQuickBarProps {
  currentUser: User;
  users: User[];
  onSwitchUser: (userId: string) => void;
  onRequestAdminLogin: () => void;
  onLogoutAdmin: () => void;
  onOpenFirebaseLogin?: () => void;
}

export const RoleQuickBar: React.FC<RoleQuickBarProps> = ({
  currentUser,
  users,
  onSwitchUser,
  onRequestAdminLogin,
  onLogoutAdmin,
  onOpenFirebaseLogin,
}) => {
  // Preset primary users for instant 1-click switching
  const adminUser = users.find(u => u.role === 'ADMIN') || users[0];
  const teacherUser = users.find(u => u.role === 'TEACHER' && u.username === 'gv_mai') || users.find(u => u.role === 'TEACHER') || users[1];
  const studentUser = users.find(u => u.role === 'STUDENT' && u.username === 'hs_nam') || users.find(u => u.role === 'STUDENT') || users[3];

  const handleAdminClick = () => {
    if (currentUser.role === 'ADMIN') {
      return;
    }
    onRequestAdminLogin();
  };

  const handleSelectUser = async (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (!selected) return;

    if (selected.role === 'ADMIN' && currentUser.role !== 'ADMIN') {
      onRequestAdminLogin();
      return;
    }

    // Lấy token phiên demo tương ứng từ backend để gửi kèm Authorization Bearer
    try {
      const res = await fetch('/api/auth/demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selected.username, role: selected.role }),
      });
      const data = await res.json();
      if (data.token) {
        sessionStorage.setItem('demo_user_session_token', data.token);
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ token demo:', err);
    }

    onSwitchUser(userId);
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Info & Demo Indicator */}
        <div className="flex items-center gap-2 text-slate-300">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold text-[10px] tracking-wide">
            CHẾ ĐỘ MÔ PHỎNG SƯ PHẠM
          </span>
          <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-slate-300 hidden sm:inline">
            Đang đóng vai: <strong className="text-sky-300">{currentUser.fullName}</strong> ({currentUser.role === 'ADMIN' ? '👑 Quản trị viên' : currentUser.role === 'TEACHER' ? '👩‍🏫 Giáo viên' : `🎒 Học sinh ${currentUser.className || ''}`})
          </span>
        </div>

        {/* Right: Quick Role Buttons & Firebase Auth entry */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Admin button - Protected with Password */}
          <button
            type="button"
            onClick={handleAdminClick}
            title={currentUser.role === 'ADMIN' ? 'Bạn đang ở quyền Quản trị viên' : 'Yêu cầu đăng nhập mật khẩu (admin / Tp@2026)'}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all text-xs cursor-pointer ${
              currentUser.role === 'ADMIN'
                ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/60'
            }`}
          >
            {currentUser.role === 'ADMIN' ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span>1. Quản trị viên {currentUser.role !== 'ADMIN' && '(Mật khẩu)'}</span>
          </button>

          {/* Teacher button */}
          <button
            type="button"
            onClick={() => handleSelectUser(teacherUser.id)}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all text-xs cursor-pointer ${
              currentUser.role === 'TEACHER' && currentUser.id === teacherUser.id
                ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>2. Giáo viên (Cô Mai)</span>
          </button>

          {/* Student button */}
          <button
            type="button"
            onClick={() => handleSelectUser(studentUser.id)}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all text-xs cursor-pointer ${
              currentUser.role === 'STUDENT' && currentUser.id === studentUser.id
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>3. Học sinh (Em Nam)</span>
          </button>

          {/* Detailed user selector dropdown */}
          <select
            value={currentUser.id}
            onChange={(e) => handleSelectUser(e.target.value)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
          >
            <optgroup label="Tất cả tài khoản hệ thống (Demo)">
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.role === 'ADMIN' ? '👑 [Admin]' : u.role === 'TEACHER' ? '👩‍🏫 [Giáo viên]' : '🎒 [Học sinh]'} {u.fullName} {u.className ? `(${u.className})` : ''}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Firebase Authentication Modal Trigger */}
          {onOpenFirebaseLogin && (
            <button
              type="button"
              onClick={onOpenFirebaseLogin}
              title="Đăng nhập tài khoản định danh qua Firebase Authentication"
              className="px-2.5 py-1 bg-orange-500/20 hover:bg-orange-600 text-orange-300 hover:text-white border border-orange-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Key className="w-3 h-3 text-orange-400" />
              <span>Firebase Auth</span>
            </button>
          )}

          {/* Logout Admin Button if currently in Admin role */}
          {currentUser.role === 'ADMIN' && (
            <button
              type="button"
              onClick={onLogoutAdmin}
              title="Đăng xuất khỏi tài khoản Quản trị viên"
              className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Đăng xuất Admin</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
