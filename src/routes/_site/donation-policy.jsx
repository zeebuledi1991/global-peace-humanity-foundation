import { createFileRoute } from "@tanstack/react-router";
import LegalLayout from "@/components/site/LegalLayout";

export const Route = createFileRoute("/_site/donation-policy")({
  head: () => ({
    meta: [
      { title: "Donation Policy — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "How donations to GPHF are received, verified, receipted and used, including payment methods and recurring giving.",
      },
    ],
  }),
  component: () => <LegalLayout slug="donation-policy" />,
});