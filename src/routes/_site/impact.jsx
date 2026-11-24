import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import SectionHeading from "@/components/site/SectionHeading";
import Reveal from "@/components/site/Reveal";
import CTABand from "@/components/site/CTABand";
import { getPublicStats } from "@/lib/content-fns";

export const Route = createFileRoute("/_site/impact")({
  loader: () => getPublicStats(),
  head: () => ({
    meta: [
      { title: "Our Impact — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "How GPHF measures and reports its humanitarian impact, and why verified figures are published only once confirmed.",
      },
    ],
  }),
  component: ImpactPage,
});

const MEASURES = [
  {
    title: "Reach",
    text: "How many people a programme actually served — counted from attendance and distribution records, not estimates.",
  },
  {
    title: "Delivery",
    text: "Whether the planned activity happened, on time, at the quality we committed to.",
  },
  {
    title: "Change",
    text: "What shifted for participants: school retention, health-seeking behaviour, income stability, access to water.",
  },
  {
    title: "Spending",
    text: "What the programme cost and how it was funded, reported against the original budget.",
  },
];

function ImpactPage() {
  const stats = Route.useLoaderData() || {};

  const figures = [
    { value: String(stats.programs ?? 0), label: "Published programmes" },
    { value: String(stats.projects ?? 0), label: "Projects in our portfolio" },
    { value: String(stats.stories ?? 0), label: "Published updates" },
    { value: String(stats.documents ?? 0), label: "Public reports" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Our impact"
        title="We publish what we can verify — and say so when we can't."
        description="Humanitarian numbers are easy to inflate. We would rather show you a smaller, true figure than an impressive one we cannot stand behind. Verified beneficiary and financial figures appear here as programmes report."
      />

      <section className="bg-primary py-16 text-white sm:py-20">
        <div className="shell grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {figures.map((figure, index) => (
            <Reveal key={figure.label} delay={index * 0.06}>
              <div className="border-white/20 pr-4 lg:border-l lg:pl-6">
                <p className="font-heading text-[clamp(2rem,3.4vw,2.75rem)] leading-none text-white">
                  {figure.value}
                </p>
                <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/85">
                  {figure.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="shell mt-10">
          <p className="max-w-2xl text-[12px] leading-relaxed text-white/55">
            These figures reflect published content on this website. Beneficiary counts, expenditure
            and outcome data are added only after verification by our programme team.
          </p>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="How we measure"
            title="Four questions we ask of every programme."
            description="If a programme cannot answer all four, it is not ready to be reported as a success."
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
            {MEASURES.map((measure) => (
              <div key={measure.title} className="bg-white p-8">
                <h3 className="text-[18px] font-semibold text-foreground">{measure.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{measure.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist py-20 sm:py-24">
        <div className="shell grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Transparency"
              title="Reports are published, not summarised away."
              description="Annual reports, financial reports and project expenditure reports are uploaded to our transparency section as they are approved. Registration documents are published there too."
            />
            <Link
              to="/financial-transparency"
              className="mt-7 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-foreground"
            >
              Visit the transparency section
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="rounded-sm border border-border bg-white p-8">
            <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              We do not publish registration numbers, audit results or beneficiary totals before they
              are verified. When a document is not yet available, the transparency page says so
              plainly rather than showing a placeholder figure.
            </p>
          </div>
        </div>
      </section>

      <CTABand
        eyebrow="Impact needs funding"
        title="Give where the need is greatest."
        description="Undesignated gifts let us respond to the most urgent gap across our programmes."
      />
    </>
  );
}