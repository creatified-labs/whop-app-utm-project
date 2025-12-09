"use client";

import { useEffect, useMemo, useState } from "react";
import { getLinkMetrics, getOverviewMetrics, getSourceMetrics } from "./metrics";
import type {
  TrackingLink,
  VisitorEvent,
  Order,
  LinkMetrics,
  OverviewMetrics,
  SourceMetrics,
} from "./types";

// TODO: In the future, replace MOCK_* imports with real Supabase/Whop queries.
// These hooks should remain the main public API for dashboard data access.

export function useUtmData(): {
  links: TrackingLink[];
  events: VisitorEvent[];
  orders: Order[];
} {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [events, setEvents] = useState<VisitorEvent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/tracking-links");
        if (!res.ok) throw new Error("Failed to load tracking links");

        const data = (await res.json()) as {
          links?: TrackingLink[];
          events?: VisitorEvent[];
          orders?: Order[];
        };

        if (cancelled) return;

        if (Array.isArray(data.links)) setLinks(data.links);
        if (Array.isArray(data.events)) setEvents(data.events);
        if (Array.isArray(data.orders)) setOrders(data.orders);
      } catch {
        // If the API fails, keep the current (empty) state instead of using
        // any mock data so the dashboard always reflects real Whop data only.
        if (cancelled) return;
        setLinks([]);
        setEvents([]);
        setOrders([]);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { links, events, orders };
}

export function useOverviewMetrics(): OverviewMetrics {
  const { links, events, orders } = useUtmData();

  return useMemo(
    () => getOverviewMetrics(links, events, orders),
    [links, events, orders],
  );
}

export function useLinkMetrics(): LinkMetrics[] {
  const { links, events, orders } = useUtmData();

  return useMemo(
    () => getLinkMetrics(links, events, orders),
    [links, events, orders],
  );
}

export function useSourceMetrics(): SourceMetrics[] {
  const { links, events, orders } = useUtmData();

  return useMemo(
    () => getSourceMetrics(links, events, orders),
    [links, events, orders],
  );
}
