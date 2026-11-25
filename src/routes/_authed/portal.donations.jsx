import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Eye, Search, X } from "lucide-react";
import {
  DataTable,
  LoadingBlock,
  Panel,
  StatusBadge,
  adminGhostButton,
  adminInput,
} from "@/components/admin/adminUi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPortalDonations } from "@/lib/portal-fns";
import { downloadReceipt } from "@/lib/receipt";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/portal/donations")({
  component: MyDonationsPage,
});

const FILTERS = [
  { value: "", label: "All" },
  { value: "completed", label: "Successful" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

function MyDonationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", projectId: "", search: "", from: "", to: "" });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPortalDonations({ data: filters })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const set = (key) => (event) => setFilters((prev) => ({ ...prev, [key]: event.target.value }));

  const columns = [
    {
      key: "reference",
      header: "Donation ID",
      render: (row) => (
        <div className="min-w-[150px]">
          <p className="font-mono text-[11px] text-foreground">{row.reference}</p>
          <p className="text-[11px] text-muted-foreground">{formatDate(row.created_date)}</p>
        </div>
      ),
    },
    {
      key: "project",
      header: "Project",
      render: (row) => (
        <span className="block min-w-[160px] text-[12.5px] text-foreground/85">
          {row.project_title || "General foundation fund"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <div>
          <p className="whitespace-nowrap font-semibold text-foreground">{formatCurrency(row.amount, row.currency)}</p>
          <p className="text-[11px] capitalize text-muted-foreground">
            {row.currency} · {String(row.frequency || "one_time").replace("_", " ")}
          </p>
        </div>
      ),
    },
    {
      key: "method",
      header: "Method",
      render: (row) => (
        <span className="text-[12px] text-muted-foreground">
          {row.payment_method === "card" ? "Card" : "Bank transfer"}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "receipt",
      header: "Receipt",
      render: (row) => (
        <span className="whitespace-nowrap text-[11px] text-muted-foreground">{row.receipt_number || "—"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelected(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label={`View donation ${row.reference}`}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => downloadReceipt(row)}
            disabled={row.status !== "completed"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Download receipt for ${row.reference}`}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-[26px] leading-tight text-foreground">My Donations</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Every gift you have made, with its payment status and official receipt. Only verified payments count as
          completed contributions.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, status: filter.value }))}
              className={cn(
                "rounded-sm border px-4 py-2 text-[12px] font-medium transition-colors",
                filters.status === filter.value
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground/70 hover:border-primary hover:text-primary"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={filters.search}
              onChange={set("search")}
              placeholder="Search reference, receipt, project"
              className={`${adminInput} pl-9`}
              aria-label="Search donations"
            />
          </div>
          <select value={filters.projectId} onChange={set("projectId")} className={adminInput} aria-label="Filter by project">
            <option value="">All projects</option>
            {(data?.projectOptions || []).map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          <input type="date" value={filters.from} onChange={set("from")} className={adminInput} aria-label="From date" />
          <input type="date" value={filters.to} onChange={set("to")} className={adminInput} aria-label="To date" />
        </div>
      </div>

      <Panel>
        <DataTable
          columns={columns}
          rows={data?.rows || []}
          loading={loading}
          empty="No donations match these filters yet."
        />
      </Panel>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-[22px] font-normal">Donation details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="mt-2 space-y-4">
              <dl className="divide-y divide-border border border-border text-[13px]">
                {[
                  ["Donation ID", selected.reference],
                  ["Project", selected.project_title || "General foundation fund"],
                  ["Amount", formatCurrency(selected.amount, selected.currency)],
                  ["Currency", selected.currency],
                  ["Frequency", String(selected.frequency || "one_time").replace("_", " ")],
                  ["Payment method", selected.payment_method === "card" ? "Card" : "Bank transfer"],
                  ["Donation date", formatDateTime(selected.created_date)],
                  ["Verified on", selected.verified_date ? formatDateTime(selected.verified_date) : "—"],
                  ["Receipt number", selected.receipt_number || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                    <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium capitalize text-foreground">{value}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge status={selected.status} />
                  </dd>
                </div>
              </dl>
              {selected.dedication && (
                <p className="rounded-sm bg-mist p-3 text-[12px] leading-relaxed text-muted-foreground">
                  “{selected.dedication}”
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadReceipt(selected)}
                  disabled={selected.status !== "completed"}
                  className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download receipt
                </button>
                {selected.project_id && (
                  <Link
                    to="/projects/$projectId"
                    params={{ projectId: selected.project_id }}
                    className={adminGhostButton}
                  >
                    View project
                  </Link>
                )}
                <button type="button" onClick={() => setSelected(null)} className={adminGhostButton}>
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {loading && !data && <LoadingBlock label="Loading your donations" />}
    </div>
  );
}