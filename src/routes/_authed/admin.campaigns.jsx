import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { AdminHeader, DataTable, Panel, adminButton } from "@/components/admin/adminUi";
import RecordDialog from "@/components/admin/RecordDialog";
import DeleteButton from "@/components/admin/DeleteButton";
import useCollection from "@/hooks/useCollection";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/campaigns")({
  component: AdminCampaignsPage,
});

export default function AdminCampaignsPage() {
  const { items, loading, refresh } = useCollection("Campaign");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fields = [
    { name: "title", label: "Campaign title", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "goal_amount", label: "Goal amount", type: "number", default: 0 },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      options: ["USD", "PKR", "GBP", "EUR"].map((code) => ({ value: code, label: code })),
      default: "USD",
    },
    { name: "image_url", label: "Image URL", type: "text" },
    { name: "image_alt", label: "Image description (alt text)", type: "text" },
    { name: "is_featured", label: "Feature on the homepage", type: "checkbox" },
    { name: "is_active", label: "Accepting donations", type: "checkbox", default: true },
  ];

  const columns = [
    {
      key: "title",
      header: "Campaign",
      render: (row) => (
        <div className="min-w-[200px]">
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="line-clamp-1 text-[11px] text-muted-foreground">{row.description}</p>
        </div>
      ),
    },
    {
      key: "goal",
      header: "Goal",
      render: (row) => (
        <span className="whitespace-nowrap text-[12px]">
          {formatCurrency(row.goal_amount, row.currency || "USD")}
        </span>
      ),
    },
    {
      key: "active",
      header: "Status",
      render: (row) => (
        <span className={`text-[11px] font-semibold uppercase tracking-[0.1em] ${row.is_active ? "text-primary" : "text-muted-foreground"}`}>
          {row.is_active ? "Active" : "Closed"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEditing(row);
              setOpen(true);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label={`Edit ${row.title}`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <DeleteButton entity="Campaign" id={row.id} label={row.title} onDeleted={refresh} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Campaigns"
        description="Fundraising campaigns shown on the donate page. Amounts raised are calculated from verified donations only."
      >
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className={adminButton}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New campaign
        </button>
      </AdminHeader>

      <Panel>
        <DataTable columns={columns} rows={items} loading={loading} empty="No campaigns yet." />
      </Panel>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        entity="Campaign"
        title="Campaign"
        fields={fields}
        record={editing}
        onSaved={refresh}
      />
    </div>
  );
}