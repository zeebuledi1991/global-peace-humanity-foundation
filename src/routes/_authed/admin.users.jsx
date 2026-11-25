import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Search, ShieldCheck } from "lucide-react";
import {
  AdminHeader,
  DataTable,
  Panel,
  StatusBadge,
  adminButton,
  adminGhostButton,
  adminInput,
  adminLabel,
} from "@/components/admin/adminUi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAdminUsers, updateUserAccess } from "@/lib/admin-fns";
import { useAuth } from "@/lib/AuthContext";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/users")({
  component: AdminUsersPage,
});

const ADMIN_ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "administrator", label: "Administrator" },
  { value: "finance_manager", label: "Finance Manager" },
  { value: "project_manager", label: "Project Manager" },
];

const totalLabel = (totals) => {
  const entries = Object.entries(totals || {});
  return entries.length ? entries.map(([currency, total]) => formatCurrency(total, currency)).join(" · ") : "—";
};

function AdminUsersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({ admin_role: "", account_status: "active", role: "user" });
  const [saving, setSaving] = useState(false);

  const canManage = (user?.admin_role || "administrator") === "super_admin";

  const load = () => getAdminUsers({ data: { search } }).then(setRows);

  useEffect(() => {
    let cancelled = false;
    getAdminUsers({ data: { search } }).then((result) => {
      if (!cancelled) setRows(result);
    });
    return () => {
      cancelled = true;
    };
  }, [search]);

  const openEditor = (row) => {
    setEditing(row);
    setValues({
      admin_role: row.admin_role || "",
      account_status: row.account_status || "active",
      role: row.role || "user",
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateUserAccess({ data: { id: editing.id, ...values } });
      toast.success("Access updated and recorded in the audit log.");
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(error?.message || "We could not update this account.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "user",
      header: "Account",
      render: (row) => (
        <div className="min-w-[190px]">
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-[11px] text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: "country", header: "Country", render: (row) => <span className="text-[12px] text-muted-foreground">{row.country || "—"}</span> },
    {
      key: "access",
      header: "Access",
      render: (row) => (
        <div className="min-w-[120px]">
          <p className="text-[12px] capitalize text-foreground">{row.role}</p>
          <p className="text-[11px] text-muted-foreground">
            {row.admin_role ? ADMIN_ROLES.find((role) => role.value === row.admin_role)?.label || row.admin_role : "Donor"}
          </p>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.account_status} /> },
    {
      key: "donations",
      header: "Donations",
      render: (row) => (
        <div>
          <p className="text-[12px] text-foreground">{row.donation_count}</p>
          <p className="text-[11px] text-muted-foreground">{row.projects} projects</p>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total given",
      render: (row) => <span className="whitespace-nowrap text-[12px] font-semibold text-foreground">{totalLabel(row.totals)}</span>,
    },
    {
      key: "joined",
      header: "Joined",
      render: (row) => <span className="whitespace-nowrap text-[11px] text-muted-foreground">{formatDate(row.created_date)}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <button
          type="button"
          onClick={() => openEditor(row)}
          disabled={!canManage}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
        >
          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
          Manage
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Users & Access"
        description="Registered donor accounts and GPHF team access. Passwords and payment credentials are never visible to administrators."
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, country"
          className={`${adminInput} pl-9`}
          aria-label="Search users"
        />
      </div>

      {!canManage && (
        <p className="rounded-sm border border-gold/40 bg-gold/10 px-4 py-3 text-[12px] text-foreground">
          Your administrator role can view accounts but only a Super Admin can change access or suspend an account.
        </p>
      )}

      <Panel>
        <DataTable columns={columns} rows={rows || []} loading={!rows} empty="No accounts match this search." />
      </Panel>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-[22px] font-normal">Manage access</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="mt-2 space-y-4">
              <div>
                <p className="text-[13px] font-medium text-foreground">{editing.name}</p>
                <p className="text-[12px] text-muted-foreground">{editing.email}</p>
              </div>
              <div>
                <label className={adminLabel} htmlFor="user-role">
                  App access
                </label>
                <select
                  id="user-role"
                  value={values.role}
                  onChange={(event) => setValues((prev) => ({ ...prev, role: event.target.value }))}
                  className={adminInput}
                >
                  <option value="user">Donor account</option>
                  <option value="admin">Administrator dashboard access</option>
                </select>
              </div>
              <div>
                <label className={adminLabel} htmlFor="user-admin-role">
                  Administrator role
                </label>
                <select
                  id="user-admin-role"
                  value={values.admin_role}
                  onChange={(event) => setValues((prev) => ({ ...prev, admin_role: event.target.value }))}
                  className={adminInput}
                  disabled={values.role !== "admin"}
                >
                  <option value="">Not assigned</option>
                  {ADMIN_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Super Admin: full access · Administrator: content and operations · Finance Manager: donations and
                  finance · Project Manager: projects only.
                </p>
              </div>
              <div>
                <label className={adminLabel} htmlFor="user-status">
                  Account status
                </label>
                <select
                  id="user-status"
                  value={values.account_status}
                  onChange={(event) => setValues((prev) => ({ ...prev, account_status: event.target.value }))}
                  className={adminInput}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button type="button" onClick={() => setEditing(null)} className={adminGhostButton}>
                  Cancel
                </button>
                <button type="button" onClick={save} disabled={saving} className={adminButton}>
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                  Save access
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}