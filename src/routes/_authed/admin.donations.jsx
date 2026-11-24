import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AdminHeader, DataTable, Panel, StatusBadge, adminGhostButton } from "@/components/admin/adminUi";
import { getAdminDonations, updateDonationStatus } from "@/lib/admin-fns";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export const Route = createFileRoute("/_authed/admin/donations")({
  component: AdminDonationsPage,
});

function AdminDonationsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async (filter = status) => {
    setLoading(true);
    try {
      const result = await getAdminDonations({ data: filter ? { status: filter } : {} });
      setRows(result);
    } catch (error) {
      toast.error(error?.message || "We could not load donations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const changeStatus = async (donation, nextStatus) => {
    setBusyId(donation.id);
    try {
      await updateDonationStatus({ data: { id: donation.id, status: nextStatus } });
      toast.success(
        nextStatus === "completed"
          ? "Donation verified. A receipt number has been issued."
          : `Donation marked ${nextStatus}.`
      );
      await load(status);
    } catch (error) {
      toast.error(error?.message || "We could not update this donation.");
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      key: "donor",
      header: "Donor",
      render: (row) => (
        <div className="min-w-[180px]">
          <p className="font-medium text-foreground">{row.is_anonymous ? "Anonymous donor" : row.donor_name}</p>
          <p className="text-[11px] text-muted-foreground">{row.donor_email}</p>
          <p className="text-[11px] text-muted-foreground">{row.country}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground">{formatCurrency(row.amount, row.currency)}</p>
          <p className="text-[11px] capitalize text-muted-foreground">{String(row.frequency).replace("_", " ")}</p>
        </div>
      ),
    },
    {
      key: "reference",
      header: "Reference",
      render: (row) => (
        <div className="min-w-[140px]">
          <p className="font-mono text-[11px] text-foreground">{row.reference}</p>
          {row.receipt_number && (
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-primary">{row.receipt_number}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "date",
      header: "Pledged",
      render: (row) => <span className="whitespace-nowrap text-[11px] text-muted-foreground">{formatDateTime(row.created_date)}</span>,
    },
    {
      key: "actions",
      header: "Verify",
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.status !== "completed" && (
            <button
              type="button"
              onClick={() => changeStatus(row, "completed")}
              disabled={busyId === row.id}
              className="rounded-sm border border-primary px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
            >
              {busyId === row.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark verified"}
            </button>
          )}
          {row.status !== "failed" && row.status !== "completed" && (
            <button
              type="button"
              onClick={() => changeStatus(row, "failed")}
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
        title="Donations"
        description="Donor details are visible only to administrators. Mark a donation verified only after the payment has been confirmed in the bank or payment provider account."
      >
        <button type="button" onClick={() => load(status)} className={adminGhostButton}>
          Refresh
        </button>
      </AdminHeader>

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
          </button>
        ))}
      </div>

      <Panel>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          empty="No donations match this filter yet."
        />
      </Panel>

      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Pledges are recorded the moment a donor submits the form. They remain pending — and are never
        shown as income — until you confirm the payment. Marking a donation verified issues a receipt
        number the donor can view with their reference.
      </p>
    </div>
  );
}