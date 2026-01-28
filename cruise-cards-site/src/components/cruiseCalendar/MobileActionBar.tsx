"use client";

import Link from "next/link";

type Props = {
  sailing?: {
    sailingId: string;
    shipName: string;
    durationLabel: string;
    priceFrom?: number | null;
    seaPayEligible?: boolean;
  };
  queryString: string;
};

export default function MobileActionBar({ sailing, queryString }: Props) {
  if (!sailing) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-navy">{sailing.shipName}</div>
          <div className="text-xs text-slate">
            {sailing.durationLabel}
            {sailing.priceFrom ? ` • From $${Math.round(sailing.priceFrom)}` : ""}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sailing.seaPayEligible && (
            <span className="hidden rounded-full bg-primary-blue/10 px-2 py-1 text-[11px] text-primary-blue sm:inline-block">
              SeaPay available
            </span>
          )}

          <Link
            href={`/cruise/${sailing.sailingId}?${queryString}`}
            className="whitespace-nowrap rounded-lg bg-primary-blue px-4 py-2 text-sm text-white hover:bg-primary-blue/90"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
