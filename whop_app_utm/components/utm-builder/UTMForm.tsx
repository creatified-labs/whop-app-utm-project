import React from "react";
import { Card } from "@whop/react/components";

export function UTMForm() {
  return (
    <Card
      size="3"
      variant="surface"
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200"
    >
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-white tracking-tight">Link configuration</h2>
        <p className="text-sm text-slate-400 max-w-xl">
          Define your base URL and UTM parameters to keep tracking consistent across campaigns.
        </p>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Base URL"
          required
          placeholder="https://your-landing-page.com"
          description="Where this tracked link should ultimately send traffic."
          className="md:col-span-2"
        />
        <FormField
          label="UTM Source"
          placeholder="instagram / facebook / tiktok / email"
        />
        <FormField
          label="UTM Medium"
          placeholder="social / feed / story / cpc"
        />
        <FormField
          label="UTM Campaign"
          placeholder="launch_q1 / retargeting / welcome_flow"
        />
        <FormField
          label="UTM Term (optional)"
          placeholder="keyword or audience"
        />
        <FormField
          label="UTM Content (optional)"
          placeholder="variant_a / hero_image / button_cta"
        />
      </form>
    </Card>
  );
}

type FormFieldProps = {
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  className?: string;
};

function FormField({ label, placeholder, description, required, className }: FormFieldProps) {
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
      {description && (
        <p className="mt-2 text-xs text-slate-500 max-w-sm">{description}</p>
      )}
    </div>
  );
}
