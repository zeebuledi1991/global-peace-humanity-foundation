import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Plus, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  AdminHeader,
  DataTable,
  Panel,
  adminButton,
  adminGhostButton,
  adminInput,
  adminLabel,
  adminTextarea,
} from "@/components/admin/adminUi";
import DeleteButton from "@/components/admin/DeleteButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useCollection from "@/hooks/useCollection";
import { formatDate } from "@/lib/format";

const CATEGORIES = [
  { value: "annual_report", label: "Annual report" },
  { value: "financial_report", label: "Financial report" },
  { value: "project_expenditure", label: "Project expenditure" },
  { value: "governance", label: "Governance" },
  { value: "registration", label: "Registration document" },
];

const LABELS = Object.fromEntries(CATEGORIES.map((item) => [item.value, item.label]));

export const Route = createFileRoute("/_authed/admin/documents")({
  component: AdminDocumentsPage,
});

export default function AdminDocumentsPage() {
  const { items, loading, refresh } = useCollection("Document", {}, { sort: "-created_date", limit: 200 });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [values, setValues] = useState({
    title: "",
    category: "annual_report",
    description: "",
    published_date: new Date().toISOString().slice(0, 10),
  });

  const update = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error("Please choose a file to upload.");
      return;
    }
    setSaving(true);
    try {
      const uploaded = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.Document.create({
        title: values.title,
        category: values.category,
        description: values.description,
        published_date: values.published_date,
        file_uri: uploaded.file_uri,
        is_published: true,
      });
      toast.success("Document uploaded and published.");
      setOpen(false);
      setFile(null);
      setValues({
        title: "",
        category: "annual_report",
        description: "",
        published_date: new Date().toISOString().slice(0, 10),
      });
      refresh();
    } catch (error) {
      toast.error(error?.message || "We could not upload this document.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "title",
      header: "Document",
      render: (row) => (
        <div className="min-w-[220px]">
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-[11px] text-muted-foreground">{LABELS[row.category] || row.category}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Published",
      render: (row) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{formatDate(row.published_date)}</span>,
    },
    {
      key: "file",
      header: "File",
      render: (row) => (
        <span className="text-[11px] text-muted-foreground">{row.file_uri ? "Attached (private)" : "No file"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => <DeleteButton entity="Document" id={row.id} label={row.title} onDeleted={refresh} />,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Reports & documents"
        description="Annual reports, financial statements, project expenditure reports and registration documents. Files are stored privately and served through expiring links."
      >
        <button type="button" onClick={() => setOpen(true)} className={adminButton}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Upload document
        </button>
      </AdminHeader>

      <Panel>
        <DataTable columns={columns} rows={items} loading={loading} empty="No documents published yet." />
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-[22px] font-normal">Upload a document</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className={adminLabel} htmlFor="doc-title">
                Title
              </label>
              <input id="doc-title" required value={values.title} onChange={update("title")} className={adminInput} />
            </div>
            <div>
              <label className={adminLabel} htmlFor="doc-category">
                Category
              </label>
              <select id="doc-category" value={values.category} onChange={update("category")} className={adminInput}>
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={adminLabel} htmlFor="doc-date">
                Published date
              </label>
              <input id="doc-date" type="date" value={values.published_date} onChange={update("published_date")} className={adminInput} />
            </div>
            <div>
              <label className={adminLabel} htmlFor="doc-description">
                Description
              </label>
              <textarea id="doc-description" value={values.description} onChange={update("description")} className={adminTextarea} />
            </div>
            <div>
              <label className={adminLabel} htmlFor="doc-file">
                File
              </label>
              <input
                id="doc-file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="block w-full rounded-sm border border-border bg-white px-3 py-2.5 text-[13px]"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Stored privately — visitors receive an expiring link.</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" onClick={() => setOpen(false)} className={adminGhostButton}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className={adminButton}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
                Upload
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}