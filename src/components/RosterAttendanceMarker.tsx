import React, { useState } from 'react';
import { AttendanceRecord, Student } from '../types';
import { getTodayDateString } from '../utils/storage';
import {
  Check,
  X,
  Calendar,
  UserPlus,
  Trash2,
  Users,
  Search,
} from 'lucide-react';

interface RosterAttendanceMarkerProps {
  students: Student[];
  records: AttendanceRecord[];
  onAddOrUpdateRecord: (date: string, rollNumber: string, name: string, status: 'Present' | 'Absent') => void;
  onAddStudent: (student: Student) => void;
  onRemoveStudent: (rollNumber: string) => void;
}

export const RosterAttendanceMarker: React.FC<RosterAttendanceMarkerProps> = ({
  students,
  records,
  onAddOrUpdateRecord,
  onAddStudent,
  onRemoveStudent,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [rollInput, setRollInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check attendance status for each student on selected date
  const getStatusForStudent = (rollNumber: string): 'Present' | 'Absent' | null => {
    const rec = records.find(
      (r) => r.date === selectedDate && r.rollNumber.trim().toLowerCase() === rollNumber.trim().toLowerCase()
    );
    return rec ? rec.status : null;
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRoll = rollInput.trim();
    const cleanName = nameInput.trim();

    if (!cleanRoll) {
      setErrorMessage('Please enter a Roll Number.');
      return;
    }
    if (!cleanName) {
      setErrorMessage('Please enter the Student Name.');
      return;
    }

    const exists = students.some(
      (s) => s.rollNumber.trim().toLowerCase() === cleanRoll.toLowerCase()
    );
    if (exists) {
      setErrorMessage(`Roll number #${cleanRoll} is already in the roster.`);
      return;
    }

    setErrorMessage(null);
    onAddStudent({
      rollNumber: cleanRoll,
      name: cleanName,
    });

    // Auto mark as Present for today when teacher adds them
    onAddOrUpdateRecord(selectedDate, cleanRoll, cleanName, 'Present');

    setRollInput('');
    setNameInput('');
  };

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    students.forEach((student) => {
      onAddOrUpdateRecord(selectedDate, student.rollNumber, student.name, status);
    });
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = students.filter((s) => getStatusForStudent(s.rollNumber) === 'Present').length;
  const absentCount = students.filter((s) => getStatusForStudent(s.rollNumber) === 'Absent').length;
  const unrecordedCount = students.length - presentCount - absentCount;

  return (
    <div className="space-y-6">
      {/* Teacher Add Student Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="w-4 h-4 text-slate-800" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Add Student to Daily Roster
          </h3>
          <span className="text-xs text-slate-400">· Enter details to enroll in class list</span>
        </div>

        <form onSubmit={handleAddStudentSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label htmlFor="roll-no" className="block text-[11px] font-medium text-slate-600 mb-1">
                Roll Number *
              </label>
              <input
                id="roll-no"
                type="text"
                placeholder="e.g. 101"
                value={rollInput}
                onChange={(e) => {
                  setRollInput(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="student-name" className="block text-[11px] font-medium text-slate-600 mb-1">
                Student Full Name *
              </label>
              <input
                id="student-name"
                type="text"
                placeholder="e.g. Alice Smith"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs font-medium text-rose-600 animate-in fade-in">
              {errorMessage}
            </p>
          )}
        </form>
      </div>

      {/* Main Roster & Roll Call Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Top Toolbar */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-800" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Class Attendance Roster
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mark attendance for each enrolled student. Changes append directly to <code className="font-mono text-slate-700">attendance.csv</code>.
            </p>
          </div>

          {/* Session Date & Batch Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600 font-medium">Session Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-slate-900 font-medium focus:ring-0 p-0 text-xs font-mono cursor-pointer"
              />
            </div>

            {students.length > 0 && (
              <>
                <button
                  onClick={() => handleMarkAll('Present')}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </button>

                <button
                  onClick={() => handleMarkAll('Absent')}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Mark All Absent</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status Metrics Strip & Quick Search */}
        <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-600">
            <span>Enrolled Students: <strong className="text-slate-900 tabular-nums font-mono">{students.length}</strong></span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">
              Present: <strong className="tabular-nums font-mono">{presentCount}</strong>
            </span>
            <span>·</span>
            <span className="text-rose-700 font-medium">
              Absent: <strong className="tabular-nums font-mono">{absentCount}</strong>
            </span>
            {unrecordedCount > 0 && (
              <>
                <span>·</span>
                <span className="text-slate-500">
                  Unmarked: <strong className="tabular-nums font-mono">{unrecordedCount}</strong>
                </span>
              </>
            )}
          </div>

          {students.length > 3 && (
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search roll or student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* Student Roster Rows */}
        {students.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-sm font-semibold text-slate-800">No Students in Roster Yet</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                As the teacher, you have full control over your class list. Enter a Roll Number and Student Full Name above to add your students.
              </p>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No students found matching "{searchQuery}".
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
            {filteredStudents.map((student) => {
              const status = getStatusForStudent(student.rollNumber);
              const isPresent = status === 'Present';
              const isAbsent = status === 'Absent';

              return (
                <div
                  key={student.rollNumber}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors"
                >
                  {/* Student Roll and Name */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded w-16 text-center tabular-nums shrink-0">
                      #{student.rollNumber}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 text-sm truncate">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {status ? (
                          <span>
                            Logged on {selectedDate}:{' '}
                            <strong className={isPresent ? 'text-emerald-700' : 'text-rose-700'}>
                              {status}
                            </strong>
                          </span>
                        ) : (
                          <span className="text-slate-400">Not recorded yet for this session</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Attendance P/A buttons + Remove Student */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Fast Attendance Toggle */}
                    <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() =>
                          onAddOrUpdateRecord(selectedDate, student.rollNumber, student.name, 'Present')
                        }
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          isPresent
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title="Mark Present"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onAddOrUpdateRecord(selectedDate, student.rollNumber, student.name, 'Absent')
                        }
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          isAbsent
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                        }`}
                        title="Mark Absent"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </button>
                    </div>

                    {/* Teacher Remove Student Button */}
                    <button
                      type="button"
                      onClick={() => onRemoveStudent(student.rollNumber)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title={`Remove ${student.name} from roster`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
