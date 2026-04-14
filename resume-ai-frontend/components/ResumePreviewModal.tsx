"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ResumePreviewModalProps {
  id: number;
  filename: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumePreviewModal({ id, filename, isOpen, onClose }: ResumePreviewModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isReady, setIsReady] = useState(false);

  if (!isOpen) return null;

  const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/resume/${id}`;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsReady(true);
  }

  const changePage = (offset: number) => {
    setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages || 1));
  };

  const adjustScale = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 2.5));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 sm:p-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Main Modal Container: High-fidelity flex box */}
      <div className="bg-white w-full max-w-5xl h-[95vh] rounded-[2rem] shadow-2xl flex flex-col relative border border-slate-200 overflow-hidden">
        
        {/* Header: Fixed controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-20 gap-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">description</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-black text-slate-900 truncate max-w-[180px] sm:max-w-xs uppercase tracking-tight">
                {filename}
              </h3>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Recruiter Dashboard Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Nav */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
               <button 
                 disabled={pageNumber <= 1} 
                 onClick={() => changePage(-1)}
                 className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
               >
                 <span className="material-symbols-outlined text-lg">chevron_left</span>
               </button>
               <span className="px-3 text-[10px] font-black text-slate-900 tracking-tighter">
                 {pageNumber} / {numPages || "--"}
               </span>
               <button 
                 disabled={!!numPages && pageNumber >= numPages} 
                 onClick={() => changePage(1)}
                 className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
               >
                 <span className="material-symbols-outlined text-lg">chevron_right</span>
               </button>
            </div>

            {/* Zoom */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
               <button onClick={() => adjustScale(-0.1)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all">
                 <span className="material-symbols-outlined text-lg">remove</span>
               </button>
               <span className="px-3 text-[10px] font-black text-slate-900 min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
               <button onClick={() => adjustScale(0.1)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all">
                 <span className="material-symbols-outlined text-lg">add</span>
               </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <a 
               href={fileUrl} 
               download={filename}
               className="h-9 px-4 rounded-xl bg-primary text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
             >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Save
             </a>
             <button 
               onClick={onClose}
               className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all"
             >
                <span className="material-symbols-outlined text-xl">close</span>
             </button>
          </div>
        </div>

        {/* Scrollable Viewport: The core fix */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 flex justify-center p-6 sm:p-10 scroll-smooth relative">
           {!isReady && (
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/60 backdrop-blur-sm z-10">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating PDF Layers...</p>
             </div>
           )}

           <div className="h-fit">
              <Document 
                 file={fileUrl} 
                 onLoadSuccess={onDocumentLoadSuccess}
                 loading={null}
                 className="react-pdf__Document"
                 error={
                   <div className="p-20 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Document Sync Failed</p>
                      <p className="text-[10px] text-slate-400 mt-2">The requested resume could not be retrieved.</p>
                   </div>
                 }
              >
                 <Page 
                   pageNumber={pageNumber} 
                   scale={scale} 
                   renderTextLayer={true}
                   renderAnnotationLayer={true}
                   className="shadow-2xl border border-slate-200 origin-top bg-white"
                   loading={null}
                 />
              </Document>
           </div>
        </div>

        {/* Info Footer: Fixed */}
        <div className="px-6 py-2.5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">AI Ranked Candidate Document</span>
           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ResumeAI Viewer v2.1</span>
        </div>
      </div>
    </div>
  );
}
