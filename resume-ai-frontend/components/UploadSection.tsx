"use client";

import React, { useState, useRef } from "react";

interface UploadSectionProps {
  onAnalyze: (files: File[], jobDescription: string, jdFile?: File) => void;
  isAnalyzing: boolean;
}

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPE = "application/pdf";

export default function UploadSection({ onAnalyze, isAnalyzing }: UploadSectionProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [jdFile, setJdFile] = useState<File | undefined>();
  const [fileError, setFileError] = useState<string | null>(null);
  const [showJdSection, setShowJdSection] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (incoming: File[]) => {
    setFileError(null);
    const valid: File[] = [];
    for (const file of incoming) {
      if (file.type !== ALLOWED_TYPE) {
        setFileError(`"${file.name}" is not a PDF. Only PDF files are accepted.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length > 0) {
      setFiles((prev) => [...prev, ...valid]);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(Array.from(e.target.files));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeJdFile = () => {
    setJdFile(undefined);
    if (jdInputRef.current) jdInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasJd = !!(jobDescription.trim() || jdFile);
  const canAnalyze = files.length > 0;

  return (
    <section className="space-y-4">
      {/* Upload Area — Hero Card */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-8 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white text-xl">upload_file</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">Resume Batch Upload</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Analysis Engine v1.0</p>
              </div>
            </div>
            {files.length > 0 && (
              <span className="text-[10px] font-black bg-primary text-white px-3 py-1.5 rounded-xl uppercase tracking-widest animate-pulse">
                {files.length} READY
              </span>
            )}
          </div>

          {/* Drop Zone */}
          <div
            className={`
              relative border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center
              cursor-pointer group transition-all duration-300
              ${isDragOver
                ? "border-primary bg-primary/5 shadow-[0_0_40px_rgba(37,99,235,0.15)]"
                : "border-slate-200 bg-slate-50/50 hover:border-primary/40 hover:bg-primary/[0.02] drop-zone-glow"
              }
            `}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" />
            <div className={`h-20 w-20 rounded-3xl bg-white shadow-md flex items-center justify-center mb-5 transition-all duration-300 ${isDragOver ? "scale-110 shadow-xl" : "group-hover:scale-105 group-hover:shadow-lg"}`}>
              <span className={`material-symbols-outlined text-4xl transition-colors duration-300 ${isDragOver ? "text-primary" : "text-slate-300 group-hover:text-primary"}`}>cloud_upload</span>
            </div>
            <p className="text-base font-bold text-slate-900 text-center">Drag & drop resumes here</p>
            <p className="text-sm text-slate-400 mt-1 font-medium italic">Supports mass upload of PDF files</p>
          </div>

          {/* File Validation Error */}
          {fileError && (
            <div className="mt-4 flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-2xl p-4 animate-[fadeIn_0.2s_ease-out]">
              <span className="material-symbols-outlined text-sm mt-0.5">error</span>
              <p className="text-xs font-bold">{fileError}</p>
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="px-8 py-6 border-t border-slate-100 mt-6 bg-slate-50/30">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-4">
              Queued for Analysis
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto no-scrollbar">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3 group/file hover:shadow-md transition-all">
                  <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-red-500 text-lg">picture_as_pdf</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block truncate text-xs font-bold text-slate-700" title={file.name}>{file.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Job Description — Optional Toggle */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <button
          onClick={() => setShowJdSection(!showJdSection)}
          className="w-full flex items-center justify-between px-8 py-4 hover:bg-slate-50/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all ${hasJd ? "bg-tertiary text-white shadow-lg shadow-tertiary/20" : "bg-slate-100 text-slate-400"}`}>
              <span className="material-symbols-outlined text-xl">{hasJd ? "check_circle" : "description"}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Job Description Context</h3>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Optional</span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Enabling this improves ATS matching precision.</p>
            </div>
          </div>
          <span className={`material-symbols-outlined text-slate-300 transition-transform duration-300 ${showJdSection ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </button>

        {showJdSection && (
          <div className="px-8 pb-8 border-t border-slate-100 animate-[slideDown_0.3s_ease-out]">
            <div className="flex justify-between items-center mt-6 mb-4">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Requirements Input</p>
              <div className="flex gap-2 items-center">
                {jdFile && (
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-black border border-blue-100 uppercase tracking-tight">
                    <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                    <span className="truncate max-w-[120px]" title={jdFile.name}>{jdFile.name}</span>
                    <button onClick={removeJdFile} className="hover:text-red-500 material-symbols-outlined text-[14px]">close</button>
                  </div>
                )}
                <input
                  type="file" ref={jdInputRef} className="hidden" accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.type === ALLOWED_TYPE) { setJdFile(file); }
                    else if (file) { setFileError("JD file must be a PDF."); }
                  }}
                />
                <button
                  onClick={() => jdInputRef.current?.click()}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all btn-hover flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">attach_file</span>
                  Attach PDF
                </button>
              </div>
            </div>
            <textarea
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white outline-none min-h-[160px] transition-all resize-none font-medium leading-relaxed disabled:opacity-50"
              placeholder="Paste job details here to analyze skill gaps relative to specific project needs..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={!!jdFile}
            />
          </div>
        )}
      </div>

      {/* Analyze Action Bar (Task 5, 6) */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-[1.5rem] shadow-sm border border-slate-200/60 p-6 gap-4">
        <div className="flex items-center gap-4 text-sm w-full sm:w-auto">
          {canAnalyze ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-tertiary font-bold mb-0.5">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{files.length} Candidates Selected</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-6">
                Mode: {hasJd ? "JD Matching Enabled" : "General Skill Analysis"}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-slate-400 font-bold">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">info</span>
              </div>
              <span className="text-[11px] uppercase tracking-widest">Select files to begin mission</span>
            </div>
          )}
        </div>
        <button
          onClick={() => onAnalyze(files, jobDescription, jdFile)}
          disabled={isAnalyzing || !canAnalyze}
          className={`
            w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-300
            ${isAnalyzing 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
              : "bg-primary text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            }
            disabled:opacity-50 disabled:shadow-none
          `}
        >
          {isAnalyzing ? (
            <>
              Analyzing Pipeline
              <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
            </>
          ) : (
            <>
              Start Analysis Engine
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
