import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  AdminHeader,
  Panel,
  adminButton,
  adminInput,
  adminLabel,
  adminTextarea,
} from "@/components/admin/adminUi";

export const Route = createFileRoute("/_authed/admin/settings")({
  component: AdminSettingsPage,
});

const FIELDS = [
  { name: "organization_name", label: "Organization name", type: "text" },
  { name: "tagline", label: "Tagline", type: "text" },
  { name: "intro", label: "Introduction", type: "textarea" },
  { name: "mission", label: "Mission statement", type: "textarea" },
  { name: "vision", label: "Vision statement", type: "textarea" },
  { name: "email", label: "Public email", type: "text" },
  { name: "phone", label: "Phone number", type: "text" },
  { name: "address", label: "Office address", type: "text" },
  { name: "office_hours", label: "Office hours", type: "text" },
  { name: "map_query", label: "Map location query", type: "text" },
  { name: "bank_details", label: "Bank transfer instructions", type: "textarea" },
  { name: "registration_note", label: "Registration note", type: "textarea" },
  { name: "social_facebook", label: "Facebook URL", type: "text" },
  { name: "social_instagram", label: "Instagram URL", type: "text" },
  { name: "social_linkedin", label: "LinkedIn URL", type: "text" },
  { name: "social_youtube", label: "YouTube URL", type: "text" },
];

export default function AdminSettingsPage() {
  const [recordId, setRecordId] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.SiteSettings.list({ limit: 1 });
        const existing = (Array.isArray(res) ? res : res?.items ?? [])[0];
        if (existing) {
          setRecordId(existing.id);
          setValues(existing);
        }
      } catch (error) {
        toast.error(error?.message || "We could not load the settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      FIELDS.forEach((field) => {
        payload[field.name] = values[field.name] || "";
      });
      if (recordId) {
        await base44.entities.SiteSettings.update(recordId, payload);
      } else {
        const created = await base44.entities.SiteSettings.create(payload);
        setRecordId(created.id);
      }
      toast.success("Organization details saved.");
    } catch (error) {
      toast.error(error?.message || "We could not save these settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading settings
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AdminHeader
        title="Site settings"
        description="Organization details shown across the website, including contact information and bank transfer instructions."
      >
        <button type="submit" disabled={saving} className={adminButton}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Save className="h-3.5 w-3.5" aria-hidden="true" />}
          Save changes
        </button>
      </AdminHeader>

      <Panel className="p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
              <label className={adminLabel} htmlFor={`settings-${field.name}`}>
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={`settings-${field.name}`}
                  value={values[field.name] || ""}
                  onChange={update(field.name)}
                  className={adminTextarea}
                  rows={3}
                />
              ) : (
                <input
                  id={`settings-${field.name}`}
                  value={values[field.name] || ""}
                  onChange={update(field.name)}
                  className={adminInput}
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-5 text-[12px] leading-relaxed text-muted-foreground">
          Leave a field blank to keep the placeholder wording on the public site. Never publish
          registration numbers or financial figures before they are verified.
        </p>
      </Panel>
    </form>
  );
}