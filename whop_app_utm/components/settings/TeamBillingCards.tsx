import React from "react";
import { Card, Button } from "@whop/react/components";

export function TeamBillingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <section id="team">
        <Card
          size="2"
          variant="surface"
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
              Team
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Invite your team to collaborate on UTM presets, reporting, and link management.
          </p>
          <div className="pt-1">
            <Button
              size="1"
              variant="surface"
              color="gray"
              className="rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs text-slate-100 px-3 py-1.5 shadow-md hover:shadow-xl transition-all duration-200"
            >
              Invite teammate
            </Button>
          </div>
        </Card>
      </section>

      <section id="billing">
        <Card
          size="2"
          variant="surface"
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
              Billing
            </h3>
            <LockIcon />
          </div>
          <p className="text-xs text-slate-400">
            Billing settings will be managed directly in Whop.
          </p>
          <p className="text-[11px] text-slate-500">
            Contact your workspace owner in Whop to update plans or payment details.
          </p>
        </Card>
      </section>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      className="w-4 h-4 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9 10V8a3 3 0 1 1 6 0v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
