import { createFileRoute } from "@tanstack/react-router";
import LegalLayout from "@/components/site/LegalLayout";

export const Route = createFileRoute("/_site/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content: "How GPHF handles donation refunds, duplicate payments and cancelled recurring gifts.",
      },
    ],
  }),
  component: () => <LegalLayout slug="refund-policy" />,
});