import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { AdminHeader, DataTable, Panel, StatusBadge } from "@/components/admin/adminUi";
import useCollection from "@/hooks/useCollection";
import { formatDateTime } from "@/lib/format";

const STATUSES = ["new", "read", "replied"];

export const Route = createFileRoute("/_authed/admin/messages")({
  component: AdminMessagesPage,
});

export default function AdminMessagesPage() {
  const { items, loading, refresh } = useCollection("ContactMessage", {}, { sort: "-created_date", limit: 200 });

  const setStatus = async (record, status) => {
    try {
      await base44.entities.ContactMessage.update(record.id, { status });
      toast.success(`Message marked ${status}.`);
      refresh();
    } catch (error) {
      toast.error(error?.message || "We could not update this message.");
    }
  };

  const columns = [
    {
      key: "sender",
      header: "From",
      render: (row) => (
        <div className="min-w-[180px]">
          <p className="font-medium text-foreground">{row.name}</p>
          <a href={`mailto:${row.email}`} className="text-[11px] text-primary hover:underline">
            {row.email}
          </a>
          {row.phone && <p className="text-[11px] text-muted-foreground">{row.phone}</p>}
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject & message",
      render: (row) => (
        <div className="max-w-[340px]">
          <p className="text-[12px] font-medium text-foreground">{row.subject || "Website enquiry"}</p>
          <p className="mt-0.5 whitespace-pre-line text-[12px] leading-relaxed text-muted-foreground">{row.message}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Received",
      render: (row) => <span className="whitespace-nowrap text-[11px] text-muted-foreground">{formatDateTime(row.created_date)}</span>,
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex flex-col gap-1.5">
          <a
            href={`mailto:${row.email}?subject=Re: ${encodeURIComponent(row.subject || "Your enquiry")}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Mail className="h-3 w-3" aria-hidden="true" />
            Reply
          </a>
          <select
            value={row.status || "new"}
            onChange={(event) => setStatus(row, event.target.value)}
            className="h-8 rounded-sm border border-border bg-white px-2 text-[11px]"
            aria-label={`Update status for message from ${row.name}`}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Website messages"
        description="Enquiries submitted through the contact form. Replying opens your email client with the sender's address."
      />
      <Panel>
        <DataTable columns={columns} rows={items} loading={loading} empty="No messages yet." />
      </Panel>
    </div>
  );
}