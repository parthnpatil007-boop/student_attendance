import React, { useState } from 'react';
import { AttendanceRecord } from '../types';
import { recordsToCSV, parseCSVToRecords, downloadAttendanceCSV, DEFAULT_RECORDS } from '../utils/storage';
import { X, Copy, Download, Upload, Check, RefreshCw, FileText, AlertTriangle } from 'lucide-react';

interface CSVManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AttendanceRecord[];
  onUpdateRecords: (records: AttendanceRecord[]) => void;
}

export const CSVManagerModal: React.FC<CSVManagerModalProps> = ({
  isOpen,
  onClose,
  records,
  onUpdateRecords,
}) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const csvRaw = recordsToCSV(records);

  const handleCopy = () => {
    navigator.clipboard.writeText(csvRaw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processCSVImport(content);
      }
    };
    reader.readAsText(file);
  };

  const processCSVImport = (text: string) => {
    const { records: parsedRecords, errors } = parseCSVToRecords(text);
    if (parsedRecords.length === 0) {
      setImportStatus(`Import failed: ${errors.join('; ')}`);
      return;
    }

    onUpdateRecords(parsedRecords);
    setImportStatus(`Successfully imported ${parsedRecords.length} records!`);
    setShowImportBox(false);
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleClearAllRecords = () => {
    if (window.confirm('Clear all attendance records from attendance.csv?')) {
      onUpdateRecords([]);
      setImportStatus('Cleared all records from attendance.csv.');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">attendance.csv File Manager</h3>
              <p className="text-xs text-slate-500">
                Direct view and manipulation of the persistent CSV storage file.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {importStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadAttendanceCSV(records)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .csv</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy CSV Text'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV File</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleClearAllRecords}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                title="Clear all records from file"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear Records</span>
              </button>
            </div>
          </div>

          {/* Raw CSV Text Preview */}
          <div className="border border-slate-800 bg-[#0c1017] rounded-xl overflow-hidden shadow-inner">
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400">
              <span>File: attendance.csv</span>
              <span>{records.length} records · {csvRaw.length} bytes</span>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-400/90 overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre leading-relaxed">
              {csvRaw}
            </pre>
          </div>

          {/* Manual paste import box toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowImportBox(!showImportBox)}
              className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
            >
              {showImportBox ? 'Hide manual text paste' : 'Or paste raw CSV text directly'}
            </button>

            {showImportBox && (
              <div className="mt-2 space-y-2">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Date,Roll Number,Name,Status&#10;2026-11-06,101,Alice Smith,Present"
                  rows={4}
                  className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() => processCSVImport(importText)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Import Pasted CSV
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
