import React, { useState } from 'react';
import { 
  SchoolClass, 
  User, 
  Assignment, 
  AssignmentSubmission, 
  GradeLevel, 
  InformaticsTopic 
} from '../../types';
import { 
  TrendingUp, 
  Download, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Award, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface ReportsAndAnalyticsProps {
  currentUser: User;
  classes: SchoolClass[];
  users: User[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
}

export const ReportsAndAnalytics: React.FC<ReportsAndAnalyticsProps> = ({
  currentUser,
  classes,
  users,
  assignments,
  submissions,
}) => {
  const [filterGrade, setFilterGrade] = useState<GradeLevel | 'ALL'>('ALL');
  const [filterClassId, setFilterClassId] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'PRACTICE' | 'OFFICIAL_TEST'>('ALL');

  const students = users.filter(u => u.role === 'STUDENT');

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterGrade !== 'ALL' && sub.grade !== filterGrade) return false;
    if (filterClassId !== 'ALL' && sub.classId !== filterClassId) return false;
    if (filterType !== 'ALL' && sub.assignmentType !== filterType) return false;
    return true;
  });

  // Calculate statistics
  const totalSubmissions = filteredSubmissions.length;
  const gradedSubmissions = filteredSubmissions.filter(s => s.status === 'GRADED');
  const avgScore = gradedSubmissions.length > 0
    ? (gradedSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / gradedSubmissions.length).toFixed(1)
    : '0';

  // Topic mastery stats
  const topicStats: Record<string, { total: number; sumScore: number; count: number }> = {};
  filteredSubmissions.forEach(sub => {
    const t = sub.topic;
    if (!topicStats[t]) {
      topicStats[t] = { total: 0, sumScore: 0, count: 0 };
    }
    if (sub.score !== undefined) {
      topicStats[t].sumScore += sub.score;
      topicStats[t].count += 1;
    }
  });

  const handleExportCSV = () => {
    const targetClassId = filterClassId === 'ALL' ? (classes[0]?.id || '') : filterClassId;
    const csvContent = storageService.exportClassReportToCSV(targetClassId);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BaoCao_KetQua_TinHoc_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Báo cáo Tổng hợp & Thống kê Học tập Tin học
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tỷ lệ hoàn thành, điểm trung bình, kiến thức cần ôn tập và xuất dữ liệu Excel
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Xuất Báo cáo Excel (.CSV)
        </button>
      </div>

      {/* Filter strip */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center gap-4 text-xs">
        
        {/* Grade */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Khối lớp:</span>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value) as GradeLevel)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
          >
            <option value="ALL">Tất cả khối lớp</option>
            <option value={3}>Khối Lớp 3</option>
            <option value={4}>Khối Lớp 4</option>
            <option value={5}>Khối Lớp 5</option>
          </select>
        </div>

        {/* Class */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Lớp học:</span>
          <select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
          >
            <option value="ALL">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Hình thức:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
          >
            <option value="ALL">Tất cả hình thức</option>
            <option value="PRACTICE">Bài Luyện tập</option>
            <option value="OFFICIAL_TEST">Kiểm tra chính thức</option>
          </select>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Số bài đã nộp</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {totalSubmissions}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Trong các nhiệm vụ đang chọn
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Điểm trung bình toàn khối</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
            {avgScore} / 10
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Dựa trên {gradedSubmissions.length} bài đã hoàn tất chấm
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Tỷ lệ nắm vững kiến thức</span>
          <div className="text-2xl font-bold text-sky-600 mt-1 tabular-nums">
            {Math.min(100, Math.round(Number(avgScore) * 10))}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Đạt chuẩn kiến thức GDPT 2018
          </div>
        </div>
      </div>

      {/* Topic Breakdown & Weakness Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Kết quả Theo Chủ đề Kiến thức & Khuyến nghị Củng cố
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(topicStats).length === 0 ? (
            <div className="col-span-2 text-xs text-slate-400 py-4 text-center">
              Chưa có dữ liệu bài nộp cho các tiêu chí đã chọn.
            </div>
          ) : (
            Object.entries(topicStats).map(([topicName, stats]) => {
              const topicAvg = stats.count > 0 ? (stats.sumScore / stats.count).toFixed(1) : '0';
              const percent = Math.min(100, Math.round(Number(topicAvg) * 10));
              
              return (
                <div key={topicName} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="text-sky-900">{topicName}</span>
                    <span className="font-mono text-emerald-700">{topicAvg}/10</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-sky-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Số lượt làm bài: {stats.count}</span>
                    <span>Tỷ lệ hoàn thành: {percent}%</span>
                  </div>

                  {percent < 80 && (
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-800 text-[11px] flex items-center gap-1.5 border border-amber-200/50">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Khuyến nghị: Cần thêm bài tập củng cố về chủ đề này trong tuần tới.</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Submissions Detail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Chi tiết Bài nộp của Từng Học sinh ({filteredSubmissions.length})
          </h2>
          <span className="text-xs text-slate-500">
            Dữ liệu gốc được lưu trữ nguyên vẹn để kiểm tra lại
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Học sinh</th>
                <th className="py-2.5 px-3">Lớp</th>
                <th className="py-2.5 px-3">Nhiệm vụ</th>
                <th className="py-2.5 px-3">Hình thức</th>
                <th className="py-2.5 px-3 text-right">Điểm số</th>
                <th className="py-2.5 px-3 text-right">Thời gian làm</th>
                <th className="py-2.5 px-4">Thời điểm nộp</th>
                <th className="py-2.5 px-4">Nhận xét của giáo viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không tìm thấy bài nộp nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {sub.studentName}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {sub.className}
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-medium">
                      {sub.assignmentTitle}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[11px] font-semibold ${
                        sub.assignmentType === 'OFFICIAL_TEST' ? 'text-purple-700' : 'text-emerald-700'
                      }`}>
                        {sub.assignmentType === 'OFFICIAL_TEST' ? 'Kiểm tra' : 'Luyện tập'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                      {sub.score !== undefined ? `${sub.score} / ${sub.maxScore}` : 'Chưa chấm'}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500 tabular-nums">
                      {Math.round(sub.timeSpentSeconds / 60)} phút
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('vi-VN') : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] italic">
                      {sub.feedback || 'Chưa có nhận xét'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
