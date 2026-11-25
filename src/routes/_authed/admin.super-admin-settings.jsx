import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { AdminHeader, Panel } from "@/components/admin/adminUi";
import PasswordForm from "@/components/admin/PasswordForm";
import { getAdminSession } from "@/lib/admin-access-fns";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authed/admin/super-admin-settings")({
  component: SuperAdminSettingsPage,
});

function SuperAdminSettingsPage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    getAdminSession()
      .then(setSession)
      .catch(() => setSession({ isAdmin: false }));
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
          These account settings belong to the foundation's Super Admin. No other administrator can open or
          change them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Super Admin account settings"
        description="Your sign-in identity, password and account security. Only you can change these — no other administrator can edit them."
      />

      <Panel>
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">Account</h2>
        </div>
        <dl className="grid gap-4 p-4 sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Name</dt>
            <dd className="mt-1 text-[13px] font-medium text-foreground">{session.name}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sign-in email</dt>
            <dd className="mt-1 break-all text-[13px] font-medium text-foreground">{session.email}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Role</dt>
            <dd className="mt-1 text-[13px] font-medium text-foreground">Super Admin</dd>
          </div>
        </dl>
        <div className="border-t border-border px-4 py-3">
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            The sign-in email is the address this account authenticates with, and it is owned by the platform
            account rather than by the website. The app cannot edit or re-verify it, so changing it is done from
            the platform account itself; contact support if you need that address updated. Last recorded
            sign-in: {session.last_login_at ? formatDateTime(session.last_login_at) : "no sign-in recorded yet"}.
          </p>
        </div>
      </Panel>

      <PasswordForm userId={session.user_id} />

      <Panel>
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">Two-factor authentication</h2>
        </div>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
            Add an authenticator app or text message as a second step at sign-in. We strongly recommend it for
            the account that manages donations, payments and administrator access.
          </p>
          <Link
            to="/mfa"
            className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-foreground"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Manage two-factor
          </Link>
        </div>
      </Panel>

      <Panel>
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">Security protections</h2>
        </div>
        <ul className="divide-y divide-border text-[12.5px] text-muted-foreground">
          <li className="px-4 py-3">
            Passwords are verified and stored (hashed) by the platform's authentication service. This website
            never sees or stores a password.
          </li>
          <li className="px-4 py-3">
            Repeated failed sign-ins are throttled: five failed attempts lock that address for fifteen minutes,
            on top of the platform's own rate limiting.
          </li>
          <li className="px-4 py-3">
            Administrator roles are re-checked on the server for every dashboard page and every data request, so
            a deactivated account loses access immediately.
          </li>
          <li className="px-4 py-3">
            You receive an email and an in-app notice whenever your password changes.
          </li>
        </ul>
      </Panel>
    </div>
  );
}