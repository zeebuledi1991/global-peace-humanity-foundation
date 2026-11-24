import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AdminHeader, Panel, StatCard, StatusBadge } from "@/components/admin/adminUi";
import { getAdminOverview } from "@/lib/admin-fns";
import { formatCurrency, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/")({
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminOverview()
      .then(setData)
      .catch((err) => setError(err?.message || "We could not load the dashboard."));
  }, []);

  if (error) {
    return (
      <p className="rounded-sm border border-destructive/30 bg-white p-6 text-[13px] text-destructive">{error}</p>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading dashboard
      </div>
    );
  }

  const totalEntries = Object.entries(data.totals || {});

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Overview"
        description="Verified donations, pending payments, applications and content in one place. Only administrators can see donor details."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Verified donations"
          value={data.verifiedCount}
          note={
            totalEntries.length === 0
              ? "No completed donations yet"
              : totalEntries.map(([currency, total]) => formatCurrency(total, currency)).join(" · ")
          }
        />
        <StatCard label="Pending donations" value={data.pendingCount} note="Awaiting payment confirmation" />
        <StatCard label="Failed / cancelled" value={data.failedCount} note="Kept separate from verified gifts" />
        <StatCard label="Newsletter subscribers" value={data.subscribers} note="Subscribed addresses" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New volunteer applications" value={data.volunteers} />
        <StatCard label="New partnership enquiries" value={data.partners} />
        <StatCard label="Unread messages" value={data.messages} />
        <StatCard label="Projects" value={data.projects} note={`${data.news} published stories`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">
              Recent donations
            </h2>
            <Link to="/admin/donations" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary hover:text-foreground">
              All donations
            </Link>
          </div>
          {data.recent.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No donations recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.recent.map((donation) => (
                <li key={donation.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {donation.is_anonymous ? "Anonymous donor" : donation.donor_name}
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

        <Panel>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">
              Latest messages
            </h2>
            <Link to="/admin/messages" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary hover:text-foreground">
              Inbox
            </Link>
          </div>
          {data.recentMessages.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No messages yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.recentMessages.map((message) => (
                <li key={message.id} className="px-4 py-3">
                  <p className="truncate text-[13px] font-medium text-foreground">{message.subject || "Website enquiry"}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {message.name} · {message.email}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="rounded-sm border border-border bg-white p-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { to: "/admin/projects", label: "Add a project" },
            { to: "/admin/news", label: "Publish a story" },
            { to: "/admin/documents", label: "Upload a report" },
            { to: "/admin/settings", label: "Update organization details" },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="rounded-sm border border-border px-4 py-2.5 text-[12px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}