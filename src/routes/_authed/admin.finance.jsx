import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, Loader2, Search } from "lucide-react";
import {
  AdminHeader,
  DataTable,
  Panel,
  StatCard,
  StatusBadge,
  adminGhostButton,
  adminInput,
} from "@/components/admin/adminUi";
import { getAdminFinance, updateDonationStatus } from "@/lib/admin-fns";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/finance")({
  component: AdminFinancePage,
});

const FILTERS = [
  { value: "", label: "All transactions" },
  { value: "completed", label: "Successful" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const totalLabel = (totals) => {
  const entries = Object.entries(totals || {});
  return entries.length ? entries.map(([currency, total]) => formatCurrency(total, currency)).join(" · ") : formatCurrency(0, "USD");
};

function AdminFinancePage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => getAdminFinance({ data: { status, search } }).then(setData);

  useEffect(() => {
    let cancelled = false;
    getAdminFinance({ data: { status, search } }).then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [status, search]);

  const act = async (row, nextStatus) => {
    setBusyId(row.id);
    try {
      await updateDonationStatus({ data: { id: row.id, status: nextStatus } });
      toast.success(`Transaction marked ${nextStatus}. The donor has been notified.`);
      await load();
    } catch (error) {
      toast.error(error?.message || "We could not update this transaction.");
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      key: "reference",
      header: "Transaction",
      render: (row) => (
        <div className="min-w-[150px]">
          <p className="font-mono text-[11px] text-foreground">{row.reference}</p>
          {row.receipt_number && <p className="text-[10px] uppercase tracking-[0.1em] text-primary">{row.receipt_number}</p>}
        </div>
      ),
    },
    {
      key: "donor",
      header: "Donor",
      render: (row) => (
        <div className="min-w-[160px]">
          <p className="text-[12.5px] font-medium text-foreground">{row.is_anonymous ? "Anonymous donor" : row.donor_name}</p>
          <p className="text-[11px] text-muted-foreground">{row.donor_email}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <span
          className={cn(
            "inline-flex whitespace-nowrap rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]",
            row.donor_type === "registered" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
          )}
        >
          {row.donor_type === "registered" ? "Registered" : "Guest"}
        </span>
      ),
    },
    {
      key: "project",
      header: "Project",
      render: (row) => <span className="block min-w-[140px] text-[12px] text-foreground/85">{row.project_title || "General fund"}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <div>
          <p className="whitespace-nowrap text-[12.5px] font-semibold text-foreground">{formatCurrency(row.amount, row.currency)}</p>
          <p className="text-[10px] text-muted-foreground">{row.currency}</p>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      render: (row) => <span className="whitespace-nowrap text-[11.5px] text-muted-foreground">{row.payment_method === "card" ? "Card" : "Bank transfer"}</span>,
    },
    {
      key: "date",
      header: "Date",
      render: (row) => <span className="whitespace-nowrap text-[11px] text-muted-foreground">{formatDateTime(row.created_date)}</span>,
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Action",
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.status !== "completed" && (
            <button
              type="button"
              onClick={() => act(row, "completed")}
              disabled={busyId === row.id}
              className="rounded-sm border border-primary px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
            >
              {busyId === row.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify"}
            </button>
          )}
          {row.status === "completed" && (
            <button
              type="button"
              onClick={() => act(row, "refunded")}
              disabled={busyId === row.id}
              className="rounded-sm border border-border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-navy hover:text-navy disabled:opacity-50"
            >
              Refund
            </button>
          )}
          {row.status === "pending" && (
            <button
              type="button"
              onClick={() => act(row, "failed")}
              disabled={busyId === row.id}
              className="rounded-sm border border-border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
            >
              Failed
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Finance & Transactions"
        description="Every payment attempt, verified against the bank or payment provider. A transaction only becomes successful with a verified provider record, and every change is written to the audit log."
      >
        <button
          type="button"
          onClick={() =>
            downloadCsv(
              "gphf-transactions.csv",
              data?.rows || [],
              [
                { header: "Transaction ID", value: (row) => row.reference },
                { header: "Donor", value: (row) => row.donor_name },
                { header: "Email", value: (row) => row.donor_email },
                { header: "Type", value: (row) => row.donor_type },
                { header: "Project", value: (row) => row.project_title },
                { header: "Amount", value: (row) => row.amount },
                { header: "Currency", value: (row) => row.currency },
                { header: "Provider", value: (row) => row.payment_method },
                { header: "Date", value: (row) => row.created_date },
                { header: "Status", value: (row) => row.status },
                { header: "Receipt", value: (row) => row.receipt_number },
              ]
            )
          }
          className={adminGhostButton}
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export CSV
        </button>
      </AdminHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Verified total" value={totalLabel(data?.totals)} note={`${data?.counts.completed || 0} successful payments`} />
        <StatCard label="Pending" value={data?.counts.pending || 0} note="Awaiting confirmation" />
        <StatCard label="Guest donations" value={data?.guestCount || 0} note={totalLabel(data?.guestTotals)} />
        <StatCard label="Registered donations" value={data?.registeredCount || 0} note={totalLabel(data?.registeredTotals)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => setStatus(filter.value)}
            className={cn(
              "rounded-sm border px-3.5 py-2 text-[11.5px] font-medium transition-colors",
              status === filter.value
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-foreground/70 hover:border-primary hover:text-primary"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search reference, donor, receipt"
          className={`${adminInput} pl-9`}
          aria-label="Search transactions"
        />
      </div>

      <Panel>
        <DataTable columns={columns} rows={data?.rows || []} loading={!data} empty="No transactions match these filters." />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground">Verified by project</h2>
          </div>
          <ul className="divide-y divide-border text-[12.5px]">
            {(data?.byProject || []).length === 0 && (
              <li className="px-4 py-6 text-center text-muted-foreground">No verified donations yet.</li>
            )}
            {(data?.byProject || []).map((row) => (
              <li key={row.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="min-w-0 truncate text-foreground">{row.name}</span>
                <span className="shrink-0 font-semibold text-foreground">{formatCurrency(row.amount, row.currency)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground">Verified by payment method</h2>
          </div>
          <ul className="divide-y divide-border text-[12.5px]">
            {(data?.byMethod || []).length === 0 && (
              <li className="px-4 py-6 text-center text-muted-foreground">No verified donations yet.</li>
            )}
            {(data?.byMethod || []).map((row) => (
              <li key={row.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-foreground">{row.name}</span>
                <span className="font-semibold text-foreground">{formatCurrency(row.amount, row.currency)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}