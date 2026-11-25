import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { FolderKanban, Loader2 } from "lucide-react";
import MyProjectCard from "@/components/portal/MyProjectCard";
import { getPortalProjects } from "@/lib/portal-fns";

const COPY = {
  all: {
    title: "My Projects",
    description:
      "Projects you support through verified donations. Each gift is tracked separately so you can follow its progress.",
    empty: "You have not supported a project yet. Explore our projects and make your first gift.",
  },
  active: {
    title: "Active Projects",
    description: "Projects you support that are currently running in the field.",
    empty: "None of your supported projects are active right now.",
  },
  completed: {
    title: "Completed Projects",
    description: "Projects you supported that the GPHF team has officially marked completed.",
    empty: "You have no completed projects yet. We will notify you when one closes.",
  },
  upcoming: {
    title: "Upcoming Projects",
    description: "Projects opening soon that you can support before fieldwork begins.",
    empty: "No upcoming projects are published right now.",
  },
};

export default function PortalProjectsPage({ category = "all" }) {
  const [projects, setProjects] = useState(null);
  const copy = COPY[category] || COPY.all;

  useEffect(() => {
    let cancelled = false;
    setProjects(null);
    getPortalProjects({ data: { category } }).then((result) => {
      if (!cancelled) setProjects(result.projects);
    });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[26px] leading-tight text-foreground">{copy.title}</h1>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{copy.description}</p>
        </div>
        <Link
          to="/projects"
          className="shrink-0 rounded-sm border border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Browse all GPHF projects
        </Link>
      </div>

      {!projects ? (
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading your projects
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-sm border border-border bg-white px-6 py-14 text-center">
          <FolderKanban className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-muted-foreground">{copy.empty}</p>
          <Link
            to="/projects"
            className="mt-5 inline-flex rounded-sm bg-primary px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
          >
            Explore projects
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {projects.map((project) => (
            <MyProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}