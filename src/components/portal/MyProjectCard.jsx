import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
import { StatusBadge } from "@/components/admin/adminUi";
import { formatCurrency, formatDate } from "@/lib/format";

export default function MyProjectCard({ project }) {
  const supported = Number(project.my_total) > 0;
  const progress = Math.min(100, Math.max(0, Number(project.progress_percent) || 0));
  const gallery = (project.gallery || []).slice(0, 3);

  return (
    <article className="overflow-hidden rounded-sm border border-border bg-white">
      <div className="flex flex-col lg:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-secondary lg:aspect-auto lg:w-[280px]">
          <Image
            src={project.image_url}
            alt={project.image_alt || project.title}
            className="h-full w-full"
          />
          <span className="absolute left-3 top-3">
            <StatusBadge status={project.status} />
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[19px] leading-snug text-foreground">{project.title}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                {project.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    {project.location}
                  </span>
                )}
                {project.category && <span>{project.category}</span>}
              </p>
            </div>
            {project.currency && (
              <p className="text-right">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {supported ? "You gave" : "Goal"}
                </span>
                <span className="block text-[15px] font-semibold text-primary">
                  {supported
                    ? formatCurrency(project.my_total, project.my_currency || project.currency)
                    : formatCurrency(project.goal_amount, project.currency)}
                </span>
              </p>
            )}
          </div>

          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {project.description || project.summary}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Date joined</p>
              <p className="mt-1 text-[12.5px] text-foreground">{formatDate(project.joined_date) || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Your donations</p>
              <p className="mt-1 text-[12.5px] text-foreground">{project.my_donation_count || 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Expected completion</p>
              <p className="mt-1 text-[12.5px] text-foreground">{formatDate(project.end_date) || "To be confirmed"}</p>
            </div>
          </div>

          {progress > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                <span>Project progress</span>
                <span className="text-foreground">{progress}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {project.updates?.length > 0 && (
            <div className="mt-4 rounded-sm bg-mist p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Latest updates</p>
              <ul className="mt-2 space-y-1.5">
                {project.updates.map((update) => (
                  <li key={update.id} className="flex items-start gap-2 text-[12px] text-foreground/80">
                    <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="font-medium text-foreground">{update.title}</span>
                      <span className="text-muted-foreground"> · {formatDate(update.created_date)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {gallery.length > 0 && (
            <div className="mt-3 flex gap-2">
              {gallery.map((url) => (
                <Image
                  key={url}
                  src={url}
                  alt={`${project.title} gallery image`}
                  className="h-14 w-20 rounded-sm object-cover"
                />
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              View project details
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            {!supported && (
              <Link
                to="/donate"
                search={{ project: project.id }}
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-foreground"
              >
                Support this project
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}