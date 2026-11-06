import React, { useState } from 'react';
import { PYTHON_SOURCE_CODE } from '../utils/storage';
import { Check, Copy, Download, Code, ShieldCheck, Calendar, FileSpreadsheet } from 'lucide-react';

export const PythonSourceViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_SOURCE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([PYTHON_SOURCE_CODE], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_attendance.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = PYTHON_SOURCE_CODE.split('\n');

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Python CLI Source Code</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Lightweight, dependency-free script using standard Python modules: <code className="text-xs bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">csv</code>, <code className="text-xs bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">os</code>, <code className="text-xs bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">datetime</code>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .py</span>
          </button>
        </div>
      </div>

      {/* Architectural Alignment Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Automatic Timestamping</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Uses <code className="font-mono text-[11px] text-slate-800">date.today().strftime("%Y-%m-%d")</code> to ensure consistency and eliminate human error when logging attendance entries.
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Persistent CSV Storage</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Appends directly to <code className="font-mono text-[11px] text-slate-800">attendance.csv</code> with proper RFC 4180 formatting, allowing seamless backup and import into Excel or Sheets.
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Input Validation</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Strict checking for roll numbers, names, and normalized status conversion (<code className="font-mono text-[11px] text-slate-800">P</code> &rarr; Present, <code className="font-mono text-[11px] text-slate-800">A</code> &rarr; Absent).
          </p>
        </div>
      </div>

      {/* Code Display Container */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1117] text-slate-200 overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs text-slate-300">student_attendance.py</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">{lines.length} lines · UTF-8</span>
        </div>

        <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
          <pre className="font-mono text-xs leading-relaxed">
            {lines.map((line, index) => {
              const isComment = line.trim().startsWith('#') || line.trim().startsWith('"""');
              const isDef = line.trim().startsWith('def ') || line.trim().startsWith('if ') || line.trim().startsWith('elif ');
              const isImport = line.trim().startsWith('import ') || line.trim().startsWith('from ');
              const isString = line.includes('"') || line.includes("'");

              let color = 'text-slate-300';
              if (isComment) color = 'text-slate-500 italic';
              else if (isImport) color = 'text-rose-400';
              else if (isDef) color = 'text-cyan-400 font-medium';
              else if (isString && !line.includes('def')) color = 'text-emerald-300';

              return (
                <div key={index} className="flex hover:bg-slate-800/40 px-2 py-0.5 rounded">
                  <span className="w-10 text-right pr-4 text-slate-600 select-none tabular-nums shrink-0">
                    {index + 1}
                  </span>
                  <span className={`${color} whitespace-pre`}>{line}</span>
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
};
