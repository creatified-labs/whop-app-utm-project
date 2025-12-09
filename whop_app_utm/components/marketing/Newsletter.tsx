"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { Mail, ShieldCheck, X } from "lucide-react";

export const Newsletter = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [hasSubscribed, setHasSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        // Silently fail for now; you can surface a toast here later.
        console.error("Newsletter subscription failed", await res.text());
        return;
      }

      setEmail("");
      setIsExpanded(false);
      setHasSubscribed(true);
    } catch (error) {
      console.error("Newsletter subscription error", error);
    }
  };

  // Auto-hide the thank-you indicator after a short delay
  useEffect(() => {
    if (!hasSubscribed) return;

    const timer = window.setTimeout(() => {
      setHasSubscribed(false);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [hasSubscribed]);

  return (
    <div className="fixed z-50 bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto">
      {isExpanded ? (
        <div className="w-full max-w-xl rounded-2xl p-4 shadow-lg bg-[#121212] animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-50 font-medium tracking-tight">
                Newsletter
              </p>
              <p className="text-neutral-400 text-xs mt-0.5">
                Updates. No noise.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 text-[11px] text-neutral-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Privacy-first
              </span>
              <button
                type="button"
                className="h-6 w-6 rounded-full inline-flex items-center justify-center text-neutral-400 hover:bg-neutral-800 transition-colors"
                onClick={() => setIsExpanded(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="mt-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="h-4 w-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-[#111111] text-neutral-50 border border-[#292929] focus:border-neutral-300 focus:outline-none placeholder:text-neutral-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-neutral-50 text-neutral-900 px-4 py-2.5 text-sm font-medium hover:bg-neutral-200 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2">
          {hasSubscribed && (
            <div className="px-3 py-1 rounded-full bg-[#121212] text-[11px] text-neutral-300 shadow-sm">
              Thanks for subscribing
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="rounded-full bg-neutral-50 text-neutral-900 px-6 py-3 shadow-lg hover:bg-neutral-200 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            <span className="font-medium">Newsletter</span>
          </button>
        </div>
      )}
    </div>
  );
};
