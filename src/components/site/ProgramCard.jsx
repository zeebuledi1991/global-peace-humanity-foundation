import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import ProgramIcon from "@/components/site/ProgramIcon";

export default function ProgramCard({ program }) {
  return (
    <Link
      to="/programs/$slug"
      params={{ slug: program.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-[0_22px_50px_-30px_rgba(23,52,81,0.45)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={program.image_url}
          alt={program.image_alt || program.title}
          className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/35" aria-hidden="true" />
        <span className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-white/95 text-primary shadow-sm">
          <ProgramIcon name={program.icon} className="h-4 w-4" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-[19px] leading-snug text-foreground">{program.title}</h3>
        <p className="mt-2.5 line-clamp-3 flex-1 text-[14px] leading-relaxed text-muted-foreground">
          {program.summary}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Learn more
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}