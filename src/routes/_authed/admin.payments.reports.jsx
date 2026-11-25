import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { LoadingBlock, Panel, StatCard, adminGhostButton, adminInput, adminLabel } from "@/components/admin/adminUi";
import { formatCurrency } from "@/lib/format";
import { getPaymentReports } from "@/lib/payment-fns";
import { exportRowsCsv, exportRowsPdf } from "@/lib/payments/export";

export const Route = createFileRoute("/_authed/admin/payments/reports")({
  component: ReportsPage,
});

const RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
];

const COLUMNS = [
  { header: "Group", value: (row) => row.key },
  { header: "Transactions", value: (row) => row.count },
  {
    header: "Verified totals",
    value: (row) => Object.entries(row.totals).map(([code, amount]) => `${code} ${amount}`).join(" | "),
  },
];

export default function ReportsPage() {
  const load = useServerFn(getPaymentReports);
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    load({ data: { range } })
      .then((result) => alive && setData(result))
      .catch((error) => toast.error(error?.message || "Could not build the report"));
    return () => {
      alive = false;
    };
  }, [load, range]);

  if (!data) return <LoadingBlock label="Building payment report" />;

  const totals = Object.entries(data.totals || {});

  return (
    <div className="space-y-5">
      <Panel className="flex flex-wrap items-end justify-between gap-3 p-4">
        <div className="w-full max-w-[220px]">
          <label className={adminLabel} htmlFor="report-range">
            Reporting period
          </label>
          <select id="report-range" value={range} onChange={(event) => setRange(event.target.value)} className={adminInput}>
            {RANGES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={adminGhostButton}
            disabled={!data.byGateway.length}
            onClick={() => exportRowsCsv(`gphf-payment-report-${range}.csv`, data.byGateway, COLUMNS)}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            CSV
          </button>
          <button
            type="button"
            className={adminGhostButton}
            disabled={!data.byGateway.length}
            onClick={() =>
              exportRowsPdf({
                filename: `gphf-payment-report-${range}.pdf`,
                title: "Payment report",
                subtitle: RANGES.find((option) => option.value === range)?.label,
                columns: COLUMNS,
                rows: data.byGateway,
              })
            }
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            PDF
          </button>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Verified in period"
          value={totals.length ? totals.map(([code, amount]) => formatCurrency(amount, code)).join(" · ") : "—"}
          note={`${data.settledCount} settled donations`}
        />
        <StatCard label="Payment methods used" value={data.byGateway.length} note="Across all gateways and transfers" />
        <StatCard label="Currencies" value={data.byCurrency.length} note="Reporting is kept per currency" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ReportTable title="By payment method" rows={data.byGateway} />
        <ReportTable title="By status" rows={data.byStatus} />
        <ReportTable title="By currency" rows={data.byCurrency} />
        <ReportTable title="By donor type" rows={data.byDonorType} />
      </div>
    </div>
  );
}

function ReportTable({ title, rows }) {
  return (
    <Panel>
      <h2 className="border-b border-border px-5 py-3 text-[14px] font-semibold text-foreground">{title}</h2>
      {!rows.length ? (
        <p className="px-5 py-8 text-center text-[12.5px] text-muted-foreground">No data for this period.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-3 px-5 py-3 text-[12.5px]">
              <span className="capitalize text-foreground/85">{String(row.key).replace(/_/g, " ")}</span>
              <span className="text-right">
                <span className="font-semibold text-foreground">
                  {Object.entries(row.totals)
                    .map(([code, amount]) => formatCurrency(amount, code))
                    .join(" · ") || "—"}
                </span>
                <span className="ml-2 text-[11px] text-muted-foreground">{row.count} txn</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}