import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import ProgramCard from "@/components/site/ProgramCard";
import Reveal from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";

export default function ProgramsSection({ programs = [] }) {
  return (
    <section className="bg-mist py-20 sm:py-28">
      <div className="shell">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Humanitarian focus areas"
            title="Nine areas of work, one purpose."
            description="Each programme is designed to meet a specific need — and to reinforce the others, because a child cannot learn on an empty stomach or without clean water."
          />
          <Link
            to="/programs"
            className="inline-flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-foreground"
          >
            All programmes
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, index) => (
            <Reveal key={program.slug} delay={(index % 3) * 0.06}>
              <ProgramCard program={program} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}