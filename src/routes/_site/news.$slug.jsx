import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Image } from "@/components/ui/image";
import NewsletterSection from "@/components/home/NewsletterSection";
import { formatDate } from "@/lib/format";
import { getNewsPostBySlug, getNewsPosts } from "@/lib/content-fns";

export const Route = createFileRoute("/_site/news/$slug")({
  loader: async ({ params }) => {
    const [post, posts] = await Promise.all([
      getNewsPostBySlug({ data: { slug: params.slug } }),
      getNewsPosts(),
    ]);
    return { post, posts };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.post ? `${loaderData.post.title} — GPHF` : "Story — Global Peace & Humanity Foundation",
      },
      {
        name: "description",
        content: loaderData?.post?.excerpt || "News and stories from Global Peace & Humanity Foundation.",
      },
      ...(loaderData?.post?.image_url
        ? [{ property: "og:image", content: loaderData.post.image_url }]
        : []),
    ],
  }),
  component: NewsDetailPage,
});

function NewsDetailPage() {
  const { post, posts } = Route.useLoaderData();

  if (!post) {
    return (
      <div className="shell py-24 text-center">
        <h1 className="text-[28px]">Story not found</h1>
        <p className="mt-3 text-[15px] text-muted-foreground">
          This story may have been unpublished or moved.
        </p>
        <Link
          to="/news"
          className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All stories
        </Link>
      </div>
    );
  }

  const more = (posts || []).filter((item) => item.slug !== post.slug).slice(0, 3);
  const paragraphs = String(post.content || "").split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <article>
        <div className="border-b border-border bg-mist">
          <div className="shell max-w-3xl py-12 sm:py-16">
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              All stories
            </Link>
            <div className="mt-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="text-primary">{post.category}</span>
              <span className="h-px w-4 bg-border" aria-hidden="true" />
              <time dateTime={post.published_date}>{formatDate(post.published_date)}</time>
            </div>
            <h1 className="mt-4 text-balance text-[clamp(2rem,4vw,3rem)] leading-[1.06]">{post.title}</h1>
            {post.excerpt && (
              <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">{post.excerpt}</p>
            )}
            {post.author && (
              <p className="mt-5 text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                By {post.author}
              </p>
            )}
          </div>
        </div>

        <div className="bg-background py-12 sm:py-16">
          <div className="shell max-w-3xl">
            {post.image_url && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
                <Image
                  src={post.image_url}
                  alt={post.image_alt || post.title}
                  className="h-full w-full"
                />
              </div>
            )}
            <div className="mt-9 space-y-5">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 50)} className="text-[16px] leading-[1.85] text-foreground/80">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-12 rounded-sm border border-border bg-mist p-6">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Stories describe our approach and published work. Verified figures are reported in our{" "}
                <Link to="/financial-transparency" className="text-primary hover:underline">
                  transparency section
                </Link>{" "}
                as they are approved.
              </p>
            </div>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t border-border bg-white py-14 sm:py-16">
          <div className="shell">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              More stories
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {more.map((item) => (
                <Link
                  key={item.id}
                  to="/news/$slug"
                  params={{ slug: item.slug }}
                  className="group rounded-sm border border-border p-5 transition-colors hover:border-primary/40"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {item.category}
                  </p>
                  <h3 className="mt-2 text-[17px] leading-snug text-foreground group-hover:text-primary">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <NewsletterSection />
    </>
  );
}