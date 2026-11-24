import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { AdminHeader, DataTable, Panel, StatusBadge } from "@/components/admin/adminUi";
import useCollection from "@/hooks/useCollection";
import { formatDateTime } from "@/lib/format";

const STATUSES = ["new", "reviewing", "approved", "declined"];
const TYPE_LABELS = {
  corporate: "Corporate",
  ngo: "NGO",
  fundraising: "Fundraising",
  project_sponsorship: "Project sponsorship",
};

export const Route = createFileRoute("/_authed/admin/partnerships")({
  component: AdminPartnershipsPage,
});

export default function AdminPartnershipsPage() {
  const { items, loading, refresh } = useCollection("Partnership", {}, { sort: "-created_date", limit: 200 });

  const setStatus = async (record, status) => {
    try {
      await base44.entities.Partnership.update(record.id, { status });
      toast.success(`Enquiry marked ${status}.`);
      refresh();
    } catch (error) {
      toast.error(error?.message || "We could not update this enquiry.");
    }
  };

  const columns = [
    {
      key: "organization",
      header: "Organization",
      render: (row) => (
        <div className="min-w-[190px]">
          <p className="font-medium text-foreground">{row.organization_name}</p>
          <p className="text-[11px] text-muted-foreground">{row.contact_name}</p>
          <p className="text-[11px] text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => <span className="text-[12px] text-muted-foreground">{TYPE_LABELS[row.partnership_type] || row.partnership_type}</span>,
    },
    {
      key: "message",
      header: "Message",
      render: (row) => <p className="max-w-[260px] text-[12px] leading-relaxed text-muted-foreground">{row.message || "—"}</p>,
    },
    {
      key: "date",
      header: "Received",
      render: (row) => <span className="whitespace-nowrap text-[11px] text-muted-foreground">{formatDateTime(row.created_date)}</span>,
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Update",
      render: (row) => (
        <select
          value={row.status || "new"}
          onChange={(event) => setStatus(row, event.target.value)}
          className="h-8 rounded-sm border border-border bg-white px-2 text-[11px]"
          aria-label={`Update status for ${row.organization_name}`}
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Partnership enquiries"
        description="Corporate partnerships, NGO collaboration, fundraising partnerships and project sponsorship requests."
      />
      <Panel>
        <DataTable columns={columns} rows={items} loading={loading} empty="No partnership enquiries yet." />
      </Panel>
    </div>
  );
}