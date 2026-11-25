import { createFileRoute } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";
import { useAuth } from "@/lib/AuthContext";

export const Route = createFileRoute("/_authed/portal")({
  component: PortalLayout,
});

function PortalLayout() {
  const { user, isLoadingAuth, logout } = useAuth();

  if (isLoadingAuth || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Opening your portal</span>
      </div>
    );
  }

  if (user.account_status === "suspended") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist px-5">
        <div className="w-full max-w-md rounded-sm border border-border bg-white p-8 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-[22px]">Your account is suspended</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Access to your donor portal has been paused. Please contact support@gphf.pk so our team can
            review your account.
          </p>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-6 rounded-sm bg-primary px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <PortalShell user={user} />;
}