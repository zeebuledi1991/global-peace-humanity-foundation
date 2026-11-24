import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import ProjectCard from "@/components/site/ProjectCard";
import Reveal from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";

export default function ProjectsSection({ projects = [] }) {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="shell">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Featured projects"
            title="Work you can follow, step by step."
            description="Each project page shows its objectives, location and verified progress, so supporters can see exactly what their giving supports."
          />
          <Link
            to="/projects"
            className="inline-flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-foreground"
          >
            All projects
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.07}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}