import React from 'react';
import { User, Award, Hash, BookOpen, Layers, CheckCircle2, FileSpreadsheet, Shield } from 'lucide-react';

const LOGO_SRC = '/src/assets/images/attendance_system_logo_1793976879101.jpg';

export const AboutSection: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Creator Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative shrink-0">
            <img
              src={LOGO_SRC}
              alt="Student Attendance System Emblem"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-md border-2 border-slate-100"
            />
            <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white p-1 rounded-full border-2 border-white">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Project Developer & Author
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                Parth Nitin Patil
              </h2>
            </div>

            {/* Academic Credentials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span>Roll Number</span>
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
                  42
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Class</span>
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  SEBIT
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>PRN Number</span>
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
                  U262E001
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Background & Architecture */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            About the Student Attendance System
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Designed to transition manual academic attendance records into a structured, reliable digital application with persistent CSV file storage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Automated Date Timestamping</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every marked record is automatically tagged with the active session date (<code className="font-mono text-[11px] text-slate-800">YYYY-MM-DD</code>) to eliminate user entry errors.
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Universal CSV Persistence</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Data is written according to RFC 4180 standards in <code className="font-mono text-[11px] text-slate-800">attendance.csv</code>, allowing instant export to Excel, Google Sheets, or Python analysis scripts.
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Input Validation & Verification</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prevents duplicate roll numbers, validates student names, and ensures statuses adhere strictly to Present or Absent rules.
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Teacher-Centric Daily Roster</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Empowers instructors to enter roll numbers and student names on their own with fast Add and Remove controls, plus batch roll calling.
            </p>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div>
            Developer: <span className="text-slate-800 font-medium">Parth Nitin Patil (Roll #42)</span>
          </div>
          <div>
            PRN: <span className="text-slate-800 font-medium">U262E001</span>
          </div>
          <div>
            Department / Class: <span className="text-slate-800 font-medium">SEBIT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
