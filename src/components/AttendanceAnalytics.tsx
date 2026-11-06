import React from 'react';
import { AttendanceStats, StudentAttendanceSummary } from '../types';
import { AlertCircle, CheckCircle2, TrendingUp, Users, CalendarDays, Award } from 'lucide-react';

interface AttendanceAnalyticsProps {
  stats: AttendanceStats;
  summaries: StudentAttendanceSummary[];
  onSelectStudent?: (rollNumber: string) => void;
}

export const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({
  stats,
  summaries,
}) => {
  return (
    <div className="space-y-6">
      {/* 4-Stat Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Overall Attendance</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {stats.overallPercentage}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-700 font-medium tabular-nums">{stats.totalPresent} Present</span> ·{' '}
            <span className="text-rose-700 font-medium tabular-nums">{stats.totalAbsent} Absent</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Today's Participation</span>
            <CalendarDays className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {stats.todayRecordsCount} <span className="text-xs font-normal text-slate-500">logged</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-700 font-medium tabular-nums">{stats.todayPresentCount} present</span>
            {' / '}
            <span className="text-rose-700 font-medium tabular-nums">{stats.todayAbsentCount} absent</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summaries.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Active in roster directory
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Attendance Warnings (&lt;75%)</span>
            <AlertCircle className={`w-4 h-4 ${stats.atRiskCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
          </div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              stats.atRiskCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {stats.atRiskCount} <span className="text-xs font-normal text-slate-500">students</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Standard 75% minimum academic threshold
          </div>
        </div>
      </div>

      {/* Student Attendance Summary Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Student Attendance Performance & Roster Health
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated statistics derived from all recorded timestamps in <code className="font-mono text-slate-700">attendance.csv</code>.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <tr>
                <th className="py-3 px-4">Roll No.</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Sessions Logged</th>
                <th className="py-3 px-4 text-center">Present / Absent</th>
                <th className="py-3 px-4 text-right">Attendance %</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.map(({ student, totalClasses, presentCount, absentCount, percentage, isAtRisk }) => {
                return (
                  <tr key={student.rollNumber} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 tabular-nums">
                      {student.rollNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {student.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {student.department || 'General'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-700">
                      {totalClasses}
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums">
                      <span className="text-emerald-700 font-medium">{presentCount}</span> /{' '}
                      <span className="text-rose-700 font-medium">{absentCount}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              percentage >= 75 ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                        <span className={percentage < 75 ? 'text-amber-600' : 'text-slate-800'}>
                          {percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {isAtRisk ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Shortage Alert</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Good Standing</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
