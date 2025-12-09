import React from "react";
import { Card, Button } from "@whop/react/components";

const INTEGRATIONS = [
  {
    name: "Stripe",
    description: "Connect to sync revenue data and correlate with clicks.",
  },
  {
    name: "Shopify",
    description: "Track orders and attribution from your storefront.",
  },
  {
    name: "Meta Ads",
    description: "Send conversions server-side to improve signal quality.",
  },
];

export function IntegrationsCard() {
  return (
    <Card
      size="3"
      variant="surface"
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200"
    >
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-lg font-semibold text-white tracking-tight">Integrations</h2>
        <p className="text-sm text-slate-400">
          Connect your stack to enrich analytics and attribution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.name}
            className="flex flex-col gap-3 rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 hover:scale-[1.01] transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-semibold text-slate-100">
                {integration.name[0]}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {integration.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {integration.description}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                size="1"
                variant="surface"
                color="gray"
                className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs text-slate-100 px-3 py-1 shadow-md hover:shadow-xl transition-all duration-200"
              >
                Connect
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
