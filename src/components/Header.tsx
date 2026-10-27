import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  Laptop, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  ChevronDown, 
  Layers,
  Settings,
  Check,
  UserCheck,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  users: User[];
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onSwitchUser: (userId: string) => void;
  onRequestAdminLogin: () => void;
  onOpenSystemConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  currentTab,
  onSelectTab,
  onSwitchUser,
  onRequestAdminLogin,
  onOpenSystemConfig,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation links based on user role
  const getNavLinks = () => {
    if (currentUser.role === 'STUDENT') {
      return [
        { id: 'lessons', label: 'Bài học của em' },
        { id: 'tasks', label: 'Nhiệm vụ tuần này' },
        { id: 'practice', label: 'Luyện tập & Kiểm tra' },
        { id: 'results', label: 'Kết quả của em' },
        { id: 'review', label: 'Góc ôn tập' },
      ];
    }
    if (currentUser.role === 'TEACHER') {
      return [
        { id: 'overview', label: 'Tổng quan' },
        { id: 'materials', label: 'Tài liệu' },
        { id: 'ai-creator', label: 'Tạo bài học AI' },
        { id: 'approval', label: 'Duyệt nội dung' },
        { id: 'questions', label: 'Ngân hàng câu hỏi' },
        { id: 'classes', label: 'Lớp & Giao bài' },
        { id: 'reports', label: 'Báo cáo' },
      ];
    }
    // Admin
    return [
      { id: 'admin-overview', label: 'Tổng quan hệ thống' },
      { id: 'materials', label: 'Kho tài liệu' },
      { id: 'admin-users', label: 'Quản lý tài khoản' },
      { id: 'admin-classes', label: 'Quản lý khối lớp' },
      { id: 'admin-audit', label: 'Nhật ký phê duyệt' },
      { id: 'admin-system', label: 'Thiết lập & Dịch vụ' },
    ];
  };

  const navLinks = getNavLinks();

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'TEACHER': return 'Giáo viên';
      case 'STUDENT': return 'Học sinh';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'TEACHER': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'STUDENT': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  // Group users by role
  const adminUsers = users.filter(u => u.role === 'ADMIN');
  const teacherUsers = users.filter(u => u.role === 'TEACHER');
  const studentUsers = users.filter(u => u.role === 'STUDENT');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Strict Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div 
          onClick={() => onSelectTab(navLinks[0].id)}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Laptop className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            TinHocTieuHoc
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium">
            · Lớp 3, 4, 5
          </span>
        </div>

        {/* Zone 2: Navigation Links (concise, single-line text links) */}
        <nav className="hidden lg:flex items-center gap-6 overflow-x-auto py-1">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 relative ${
                  isActive
                    ? 'text-sky-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action (User Switcher / Role Simulation Drawer & System Status) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSystemConfig}
            title="Xem trạng thái cấu hình dịch vụ hệ thống"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-slate-200"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Trạng thái Dịch vụ</span>
          </button>

          {/* User selector dropdown with explicit click handler */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl cursor-pointer transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                {currentUser.fullName.split(' ').slice(-1)[0][0]}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="text-[11px] text-slate-500 leading-none flex items-center gap-1 mt-0.5">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getRoleBadgeColor(currentUser.role)}`}>
                    {getRoleLabel(currentUser.role)}
                  </span>
                  {currentUser.className && <span>· {currentUser.className}</span>}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Click-activated Role & User Switch Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900">
                    Chuyển đổi Quyền Người dùng
                  </div>
                  <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                    Mô phỏng RBAC
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                  
                  {/* ADMIN GROUP */}
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Nhóm Quản trị viên (Toàn quyền)
                    </div>
                    {adminUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            if (currentUser.role !== 'ADMIN') {
                              onRequestAdminLogin();
                            } else {
                              onSwitchUser(u.id);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="text-slate-900">{u.fullName} {currentUser.role !== 'ADMIN' && '(Cần mật khẩu)'}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-purple-700 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* TEACHER GROUP */}
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      Nhóm Giáo viên Tin học
                    </div>
                    {teacherUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            onSwitchUser(u.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="text-slate-900">{u.fullName}</div>
                            <div className="text-[11px] text-slate-500">
                              Phụ trách: {u.assignedGrades ? `Khối ${u.assignedGrades.join(', ')}` : 'Toàn trường'}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-sky-700 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* STUDENT GROUP */}
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Nhóm Học sinh Tiểu học
                    </div>
                    {studentUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            onSwitchUser(u.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="text-slate-900">{u.fullName}</div>
                            <div className="text-[11px] text-slate-500">
                              {u.className || `Khối ${u.grade}`} · {u.username}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                </div>

                <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 rounded-b-2xl text-[11px] text-slate-500 text-center">
                  Bấm vào bất kỳ tài khoản nào để chuyển quyền tức thì
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="lg:hidden border-t border-slate-200 overflow-x-auto px-4 py-2 flex items-center gap-4 bg-slate-50">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => onSelectTab(link.id)}
            className={`text-xs font-medium whitespace-nowrap ${
              currentTab === link.id
                ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-0.5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
    </header>
  );
};
