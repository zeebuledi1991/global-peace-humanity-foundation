import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Check, Heart, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
import CTABand from "@/components/site/CTABand";
import { formatCurrency, formatDate } from "@/lib/format";
import { getProjectById } from "@/lib/content-fns";

const STATUS_LABELS = { ongoing: "Ongoing", completed: "Completed", upcoming: "Upcoming" };

export const Route = createFileRoute("/_site/projects/$projectId")({
  loader: ({ params }) => getProjectById({ data: { id: params.projectId } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title ? `${loaderData.title} — GPHF Projects` : "Project — GPHF",
      },
      {
        name: "description",
        content: loaderData?.summary || "Project details from Global Peace & Humanity Foundation.",
      },
    ],
  }),
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const project = Route.useLoaderData();

  if (!project) {
    return (
      <div className="shell py-24 text-center">
        <h1 className="text-[28px]">Project not found</h1>
        <p className="mt-3 text-[15px] text-muted-foreground">
          This project may have been completed or is not published yet.
        </p>
        <Link
          to="/projects"
          className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All projects
        </Link>
      </div>
    );
  }

  const goal = Number(project.goal_amount) || 0;
  const raised = Number(project.raised_amount) || 0;
  const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const progress = Number(project.progress_percent) || 0;

  return (
    <>
      <section className="border-b border-border bg-mist">
        <div className="shell py-10 sm:py-14">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            All projects
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-sm bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              {STATUS_LABELS[project.status] || project.status}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {project.location}
            </span>
            {project.start_date && (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Started {formatDate(project.start_date)}
              </span>
            )}
          </div>

          <h1 className="mt-4 max-w-3xl text-balance text-[clamp(2rem,4vw,3.1rem)] leading-[1.05]">
            {project.title}
          </h1>
          <p className="mt-4 max-w-[62ch] text-[16px] leading-[1.75] text-muted-foreground">
            {project.summary}
          </p>
        </div>
      </section>

      <section className="bg-background py-14 sm:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div>
            {project.image_url && (
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
                <Image
                  src={project.image_url}
                  alt={project.image_alt || project.title}
                  className="h-full w-full"
                />
              </div>
            )}

            <h2 className="mt-10 text-[24px]">About this project</h2>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-[1.85] text-muted-foreground">
              {project.description}
            </p>

            {(project.objectives || []).length > 0 && (
              <>
                <h2 className="mt-10 text-[24px]">Objectives</h2>
                <ul className="mt-4 space-y-3">
                  {project.objectives.map((objective) => (
                    <li
                      key={objective}
                      className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-sm border border-border bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Funding
              </p>
              {goal > 0 ? (
                <>
                  <p className="mt-3 font-heading text-[32px] leading-none text-foreground">
                    {formatCurrency(raised, project.currency || "USD")}
                  </p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    raised of {formatCurrency(goal, project.currency || "USD")} goal
                  </p>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {raised > 0
                      ? `${percent}% funded by verified donations`
                      : "Awaiting the first verified donation"}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                  A funding goal for this project has not been published yet.
                </p>
              )}

              <div className="mt-6 border-t border-border pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Project progress
                </p>
                {progress > 0 ? (
                  <>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-navy transition-all duration-700"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[12px] text-muted-foreground">{progress}% complete</p>
                  </>
                ) : (
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    Progress will be published once field verification is complete.
                  </p>
                )}
              </div>

              <Link
                to="/donate"
                search={{ project: project.id }}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-foreground"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                Support this project
              </Link>

              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                Donations are recorded with a reference and verified before a receipt is issued.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <CTABand
        eyebrow="Project support"
        title="Fund the next phase of this work."
        description="One-time and monthly giving are both welcome, and every gift is recorded against this project."
        primary={{ to: "/donate", label: "Donate to this project" }}
        secondary={{ to: "/partner", label: "Sponsor a project" }}
      />
    </>
  );
}