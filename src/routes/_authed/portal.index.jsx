import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bell, CheckCircle2, FolderKanban, HandCoins, Heart, Loader2, Wallet } from "lucide-react";
import { Panel, StatusBadge } from "@/components/admin/adminUi";
import PortalStat from "@/components/portal/PortalStat";
import { getPortalOverview } from "@/lib/portal-fns";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/portal/")({
  component: PortalOverviewPage,
});

function PortalOverviewPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPortalOverview()
      .then(setData)
      .catch((err) => setError(err?.message || "We could not load your portal."));
  }, []);

  if (error) {
    return <p className="rounded-sm border border-destructive/30 bg-white p-6 text-[13px] text-destructive">{error}</p>;
  }

  if (!data) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading your portal
      </div>
    );
  }

  const firstName = String(data.user.full_name || data.user.email).split(" ")[0];
  const totalEntries = Object.entries(data.totals || {});
  const needsProfile = !data.user.country || !data.user.phone;

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-border bg-navy px-6 py-7 text-white sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">Donor portal</p>
        <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-white">
          Welcome Back, {firstName}
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/70">
          Thank you for standing with the Global Peace &amp; Humanity Foundation. Here is everything your giving
          has made possible.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 rounded-sm bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-gold hover:text-navy"
          >
            <Heart className="h-3.5 w-3.5" aria-hidden="true" />
            Make a donation
          </Link>
          <Link
            to="/portal/projects"
            className="inline-flex items-center gap-2 rounded-sm border border-white/25 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white"
          >
            My projects
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {needsProfile && (
        <div className="flex flex-col gap-3 rounded-sm border border-gold/40 bg-gold/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] leading-relaxed text-foreground">
            Complete your profile so we can issue receipts with your correct details and reach you about the
            projects you support.
          </p>
          <Link
            to="/portal/profile"
            className="shrink-0 rounded-sm bg-primary px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
          >
            Complete profile
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStat
          label="Total donations"
          value={totalEntries.length ? totalEntries.map(([currency, total]) => formatCurrency(total, currency)).join(" · ") : formatCurrency(0, "USD")}
          note={`${data.verifiedCount} verified donation${data.verifiedCount === 1 ? "" : "s"}`}
          icon={Wallet}
        />
        <PortalStat
          label="Supported projects"
          value={data.supportedProjects}
          note="Projects your verified gifts support"
          icon={FolderKanban}
          tone="navy"
        />
        <PortalStat label="Active projects" value={data.activeProjects} note="Still running today" icon={HandCoins} tone="gold" />
        <PortalStat
          label="Completed projects"
          value={data.completedProjects}
          note="Delivered and closed"
          icon={CheckCircle2}
          tone="muted"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">Recent donations</h2>
            <Link to="/portal/donations" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary hover:text-foreground">
              View all
            </Link>
          </div>
          {data.recent.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-[13px] text-muted-foreground">You have not made a donation yet.</p>
              <Link to="/donate" className="mt-3 inline-flex text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                Support a project
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.recent.map((donation) => (
                <li key={donation.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {donation.project_title || "General foundation fund"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {donation.reference} · {formatDateTime(donation.created_date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[13px] font-semibold text-foreground">
                      {formatCurrency(donation.amount, donation.currency)}
                    </span>
                    <StatusBadge status={donation.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel>
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">At a glance</h2>
            </div>
            <ul className="divide-y divide-border text-[13px]">
              <li className="flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Pending payments</span>
                <span className="font-semibold text-foreground">{data.pendingCount}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Failed or cancelled</span>
                <span className="font-semibold text-foreground">{data.failedCount}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Refunded</span>
                <span className="font-semibold text-foreground">{data.refundedCount}</span>
              </li>
              <li className="flex items-center justify-between px-4 py-3">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                  Unread notifications
                </span>
                <span className="font-semibold text-foreground">{data.unreadNotifications}</span>
              </li>
            </ul>
          </Panel>

          <Panel className="p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">Need a receipt?</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              Every verified donation has an official PDF receipt you can download at any time.
            </p>
            <Link
              to="/portal/donations"
              className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary hover:text-foreground"
            >
              Open my donations
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}