import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardBody,
} from "@/components/ui/DashboardCard";

export default function ReportsPage() {
  return (
    <div className="px-6 sm:px-10 lg:px-16">
      <DashboardTopBar
        title="Reports"
        subtitle="High-level performance reports for your tracking links"
      />

      <div className="mt-3 space-y-4">
        <DashboardCard className="p-4 sm:p-5 md:p-6">
          <DashboardCardHeader>
            <h2 className="text-sm font-semibold text-neutral-100">
              Reporting coming soon
            </h2>
          </DashboardCardHeader>
          <DashboardCardBody>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-300">
              <li>Saved reports for cohorts, funnels, and attribution.</li>
              <li>Export-ready views for revenue and performance.</li>
              <li>Breakdowns by source, campaign, and device.</li>
            </ul>
          </DashboardCardBody>
        </DashboardCard>

        <DashboardCard className="p-4 sm:p-5 md:p-6">
          <DashboardCardHeader>
            <h3 className="text-sm font-semibold text-neutral-100">
              TODO
            </h3>
          </DashboardCardHeader>
          <DashboardCardBody>
            <p className="text-sm text-neutral-300">
              {/* TODO: Wire reports to real Supabase + Whop data once backend is ready. */}
            </p>
          </DashboardCardBody>
        </DashboardCard>
      </div>
    </div>
  );
}
