import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { Image } from "@/components/ui/image";
import { AdminHeader, DataTable, Panel, adminButton } from "@/components/admin/adminUi";
import RecordDialog from "@/components/admin/RecordDialog";
import DeleteButton from "@/components/admin/DeleteButton";
import useCollection from "@/hooks/useCollection";

export const Route = createFileRoute("/_authed/admin/gallery")({
  component: AdminGalleryPage,
});

export default function AdminGalleryPage() {
  const { items, loading, refresh } = useCollection("GalleryItem", {}, { sort: "display_order", limit: 200 });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fields = [
    { name: "title", label: "Title", type: "text" },
    { name: "category", label: "Category", type: "text", placeholder: "Education, Relief, Community…" },
    {
      name: "media_type",
      label: "Media type",
      type: "select",
      options: [
        { value: "photo", label: "Photo" },
        { value: "video", label: "Video" },
      ],
      default: "photo",
    },
    { name: "image_url", label: "Image URL", type: "text" },
    { name: "video_url", label: "Video URL (for video items)", type: "text" },
    { name: "caption", label: "Caption", type: "textarea" },
    { name: "display_order", label: "Display order", type: "number", default: 10 },
    { name: "is_published", label: "Published in the gallery", type: "checkbox", default: true },
  ];

  const columns = [
    {
      key: "item",
      header: "Item",
      render: (row) => (
        <div className="flex min-w-[220px] items-center gap-3">
          {row.image_url ? (
            <Image src={row.image_url} alt={row.title} className="h-11 w-14 shrink-0 rounded-sm" />
          ) : (
            <span className="h-11 w-14 shrink-0 rounded-sm bg-secondary" />
          )}
          <div>
            <p className="font-medium text-foreground">{row.title}</p>
            <p className="text-[11px] text-muted-foreground">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => <span className="text-[12px] capitalize text-muted-foreground">{row.media_type || "photo"}</span>,
    },
    {
      key: "published",
      header: "Live",
      render: (row) => (
        <span className={`text-[11px] font-semibold uppercase tracking-[0.1em] ${row.is_published ? "text-primary" : "text-muted-foreground"}`}>
          {row.is_published ? "Published" : "Hidden"}
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
          <DeleteButton entity="GalleryItem" id={row.id} label={row.title} onDeleted={refresh} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Gallery"
        description="Photos and videos shown in the public gallery. Add an image URL for each item; only publish images you have consent to use."
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
          New item
        </button>
      </AdminHeader>

      <Panel>
        <DataTable columns={columns} rows={items} loading={loading} empty="No gallery items yet." />
      </Panel>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        entity="GalleryItem"
        title="Gallery item"
        fields={fields}
        record={editing}
        onSaved={refresh}
      />
    </div>
  );
}