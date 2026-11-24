import { createFileRoute } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAuth } from "@/lib/AuthContext";

export const Route = createFileRoute("/_authed/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isLoadingAuth, logout } = useAuth();

  if (isLoadingAuth || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Checking your access</span>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist px-5">
        <div className="w-full max-w-md rounded-sm border border-border bg-white p-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-[22px]">Administrator access required</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            This dashboard is limited to authorized administrators of the foundation. Your account does
            not have administrator permissions.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/"
              className="rounded-sm bg-primary px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-foreground"
            >
              Back to website
            </a>
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

  return <AdminShell user={user} />;
}