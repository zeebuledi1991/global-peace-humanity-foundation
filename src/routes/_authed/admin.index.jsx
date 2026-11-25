import { createFileRoute, redirect } from "@tanstack/react-router";

// The administrator dashboard lives at /admin/dashboard; this keeps the older
// /admin address working for existing bookmarks.
export const Route = createFileRoute("/_authed/admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Admin dashboard — GPHF" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});