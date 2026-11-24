import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { AdminHeader, DataTable, Panel, StatusBadge, adminButton } from "@/components/admin/adminUi";
import RecordDialog from "@/components/admin/RecordDialog";
import DeleteButton from "@/components/admin/DeleteButton";
import useCollection from "@/hooks/useCollection";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/projects")({
  component: AdminProjectsPage,
});

const STATUS_OPTIONS = [
  { value: "ongoing", label: "Ongoing" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

const CURRENCY_OPTIONS = ["USD", "PKR", "GBP", "EUR"].map((code) => ({ value: code, label: code }));

export default function AdminProjectsPage() {
  const { items, loading, refresh } = useCollection("Project");
  const { items: programs } = useCollection("Program", {}, { sort: "display_order", limit: 100 });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fields = [
    { name: "title", label: "Project name", type: "text" },
    { name: "location", label: "Location", type: "text", placeholder: "Punjab, Pakistan" },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, default: "upcoming" },
    { name: "summary", label: "Short summary", type: "textarea" },
    { name: "description", label: "Full description", type: "textarea" },
    { name: "objectives", label: "Objectives (one per line)", type: "lines" },
    { name: "image_url", label: "Main image URL", type: "text" },
    { name: "image_alt", label: "Image description (alt text)", type: "text" },
    {
      name: "program_slug",
      label: "Related programme",
      type: "select",
      options: programs.map((program) => ({ value: program.slug, label: program.title })),
    },
    { name: "progress_percent", label: "Progress (%)", type: "number", default: 0, hint: "Publish only once verified." },
    { name: "goal_amount", label: "Fundraising goal", type: "number", default: 0 },
    { name: "currency", label: "Currency", type: "select", options: CURRENCY_OPTIONS, default: "USD" },
    { name: "is_featured", label: "Feature on the homepage", type: "checkbox" },
    { name: "is_published", label: "Published on the website", type: "checkbox", default: true },
  ];

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setOpen(true);
  };

  const columns = [
    {
      key: "title",
      header: "Project",
      render: (row) => (
        <div className="min-w-[200px]">
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-[11px] text-muted-foreground">{row.location}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "progress",
      header: "Progress",
      render: (row) => (
        <span className="text-[12px] text-muted-foreground">
          {Number(row.progress_percent) > 0 ? `${row.progress_percent}%` : "Not published"}
        </span>
      ),
    },
    {
      key: "goal",
      header: "Goal",
      render: (row) => (
        <span className="whitespace-nowrap text-[12px] text-muted-foreground">
          {Number(row.goal_amount) > 0 ? formatCurrency(row.goal_amount, row.currency || "USD") : "—"}
        </span>
      ),
    },
    {
      key: "published",
      header: "Live",
      render: (row) => (
        <span className={`text-[11px] font-semibold uppercase tracking-[0.1em] ${row.is_published ? "text-primary" : "text-muted-foreground"}`}>
          {row.is_published ? "Published" : "Draft"}
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
            onClick={() => openEdit(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label={`Edit ${row.title}`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <DeleteButton entity="Project" id={row.id} label={row.title} onDeleted={refresh} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Projects"
        description="Create, publish and retire projects. Progress figures should be added only after field verification."
      >
        <button type="button" onClick={openNew} className={adminButton}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New project
        </button>
      </AdminHeader>

      <Panel>
        <DataTable columns={columns} rows={items} loading={loading} empty="No projects yet. Create the first one." />
      </Panel>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        entity="Project"
        title="Project"
        fields={fields}
        record={editing}
        onSaved={refresh}
      />
    </div>
  );
}