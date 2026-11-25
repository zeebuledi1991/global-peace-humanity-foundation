import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Panel, adminButton, adminInput, adminLabel } from "@/components/admin/adminUi";
import { ADMIN_ROLE_OPTIONS, ADMIN_STATUS_OPTIONS } from "@/lib/adminRoles";
import { createAdministrator } from "@/lib/admin-access-fns";

const EMPTY = { full_name: "", email: "", admin_role: "administrator", account_status: "active" };

export default function AddAdminForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createAdministrator({ data: form });
      setForm(EMPTY);
      onCreated?.();
    } catch (err) {
      setError(err?.message || "We could not create that administrator account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel>
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">Add new admin</h2>
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
          The platform emails a secure invitation, so the new administrator sets their own password. No
          password is created or displayed here.
        </p>
      </div>
      <form onSubmit={submit} className="grid gap-4 p-4 sm:grid-cols-2">
        <div>
          <label className={adminLabel} htmlFor="admin-name">
            Full name
          </label>
          <input
            id="admin-name"
            required
            value={form.full_name}
            onChange={update("full_name")}
            className={adminInput}
            placeholder="Ayesha Khan"
          />
        </div>
        <div>
          <label className={adminLabel} htmlFor="admin-email">
            Email address
          </label>
          <input
            id="admin-email"
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            className={adminInput}
            placeholder="name@gphf.pk"
          />
        </div>
        <div>
          <label className={adminLabel} htmlFor="admin-role">
            Administrator role
          </label>
          <select id="admin-role" value={form.admin_role} onChange={update("admin_role")} className={adminInput}>
            {ADMIN_ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {ADMIN_ROLE_OPTIONS.find((role) => role.value === form.admin_role)?.hint}
          </p>
        </div>
        <div>
          <label className={adminLabel} htmlFor="admin-status">
            Account status
          </label>
          <select id="admin-status" value={form.account_status} onChange={update("account_status")} className={adminInput}>
            {ADMIN_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="sm:col-span-2 rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
            {error}
          </p>
        )}

        <div className="sm:col-span-2">
          <button type="submit" disabled={busy} className={adminButton}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />}
            Send invitation
          </button>
        </div>
      </form>
    </Panel>
  );
}