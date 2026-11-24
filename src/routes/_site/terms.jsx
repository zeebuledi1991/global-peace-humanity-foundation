import { createFileRoute } from "@tanstack/react-router";
import LegalLayout from "@/components/site/LegalLayout";

export const Route = createFileRoute("/_site/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content: "Terms of use for the Global Peace & Humanity Foundation website.",
      },
    ],
  }),
  component: () => <LegalLayout slug="terms" />,
});