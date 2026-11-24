import { createFileRoute } from "@tanstack/react-router";
import LegalLayout from "@/components/site/LegalLayout";

export const Route = createFileRoute("/_site/safeguarding")({
  head: () => ({
    meta: [
      { title: "Safeguarding & Child Protection Policy — GPHF" },
      {
        name: "description",
        content:
          "GPHF's safeguarding and child protection commitments, standards of behaviour and how to report a concern.",
      },
    ],
  }),
  component: () => <LegalLayout slug="safeguarding" />,
});