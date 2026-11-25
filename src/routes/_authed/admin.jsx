import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAuth } from "@/lib/AuthContext";
import { getAdminSession } from "@/lib/admin-access-fns";

export const Route = createFileRoute("/_authed/admin")({
  component: AdminLayout,
});

// The administrator area. Access is confirmed by the server on every visit (not
// from the cached session), so a deactivated administrator is locked out of every
// admin page the moment the Super Admin deactivates them.
function AdminLayout() {
  const { user, isLoadingAuth, logout } = useAuth();
  const [session, setSession] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    setFailed(false);
    getAdminSession()
      .then((value) => {
        if (!cancelled) setSession(value);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isLoadingAuth || !user || (!session && !failed)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Checking your access</span>
      </div>
    );
  }

  if (failed || !session?.isAdmin) {
    const unknown = failed && !session;
    const deactivated = session?.reason === "deactivated";
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist px-5">
        <div className="w-full max-w-md rounded-sm border border-border bg-white p-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-[22px]">
            {unknown
              ? "We could not confirm your access"
              : deactivated
                ? "Your administrator access is deactivated"
                : "Administrator access required"}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            {unknown
              ? "The access check did not complete. Please reload the page to try again."
              : deactivated
                ? "This administrator account has been deactivated by the Super Admin, so the dashboard is closed to it. Contact the Super Admin if you believe this is a mistake."
                : "This dashboard is limited to authorized administrators of the foundation. Your account does not have administrator permissions."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="rounded-sm bg-primary px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-foreground"
            >
              Back to website
            </Link>
            <Link
              to="/dashboard"
              className="rounded-sm border border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground hover:border-primary hover:text-primary"
            >
              My donor dashboard
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-sm border border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground hover:border-primary hover:text-primary"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell user={user} adminRole={session.admin_role} />;
}