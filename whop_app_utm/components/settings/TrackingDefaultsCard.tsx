import React from "react";
import { Card } from "@whop/react/components";

export function TrackingDefaultsCard() {
  return (
    <Card
      size="3"
      variant="surface"
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200"
    >
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-lg font-semibold text-white tracking-tight">Tracking Defaults</h2>
        <p className="text-sm text-slate-400">
          Set sensible defaults so new UTM links stay consistent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Field
          label="Default UTM Source"
          placeholder="instagram / facebook / email"
        />
        <Field
          label="Default UTM Medium"
          placeholder="social / cpc / email"
        />
        <Field
          label="Default Campaign Prefix"
          placeholder="launch_ / evergreen_"
        />
      </div>

      <div className="space-y-4">
        <ToggleRow
          label="Auto-append UTM parameters to new links"
          description="When enabled, new links will prefill your default UTM values."
          on
        />
        <ToggleRow
          label="Include IP hash in analytics"
          description="Store anonymized IP hashes to improve uniqueness metrics."
        />
      </div>
    </Card>
  );
}

type FieldProps = {
  label: string;
  placeholder?: string;
};

function Field({ label, placeholder }: FieldProps) {
  return (
    <div>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        <span>{label}</span>
        <input
          type="text"
          placeholder={placeholder}
          className="frosted-input w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-400/70 transition-all duration-150"
        />
      </label>
    </div>
  );
}

type ToggleRowProps = {
  label: string;
  description?: string;
  on?: boolean;
};

function ToggleRow({ label, description, on }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 max-w-md">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-all duration-200 ${
          on
            ? "bg-emerald-500/80 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
            : "bg-white/5 border-white/15"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-200 ${
            on ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
