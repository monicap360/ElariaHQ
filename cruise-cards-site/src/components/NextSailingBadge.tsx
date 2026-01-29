"use client";

import { useEffect, useState } from "react";

type HealthCheckData = {
  upcoming_sailings: number;
  next_sailing: string | null;
  last_loaded_sailing: string | null;
  status: string;
  healthy: boolean;
};

function formatDate(dateString: string | null): string {
  if (!dateString) return "TBD";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return dateString;
  }
}

export function NextSailingBadge() {
  const [health, setHealth] = useState<HealthCheckData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function fetchHealth() {
      try {
        const res = await fetch("/api/inventory-health");
        if (!res.ok) {
          if (isActive) setLoading(false);
          return;
        }
        const data = await res.json();
        if (isActive) {
          setHealth(data);
          setLoading(false);
        }
      } catch {
        if (isActive) setLoading(false);
      }
    }

    fetchHealth();
    return () => {
      isActive = false;
    };
  }, []);

  if (loading || !health) {
    return null;
  }

  // Don't show if no sailings or status is error
  if (health.upcoming_sailings === 0 || health.status.includes("ERROR") || !health.healthy) {
    return null;
  }

  // Don't show if next sailing is more than 90 days away (not very relevant)
  if (health.next_sailing) {
    const nextDate = new Date(health.next_sailing);
    const daysUntil = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil > 90) {
      return null;
    }
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary-blue/40 bg-primary-blue/10 px-4 py-2 text-xs">
      <span className="text-text-muted">Next sailing:</span>
      <span className="font-semibold text-text-primary">
        {formatDate(health.next_sailing)}
      </span>
      {health.upcoming_sailings > 1 && (
        <span className="text-text-muted">
          • {health.upcoming_sailings} upcoming
        </span>
      )}
    </div>
  );
}
