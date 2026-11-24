import { createFileRoute, Link } from "@tanstack/react-router";
import PageHero from "@/components/site/PageHero";
import StoryCard from "@/components/site/StoryCard";
import Reveal from "@/components/site/Reveal";
import NewsletterSection from "@/components/home/NewsletterSection";
import { getNewsPosts } from "@/lib/content-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/news/")({
  validateSearch: (search) => ({
    category: search.category ? String(search.category) : undefined,
  }),
  loader: () => getNewsPosts(),
  head: () => ({
    meta: [
      { title: "News & Stories — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "Announcements, field updates, project news and perspectives from Global Peace & Humanity Foundation.",
      },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const posts = Route.useLoaderData() || [];
  const { category } = Route.useSearch();
  const categories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean)));
  const filtered = category ? posts.filter((post) => post.category === category) : posts;

  return (
    <>
      <PageHero
        eyebrow="News & stories"
        title="Updates from the field and the office."
        description="Announcements, project updates and perspectives on humanitarian work. We publish what we can verify, when we can verify it."
      />

      <section className="bg-background py-14 sm:py-20">
        <div className="shell">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link
                to="/news"
                search={{}}
                className={cn(
                  "rounded-sm border px-4 py-2.5 text-[12px] font-medium transition-colors",
                  !category
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-foreground/75 hover:border-primary hover:text-primary"
                )}
              >
                All
              </Link>
              {categories.map((item) => (
                <Link
                  key={item}
                  to="/news"
                  search={{ category: item }}
                  className={cn(
                    "rounded-sm border px-4 py-2.5 text-[12px] font-medium transition-colors",
                    category === item
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground/75 hover:border-primary hover:text-primary"
                  )}
                >
                  {item}
                </Link>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="mt-8 rounded-sm border border-border bg-white p-8 text-center text-[15px] text-muted-foreground">
              No stories are published in this category yet.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post, index) => (
                <Reveal key={post.id} delay={(index % 3) * 0.06}>
                  <StoryCard story={post} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}