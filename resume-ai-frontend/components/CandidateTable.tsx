"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

// Dynamic import with SSR disabled to prevent DOMMatrix errors
const ResumePreviewModal = dynamic(() => import("./ResumePreviewModal"), {
  ssr: false,
});

interface Candidate {
  id: number;
  filename: string;
  skills: string;
  experience: string;
  ats_score: number;
  has_preview?: boolean; // Prop to track if PDF exists
}

const ITEMS_PER_PAGE = 10;

export default function CandidateTable() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [minAtsScore, setMinAtsScore] = useState("all");
  const [expRange, setExpRange] = useState("all");
  const [skillsFilter, setSkillsFilter] = useState("");

  // Preview State
  const [previewData, setPreviewData] = useState<{ id: number; filename: string } | null>(null);

  // Logic: Send all filters to the BACKEND (Task implementation)
  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString()
      });

      if (searchQuery) params.append("search", searchQuery);
      if (minAtsScore !== "all") params.append("min_score", minAtsScore);
      if (expRange !== "all") params.append("experience_range", expRange);
      if (skillsFilter) params.append("skills", skillsFilter);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates?${params.toString()}`);
      if (!response.ok) throw new Error("Backend connection failed.");
      
      const data = await response.json();
      setCandidates(data.candidates || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load candidates");
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, minAtsScore, expRange, skillsFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200/60 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search by name or skills..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select 
                value={minAtsScore} 
                onChange={(e) => { setMinAtsScore(e.target.value); setPage(1); }}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-3 px-10 text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="all">Any Match</option>
                <option value="70">70%+ Match</option>
                <option value="80">80%+ Match</option>
              </select>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">analytics</span>
            </div>

            <div className="relative">
              <select 
                value={expRange} 
                onChange={(e) => { setExpRange(e.target.value); setPage(1); }}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-3 px-10 text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="all">Any Exp.</option>
                <option value="0-1">0-1 Years</option>
                <option value="1-3">1-3 Years</option>
                <option value="3+">3+ Years</option>
              </select>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">calendar_today</span>
            </div>

            <input 
              type="text" 
              value={skillsFilter} 
              onChange={(e) => { setSkillsFilter(e.target.value); setPage(1); }}
              placeholder="Filter by specific skills..."
              className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all min-w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Pipeline Table */}
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-200/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Candidate Information</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ATS Assessment</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <span className="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No matching candidates found</td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined">description</span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">{c.filename.replace(/\.[^/.]+$/, "")}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{c.experience || "Fresh"}</span>
                            <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[10px] font-bold text-primary uppercase truncate max-w-[200px]">{c.skills.split(",").slice(0, 3).join(", ")}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                         <div className="flex flex-col gap-1.5 flex-1 max-w-[120px]">
                            <div className="flex justify-between items-center">
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                               <span className="text-xs font-black text-slate-900">{c.ats_score}%</span>
                            </div>
                            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                               <div className={`h-full ${c.ats_score > 70 ? 'bg-tertiary' : 'bg-slate-400'} rounded-full`} style={{ width: `${c.ats_score}%` }}></div>
                            </div>
                         </div>
                         <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${c.ats_score > 70 ? 'bg-tertiary/10 text-tertiary' : 'bg-slate-100 text-slate-400'}`}>
                            {c.ats_score > 70 ? 'Strong' : 'Review'}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      {c.has_preview ? (
                        <button 
                          onClick={() => setPreviewData({ id: c.id, filename: c.filename })}
                          className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 font-black text-[10px] uppercase tracking-widest transition-all btn-hover"
                        >
                          Preview Resume
                        </button>
                      ) : (
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic cursor-help" title="Legacy candidate: Re-upload to enable preview">
                          Preview Missing
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Integrated Pagination Footer */}
        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{totalPages}</span>
            </p>
            <div className="flex gap-2">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white hover:bg-slate-50 disabled:opacity-30 transition-all font-bold"
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages || totalPages === 0} 
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white hover:bg-slate-50 disabled:opacity-30 transition-all font-bold"
                >
                  Next
                </button>
            </div>
        </div>
      </div>

      {previewData && (
        <ResumePreviewModal 
          id={previewData.id} 
          filename={previewData.filename} 
          isOpen={!!previewData} 
          onClose={() => setPreviewData(null)} 
        />
      )}
    </div>
  );
}
