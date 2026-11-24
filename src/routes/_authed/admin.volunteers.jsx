import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { AdminHeader, DataTable, Panel, StatusBadge } from "@/components/admin/adminUi";
import useCollection from "@/hooks/useCollection";
import { formatDateTime } from "@/lib/format";

const STATUSES = ["new", "reviewing", "approved", "declined"];

export const Route = createFileRoute("/_authed/admin/volunteers")({
  component: AdminVolunteersPage,
});

export default function AdminVolunteersPage() {
  const { items, loading, refresh } = useCollection("VolunteerApplication", {}, { sort: "-created_date", limit: 200 });

  const setStatus = async (record, status) => {
    try {
      await base44.entities.VolunteerApplication.update(record.id, { status });
      toast.success(`Application marked ${status}.`);
      refresh();
    } catch (error) {
      toast.error(error?.message || "We could not update this application.");
    }
  };

  const columns = [
    {
      key: "applicant",
      header: "Applicant",
      render: (row) => (
        <div className="min-w-[190px]">
          <p className="font-medium text-foreground">{row.full_name}</p>
          <p className="text-[11px] text-muted-foreground">{row.email}</p>
          <p className="text-[11px] text-muted-foreground">
            {[row.city, row.country].filter(Boolean).join(", ")}
          </p>
        </div>
      ),
    },
    {
      key: "areas",
      header: "Interests",
      render: (row) => (
        <p className="max-w-[220px] text-[12px] leading-relaxed text-muted-foreground">
          {(row.areas_of_interest || []).join(", ") || "—"}
        </p>
      ),
    },
    {
      key: "availability",
      header: "Availability",
      render: (row) => <span className="text-[12px] text-muted-foreground">{row.availability || "—"}</span>,
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
          aria-label={`Update status for ${row.full_name}`}
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
        title="Volunteer applications"
        description="Review applications and record a decision. Applicants working with children complete safeguarding checks before any placement."
      />
      <Panel>
        <DataTable columns={columns} rows={items} loading={loading} empty="No volunteer applications yet." />
      </Panel>
    </div>
  );
}