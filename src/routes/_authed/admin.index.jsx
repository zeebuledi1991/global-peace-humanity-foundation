import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AdminHeader, Panel, StatCard, StatusBadge, adminInput } from "@/components/admin/adminUi";
import OverviewCharts from "@/components/admin/OverviewCharts";
import { getAdminOverview } from "@/lib/admin-fns";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/")({
  component: AdminOverviewPage,
});

const RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom" },
];

function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("30d");
  const [custom, setCustom] = useState({ from: "", to: "" });

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getAdminOverview({
      data: range === "custom" ? { range, from: custom.from || undefined, to: custom.to || undefined } : { range },
    })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "We could not load the dashboard.");
      });
    return () => {
      cancelled = true;
    };
  }, [range, custom]);

  const totals = Object.entries(data?.totals || {});

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Overview"
        description="Live figures calculated from the database. Verified donations only count once the finance team has confirmed the payment."
      />

      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRange(option.value)}
            className={cn(
              "rounded-sm border px-3.5 py-2 text-[11.5px] font-medium transition-colors",
              range === option.value
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-foreground/70 hover:border-primary hover:text-primary"
            )}
          >
            {option.label}
          </button>
        ))}
        {range === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={custom.from}
              onChange={(event) => setCustom((prev) => ({ ...prev, from: event.target.value }))}
              className={`${adminInput} w-auto`}
              aria-label="From date"
            />
            <span className="text-[11px] text-muted-foreground">to</span>
            <input
              type="date"
              value={custom.to}
              onChange={(event) => setCustom((prev) => ({ ...prev, to: event.target.value }))}
              className={`${adminInput} w-auto`}
              aria-label="To date"
            />
          </div>
        )}
      </div>

      {error && <p className="rounded-sm border border-destructive/30 bg-white p-6 text-[13px] text-destructive">{error}</p>}

      {!data && !error ? (
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading dashboard
        </div>
      ) : null}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total donation amount"
              value={totals.length ? totals.map(([currency, total]) => formatCurrency(total, currency)).join(" · ") : formatCurrency(0, "USD")}
              note={`${data.verifiedCount} verified donation${data.verifiedCount === 1 ? "" : "s"}`}
            />
            <StatCard label="Registered users" value={data.registeredUsers} note={`${data.registeredDonors} have donated`} />
            <StatCard label="Guest donors" value={data.guestDonors} note="Donated without an account" />
            <StatCard label="Total donors" value={data.donorCount} note="Accounts plus guest donors" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active projects" value={data.projects.active} note={`${data.projects.total} projects in total`} />
            <StatCard label="Completed projects" value={data.projects.completed} />
            <StatCard label="Upcoming projects" value={data.projects.upcoming} />
            <StatCard label="Pending transactions" value={data.pendingCount} note="Awaiting payment confirmation" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Failed transactions" value={data.failedCount} />
            <StatCard label="Refunds" value={data.refundCount} />
            <StatCard label="New volunteer applications" value={data.newVolunteers} />
            <StatCard label="New enquiries" value={data.newPartners + data.newMessages} note="Partnerships and messages" />
          </div>

          <OverviewCharts data={data} />

          <Panel>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">Recent donations</h2>
              <Link to="/admin/donations" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary hover:text-foreground">
                All donations
              </Link>
            </div>
            {data.recent.length === 0 ? (
              <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">No donations in this period.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.recent.map((donation) => (
                  <li key={donation.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">
                        {donation.is_anonymous ? "Anonymous donor" : donation.donor_name}
                        <span className="ml-2 rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                          {donation.user_id ? "Registered" : "Guest"}
                        </span>
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {donation.project_title || "General fund"} · {donation.reference} · {formatDateTime(donation.created_date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="whitespace-nowrap text-[13px] font-semibold text-foreground">
                        {formatCurrency(donation.amount, donation.currency)}
                      </span>
                      <StatusBadge status={donation.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}