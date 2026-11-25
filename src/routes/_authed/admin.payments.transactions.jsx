import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { DataTable, LoadingBlock, Panel, StatusBadge, adminGhostButton, adminInput, adminLabel } from "@/components/admin/adminUi";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { listTransactions } from "@/lib/payment-fns";
import { exportRowsCsv, exportRowsPdf } from "@/lib/payments/export";

export const Route = createFileRoute("/_authed/admin/payments/transactions")({
  component: TransactionsPage,
});

const STATUSES = ["", "pending", "processing", "completed", "failed", "cancelled", "refunded"];

const COLUMNS = [
  { header: "Transaction", value: (row) => row.reference },
  { header: "Donor", value: (row) => row.donor_name },
  { header: "Type", value: (row) => row.donor_type },
  { header: "Gateway", value: (row) => row.gateway_label },
  { header: "Project", value: (row) => row.project_title },
  { header: "Amount", value: (row) => row.amount },
  { header: "Currency", value: (row) => row.currency },
  { header: "Date", value: (row) => formatDateTime(row.created_date) },
  { header: "Payment reference", value: (row) => row.payment_reference },
  { header: "Status", value: (row) => row.status },
];

function TransactionsPage() {
  const load = useServerFn(listTransactions);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ search: "", gateway: "", status: "", currency: "", donorType: "", from: "", to: "" });

  useEffect(() => {
    let alive = true;
    load({ data: filters })
      .then((result) => alive && setData(result))
      .catch((error) => toast.error(error?.message || "Could not load transactions"));
    return () => {
      alive = false;
    };
  }, [load, filters]);

  const update = (field) => (event) => setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  const rows = data?.rows || [];
  const subtitle = `${rows.length} transactions · exported ${formatDateTime(new Date().toISOString())}`;

  return (
    <div className="space-y-5">
      <Panel>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label className={adminLabel} htmlFor="txn-search">
              Search
            </label>
            <input
              id="txn-search"
              value={filters.search}
              onChange={update("search")}
              placeholder="Reference, donor, payment reference, receipt"
              className={adminInput}
            />
          </div>
          <div>
            <label className={adminLabel} htmlFor="txn-gateway">
              Gateway
            </label>
            <select id="txn-gateway" value={filters.gateway} onChange={update("gateway")} className={adminInput}>
              <option value="">All gateways</option>
              {(data?.gateways || []).map((gateway) => (
                <option key={gateway.key} value={gateway.key}>
                  {gateway.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={adminLabel} htmlFor="txn-status">
              Status
            </label>
            <select id="txn-status" value={filters.status} onChange={update("status")} className={adminInput}>
              {STATUSES.map((status) => (
                <option key={status || "all"} value={status}>
                  {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All statuses"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={adminLabel} htmlFor="txn-currency">
              Currency
            </label>
            <input
              id="txn-currency"
              value={filters.currency}
              onChange={update("currency")}
              placeholder="Any"
              className={adminInput}
            />
          </div>
          <div>
            <label className={adminLabel} htmlFor="txn-donor-type">
              Donor type
            </label>
            <select id="txn-donor-type" value={filters.donorType} onChange={update("donorType")} className={adminInput}>
              <option value="">All donors</option>
              <option value="registered">Registered users</option>
              <option value="guest">Guest donors</option>
            </select>
          </div>
          <div>
            <label className={adminLabel} htmlFor="txn-from">
              From
            </label>
            <input id="txn-from" type="date" value={filters.from} onChange={update("from")} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel} htmlFor="txn-to">
              To
            </label>
            <input id="txn-to" type="date" value={filters.to} onChange={update("to")} className={adminInput} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap gap-4 text-[12px] text-muted-foreground">
            {Object.entries(data?.totals || {}).map(([code, amount]) => (
              <span key={code}>
                Verified {code}: <span className="font-semibold text-foreground">{formatCurrency(amount, code)}</span>
              </span>
            ))}
            {!Object.keys(data?.totals || {}).length && <span>No verified totals for these filters.</span>}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className={adminGhostButton}
              disabled={!rows.length}
              onClick={() => exportRowsCsv("gphf-transactions.csv", rows, COLUMNS)}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              CSV
            </button>
            <button
              type="button"
              className={adminGhostButton}
              disabled={!rows.length}
              onClick={() =>
                exportRowsPdf({
                  filename: "gphf-transactions.pdf",
                  title: "Transaction history",
                  subtitle,
                  columns: COLUMNS,
                  rows,
                })
              }
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              PDF
            </button>
          </div>
        </div>
      </Panel>

      <Panel>
        {!data ? (
          <LoadingBlock label="Loading transactions" />
        ) : (
          <DataTable
            columns={[
              {
                key: "reference",
                header: "Transaction ID",
                render: (row) => <span className="font-mono text-[11.5px]">{row.reference}</span>,
              },
              {
                key: "donor_name",
                header: "Donor",
                render: (row) => (
                  <div>
                    <p className="font-medium text-foreground">{row.donor_name}</p>
                    <p className="text-[11px] text-muted-foreground">{row.donor_email}</p>
                  </div>
                ),
              },
              {
                key: "donor_type",
                header: "Type",
                render: (row) => (
                  <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{row.donor_type}</span>
                ),
              },
              { key: "gateway_label", header: "Gateway" },
              { key: "project_title", header: "Project" },
              {
                key: "amount",
                header: "Amount",
                render: (row) => (
                  <span className="whitespace-nowrap font-medium">{formatCurrency(row.amount, row.currency)}</span>
                ),
              },
              {
                key: "created_date",
                header: "Date",
                render: (row) => <span className="whitespace-nowrap text-[11.5px]">{formatDateTime(row.created_date)}</span>,
              },
              {
                key: "payment_reference",
                header: "Payment ref",
                render: (row) => (
                  <span className="break-all text-[11px] text-muted-foreground">{row.payment_reference || "—"}</span>
                ),
              },
              { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            ]}
            rows={rows}
            empty="No transactions match these filters."
          />
        )}
      </Panel>
    </div>
  );
}