import Navbar from "@/components/Navbar";
import CandidateTable from "@/components/CandidateTable";

export default function Candidates() {
  return (
    <>
      <Navbar />

      <main className="pt-24 pb-16 px-6 max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Talent Pipeline
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary/10">
                <span className="material-symbols-outlined text-[14px]">database</span>
                Database
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium max-w-lg">
              Browse, filter, and manage all analyzed candidates from your database.
            </p>
          </div>
        </div>

        {/* Data Table with Filters */}
        <CandidateTable />
      </main>
    </>
  );
}
