import React from "react";
import { Card, Button } from "@whop/react/components";

export function GeneralSettingsCard() {
  return (
    <Card
      size="3"
      variant="surface"
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200"
    >
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-lg font-semibold text-white tracking-tight">General</h2>
        <p className="text-sm text-slate-400">
          Configure core workspace details that appear across your tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          label="Workspace Name"
          placeholder="Acme Growth Studio"
          className="md:col-span-2"
        />
        <Field
          label="Primary Domain"
          placeholder="https://utm.acmegrowth.com"
          className="md:col-span-2"
        />
        <Field
          label="Timezone"
          placeholder="Europe/London (GMT+1)"
        />
        <Field
          label="Date Format"
          type="select"
          options={["DD/MM/YYYY", "MM/DD/YYYY"]}
        />
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Settings are mock only for now.
        </p>
        <Button
          size="2"
          variant="surface"
          color="gray"
          className="rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-100 text-sm font-medium px-5 py-2 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-200"
        >
          Save Changes
        </Button>
      </div>
    </Card>
  );
}

type FieldProps = {
  label: string;
  placeholder?: string;
  className?: string;
  type?: "input" | "select";
  options?: string[];
};

function Field({ label, placeholder, className, type = "input", options }: FieldProps) {
  return (
    <div className={className}>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        <span>{label}</span>
        {type === "select" ? (
          <select
            className="frosted-input w-full rounded-xl bg-white/5 border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-400/70 placeholder:text-white/30 appearance-none pr-8"
            defaultValue={options?.[0] ?? ""}
          >
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder={placeholder}
            className="frosted-input w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-400/70 transition-all duration-150"
          />
        )}
      </label>
    </div>
  );
}
