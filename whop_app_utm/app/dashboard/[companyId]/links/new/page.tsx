import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UTMBreadcrumb } from "@/components/utm-builder/UTMBreadcrumb";
import { UTMForm } from "@/components/utm-builder/UTMForm";
import { PresetButtons } from "@/components/utm-builder/PresetButtons";
import { UTMResultCard } from "@/components/utm-builder/UTMResultCard";

export default function NewUTMLinkPage() {
  return (
    <DashboardLayout>
      <UTMBreadcrumb />

      <div className="space-y-6">
        <UTMForm />
        <PresetButtons />
        <UTMResultCard />

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-medium text-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200"
          >
            Clear Form
          </button>
          <button
            type="button"
            className="px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-200"
          >
            Generate Link
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
