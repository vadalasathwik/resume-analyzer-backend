"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import with SSR disabled to prevent DOMMatrix errors
const ResumePreviewModal = dynamic(() => import("./ResumePreviewModal"), {
  ssr: false,
});

export interface CandidateCardProps {
  id?: number; // Added for preview
  rank: number;
  name: string;
  filename: string;
  icon: string;
  iconColorClass: string;
  score: number;
  scoreVariant: "excellent" | "strong" | "low";
  strokeDashoffset: number;
  topSkills: { name: string; isAdditional?: boolean }[];
  gaps: string[];
  experience: string;
  opacityClass?: string;
  hasPreview?: boolean; // New prop
}

export default function CandidateCard({
  id,
  rank,
  name,
  filename,
  icon,
  iconColorClass,
  score,
  scoreVariant,
  strokeDashoffset,
  topSkills,
  gaps,
  experience,
  opacityClass = "",
  hasPreview = true,
}: CandidateCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  let scoreColorClass = "text-tertiary";
  let strokeColorClass = "stroke-tertiary";
  let scoreBgClass = "bg-tertiary/10";
  let scoreText = "Excellent";

  if (scoreVariant === "strong") {
    scoreColorClass = "text-amber-600";
    strokeColorClass = "stroke-amber-500";
    scoreBgClass = "bg-amber-50";
    scoreText = "Strong";
  } else if (scoreVariant === "low") {
    scoreColorClass = "text-red-500";
    strokeColorClass = "stroke-red-400";
    scoreBgClass = "bg-red-50";
    scoreText = "Needs Work";
  }

  const rankBg = rank === 1 ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30" :
                 rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md shadow-slate-400/20" :
                 rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md shadow-amber-700/20" :
                 "bg-slate-100 text-slate-500";

  return (
    <>
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 card-hover flex flex-col group/card relative overflow-hidden ${opacityClass}`}>
        {/* Rank Badge */}
        <div className={`absolute top-4 right-4 h-8 w-8 rounded-lg ${rankBg} flex items-center justify-center text-xs font-extrabold`}>
          #{rank}
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6 pr-10">
          <div className={`h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover/card:bg-white group-hover/card:shadow-md transition-all duration-300 ${iconColorClass} shrink-0`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-lg leading-tight truncate">{name}</h4>
            <p className="text-xs text-slate-400 mt-1 font-medium truncate">{filename}</p>
            {experience && experience !== "Not found" && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="material-symbols-outlined text-[14px] text-slate-400">work_history</span>
                <span className="text-xs text-slate-500 font-medium">{experience} experience</span>
              </div>
            )}
          </div>
        </div>

        {/* ATS Score — Prominent */}
        <div className={`${scoreBgClass} rounded-xl p-4 flex items-center gap-4 mb-6`}>
          <div className="relative h-14 w-14 shrink-0">
            <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
              <circle className="stroke-slate-200" cx="18" cy="18" fill="none" r="16" strokeWidth="3" />
              <circle className={`progress-ring ${strokeColorClass}`} cx="18" cy="18" fill="none" r="16" strokeDasharray="100" strokeDashoffset={strokeDashoffset} strokeLinecap="round" strokeWidth="3" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-slate-900">{score}%</span>
          </div>
          <div>
            <p className={`text-sm font-bold ${scoreColorClass}`}>{scoreText}</p>
            <p className="text-[11px] text-slate-500 font-medium">ATS Compatibility Score</p>
          </div>
        </div>

        {/* Skills & Gaps */}
        <div className="space-y-5 flex-1 mb-6">
          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
              Matched Skills
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {topSkills.map((skill, index) =>
                skill.isAdditional ? (
                  <span key={index} className="px-2 py-1 text-slate-400 text-[11px] font-bold text-nowrap">{skill.name}</span>
                ) : (
                  <span key={index} className="px-2.5 py-1 chip-refined rounded-lg text-[11px] text-nowrap">{skill.name}</span>
                )
              )}
            </div>
          </div>
          {gaps.length > 0 && (
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-red-400">cancel</span>
                Missing Skills
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {gaps.map((gap, index) => (
                  <span key={index} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold border border-red-100/50 text-nowrap">{gap}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {id && (
          hasPreview ? (
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="w-full mt-auto py-4 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-primary transition-all btn-hover shadow-md hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">visibility</span>
              View Resume PDF
            </button>
          ) : (
            <div className="w-full mt-auto py-4 bg-slate-50 border border-slate-200 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 cursor-help" title="Legacy data: Re-upload candidate to enable preview">
              <span className="material-symbols-outlined text-lg">block</span>
              Preview Unavailable
            </div>
          )
        )}
      </div>

      {isPreviewOpen && (
        <ResumePreviewModal 
          id={id!} 
          filename={filename} 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)} 
        />
      )}
    </>
  );
}
