import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { formatDate } from "@/lib/format";

export default function StoryCard({ story }) {
  return (
    <Link
      to="/news/$slug"
      params={{ slug: story.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card transition-all duration-300 hover:shadow-[0_22px_50px_-30px_rgba(23,52,81,0.45)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={story.image_url}
          alt={story.image_alt || story.title}
          className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="text-primary">{story.category}</span>
          <span className="h-px w-4 bg-border" aria-hidden="true" />
          <time dateTime={story.published_date}>{formatDate(story.published_date)}</time>
        </div>
        <h3 className="mt-3 text-[19px] leading-snug text-foreground">{story.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[14px] leading-relaxed text-muted-foreground">
          {story.excerpt}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Read story
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}