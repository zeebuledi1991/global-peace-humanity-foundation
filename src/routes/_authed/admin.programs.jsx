import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { AdminHeader, DataTable, Panel, adminButton } from "@/components/admin/adminUi";
import RecordDialog from "@/components/admin/RecordDialog";
import DeleteButton from "@/components/admin/DeleteButton";
import useCollection from "@/hooks/useCollection";

export const Route = createFileRoute("/_authed/admin/programs")({
  component: AdminProgramsPage,
});

const ICON_OPTIONS = [
  { value: "book", label: "Education" },
  { value: "health", label: "Healthcare" },
  { value: "food", label: "Food" },
  { value: "water", label: "Water" },
  { value: "livelihood", label: "Livelihood" },
  { value: "women", label: "Women" },
  { value: "child", label: "Child" },
  { value: "relief", label: "Relief" },
  { value: "peace", label: "Peace" },
];

export default function AdminProgramsPage() {
  const { items, loading, refresh } = useCollection("Program", {}, { sort: "display_order", limit: 100 });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fields = [
    { name: "title", label: "Programme title", type: "text" },
    { name: "slug", label: "URL slug", type: "text", hint: "Leave blank to generate from the title." },
    { name: "summary", label: "Short summary", type: "textarea" },
    { name: "description", label: "Full description", type: "textarea" },
    { name: "objectives", label: "Objectives (one per line)", type: "lines" },
    { name: "image_url", label: "Image URL", type: "text" },
    { name: "image_alt", label: "Image description (alt text)", type: "text" },
    { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS, default: "book" },
    { name: "display_order", label: "Display order", type: "number", default: 10 },
    { name: "is_published", label: "Published on the website", type: "checkbox", default: true },
  ];

  const columns = [
    {
      key: "title",
      header: "Programme",
      render: (row) => (
        <div className="min-w-[200px]">
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-[11px] text-muted-foreground">/{row.slug}</p>
        </div>
      ),
    },
    { key: "order", header: "Order", render: (row) => <span className="text-[12px]">{row.display_order ?? "—"}</span> },
    {
      key: "objectives",
      header: "Objectives",
      render: (row) => <span className="text-[12px] text-muted-foreground">{(row.objectives || []).length}</span>,
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
            onClick={() => {
              setEditing(row);
              setOpen(true);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label={`Edit ${row.title}`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <DeleteButton entity="Program" id={row.id} label={row.title} onDeleted={refresh} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader title="Programs" description="The nine humanitarian focus areas shown across the website.">
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className={adminButton}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New programme
        </button>
      </AdminHeader>

      <Panel>
        <DataTable columns={columns} rows={items} loading={loading} empty="No programmes yet." />
      </Panel>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        entity="Program"
        title="Programme"
        fields={fields}
        record={editing}
        onSaved={refresh}
      />
    </div>
  );
}