import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { AdminHeader, DataTable, LoadingBlock, Panel, StatCard, StatusBadge } from "@/components/admin/adminUi";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getPaymentOverview } from "@/lib/payment-fns";

export const Route = createFileRoute("/_authed/admin/payments/")({
  component: PaymentOverview,
});

function PaymentOverview() {
  const load = useServerFn(getPaymentOverview);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    load()
      .then((result) => alive && setData(result))
      .catch((err) => alive && setError(err?.message || "Could not load payment data"));
    return () => {
      alive = false;
    };
  }, [load]);

  if (error) {
    return <Panel className="p-6 text-[13px] text-destructive">{error}</Panel>;
  }
  if (!data) return <LoadingBlock label="Loading payment overview" />;

  const totalEntries = Object.entries(data.totals || {});

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Verified donations"
          value={totalEntries.length ? totalEntries.map(([code, amount]) => formatCurrency(amount, code)).join(" · ") : "—"}
          note={`${data.settledCount} settled transactions`}
        />
        <StatCard label="Awaiting payment" value={data.pendingCount} note="Pending or processing" />
        <StatCard label="Bank transfers to verify" value={data.bankPending} note="Finance action required" />
        <StatCard
          label="Active gateways"
          value={`${data.activeGateways} / 4`}
          note={`${data.configuredGateways} passed a connection test`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-[15px] font-semibold text-foreground">Gateway readiness</h2>
            <Link
              to="/admin/payments/gateways"
              className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary hover:underline"
            >
              Manage <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {data.gateways.map((gateway) => (
              <li key={gateway.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-foreground">{gateway.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {gateway.is_enabled ? "Live on checkout" : "Hidden from checkout"}
                  </p>
                </div>
                <StatusBadge status={gateway.connection_status} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-[15px] font-semibold text-foreground">Latest payment events</h2>
            <Link
              to="/admin/payments/logs"
              className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary hover:underline"
            >
              All logs <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <DataTable
            columns={[
              { key: "type", header: "Event", render: (row) => <StatusBadge status={row.type} /> },
              { key: "message", header: "Detail", render: (row) => <span className="text-[12px]">{row.message}</span> },
              {
                key: "created_date",
                header: "When",
                render: (row) => <span className="whitespace-nowrap text-[11px]">{formatDateTime(row.created_date)}</span>,
              },
            ]}
            rows={data.events}
            empty="No payment activity yet."
          />
        </Panel>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile
          icon={CheckCircle2}
          label="Settled"
          value={data.settledCount}
          tone="text-primary"
          note="Verified payments only"
        />
        <SummaryTile
          icon={Clock}
          label="Pending"
          value={data.pendingCount}
          tone="text-[#8a6d1a]"
          note="Not yet confirmed by a provider or finance"
        />
        <SummaryTile
          icon={AlertTriangle}
          label="Failed / cancelled"
          value={data.failedCount}
          tone="text-destructive"
          note={`${data.refundedCount} refunded`}
        />
      </div>
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value, note, tone }) {
  return (
    <div className="rounded-sm border border-border bg-white p-5">
      <Icon className={`h-4 w-4 ${tone}`} aria-hidden="true" />
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-[24px] leading-none text-foreground">{value}</p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{note}</p>
    </div>
  );
}