import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Heart } from "lucide-react";
import { Image } from "@/components/ui/image";
import ProgramIcon from "@/components/site/ProgramIcon";
import ProjectCard from "@/components/site/ProjectCard";
import CTABand from "@/components/site/CTABand";
import { getProgramBySlug, getPrograms, getProjects } from "@/lib/content-fns";

export const Route = createFileRoute("/_site/programs/$slug")({
  loader: async ({ params }) => {
    const [program, projects, programs] = await Promise.all([
      getProgramBySlug({ data: { slug: params.slug } }),
      getProjects(),
      getPrograms(),
    ]);
    return { program, projects, programs };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.program
          ? `${loaderData.program.title} — GPHF`
          : "Programme — Global Peace & Humanity Foundation",
      },
      {
        name: "description",
        content:
          loaderData?.program?.summary ||
          "Explore Global Peace & Humanity Foundation's humanitarian programmes.",
      },
    ],
  }),
  component: ProgramDetailPage,
});

function ProgramDetailPage() {
  const { program, projects, programs } = Route.useLoaderData();

  if (!program) {
    return (
      <div className="shell py-24 text-center">
        <h1 className="text-[28px]">Programme not found</h1>
        <p className="mt-3 text-[15px] text-muted-foreground">
          This programme may have been renamed or is not published yet.
        </p>
        <Link
          to="/programs"
          className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All programmes
        </Link>
      </div>
    );
  }

  const related = (projects || []).filter((project) => project.program_slug === program.slug);
  const others = (programs || []).filter((item) => item.slug !== program.slug).slice(0, 4);

  return (
    <>
      <section className="border-b border-border bg-mist">
        <div className="shell grid gap-10 py-14 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:py-20">
          <div>
            <Link
              to="/programs"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              All programmes
            </Link>
            <span className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <ProgramIcon name={program.icon} className="h-5 w-5" />
            </span>
            <h1 className="mt-5 text-balance text-[clamp(2rem,4vw,3.1rem)] leading-[1.04]">
              {program.title}
            </h1>
            <p className="mt-5 max-w-[58ch] text-[16px] leading-[1.75] text-muted-foreground">
              {program.summary}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-foreground"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                Support this programme
              </Link>
              <Link
                to="/volunteer"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-border bg-white px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Volunteer with us
              </Link>
            </div>
          </div>
          {program.image_url && (
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm lg:aspect-[4/3]">
              <Image
                src={program.image_url}
                alt={program.image_alt || program.title}
                className="h-full w-full"
              />
            </div>
          )}
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-[24px]">About this programme</h2>
            <p className="mt-4 text-[15px] leading-[1.85] text-muted-foreground">{program.description}</p>
          </div>

          <div className="rounded-sm border border-border bg-white p-7">
            <h2 className="text-[18px] font-semibold text-foreground">What we aim to achieve</h2>
            <ul className="mt-4 space-y-3">
              {(program.objectives || []).map((objective) => (
                <li key={objective} className="flex gap-3 text-[14px] leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-mist py-16 sm:py-20">
        <div className="shell">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-[clamp(1.5rem,2.6vw,2rem)]">Related projects</h2>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary hover:text-foreground"
            >
              All projects
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {related.length === 0 ? (
            <p className="mt-6 rounded-sm border border-border bg-white p-7 text-[14px] leading-relaxed text-muted-foreground">
              No project is currently published under this programme. Projects appear here once their
              details are approved for publication.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {others.length > 0 && (
            <div className="mt-14 border-t border-border pt-8">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Other programmes
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {others.map((item) => (
                  <Link
                    key={item.id}
                    to="/programs/$slug"
                    params={{ slug: item.slug }}
                    className="rounded-sm border border-border bg-white px-3.5 py-2 text-[12px] text-foreground/75 transition-colors hover:border-primary hover:text-primary"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CTABand
        eyebrow="Make it possible"
        title={`Support ${program.title.toLowerCase()}.`}
        description="Give once, give monthly, or sponsor a related project directly."
      />
    </>
  );
}