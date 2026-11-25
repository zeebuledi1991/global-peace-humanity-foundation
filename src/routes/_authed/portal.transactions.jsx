import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { DataTable, Panel, StatusBadge, adminInput } from "@/components/admin/adminUi";
import { getPortalTransactions } from "@/lib/portal-fns";
import { downloadReceipt } from "@/lib/receipt";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/portal/transactions")({
  component: MyTransactionsPage,
});

const FILTERS = [
  { value: "", label: "All transactions" },
  { value: "completed", label: "Successful" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

function MyTransactionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPortalTransactions({ data: { status, search } })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, search]);

  const columns = [
    {
      key: "reference",
      header: "Transaction reference",
      render: (row) => (
        <div className="min-w-[170px]">
          <p className="font-mono text-[11px] text-foreground">{row.reference}</p>
          {row.payment_reference && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">Provider: {row.payment_reference}</p>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{formatDateTime(row.created_date)}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <div>
          <p className="whitespace-nowrap font-semibold text-foreground">{formatCurrency(row.amount, row.currency)}</p>
          <p className="text-[11px] text-muted-foreground">{row.currency}</p>
        </div>
      ),
    },
    { key: "provider", header: "Payment provider", render: (row) => <span className="text-[12px] text-muted-foreground">{row.provider}</span> },
    {
      key: "project",
      header: "Project",
      render: (row) => (
        <span className="block min-w-[150px] text-[12.5px] text-foreground/85">
          {row.project_title || "General foundation fund"}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "receipt",
      header: "Receipt",
      render: (row) => (
        <button
          type="button"
          onClick={() => downloadReceipt(row)}
          disabled={row.status !== "completed"}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-3 w-3" aria-hidden="true" />
          {row.receipt_number ? "Download" : "Not issued"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-[26px] leading-tight text-foreground">My Transactions</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Every financial transaction on your account, including pending and failed attempts. Receipts are issued
          only for verified payments.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => setStatus(filter.value)}
            className={cn(
              "rounded-sm border px-4 py-2 text-[12px] font-medium transition-colors",
              status === filter.value
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-foreground/70 hover:border-primary hover:text-primary"
            )}
          >
            {filter.label}
            {data?.summary?.[filter.value || "completed"] && filter.value ? ` (${data.summary[filter.value]})` : ""}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search transaction or receipt reference"
          className={`${adminInput} pl-9`}
          aria-label="Search transactions"
        />
      </div>

      <Panel>
        <DataTable
          columns={columns}
          rows={data?.rows || []}
          loading={loading}
          empty="No transactions match these filters yet."
        />
      </Panel>
    </div>
  );
}