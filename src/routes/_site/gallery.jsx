import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { Image } from "@/components/ui/image";
import PageHero from "@/components/site/PageHero";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import CTABand from "@/components/site/CTABand";
import { getGalleryItems } from "@/lib/content-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/gallery")({
  loader: () => getGalleryItems(),
  head: () => ({
    meta: [
      { title: "Gallery — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "Photographs and videos from GPHF programmes: education, water, relief, women's empowerment and community work.",
      },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const items = Route.useLoaderData() || [];
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState(null);

  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))];
  const filtered = category === "All" ? items : items.filter((item) => item.category === category);

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Moments from our programmes."
        description="Photographs from the communities and programmes we work with. Images are shared with consent and with respect for the dignity of the people in them."
      />

      <section className="bg-background py-14 sm:py-20">
        <div className="shell">
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={cn(
                    "rounded-sm border px-4 py-2.5 text-[12px] font-medium transition-colors",
                    category === item
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground/75 hover:border-primary hover:text-primary"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="mt-8 rounded-sm border border-border bg-white p-8 text-center text-[15px] text-muted-foreground">
              Photographs will appear here as they are published.
            </p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-sm border border-border bg-secondary text-left"
                  aria-label={`Open ${item.title}`}
                >
                  <Image
                    src={item.image_url}
                    alt={item.caption || item.title}
                    className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/5 to-transparent opacity-80" aria-hidden="true" />
                  {item.media_type === "video" && (
                    <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary">
                      <Play className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                      {item.category}
                    </p>
                    <p className="mt-1 text-[15px] font-medium text-white">{item.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogTitle className="sr-only">{active?.title}</DialogTitle>
          {active && (
            <div>
              <div className="relative aspect-[16/10] bg-secondary">
                {active.media_type === "video" && active.video_url ? (
                  <video src={active.video_url} controls className="h-full w-full" />
                ) : (
                  <Image
                    src={active.image_url}
                    alt={active.caption || active.title}
                    className="h-full w-full"
                  />
                )}
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {active.category}
                </p>
                <p className="mt-2 text-[17px] text-foreground">{active.title}</p>
                {active.caption && (
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{active.caption}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CTABand
        eyebrow="Be part of the next photograph"
        title="Support the work behind these moments."
        description="Every programme in this gallery runs on donations and volunteer time."
      />
    </>
  );
}