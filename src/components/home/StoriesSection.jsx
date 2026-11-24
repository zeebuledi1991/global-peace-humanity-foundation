import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import StoryCard from "@/components/site/StoryCard";
import Reveal from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";

export default function StoriesSection({ stories = [] }) {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="shell">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="News & stories"
            title="Updates from the field and the office."
            description="Announcements, programme updates and perspectives on humanitarian work."
          />
          <Link
            to="/news"
            className="inline-flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-foreground"
          >
            All stories
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, index) => (
            <Reveal key={story.slug} delay={index * 0.07}>
              <StoryCard story={story} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}