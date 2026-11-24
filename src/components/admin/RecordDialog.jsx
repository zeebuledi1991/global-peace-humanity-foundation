import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminButton, adminGhostButton, adminInput, adminLabel, adminTextarea } from "@/components/admin/adminUi";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 90);
}

function toInputValue(field, value) {
  if (field.type === "lines") {
    return Array.isArray(value) ? value.join("\n") : value || "";
  }
  if (field.type === "checkbox") return Boolean(value);
  return value ?? "";
}

export default function RecordDialog({ open, onOpenChange, entity, fields, record, onSaved, title }) {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const next = {};
    fields.forEach((field) => {
      const source = record ? record[field.name] : field.default;
      next[field.name] = toInputValue(field, source);
    });
    setValues(next);
  }, [open, record, fields]);

  const setValue = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      fields.forEach((field) => {
        const raw = values[field.name];
        if (field.type === "number") {
          payload[field.name] = raw === "" || raw === null ? 0 : Number(raw);
        } else if (field.type === "checkbox") {
          payload[field.name] = Boolean(raw);
        } else if (field.type === "lines") {
          payload[field.name] = String(raw || "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        } else {
          payload[field.name] = raw ?? "";
        }
      });
      if ("slug" in payload && !payload.slug && payload.title) {
        payload.slug = slugify(payload.title);
      }

      if (record?.id) {
        await base44.entities[entity].update(record.id, payload);
        toast.success("Changes saved.");
      } else {
        await base44.entities[entity].create(payload);
        toast.success("Record created.");
      }
      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      toast.error(error?.message || "We could not save this record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-[22px] font-normal">
            {record ? `Edit ${title.toLowerCase()}` : `New ${title.toLowerCase()}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-2 space-y-4">
          {fields.map((field) => (
            <div key={field.name} className={field.wide ? "sm:col-span-2" : ""}>
              {field.type === "checkbox" ? (
                <label className="flex cursor-pointer items-center gap-3 rounded-sm border border-border px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={Boolean(values[field.name])}
                    onChange={(event) => setValue(field.name, event.target.checked)}
                    className="h-4 w-4 accent-[#174D38]"
                  />
                  <span className="text-[13px] text-foreground">{field.label}</span>
                </label>
              ) : (
                <>
                  <label className={adminLabel} htmlFor={`field-${field.name}`}>
                    {field.label}
                  </label>
                  {field.type === "textarea" || field.type === "lines" ? (
                    <textarea
                      id={`field-${field.name}`}
                      value={values[field.name] ?? ""}
                      onChange={(event) => setValue(field.name, event.target.value)}
                      className={adminTextarea}
                      rows={field.type === "lines" ? 5 : 5}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={`field-${field.name}`}
                      value={values[field.name] ?? ""}
                      onChange={(event) => setValue(field.name, event.target.value)}
                      className={adminInput}
                    >
                      <option value="">Select…</option>
                      {(field.options || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`field-${field.name}`}
                      type={field.type === "number" ? "number" : "text"}
                      value={values[field.name] ?? ""}
                      onChange={(event) => setValue(field.name, event.target.value)}
                      className={adminInput}
                      placeholder={field.placeholder}
                    />
                  )}
                  {field.hint && <p className="mt-1 text-[11px] text-muted-foreground">{field.hint}</p>}
                </>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => onOpenChange(false)} className={adminGhostButton}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={adminButton}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              {record ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}