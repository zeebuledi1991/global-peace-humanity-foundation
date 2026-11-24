import { createFileRoute } from "@tanstack/react-router";

const BASE = "https://gphf.pk";

const STATIC_PATHS = [
  "/",
  "/about",
  "/mission-vision",
  "/programs",
  "/projects",
  "/impact",
  "/donate",
  "/volunteer",
  "/partner",
  "/news",
  "/gallery",
  "/contact",
  "/faq",
  "/financial-transparency",
  "/privacy-policy",
  "/terms",
  "/donation-policy",
  "/refund-policy",
  "/safeguarding",
  "/accessibility",
];

const list = (res) => (Array.isArray(res) ? res : res?.items ?? []);

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const paths = [...STATIC_PATHS];
        try {
          const base44 = context.getBase44();
          const [programs, projects, posts] = await Promise.all([
            base44.entities.Program.filter({ is_published: true }, { limit: 100 }),
            base44.entities.Project.filter({ is_published: true }, { limit: 100 }),
            base44.entities.NewsPost.filter({ is_published: true }, { limit: 100 }),
          ]);
          list(programs).forEach((program) => paths.push(`/programs/${program.slug}`));
          list(projects).forEach((project) => paths.push(`/projects/${project.id}`));
          list(posts).forEach((post) => paths.push(`/news/${post.slug}`));
        } catch (error) {
          // A sitemap with only the static pages is still valid.
        }

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${BASE}${path}</loc></url>`).join("\n")}
</urlset>`;

        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, s-maxage=3600",
          },
        });
      },
    },
  },
});