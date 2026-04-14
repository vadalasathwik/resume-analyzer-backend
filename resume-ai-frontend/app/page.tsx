"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import UploadSection from "@/components/UploadSection";
import CandidateCard from "@/components/CandidateCard";
import Link from "next/link";

// Dynamic import with SSR disabled to prevent DOMMatrix errors
const ResumePreviewModal = dynamic(() => import("@/components/ResumePreviewModal"), {
  ssr: false,
});

interface CandidateResult {
  id?: number;
  filename: string;
  skills: string[];
  experience: string;
  score: number;
  keyword_match: number;
  ats_score: number;
  missing_skills: string[];
  created_at?: string;
  has_preview?: boolean; // New field
}

export default function Dashboard() {
  const [candidates, setCandidates] = useState<CandidateResult[] | null>(null);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview State
  const [previewData, setPreviewData] = useState<{ id: number; filename: string } | null>(null);

  // Helper to parse experience
  const parseExperienceYears = (exp: string): number => {
    if (!exp || exp.toLowerCase() === "not found" || exp.toLowerCase() === "n/a") return 0;
    const match = exp.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Fetch recent history from DB
  const fetchRecentHistory = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`);
      const data = await response.json();
      if (response.ok) {
        setRecentHistory((data.candidates || []).slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    fetchRecentHistory();
  }, []);

  const handleAnalyze = async (files: File[], jobDescription: string, jdFile?: File) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      if (jobDescription && jobDescription.trim() !== "") {
        formData.append("job_description", jobDescription);
      }

      if (jdFile) {
        formData.append("jd_file", jdFile);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rank-resumes`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || `Upload failed with status ${response.status}`);
        return;
      }

      if (data.error) {
        setError(data.error);
        return;
      }

      setCandidates(data.ranked_candidates || []);
      fetchRecentHistory();
    } catch (err: any) {
      setError(
        err.message === "Failed to fetch"
          ? "Backend not reachable. Ensure the server is running at " + process.env.NEXT_PUBLIC_API_URL
          : err.message || "An unexpected error occurred"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stats = useMemo(() => {
    if (!candidates || candidates.length === 0) return null;

    const total = candidates.length;
    const sumAts = candidates.reduce((sum, c) => sum + c.ats_score, 0);
    const avgAts = Math.round(sumAts / total);
    const topScore = candidates[0].ats_score;
    const strongMatches = candidates.filter(c => c.ats_score > 70).length;

    const skillCounts: Record<string, number> = {};
    candidates.forEach(c => c.skills.forEach(s => skillCounts[s] = (skillCounts[s] || 0) + 1));
    const sortedSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]);
    const topSkill = sortedSkills[0]?.[0] || "N/A";
    const topSkillPercent = total > 0 ? Math.round((sortedSkills[0]?.[1] || 0) / total * 100) : 0;

    const missingCounts: Record<string, number> = {};
    candidates.forEach(c => (c.missing_skills || []).forEach(s => missingCounts[s] = (missingCounts[s] || 0) + 1));
    const sortedMissing = Object.entries(missingCounts).sort((a, b) => b[1] - a[1]);
    const mostMissing = sortedMissing.slice(0, 2).map(m => m[0]).join(", ") || "None";

    const totalExp = candidates.reduce((sum, c) => sum + parseExperienceYears(c.experience), 0);
    const avgExp = (totalExp / total).toFixed(1);

    return { total, avgAts, topScore, strongMatches, topSkill, topSkillPercent, mostMissing, avgExp };
  }, [candidates]);

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Command Center</h1>
                <div className="hidden sm:inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                  <span className="material-symbols-outlined text-[14px]">terminal</span>
                  ATS Control
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium max-w-lg">
                Manage your hiring pipeline with intelligent AI insights and real-time candidate scoring.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/candidates" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary bg-white border border-slate-200 px-5 py-2.5 rounded-xl transition-all btn-hover shadow-sm">
                <span className="material-symbols-outlined text-lg">group</span>
                View Pipeline
              </Link>
              <button 
                onClick={() => { setCandidates(null); setError(null); }}
                className="flex items-center gap-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl transition-all btn-hover shadow-lg shadow-slate-200"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                New Analysis
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Analyzed" value={stats?.total || 0} subValue="Candidates" icon="group" colorClass="bg-primary/10 text-primary" loading={isAnalyzing} />
            <StatCard label="Avg. Score" value={`${stats?.avgAts || 0}%`} subValue="ATS Compatibility" icon="speed" colorClass="bg-amber-500/10 text-amber-600" loading={isAnalyzing} />
            <StatCard label="Top Score" value={`${stats?.topScore || 0}%`} subValue="Best Match" icon="emoji_events" colorClass="bg-tertiary/10 text-tertiary" loading={isAnalyzing} />
            <StatCard label="Strong Matches" value={stats?.strongMatches || 0} subValue="Scored > 70%" icon="stars" colorClass="bg-violet-500/10 text-violet-600" loading={isAnalyzing} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <UploadSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

              {candidates && candidates.length > 0 && (
                <section className="animate-[fadeIn_0.5s_ease-out]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary">military_tech</span>
                       Top Candidates
                    </h2>
                    <Link href="/candidates" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                      View All Pipeline <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidates.slice(0, 3).map((candidate, idx) => (
                      <CandidateCard
                        key={idx}
                        id={candidate.id}
                        rank={idx + 1}
                        name={candidate.filename.replace(/\.[^/.]+$/, "")}
                        filename={candidate.filename}
                        icon="person"
                        iconColorClass="text-primary"
                        score={candidate.ats_score}
                        scoreVariant={candidate.ats_score >= 80 ? "excellent" : candidate.ats_score >= 60 ? "strong" : "low"}
                        strokeDashoffset={100 - candidate.ats_score}
                        topSkills={candidate.skills.slice(0, 3).map(s => ({ name: s }))}
                        gaps={candidate.missing_skills?.slice(0, 2) || []}
                        experience={candidate.experience}
                        hasPreview={candidate.has_preview}
                      />
                    ))}
                  </div>
                </section>
              )}

              {!candidates && !isAnalyzing && (
                <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center animate-[fadeIn_0.4s_ease-out]">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-white shadow-sm mb-6">
                    <span className="material-symbols-outlined text-4xl text-slate-300">rocket_launch</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Hire Smarter?</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">
                    Upload resumes to get instant AI-powered rankings and deep skill compatibility analysis.
                  </p>
                  <button 
                    onClick={() => document.querySelector<HTMLDivElement>('.drop-zone-glow')?.click()}
                    className="bg-primary text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    Select Resumes to Start
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8">
              <section className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                  AI Curator Insights
                </h3>
                {stats ? (
                  <div className="space-y-6">
                    <InsightItem label="Key Strength" title={stats.topSkill} desc={`Appears in ${stats.topSkillPercent}% of candidates.`} icon="verified" colorClass="text-tertiary bg-tertiary/10" />
                    <InsightItem label="Critical Gap" title={stats.mostMissing} desc="Most candidates lack these core skills." icon="warning" colorClass="text-red-500 bg-red-50" />
                    <InsightItem label="Exp. Average" title={`${stats.avgExp} Years`} desc="Average industry experience in this batch." icon="history_edu" colorClass="text-blue-500 bg-blue-50" />
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Skill Gap Summary</p>
                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                          &quot;Overall, the candidate pool shows strong {stats.topSkill} alignment. However, there is a noticeable gap in {stats.mostMissing} which may require targeted screening.&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-200 mb-3 block">analytics</span>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Awaiting Analysis</p>
                  </div>
                )}
              </section>

              <section className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">history</span>
                  Recent History
                </h3>
                <div className="space-y-4">
                  {recentHistory.length > 0 ? (
                    recentHistory.map((item, idx) => (
                      <button 
                        key={idx} 
                        disabled={!item.has_preview}
                        onClick={() => setPreviewData({ id: item.id, filename: item.filename })}
                        className={`w-full flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl transition-colors text-left ${item.has_preview ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                            <span className="material-symbols-outlined text-primary text-lg">description</span>
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate" title={item.filename}>{item.filename}</p>
                            <p className="text-[10px] text-slate-400 font-medium tracking-tight">ATS: {item.ats_score}%</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 text-lg">{item.has_preview ? 'visibility' : 'block'}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4 font-medium italic">No recent analyses found.</p>
                  )}
                  {recentHistory.length > 0 && (
                    <Link href="/candidates" className="block text-center text-xs font-bold text-primary mt-4 hover:underline">
                      See full history
                    </Link>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {previewData && (
        <ResumePreviewModal 
          id={previewData.id} 
          filename={previewData.filename} 
          isOpen={!!previewData} 
          onClose={() => setPreviewData(null)} 
        />
      )}
    </>
  );
}

function StatCard({ label, value, subValue, icon, colorClass, loading }: any) {
  return (
    <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200/60 shadow-sm group hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg mb-2"></div>
      ) : (
        <p className="text-3xl font-extrabold text-slate-900 mb-1">{value}</p>
      )}
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">{subValue}</p>
    </div>
  );
}

function InsightItem({ label, title, desc, icon, colorClass }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <h4 className="font-bold text-slate-900 text-sm truncate capitalize">{title}</h4>
        <p className="text-xs text-slate-500 font-medium leading-normal">{desc}</p>
      </div>
    </div>
  );
}