import React, { useState } from 'react';
import { 
  User, 
  SchoolClass, 
  ApprovalRecord, 
  GradeLevel, 
  UserRole 
} from '../../types';
import { 
  ShieldCheck, 
  Users, 
  Layers, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Key, 
  Database, 
  HardDrive,
  FileText,
  UserPlus
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  classes: SchoolClass[];
  approvalRecords: ApprovalRecord[];
  activeTab: string;
  onSaveUser: (user: User) => void;
  onSaveClass: (schoolClass: SchoolClass) => void;
  onOpenSystemConfig: () => void;
  onSwitchUser: (userId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  classes,
  approvalRecords,
  activeTab,
  onSaveUser,
  onSaveClass,
  onOpenSystemConfig,
  onSwitchUser,
}) => {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);

  // New user form state
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('STUDENT');
  const [newGrade, setNewGrade] = useState<GradeLevel>(4);
  const [newClassId, setNewClassId] = useState<string>('class-4a');

  // New class form state
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<GradeLevel>(4);
  const [newClassTeacher, setNewClassTeacher] = useState('Cô Nguyễn Thị Mai');

  const teachers = users.filter(u => u.role === 'TEACHER');
  const students = users.filter(u => u.role === 'STUDENT');

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newUsername) return;

    const user: User = {
      id: `user-${Date.now()}`,
      fullName: newFullName,
      username: newUsername,
      email: newEmail || `${newUsername}@tieuhoc.edu.vn`,
      role: newRole,
      schoolName: 'Trường Tiểu học Ánh Dương - Hà Nội',
      createdAt: new Date().toISOString(),
      isActive: true,
      grade: newRole === 'STUDENT' ? newGrade : undefined,
      classId: newRole === 'STUDENT' ? newClassId : undefined,
      className: newRole === 'STUDENT' ? classes.find(c => c.id === newClassId)?.name : undefined,
      assignedGrades: newRole === 'TEACHER' ? [newGrade] : undefined,
    };

    onSaveUser(user);
    setIsAddUserModalOpen(false);
    setNewFullName('');
    setNewUsername('');
    setNewEmail('');
  };

  const handleCreateClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;

    const schoolClass: SchoolClass = {
      id: `class-${Date.now()}`,
      name: newClassName,
      grade: newClassGrade,
      academicYear: '2026-2027',
      headTeacherId: 'user-teacher-01',
      headTeacherName: newClassTeacher,
      studentCount: 30,
      room: 'Phòng Tin học Tầng 2'
    };

    onSaveClass(schoolClass);
    setIsAddClassModalOpen(false);
    setNewClassName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-purple-700">● Quản trị viên Hệ thống</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.fullName}</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.schoolName}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Trung tâm Điều hành & Phân quyền Hệ thống
          </h1>
        </div>

        <button
          onClick={onOpenSystemConfig}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          Bảng kiểm soát Dịch vụ Đám mây
        </button>
      </div>

      {/* 4 Overview metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Tổng người dùng</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {users.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {teachers.length} Giáo viên · {students.length} Học sinh
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Lớp học Tin học</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {classes.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Khối Lớp 3, 4, 5
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Lượt phê duyệt nội dung</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
            {approvalRecords.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Ghi nhật ký hệ thống đầy đủ
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">An toàn dữ liệu trẻ em</span>
          <div className="text-2xl font-bold text-sky-600 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span className="text-base text-slate-800">Tuân thủ</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Cách ly dữ liệu từng học sinh
          </div>
        </div>
      </div>

      {/* TAB: USERS MANAGEMENT */}
      {(activeTab === 'admin-users' || activeTab === 'admin-overview') && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Quản lý Tài khoản & Phân quyền Người dùng ({users.length})
              </h2>
              <p className="text-xs text-slate-500">
                Phân quyền RBAC nghiêm ngặt: Quản trị viên, Giáo viên phụ trách khối, Học sinh
              </p>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Thêm người dùng mới
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Họ và tên</th>
                  <th className="py-2.5 px-3">Tài khoản</th>
                  <th className="py-2.5 px-3">Vai trò phân quyền</th>
                  <th className="py-2.5 px-3">Khối / Lớp</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3 text-right">Thao tác quyền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className={`transition-colors ${isCurrent ? 'bg-sky-50/50' : 'hover:bg-slate-50/60'}`}>
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <span>{u.fullName}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-sky-100 text-sky-800 rounded font-bold">
                            Đang dùng
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {u.username}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          onChange={(e) => {
                            const newRole = e.target.value as UserRole;
                            onSaveUser({
                              ...u,
                              role: newRole,
                              assignedGrades: newRole === 'TEACHER' && !u.assignedGrades ? [4, 5] : u.assignedGrades,
                              grade: newRole === 'STUDENT' && !u.grade ? 4 : u.grade,
                              classId: newRole === 'STUDENT' && !u.classId ? 'class-4a' : u.classId,
                              className: newRole === 'STUDENT' && !u.className ? 'Lớp 4A' : u.className,
                            });
                          }}
                          className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                        >
                          <option value="ADMIN">👑 Quản trị viên</option>
                          <option value="TEACHER">👩‍🏫 Giáo viên</option>
                          <option value="STUDENT">🎒 Học sinh</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {u.className || (u.assignedGrades ? `Khối ${u.assignedGrades.join(', ')}` : 'Toàn trường')}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isCurrent ? (
                          <span className="text-xs text-sky-700 font-semibold">Tài khoản hiện tại</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSwitchUser(u.id)}
                            className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                          >
                            Chuyển sang vai này
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CLASSES MANAGEMENT */}
      {(activeTab === 'admin-classes' || activeTab === 'admin-overview') && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Quản lý Khối lớp & Phân công Giảng dạy ({classes.length} Lớp)
              </h2>
              <p className="text-xs text-slate-500">
                Thiết lập danh sách lớp, giáo viên phụ trách phòng máy và sĩ số
              </p>
            </div>

            <button
              onClick={() => setIsAddClassModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Tạo lớp học mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
            {classes.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">{c.name}</span>
                  <span className="font-semibold text-sky-700">Khối {c.grade}</span>
                </div>
                <div className="text-slate-600">
                  <strong>GV phụ trách:</strong> {c.headTeacherName}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Sĩ số: {c.studentCount} học sinh · {c.academicYear}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: AUDIT LOGS */}
      {(activeTab === 'admin-audit' || activeTab === 'admin-overview') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">
            Nhật ký Hoạt động Phê duyệt Toàn Hệ thống
          </h2>
          <div className="divide-y divide-slate-100 text-xs">
            {approvalRecords.map((r) => (
              <div key={r.id} className="py-2.5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{r.actorName}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-sky-700">{r.action}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-800">{r.entityTitle}</span>
                  </div>
                  {r.comment && <p className="text-slate-500 text-[11px] mt-0.5 italic">{r.comment}</p>}
                </div>
                <span className="text-slate-400 text-[11px] font-mono shrink-0">
                  {new Date(r.timestamp).toLocaleString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Thêm Tài khoản Người dùng Mới</h3>
            
            <form onSubmit={handleCreateUserSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên:</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ví dụ: Em Nguyễn Hoàng Nam"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên đăng nhập:</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="nam.nguyen"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Vai trò:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="STUDENT">Học sinh</option>
                  <option value="TEACHER">Giáo viên</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>

              {newRole === 'STUDENT' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Khối lớp:</label>
                    <select
                      value={newGrade}
                      onChange={(e) => setNewGrade(Number(e.target.value) as GradeLevel)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value={3}>Lớp 3</option>
                      <option value={4}>Lớp 4</option>
                      <option value={5}>Lớp 5</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Lớp:</label>
                    <select
                      value={newClassId}
                      onChange={(e) => setNewClassId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg"
                >
                  Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Class */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Tạo Lớp học Mới</h3>
            
            <form onSubmit={handleCreateClassSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên lớp:</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ví dụ: Lớp 4C"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Khối lớp:</label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(Number(e.target.value) as GradeLevel)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value={3}>Khối 3</option>
                  <option value={4}>Khối 4</option>
                  <option value={5}>Khối 5</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giáo viên phụ trách:</label>
                <select
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {teachers.map(t => <option key={t.id} value={t.fullName}>{t.fullName}</option>)}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg"
                >
                  Tạo lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
