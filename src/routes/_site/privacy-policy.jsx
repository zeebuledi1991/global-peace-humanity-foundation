import { createFileRoute } from "@tanstack/react-router";
import LegalLayout from "@/components/site/LegalLayout";

export const Route = createFileRoute("/_site/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "How Global Peace & Humanity Foundation collects, uses and protects your personal information.",
      },
    ],
  }),
  component: () => <LegalLayout slug="privacy-policy" />,
});