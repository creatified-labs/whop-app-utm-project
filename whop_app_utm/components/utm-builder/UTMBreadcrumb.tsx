import React from "react";
import { Button } from "@whop/react/components";

export function UTMBreadcrumb() {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create UTM Link</h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl">
          Build consistent UTM parameters and instantly generate a tracking link.
        </p>
      </div>
      <Button
        size="2"
        variant="surface"
        color="gray"
        className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-100 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-200 backdrop-blur-xl"
      >
        <ArrowLeftIcon />
        <span className="text-sm font-medium">Back to Links</span>
      </Button>
    </header>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 19L3 12L10 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12H21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
