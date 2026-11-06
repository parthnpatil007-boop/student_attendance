import { AttendanceRecord, Student, AttendanceStats, StudentAttendanceSummary } from '../types';

export const CSV_FILE_NAME = 'attendance.csv';
const ATTENDANCE_STORAGE_KEY = 'student_attendance_records_clean';
const STUDENTS_STORAGE_KEY = 'student_attendance_roster_clean';

export const DEFAULT_STUDENTS: Student[] = [];

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DEFAULT_RECORDS: AttendanceRecord[] = [];

export const loadRecordsFromStorage = (): AttendanceRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load attendance records from localStorage', e);
    return [];
  }
};

export const saveRecordsToStorage = (records: AttendanceRecord[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save attendance records to localStorage', e);
  }
};

export const loadStudentsFromStorage = (): Student[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load students from localStorage', e);
    return [];
  }
};

export const saveStudentsToStorage = (students: Student[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to localStorage', e);
  }
};

/**
 * Formats attendance records into the authentic CSV structure
 * matching Python's: writer.writerow(["Date", "Roll Number", "Name", "Status"])
 */
export const recordsToCSV = (records: AttendanceRecord[]): string => {
  const header = ['Date', 'Roll Number', 'Name', 'Status'];
  const rows = records.map((r) => [
    r.date,
    `"${r.rollNumber.replace(/"/g, '""')}"`,
    `"${r.name.replace(/"/g, '""')}"`,
    r.status,
  ]);
  return [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

/**
 * Parses CSV text back into AttendanceRecord format
 */
export const parseCSVToRecords = (csvText: string): { records: AttendanceRecord[]; errors: string[] } => {
  const lines = csvText.trim().split(/\r?\n/);
  const records: AttendanceRecord[] = [];
  const errors: string[] = [];

  if (lines.length === 0) {
    return { records, errors: ['CSV file is completely empty.'] };
  }

  // Parse header
  const headerLine = lines[0];
  if (!headerLine.toLowerCase().includes('date') || !headerLine.toLowerCase().includes('status')) {
    errors.push('CSV header must contain "Date" and "Status" columns.');
  }

  // Simple CSV parser supporting quotes
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split line respecting quotes
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());

    if (cols.length < 4) {
      errors.push(`Row ${i + 1} has insufficient columns (${cols.length}/4)`);
      continue;
    }

    const [rawDate, rawRoll, rawName, rawStatus] = cols.map((col) =>
      col.replace(/^["']|["']$/g, '').trim()
    );

    const normalizedStatus = rawStatus.toLowerCase().startsWith('p') ? 'Present' : 'Absent';

    records.push({
      id: `imported-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      date: rawDate || getTodayDateString(),
      rollNumber: rawRoll || 'N/A',
      name: rawName || 'Unnamed Student',
      status: normalizedStatus,
      timestamp: Date.now() - i * 1000,
    });
  }

  return { records, errors };
};

/**
 * Triggers a browser download of the attendance.csv file
 */
export const downloadAttendanceCSV = (records: AttendanceRecord[]): void => {
  const csvContent = recordsToCSV(records);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', CSV_FILE_NAME);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Calculates analytics and KPIs
 */
export const computeStats = (
  records: AttendanceRecord[],
  students: Student[],
  targetDate: string = getTodayDateString()
): { stats: AttendanceStats; summaries: StudentAttendanceSummary[] } => {
  const totalRecords = records.length;
  const totalPresent = records.filter((r) => r.status === 'Present').length;
  const totalAbsent = records.filter((r) => r.status === 'Absent').length;
  const overallPercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

  const todayRecords = records.filter((r) => r.date === targetDate);
  const todayPresentCount = todayRecords.filter((r) => r.status === 'Present').length;
  const todayAbsentCount = todayRecords.filter((r) => r.status === 'Absent').length;

  // Student summaries
  const summaries: StudentAttendanceSummary[] = students.map((student) => {
    const studentRecords = records.filter((r) => r.rollNumber.trim() === student.rollNumber.trim());
    const totalClasses = studentRecords.length;
    const presentCount = studentRecords.filter((r) => r.status === 'Present').length;
    const absentCount = studentRecords.filter((r) => r.status === 'Absent').length;
    const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;
    const isAtRisk = totalClasses >= 2 && percentage < 75;

    return {
      student,
      totalClasses,
      presentCount,
      absentCount,
      percentage,
      isAtRisk,
    };
  });

  const atRiskCount = summaries.filter((s) => s.isAtRisk).length;

  return {
    stats: {
      totalRecords,
      totalPresent,
      totalAbsent,
      overallPercentage,
      todayRecordsCount: todayRecords.length,
      todayPresentCount,
      todayAbsentCount,
      atRiskCount,
    },
    summaries,
  };
};

export const PYTHON_SOURCE_CODE = `"""
Student Attendance System
Developed as a lightweight CLI utility utilizing Python's built-in libraries
(csv, os, datetime) for automated attendance tracking in academic environments.
"""

import csv
import os
from datetime import date

FILE_NAME = "attendance.csv"


def initialize_file():
    """
    Create the CSV file with headers if it doesn't exist.
    Headers: Date, Roll Number, Name, Status
    """
    if not os.path.exists(FILE_NAME):
        with open(FILE_NAME, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(["Date", "Roll Number", "Name", "Status"])
        print(f"Initialized persistent storage: {FILE_NAME}")


def mark_attendance():
    """
    Prompt user for student details, validate status input,
    timestamp with current date, and append to CSV file.
    """
    today = date.today().strftime("%Y-%m-%d")
    print("\\n--- Mark Attendance ---")
    roll_no = input("Enter Roll Number: ").strip()
    if not roll_no:
        print("Error: Roll Number cannot be empty.")
        return

    name = input("Enter Student Name: ").strip()
    if not name:
        print("Error: Student Name cannot be empty.")
        return

    status_input = input("Enter Status (P for Present / A for Absent): ").strip().upper()

    if status_input == 'P':
        status = "Present"
    elif status_input == 'A':
        status = "Absent"
    else:
        print("Error: Invalid input. Please enter 'P' or 'A'.")
        return

    # Ensure file is initialized before appending
    initialize_file()

    # Append the record to the CSV file
    with open(FILE_NAME, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([today, roll_no, name, status])

    print(f"Success: Attendance marked for {name} on {today}.")


def view_attendance():
    """
    Read and display all records from the CSV file in formatted table.
    """
    if not os.path.exists(FILE_NAME):
        print("\\nNo attendance records found. Please mark attendance first.")
        return

    print("\\n--- Attendance Records ---")
    with open(FILE_NAME, mode='r') as file:
        reader = csv.reader(file)
        header = next(reader, None)
        if header:
            print(" | ".join(header))
            print("-" * 50)
            count = 0
            for row in reader:
                if row:
                    print(" | ".join(row))
                    count += 1
            print(f"\\nTotal Records: {count}")
        else:
            print("CSV file is empty.")


def main():
    """
    Main interactive loop for the Student Attendance System CLI.
    """
    initialize_file()
    while True:
        print("\\n=== Student Attendance System ===")
        print("1 Mark Attendance")
        print("2 View Attendance")
        print("3 Exit")

        choice = input("Enter your choice (1-3): ").strip()

        if choice == '1':
            mark_attendance()
        elif choice == '2':
            view_attendance()
        elif choice == '3':
            print("Exiting system. Goodbye!")
            break
        else:
            print("Invalid selection! Please enter a valid option (1, 2, or 3).")


if __name__ == "__main__":
    main()
`;
