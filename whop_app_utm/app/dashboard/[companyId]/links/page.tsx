import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { LinksToolbar } from "@/components/links/LinksToolbar";
import { LinksTable } from "@/components/links/LinksTable";

export default function LinksPage() {
  return (
    <>
      <DashboardTopBar
        title="Links"
        subtitle="Manage tracked URLs and UTM parameters"
        rightSlot={
          <button
            type="button"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-50 hover:bg-white/10"
          >
            New Link
          </button>
        }
      />

      <div className="space-y-3">
        <LinksToolbar />
        <LinksTable />
      </div>
    </>
  );
}
