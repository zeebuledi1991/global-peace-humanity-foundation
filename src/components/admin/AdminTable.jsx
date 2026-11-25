import { useState } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DataTable, StatusBadge, adminButton, adminGhostButton, adminInput, adminLabel } from "@/components/admin/adminUi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ADMIN_ROLE_LABELS, ADMIN_ROLE_OPTIONS, ADMIN_STATUS_OPTIONS } from "@/lib/adminRoles";
import { removeAdministrator, recordAdministratorReset, updateAdministrator } from "@/lib/admin-access-fns";
import { formatDateTime } from "@/lib/format";

const dateLabel = (value) => (value ? formatDateTime(value) : "—");
const tiny =
  "rounded-sm border border-border px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-foreground/70 transition-colors hover:border-primary hover:text-primary disabled:opacity-50";

const CONFIRM = {
  suspend: {
    title: "Deactivate this administrator?",
    body: "They lose access to every admin page immediately, including any open session.",
    confirm: "Deactivate",
  },
  activate: {
    title: "Activate this administrator?",
    body: "They will be able to sign in to the admin dashboard again with their existing role.",
    confirm: "Activate",
  },
  remove: {
    title: "Remove administrator access?",
    body: "The account remains as a donor account and can no longer open any admin page.",
    confirm: "Remove access",
  },
  reset: {
    title: "Send a password reset?",
    body: "The platform emails a secure, time-limited reset link to this administrator.",
    confirm: "Send reset link",
  },
};

export default function AdminTable({ rows, loading, currentUserId, onChanged, onNotice }) {
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (action, message) => {
    setBusy(true);
    setError("");
    try {
      await action();
      onChanged?.();
      if (message) onNotice?.(message);
      setConfirming(null);
      setEditing(null);
    } catch (err) {
      setError(err?.message || "That action could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = () => {
    const { kind, admin } = confirming;
    if (kind === "remove") {
      return run(() => removeAdministrator({ data: { id: admin.id } }), `${admin.name} no longer has administrator access.`);
    }
    if (kind === "suspend" || kind === "activate") {
      const status = kind === "suspend" ? "suspended" : "active";
      return run(
        () => updateAdministrator({ data: { id: admin.id, account_status: status } }),
        kind === "suspend" ? `${admin.name} has been deactivated.` : `${admin.name} has been activated.`
      );
    }
    return run(async () => {
      const { email } = await recordAdministratorReset({ data: { id: admin.id } });
      await base44.auth.resetPasswordRequest(email);
    }, `A password reset link has been sent to ${admin.email}.`);
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <span className="font-medium text-foreground">
          {row.name}
          {row.id === currentUserId && (
            <span className="ml-2 rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              You
            </span>
          )}
        </span>
      ),
    },
    { key: "email", header: "Email" },
    {
      key: "admin_role",
      header: "Role",
      render: (row) => (
        <span className="inline-flex whitespace-nowrap rounded-sm bg-navy/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-navy">
          {ADMIN_ROLE_LABELS[row.admin_role] || row.admin_role}
        </span>
      ),
    },
    { key: "account_status", header: "Status", render: (row) => <StatusBadge status={row.account_status} /> },
    { key: "created_date", header: "Date created", render: (row) => dateLabel(row.created_date) },
    { key: "last_login_at", header: "Last login", render: (row) => dateLabel(row.last_login_at) },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className={tiny} onClick={() => setViewing(row)}>
            View
          </button>
          <button type="button" className={tiny} onClick={() => setEditing({ ...row })}>
            Edit
          </button>
          <button type="button" className={tiny} onClick={() => setConfirming({ kind: "reset", admin: row })}>
            Reset
          </button>
          {row.account_status === "active" ? (
            <button type="button" className={tiny} onClick={() => setConfirming({ kind: "suspend", admin: row })}>
              Deactivate
            </button>
          ) : (
            <button type="button" className={tiny} onClick={() => setConfirming({ kind: "activate", admin: row })}>
              Activate
            </button>
          )}
          <button type="button" className={tiny} onClick={() => setConfirming({ kind: "remove", admin: row })}>
            Remove
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} rows={rows} loading={loading} empty="No administrator accounts yet." />

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>Administrator account details</DialogDescription>
          </DialogHeader>
          <dl className="space-y-2 text-[13px]">
            {[
              ["Email", viewing?.email],
              ["Role", ADMIN_ROLE_LABELS[viewing?.admin_role] || viewing?.admin_role],
              ["Status", viewing?.account_status === "active" ? "Active" : "Deactivated"],
              ["Created", dateLabel(viewing?.created_date)],
              ["Last login", dateLabel(viewing?.last_login_at)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium text-foreground">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editing?.name}</DialogTitle>
            <DialogDescription>Change this administrator's role or account status.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <label className={adminLabel} htmlFor="edit-role">
                  Administrator role
                </label>
                <select
                  id="edit-role"
                  className={adminInput}
                  value={editing.admin_role}
                  onChange={(event) => setEditing((prev) => ({ ...prev, admin_role: event.target.value }))}
                >
                  {ADMIN_ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  {ADMIN_ROLE_OPTIONS.find((role) => role.value === editing.admin_role)?.hint}
                </p>
              </div>
              <div>
                <label className={adminLabel} htmlFor="edit-status">
                  Account status
                </label>
                <select
                  id="edit-status"
                  className={adminInput}
                  value={editing.account_status}
                  onChange={(event) => setEditing((prev) => ({ ...prev, account_status: event.target.value }))}
                >
                  {ADMIN_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              {error && <p className="text-[12px] text-destructive">{error}</p>}
            </div>
          )}
          <DialogFooter className="gap-2">
            <button type="button" className={adminGhostButton} onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              className={adminButton}
              onClick={() =>
                run(
                  () =>
                    updateAdministrator({
                      data: {
                        id: editing.id,
                        admin_role: editing.admin_role,
                        account_status: editing.account_status,
                      },
                    }),
                  `${editing.name} has been updated.`
                )
              }
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              Save changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirming} onOpenChange={(open) => !open && setConfirming(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{CONFIRM[confirming?.kind]?.title}</DialogTitle>
            <DialogDescription>
              {confirming?.admin?.name} · {confirming?.admin?.email}
            </DialogDescription>
          </DialogHeader>
          <p className="text-[13px] leading-relaxed text-muted-foreground">{CONFIRM[confirming?.kind]?.body}</p>
          {error && <p className="text-[12px] text-destructive">{error}</p>}
          <DialogFooter className="gap-2">
            <button type="button" className={adminGhostButton} onClick={() => setConfirming(null)}>
              Cancel
            </button>
            <button type="button" disabled={busy} className={adminButton} onClick={confirm}>
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              {CONFIRM[confirming?.kind]?.confirm}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}