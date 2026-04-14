"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    if (pathname === path) {
      return "font-sans text-sm font-bold tracking-tight text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1 px-5 py-2 lg:px-0 lg:py-0 transition-colors duration-200 ease-in-out active:scale-95";
    }
    return "font-sans text-sm font-medium tracking-tight text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 ease-in-out active:scale-95 px-5 py-2 lg:px-0 lg:py-0 hover:bg-slate-100/50 lg:hover:bg-transparent rounded-full lg:rounded-none";
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-[0px_1px_0px_rgba(0,0,0,0.05)] border-b border-slate-200/40">
      <div className="relative flex items-center justify-between px-6 py-4 max-w-[1600px] mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
          </div>
          <span className="text-xl font-extrabold tracking-tighter text-slate-900 dark:text-slate-50">ResumeAI</span>
        </div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center lg:space-x-6 gap-2">
          <Link className={getLinkClass("/")} href="/">Dashboard</Link>
          <Link className={getLinkClass("/candidates")} href="/candidates">Candidates</Link>
        </div>
      </div>
    </nav>
  );
}
