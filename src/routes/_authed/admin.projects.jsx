import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Eye, EyeOff, Megaphone, Pencil, Plus } from "lucide-react";
import {
  AdminHeader,
  DataTable,
  Panel,
  StatusBadge,
  adminButton,
  adminGhostButton,
  adminInput,
  adminLabel,
  adminTextarea,
} from "@/components/admin/adminUi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RecordDialog from "@/components/admin/RecordDialog";
import DeleteButton from "@/components/admin/DeleteButton";
import useCollection from "@/hooks/useCollection";
import { createProjectUpdate, setProjectPublish } from "@/lib/admin-fns";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/projects")({
  component: AdminProjectsPage,
});

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
];

const CURRENCY_OPTIONS = ["USD", "PKR", "GBP", "EUR"].map((code) => ({ value: code, label: code }));

export default function AdminProjectsPage() {
  const { items, loading, refresh } = useCollection("Project");
  const { items: programs } = useCollection("Program", {}, { sort: "display_order", limit: 100 });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [updateFor, setUpdateFor] = useState(null);
  const [updateValues, setUpdateValues] = useState({ title: "", body: "", image_url: "" });
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fields = [
    { name: "title", label: "Project name", type: "text" },
    { name: "location", label: "Location", type: "text", placeholder: "Punjab, Pakistan" },
    { name: "category", label: "Project category", type: "text", placeholder: "Education, Health, Water" },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, default: "upcoming" },
    { name: "summary", label: "Short summary", type: "textarea" },
    { name: "description", label: "Full description", type: "textarea" },
    { name: "objectives", label: "Objectives (one per line)", type: "lines" },
    { name: "image_url", label: "Cover image URL", type: "text" },
    { name: "image_alt", label: "Image description (alt text)", type: "text" },
    { name: "gallery", label: "Additional images (one URL per line)", type: "lines" },
    {
      name: "program_slug",
      label: "Related programme",
      type: "select",
      options: programs.map((program) => ({ value: program.slug, label: program.title })),
    },
    { name: "goal_amount", label: "Target donation amount", type: "number", default: 0 },
    { name: "currency", label: "Currency", type: "select", options: CURRENCY_OPTIONS, default: "USD" },
    { name: "start_date", label: "Start date (YYYY-MM-DD)", type: "text" },
    { name: "end_date", label: "Expected completion date (YYYY-MM-DD)", type: "text" },
    { name: "progress_percent", label: "Progress (%)", type: "number", default: 0, hint: "Publish only once verified." },
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

  const togglePublish = async (row) => {
    setBusyId(row.id);
    try {
      await setProjectPublish({ data: { id: row.id, is_published: !row.is_published } });
      toast.success(row.is_published ? "Project unpublished." : "Project published.");
      await refresh();
    } catch (error) {
      toast.error(error?.message || "We could not change the publication status.");
    } finally {
      setBusyId(null);
    }
  };

  const submitUpdate = async (event) => {
    event.preventDefault();
    setSavingUpdate(true);
    try {
      await createProjectUpdate({
        data: { project_id: updateFor.id, ...updateValues },
      });
      toast.success("Update published and supporters notified.");
      setUpdateFor(null);
      setUpdateValues({ title: "", body: "", image_url: "" });
      await refresh();
    } catch (error) {
      toast.error(error?.message || "We could not publish this update.");
    } finally {
      setSavingUpdate(false);
    }
  };

  const columns = [
    {
      key: "title",
      header: "Project",
      render: (row) => (
        <div className="min-w-[200px]">
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-[11px] text-muted-foreground">{row.location || row.category || "—"}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "goal",
      header: "Target",
      render: (row) => (
        <span className="whitespace-nowrap text-[12px] text-muted-foreground">
          {Number(row.goal_amount) > 0 ? formatCurrency(row.goal_amount, row.currency || "USD") : "—"}
        </span>
      ),
    },
    {
      key: "dates",
      header: "Timeline",
      render: (row) => (
        <span className="whitespace-nowrap text-[11px] text-muted-foreground">
          {row.start_date || "—"} → {row.end_date || "—"}
        </span>
      ),
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
            onClick={() => openEdit(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label={`Edit ${row.title}`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setUpdateFor(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label={`Publish an update for ${row.title}`}
          >
            <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => togglePublish(row)}
            disabled={busyId === row.id}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
            aria-label={row.is_published ? `Unpublish ${row.title}` : `Publish ${row.title}`}
          >
            {row.is_published ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
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
        description="Create, publish, pause and close projects. Changing a project to completed or closed moves it into every supporter's completed list and notifies them."
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

      <Dialog open={Boolean(updateFor)} onOpenChange={(open) => !open && setUpdateFor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-[22px] font-normal">
              Publish an update · {updateFor?.title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitUpdate} className="mt-2 space-y-4">
            <div>
              <label className={adminLabel} htmlFor="update-title">
                Update title
              </label>
              <input
                id="update-title"
                required
                minLength={3}
                value={updateValues.title}
                onChange={(event) => setUpdateValues((prev) => ({ ...prev, title: event.target.value }))}
                className={adminInput}
                placeholder="Water points handed over to the community"
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="update-body">
                Update text
              </label>
              <textarea
                id="update-body"
                value={updateValues.body}
                onChange={(event) => setUpdateValues((prev) => ({ ...prev, body: event.target.value }))}
                className={adminTextarea}
                rows={5}
              />
            </div>
            <div>
              <label className={adminLabel} htmlFor="update-image">
                Image URL (optional)
              </label>
              <input
                id="update-image"
                value={updateValues.image_url}
                onChange={(event) => setUpdateValues((prev) => ({ ...prev, image_url: event.target.value }))}
                className={adminInput}
              />
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Supporters of this project receive an in-app notification and a branded email.
            </p>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" onClick={() => setUpdateFor(null)} className={adminGhostButton}>
                Cancel
              </button>
              <button type="submit" disabled={savingUpdate} className={adminButton}>
                Publish update
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}