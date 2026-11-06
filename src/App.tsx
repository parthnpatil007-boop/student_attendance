import React, { useState, useEffect, useMemo } from 'react';
import { AttendanceRecord, Student } from './types';
import {
  loadRecordsFromStorage,
  saveRecordsToStorage,
  loadStudentsFromStorage,
  saveStudentsToStorage,
  computeStats,
  downloadAttendanceCSV,
  getTodayDateString,
} from './utils/storage';
import { RosterAttendanceMarker } from './components/RosterAttendanceMarker';
import { AttendanceTable } from './components/AttendanceTable';
import { AttendanceAnalytics } from './components/AttendanceAnalytics';
import { PythonSourceViewer } from './components/PythonSourceViewer';
import { CSVManagerModal } from './components/CSVManagerModal';
import { AboutSection } from './components/AboutSection';
import {
  CalendarCheck2,
  FileSpreadsheet,
  BarChart3,
  Code2,
  Download,
  CheckCircle,
  Info,
} from 'lucide-react';

const LOGO_SRC = '/src/assets/images/attendance_system_logo_1793976879101.jpg';

export default function App() {
  const [records, setRecords] = useState<AttendanceRecord[]>(() => loadRecordsFromStorage());
  const [students, setStudents] = useState<Student[]>(() => loadStudentsFromStorage());
  const [activeTab, setActiveTab] = useState<'roster' | 'records' | 'analytics' | 'code' | 'about'>('roster');

  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync state to storage
  useEffect(() => {
    saveRecordsToStorage(records);
  }, [records]);

  useEffect(() => {
    saveStudentsToStorage(students);
  }, [students]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Upsert for daily roster marking
  const handleAddOrUpdateRecord = (
    date: string,
    rollNumber: string,
    name: string,
    status: 'Present' | 'Absent'
  ) => {
    setRecords((prev) => {
      const existingIndex = prev.findIndex(
        (r) => r.date === date && r.rollNumber.trim().toLowerCase() === rollNumber.trim().toLowerCase()
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          name,
          status,
          timestamp: Date.now(),
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            date,
            rollNumber,
            name,
            status,
            timestamp: Date.now(),
          },
        ];
      }
    });
    showNotification(`Marked ${name} (#${rollNumber}) as ${status}`);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showNotification('Record removed from attendance.csv');
  };

  const handleToggleStatus = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === 'Present' ? 'Absent' : 'Present' } : r))
    );
  };

  const handleAddStudent = (student: Student) => {
    setStudents((prev) => [...prev, student]);
    showNotification(`Added ${student.name} (#${student.rollNumber}) to Roster`);
  };

  const handleRemoveStudent = (rollNumber: string) => {
    const target = students.find((s) => s.rollNumber === rollNumber);
    setStudents((prev) => prev.filter((s) => s.rollNumber !== rollNumber));
    showNotification(`Removed ${target?.name || rollNumber} from class roster`);
  };

  const { stats, summaries } = useMemo(() => {
    return computeStats(records, students, getTodayDateString());
  }, [records, students]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Bar - Strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand title with custom logo, single-element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src={LOGO_SRC}
              alt="Student Attendance System Logo"
              className="w-9 h-9 rounded-lg object-cover shadow-xs border border-slate-200"
            />
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Student Attendance System
            </span>
          </div>

          {/* Zone 2: Navigation Links (single-line, whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'roster'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Daily Roster</span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'records'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Attendance Log</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'analytics'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'code'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Python Script</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'about'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => downloadAttendanceCSV(records)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export attendance.csv</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-200 bg-white overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeTab === 'roster' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Roster
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeTab === 'records' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Records
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeTab === 'code' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Python
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
              activeTab === 'about' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            About
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Context Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_SRC}
              alt="Logo Mark"
              className="w-10 h-10 rounded-lg object-cover shadow-2xs border border-slate-200 hidden sm:block"
            />
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-800">
                Teacher Attendance Desk & Digital Ledger
              </div>
              <div className="text-xs text-slate-500">
                Direct roll number and student management · Persistent output synced to <code className="font-mono text-slate-700">attendance.csv</code>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 font-mono tabular-nums">
            <span>Enrolled: <strong className="text-slate-900">{students.length}</strong></span>
            <span>·</span>
            <span>Total Records: <strong className="text-slate-900">{records.length}</strong></span>
            <span>·</span>
            <button
              onClick={() => setIsCSVModalOpen(true)}
              className="text-slate-900 underline font-medium hover:text-emerald-700 font-sans"
            >
              CSV Tools
            </button>
          </div>
        </div>

        {/* Tab 1: Daily Roster (Teacher's main workspace with Add & Remove) */}
        {activeTab === 'roster' && (
          <RosterAttendanceMarker
            students={students}
            records={records}
            onAddOrUpdateRecord={handleAddOrUpdateRecord}
            onAddStudent={handleAddStudent}
            onRemoveStudent={handleRemoveStudent}
          />
        )}

        {/* Tab 2: Attendance Records Table */}
        {activeTab === 'records' && (
          <AttendanceTable
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onToggleStatus={handleToggleStatus}
            onOpenCSVManager={() => setIsCSVModalOpen(true)}
          />
        )}

        {/* Tab 3: Analytics & Performance Metrics */}
        {activeTab === 'analytics' && (
          <AttendanceAnalytics stats={stats} summaries={summaries} />
        )}

        {/* Tab 4: Python Implementation & Architecture */}
        {activeTab === 'code' && <PythonSourceViewer />}

        {/* Tab 5: About & Creator Information */}
        {activeTab === 'about' && <AboutSection />}
      </main>

      {/* CSV Manager Modal */}
      <CSVManagerModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        records={records}
        onUpdateRecords={(newRecs) => {
          setRecords(newRecs);
          showNotification(`Updated records (${newRecs.length} entries)`);
        }}
      />

      {/* Clean Academic Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <img
              src={LOGO_SRC}
              alt="Logo"
              className="w-5 h-5 rounded-md object-cover"
            />
            <span className="font-semibold text-slate-800">Student Attendance System</span>
            <span>·</span>
            <span>Created by <strong className="text-slate-800 font-medium">Parth Nitin Patil</strong> (Roll No. 42 · SEBIT · PRN: U262E001)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-slate-900 font-medium transition-colors"
            >
              About Project
            </button>
            <button
              onClick={() => setIsCSVModalOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              Raw attendance.csv
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className="hover:text-slate-800 transition-colors"
            >
              Python Script
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
