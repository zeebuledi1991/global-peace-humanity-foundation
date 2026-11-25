import { createFileRoute, Link } from "@tanstack/react-router";
import PageHero from "@/components/site/PageHero";
import ProjectCard from "@/components/site/ProjectCard";
import Reveal from "@/components/site/Reveal";
import CTABand from "@/components/site/CTABand";
import { getProjects } from "@/lib/content-fns";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "", label: "All projects" },
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

export const Route = createFileRoute("/_site/projects/")({
  validateSearch: (search) => ({
    status: search.status ? String(search.status) : undefined,
  }),
  loader: () => getProjects(),
  head: () => ({
    meta: [
      { title: "Our Projects — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "Browse GPHF projects: ongoing, upcoming and completed humanitarian work with locations, objectives and verified progress.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const projects = Route.useLoaderData() || [];
  const { status } = Route.useSearch();
  const active = status || "";
  const filtered = active ? projects.filter((project) => project.status === active) : projects;

  return (
    <>
      <PageHero
        eyebrow="Our projects"
        title="Work you can follow, step by step."
        description="Every project shows its location, objectives and progress. Progress figures are published only after field verification, so a project without a figure is one we have not yet been able to confirm."
      />

      <section className="bg-background py-14 sm:py-20">
        <div className="shell">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <Link
                key={filter.label}
                to="/projects"
                search={filter.value ? { status: filter.value } : {}}
                className={cn(
                  "rounded-sm border px-4 py-2.5 text-[12px] font-medium transition-colors",
                  active === filter.value
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-foreground/75 hover:border-primary hover:text-primary"
                )}
              >
                {filter.label}
              </Link>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="mt-8 rounded-sm border border-border bg-white p-8 text-center text-[15px] text-muted-foreground">
              No projects are published in this category yet.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project, index) => (
                <Reveal key={project.id} delay={(index % 3) * 0.06}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTABand
        eyebrow="Fund a project"
        title="Every project has a gap only donors can close."
        description="Choose a project, or let us direct your gift to where it is needed most."
      />
    </>
  );
}