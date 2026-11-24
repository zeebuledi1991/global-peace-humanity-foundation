import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  ongoing: "bg-primary/10 text-primary",
  completed: "bg-navy/10 text-navy",
  upcoming: "bg-gold/15 text-[#7a5c10]",
};

const STATUS_LABELS = {
  ongoing: "Ongoing",
  completed: "Completed",
  upcoming: "Upcoming",
};

export default function ProjectCard({ project }) {
  const hasProgress = Number(project.progress_percent) > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card transition-all duration-300 hover:shadow-[0_22px_50px_-30px_rgba(23,52,81,0.45)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={project.image_url}
          alt={project.image_alt || project.title}
          className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
        <span
          className={cn(
            "absolute left-4 top-4 rounded-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
            STATUS_STYLES[project.status] || "bg-white text-foreground"
          )}
        >
          {STATUS_LABELS[project.status] || project.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {project.location}
        </p>
        <h3 className="mt-2 text-[20px] leading-snug text-foreground">{project.title}</h3>
        <p className="mt-2.5 line-clamp-2 flex-1 text-[14px] leading-relaxed text-muted-foreground">
          {project.summary}
        </p>

        <div className="mt-5">
          {hasProgress ? (
            <>
              <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                <span>Progress</span>
                <span className="text-foreground">{project.progress_percent}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${Math.min(100, Number(project.progress_percent) || 0)}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Progress update pending field verification
            </p>
          )}

          {Number(project.goal_amount) > 0 && (
            <p className="mt-3 text-[12px] text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatCurrency(project.raised_amount || 0, project.currency || "USD")}
              </span>{" "}
              raised of {formatCurrency(project.goal_amount, project.currency || "USD")}
            </p>
          )}
        </div>

        <Link
          to="/projects/$projectId"
          params={{ projectId: project.id }}
          className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-foreground"
        >
          View project
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}