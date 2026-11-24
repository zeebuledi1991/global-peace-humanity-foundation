import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { AdminHeader, DataTable, Panel, adminButton } from "@/components/admin/adminUi";
import RecordDialog from "@/components/admin/RecordDialog";
import DeleteButton from "@/components/admin/DeleteButton";
import useCollection from "@/hooks/useCollection";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/news")({
  component: AdminNewsPage,
});

export default function AdminNewsPage() {
  const { items, loading, refresh } = useCollection("NewsPost", {}, { sort: "-created_date", limit: 200 });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fields = [
    { name: "title", label: "Title", type: "text" },
    { name: "slug", label: "URL slug", type: "text", hint: "Leave blank to generate from the title." },
    { name: "category", label: "Category", type: "text", placeholder: "Field update, Perspective, Education…" },
    { name: "excerpt", label: "Excerpt", type: "textarea" },
    { name: "content", label: "Article content", type: "textarea", hint: "Separate paragraphs with a blank line." },
    { name: "image_url", label: "Image URL", type: "text" },
    { name: "image_alt", label: "Image description (alt text)", type: "text" },
    { name: "author", label: "Author", type: "text", default: "GPHF Team" },
    { name: "published_date", label: "Published date (YYYY-MM-DD)", type: "text" },
    { name: "is_featured", label: "Feature on the homepage", type: "checkbox" },
    { name: "is_published", label: "Published on the website", type: "checkbox", default: true },
  ];

  const columns = [
    {
      key: "title",
      header: "Story",
      render: (row) => (
        <div className="min-w-[220px]">
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-[11px] text-muted-foreground">{row.category}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Published",
      render: (row) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{formatDate(row.published_date)}</span>,
    },
    {
      key: "live",
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
          <DeleteButton entity="NewsPost" id={row.id} label={row.title} onDeleted={refresh} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader title="News & stories" description="Announcements, field updates, beneficiary stories and events.">
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className={adminButton}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          New story
        </button>
      </AdminHeader>

      <Panel>
        <DataTable columns={columns} rows={items} loading={loading} empty="No stories yet." />
      </Panel>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        entity="NewsPost"
        title="Story"
        fields={fields}
        record={editing}
        onSaved={refresh}
      />
    </div>
  );
}