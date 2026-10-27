import React, { useState } from 'react';
import { 
  SchoolClass, 
  User, 
  Assignment, 
  Lesson, 
  Question, 
  AssignmentSubmission 
} from '../../types';
import { 
  Users, 
  BookOpen, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Send, 
  FileSpreadsheet, 
  UserCheck,
  ChevronRight,
  X
} from 'lucide-react';

interface ClassAndAssignmentManagerProps {
  currentUser: User;
  classes: SchoolClass[];
  users: User[];
  assignments: Assignment[];
  lessons: Lesson[];
  questions: Question[];
  submissions: AssignmentSubmission[];
  onSaveAssignment: (assignment: Assignment) => void;
  onSaveClass: (schoolClass: SchoolClass) => void;
  onSaveUser: (user: User) => void;
}

export const ClassAndAssignmentManager: React.FC<ClassAndAssignmentManagerProps> = ({
  currentUser,
  classes,
  users,
  assignments,
  lessons,
  questions,
  submissions,
  onSaveAssignment,
  onSaveClass,
  onSaveUser,
}) => {
  const [activeTab, setActiveTab] = useState<'ASSIGNMENTS' | 'CLASSES'>('ASSIGNMENTS');
  const [isCreateAssignModalOpen, setIsCreateAssignModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');

  // Form State for new assignment
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDescription, setAssignDescription] = useState('');
  const [assignType, setAssignType] = useState<'PRACTICE' | 'OFFICIAL_TEST'>('PRACTICE');
  const [targetType, setTargetType] = useState<'CLASS' | 'STUDENT'>('CLASS');
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>(['class-4a']);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('lesson-01');
  const [dueDate, setDueDate] = useState('2026-11-05T23:59');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);

  const students = users.filter(u => u.role === 'STUDENT');
  const selectedClass = classes.find(c => c.id === selectedClassId);
  const classStudents = students.filter(s => s.classId === selectedClassId);

  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle) return;

    const selectedLesson = lessons.find(l => l.id === selectedLessonId);
    const assignQuestions = selectedLesson?.assessmentQuestions || questions.slice(0, 4);

    let targetNames: string[] = [];
    if (targetType === 'CLASS') {
      targetNames = classes.filter(c => selectedTargetIds.includes(c.id)).map(c => c.name);
    } else {
      targetNames = students.filter(s => selectedTargetIds.includes(s.id)).map(s => s.fullName);
    }

    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      code: `NV-TIN-${Date.now().toString().slice(-4)}`,
      title: assignTitle,
      description: assignDescription || 'Hoàn thành các câu hỏi để củng cố kiến thức.',
      lessonId: selectedLessonId,
      grade: selectedLesson?.grade || 4,
      topic: selectedLesson?.topic || 'CHỦ ĐỀ A: MÁY TÍNH VÀ EM',
      type: assignType,
      targetType,
      targetIds: selectedTargetIds,
      targetNames,
      assignedByTeacherId: currentUser.id,
      assignedByTeacherName: currentUser.fullName,
      assignedAt: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      timeLimitMinutes,
      questions: assignQuestions,
      totalPoints: 10,
      passingScore: 5.0,
      status: 'ACTIVE'
    };

    onSaveAssignment(newAssignment);
    setIsCreateAssignModalOpen(false);
    setAssignTitle('');
    setAssignDescription('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Quản lý Lớp học & Giao bài Tập
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Giao bài cho cả lớp hoặc từng cá nhân học sinh, theo dõi tiến độ nộp bài và kết quả
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateAssignModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tạo nhiệm vụ giao bài mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit text-xs">
        <button
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
            activeTab === 'ASSIGNMENTS'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Danh sách Nhiệm vụ đã giao ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('CLASSES')}
          className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
            activeTab === 'CLASSES'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Danh sách Lớp học ({classes.length})
        </button>
      </div>

      {/* TAB 1: ASSIGNMENTS */}
      {activeTab === 'ASSIGNMENTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assign) => {
              const assignSubs = submissions.filter(s => s.assignmentId === assign.id);
              const isTest = assign.type === 'OFFICIAL_TEST';

              return (
                <div
                  key={assign.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold text-xs ${isTest ? 'text-purple-700' : 'text-emerald-700'}`}>
                          ● {isTest ? 'Kiểm tra chính thức' : 'Luyện tập rèn luyện'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-400">{assign.code}</span>
                      </div>
                      <span className="font-mono text-slate-500">Lớp {assign.grade}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {assign.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {assign.description}
                    </p>

                    <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                      <div>Giao cho: <strong>{assign.targetNames.join(', ')}</strong></div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Hạn nộp: {new Date(assign.dueDate).toLocaleDateString('vi-VN')}</span>
                        <span>{assign.timeLimitMinutes} phút</span>
                      </div>
                    </div>
                  </div>

                  {/* Submission completion progress */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Đã nộp: <strong className="text-slate-900">{assignSubs.length}</strong> bài
                    </span>
                    <span className="text-emerald-700 font-semibold">
                      {assign.questions.length} câu hỏi
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CLASSES & ROSTER */}
      {activeTab === 'CLASSES' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Class list sidebar */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Các lớp phụ trách
            </h3>
            {classes.map((c) => {
              const isSelected = c.id === selectedClassId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClassId(c.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/60 font-semibold text-sky-950 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{c.name}</span>
                    <span className="text-xs text-slate-500 font-normal">{c.studentCount} học sinh</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    GVCN: {c.headTeacherName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Class details and student roster */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
            {selectedClass ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Danh sách Học sinh {selectedClass.name} (Khối {selectedClass.grade})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Năm học: {selectedClass.academicYear} · {selectedClass.room || 'Phòng Tin học'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert('Chức năng nhập danh sách học sinh từ tệp Excel chuẩn bị sẵn sàng.')}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                      Nhập từ Excel
                    </button>
                  </div>
                </div>

                {/* Student table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Học sinh</th>
                        <th className="py-2.5 px-3">Tài khoản</th>
                        <th className="py-2.5 px-3">Email trường</th>
                        <th className="py-2.5 px-3 text-right">Bài đã nộp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {classStudents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400">
                            Chưa có dữ liệu học sinh trong lớp này.
                          </td>
                        </tr>
                      ) : (
                        classStudents.map((s) => {
                          const studentSubs = submissions.filter(sub => sub.studentId === s.id);
                          return (
                            <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 px-3 font-semibold text-slate-900">
                                {s.fullName}
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-600">
                                {s.username}
                              </td>
                              <td className="py-3 px-3 text-slate-500">
                                {s.email}
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-sky-700 tabular-nums">
                                {studentSubs.length} bài
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </div>

        </div>
      )}

      {/* Modal: Create Assignment */}
      {isCreateAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tạo và Giao Nhiệm vụ Học tập Mới
                </h3>
                <p className="text-xs text-slate-500">
                  Giao bài tập hoặc bài kiểm tra chính thức cho học sinh
                </p>
              </div>
              <button
                onClick={() => setIsCreateAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignmentSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tiêu đề nhiệm vụ:
                </label>
                <input
                  type="text"
                  required
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  placeholder="Ví dụ: Nhiệm vụ tuần 9: Ôn tập Phần cứng máy tính"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>

              {/* Type: Practice vs Official Test */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Hình thức đánh giá:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                    assignType === 'PRACTICE' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' : 'border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="assignType"
                      checked={assignType === 'PRACTICE'}
                      onChange={() => setAssignType('PRACTICE')}
                    />
                    <span>Luyện tập rèn luyện</span>
                  </label>
                  <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer ${
                    assignType === 'OFFICIAL_TEST' ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold' : 'border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="assignType"
                      checked={assignType === 'OFFICIAL_TEST'}
                      onChange={() => setAssignType('OFFICIAL_TEST')}
                    />
                    <span>Kiểm tra chính thức</span>
                  </label>
                </div>
              </div>

              {/* Select Lesson to bind */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Gắn với Bài học:
                </label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      [Lớp {l.grade}] {l.title} ({l.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Due date and time limit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Hạn nộp bài:
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Thời gian làm bài (Phút):
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={90}
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Assign to Class or individual students */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Đối tượng giao bài:
                </label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="targetType"
                      checked={targetType === 'CLASS'}
                      onChange={() => setTargetType('CLASS')}
                    />
                    <span>Giao cho cả Lớp</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="targetType"
                      checked={targetType === 'STUDENT'}
                      onChange={() => setTargetType('STUDENT')}
                    />
                    <span>Giao cá nhân cho từng Học sinh</span>
                  </label>
                </div>

                {targetType === 'CLASS' ? (
                  <div className="flex flex-wrap gap-2">
                    {classes.map((c) => {
                      const isChecked = selectedTargetIds.includes(c.id);
                      return (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedTargetIds(selectedTargetIds.filter(id => id !== c.id));
                            } else {
                              setSelectedTargetIds([...selectedTargetIds, c.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border font-semibold ${
                            isChecked ? 'bg-sky-50 border-sky-600 text-sky-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="max-h-32 overflow-y-auto space-y-1 p-2 border border-slate-200 rounded-lg">
                    {students.map((s) => {
                      const isChecked = selectedTargetIds.includes(s.id);
                      return (
                        <label key={s.id} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTargetIds([...selectedTargetIds, s.id]);
                              } else {
                                setSelectedTargetIds(selectedTargetIds.filter(id => id !== s.id));
                              }
                            }}
                          />
                          <span>{s.fullName} ({s.className})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateAssignModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Hoàn tất giao bài
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
