import { createFileRoute } from "@tanstack/react-router";
import PortalProjectsPage from "@/components/portal/PortalProjectsPage";

export const Route = createFileRoute("/_authed/portal/projects/completed")({
  component: () => <PortalProjectsPage category="completed" />,
});