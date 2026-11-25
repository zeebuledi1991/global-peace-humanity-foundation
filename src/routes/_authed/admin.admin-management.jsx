import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { AdminHeader, Panel } from "@/components/admin/adminUi";
import AddAdminForm from "@/components/admin/AddAdminForm";
import AdminTable from "@/components/admin/AdminTable";
import { getAdminSession, listAdministrators } from "@/lib/admin-access-fns";

export const Route = createFileRoute("/_authed/admin/admin-management")({
  component: AdminManagementPage,
});

function AdminManagementPage() {
  const [session, setSession] = useState(null);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = () => {
    setError("");
    listAdministrators()
      .then(setRows)
      .catch((err) => setError(err?.message || "We could not load the administrator list."));
  };

  useEffect(() => {
    getAdminSession()
      .then((value) => {
        setSession(value);
        if (value.isAdmin && value.admin_role === "super_admin") load();
      })
      .catch(() => setSession({ isAdmin: false, reason: "error" }));
  }, []);

  if (!session) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Checking your access
      </div>
    );
  }

  if (!session.isAdmin || session.admin_role !== "super_admin") {
    return (
      <div className="mx-auto max-w-md rounded-sm border border-border bg-white p-8 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
        <h1 className="mt-4 text-[22px]">Super Admin access required</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          Administrator accounts can only be viewed and managed by the foundation's Super Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Admin Management"
        description="Create administrator accounts, assign roles, deactivate access and send password resets. Every action here is written to the audit log."
      />

      {notice && (
        <p className="rounded-sm border border-primary/30 bg-primary/5 px-4 py-3 text-[12.5px] text-primary">{notice}</p>
      )}
      {error && (
        <p className="rounded-sm border border-destructive/30 bg-white px-4 py-3 text-[12.5px] text-destructive">
          {error}
        </p>
      )}

      <AddAdminForm
        onCreated={() => {
          setNotice("Invitation sent. The new administrator sets their own password from the email.");
          load();
        }}
      />

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">
            Administrators
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {rows ? `${rows.length} account${rows.length === 1 ? "" : "s"}` : "Loading"}
          </p>
        </div>
        <AdminTable
          rows={rows}
          loading={!rows && !error}
          currentUserId={session.user_id}
          onChanged={load}
          onNotice={setNotice}
        />
      </Panel>
    </div>
  );
}