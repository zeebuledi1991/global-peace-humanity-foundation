import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { safeReturnTo } from "@/lib/authReturnTo";

export const Route = createFileRoute("/post-login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in — GPHF" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PostLogin,
});

// The single place that decides where a signed-in person belongs, using the role
// the server reports for the session: administrators to the admin dashboard,
// donors to their portal. Social and two-factor sign-ins come back here too.
function PostLogin() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      if (cancelled) return;
      if (!me) {
        window.location.href = "/login";
        return;
      }
      const returnTo = safeReturnTo();
      const destination =
        me.role === "admin"
          ? returnTo.startsWith("/admin")
            ? returnTo
            : "/admin/dashboard"
          : returnTo && returnTo !== "/"
            ? returnTo
            : "/dashboard";
      window.location.href = destination;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist">
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">Signing you in</span>
    </div>
  );
}