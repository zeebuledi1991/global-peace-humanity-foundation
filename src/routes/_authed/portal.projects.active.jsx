import { createFileRoute } from "@tanstack/react-router";
import PortalProjectsPage from "@/components/portal/PortalProjectsPage";

export const Route = createFileRoute("/_authed/portal/projects/active")({
  component: () => <PortalProjectsPage category="active" />,
});