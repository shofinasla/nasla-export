import React from "react";

export function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-200/80">
        <div className="h-3 w-28 rounded-md bg-slate-200" />
        <div className="h-8 w-64 rounded-xl bg-slate-200" />
        <div className="h-4 w-96 rounded-md bg-slate-100" />
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-8 w-8 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-7 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-28 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
