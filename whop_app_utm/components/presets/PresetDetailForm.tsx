import React from "react";
import { Card } from "@whop/react/components";

export function PresetDetailForm() {
  return (
    <Card
      size="3"
      variant="surface"
      className="bg-card/95 text-card-foreground backdrop-blur-xl border border-border rounded-3xl p-6 lg:p-8 shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] hover:bg-card transition-all duration-200 hover:scale-[1.01]"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Preset Details</h2>
          <p className="mt-1 text-sm text-slate-400 max-w-xl">
            Configure the UTM parameters for this reusable preset. This is mock-only for now.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-white/5 border border-white/10 text-slate-200">
          Editing: <span className="ml-1 text-white">Instagram Feed</span>
        </span>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <FormField
          label="Preset Name"
          required
          placeholder="Instagram Feed"
          className="md:col-span-2"
        />
        <FormField
          label="UTM Source"
          required
          placeholder="instagram"
        />
        <FormField
          label="UTM Medium"
          required
          placeholder="social / feed / story"
        />
        <FormField
          label="UTM Campaign"
          required
          placeholder="launch_q1 / welcome_flow / retargeting"
        />
        <FormField
          label="UTM Term (optional)"
          placeholder="keyword or audience segment"
        />
        <FormField
          label="UTM Content (optional)"
          placeholder="creative_variant_a / hero_image / button_cta"
        />
        <FormField
          label="Tag / Category (optional)"
          placeholder="Social / Email / Paid"
          className="md:col-span-2"
        />
      </form>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2.5 rounded-2xl bg-transparent border border-white/10 text-slate-300 hover:bg-white/5 hover:text-slate-100 hover:shadow-md hover:scale-[1.01] text-sm font-medium transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-200"
        >
          Save Preset
        </button>
      </div>
    </Card>
  );
}

type FormFieldProps = {
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

function FormField({ label, placeholder, required, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        <span className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-400 text-xs">*</span>}
        </span>
        <input
          type="text"
          placeholder={placeholder}
          className="frosted-input w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-400/70 transition-all duration-150"
        />
      </label>
    </div>
  );
}
