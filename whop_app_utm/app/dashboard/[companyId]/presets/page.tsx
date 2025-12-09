import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardBody,
} from "@/components/ui/DashboardCard";

export default function PresetsPage() {
  return (
    <div className="px-6 sm:px-10 lg:px-16">
      <DashboardTopBar
        title="Presets"
        subtitle="Save reusable UTM combinations for faster link creation"
      />

      <div className="mt-3 space-y-4">
        <DashboardCard className="p-4 sm:p-5 md:p-6">
          <DashboardCardHeader>
            <h2 className="text-sm font-semibold text-neutral-100">
              Presets coming soon
            </h2>
          </DashboardCardHeader>
          <DashboardCardBody>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-300">
              <li>Define preset bundles for source / medium / campaign.</li>
              <li>Apply presets instantly when creating new links.</li>
              <li>Share presets across your workspace.</li>
            </ul>
          </DashboardCardBody>
        </DashboardCard>
      </div>
    </div>
  );
}
