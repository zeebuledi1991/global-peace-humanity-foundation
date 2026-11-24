import { createFileRoute } from "@tanstack/react-router";
import LegalLayout from "@/components/site/LegalLayout";

export const Route = createFileRoute("/_site/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Statement — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content: "How GPHF makes this website usable for everyone, and how to report an accessibility barrier.",
      },
    ],
  }),
  component: () => <LegalLayout slug="accessibility" />,
});