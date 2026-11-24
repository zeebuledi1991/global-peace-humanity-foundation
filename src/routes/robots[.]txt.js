import { createFileRoute } from "@tanstack/react-router";

const BODY = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /donation-confirmation

Sitemap: https://gphf.pk/sitemap.xml
`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(BODY, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, s-maxage=3600",
          },
        }),
    },
  },
});