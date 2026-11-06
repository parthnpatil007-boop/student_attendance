export type AttendanceStatus = 'Present' | 'Absent';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  rollNumber: string;
  name: string;
  status: AttendanceStatus;
  timestamp: number;
}

export interface Student {
  rollNumber: string;
  name: string;
  department?: string;
  email?: string;
}

export interface StudentAttendanceSummary {
  student: Student;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  percentage: number;
  isAtRisk: boolean; // < 75% attendance
}

export interface AttendanceStats {
  totalRecords: number;
  totalPresent: number;
  totalAbsent: number;
  overallPercentage: number;
  todayRecordsCount: number;
  todayPresentCount: number;
  todayAbsentCount: number;
  atRiskCount: number;
}
