import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AdminHeader, DataTable, Panel, adminInput } from "@/components/admin/adminUi";
import { getAuditLogs } from "@/lib/admin-fns";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/audit")({
  component: AuditLogPage,
});

const ACTION_LABELS = {
  "donation.completed": "Donation verified",
  "donation.failed": "Donation marked failed",
  "donation.refunded": "Donation refunded",
  "donation.pending": "Donation set pending",
  "user.access_updated": "User access updated",
  "project.update_published": "Project update published",
  "project.published": "Project published",
  "project.unpublished": "Project unpublished",
};

function AuditLogPage() {
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAuditLogs({ data: { search } }).then((result) => {
      if (!cancelled) setRows(result);
    });
    return () => {
      cancelled = true;
    };
  }, [search]);

  const columns = [
    {
      key: "action",
      header: "Action",
      render: (row) => (
        <div className="min-w-[180px]">
          <p className="text-[12.5px] font-medium text-foreground">{ACTION_LABELS[row.action] || row.action}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{row.action}</p>
        </div>
      ),
    },
    {
      key: "actor",
      header: "Administrator",
      render: (row) => (
        <div className="min-w-[160px]">
          <p className="text-[12px] text-foreground">{row.actor_email || "—"}</p>
          <p className="text-[11px] capitalize text-muted-foreground">{String(row.actor_role || "").replace("_", " ")}</p>
        </div>
      ),
    },
    {
      key: "record",
      header: "Record",
      render: (row) => (
        <div className="min-w-[140px]">
          <p className="text-[12px] text-foreground">{row.entity || "—"}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{row.record_id || ""}</p>
        </div>
      ),
    },
    {
      key: "details",
      header: "Details",
      render: (row) => <span className="block max-w-[280px] truncate text-[12px] text-muted-foreground">{row.details || "—"}</span>,
    },
    {
      key: "date",
      header: "When",
      render: (row) => <span className="whitespace-nowrap text-[11px] text-muted-foreground">{formatDateTime(row.created_date)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Audit Log"
        description="Administrator sign-ins, donation verifications, project changes, access updates and report exports, with the acting administrator and the affected record."
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search action, administrator, record"
          className={`${adminInput} pl-9`}
          aria-label="Search audit log"
        />
      </div>

      <Panel>
        <DataTable columns={columns} rows={rows || []} loading={!rows} empty="No administrative activity recorded yet." />
      </Panel>
    </div>
  );
}