import { createFileRoute, redirect } from "@tanstack/react-router";

// The signed-in donor dashboard address. The donor portal already is the
// dashboard, so this stable URL opens it.
export const Route = createFileRoute("/_authed/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/portal" });
  },
  head: () => ({
    meta: [
      { title: "My dashboard — GPHF" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});