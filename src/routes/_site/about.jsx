import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, HeartHandshake, ShieldCheck } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import SectionHeading from "@/components/site/SectionHeading";
import Reveal from "@/components/site/Reveal";
import CTABand from "@/components/site/CTABand";

const ABOUT_IMAGE =
  "https://media.base44.com/images/public/6b05c6dfcc821afc5baa03e2/90fec5628c4d5fa9d809caa58b3cd330_generated_7a420e36.png";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About Us — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "Learn who Global Peace & Humanity Foundation is, how we work with communities in Pakistan and worldwide, and the principles that guide our humanitarian work.",
      },
    ],
  }),
  component: AboutPage,
});

const PILLARS = [
  {
    icon: HeartHandshake,
    title: "Working with communities",
    text: "Programmes begin with conversations with local representatives, so support fits the place it serves and can be maintained locally.",
  },
  {
    icon: ShieldCheck,
    title: "Safeguarding first",
    text: "Child protection and the dignity of every person we meet guide recruitment, field work, photography and partnerships.",
  },
  {
    icon: BookOpen,
    title: "Learning openly",
    text: "We publish what we can verify, and we say plainly when figures are still pending rather than filling the gap with estimates.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About the foundation"
        title="A humanitarian foundation rooted in service."
        description="Global Peace & Humanity Foundation (GPHF) is registered in Pakistan and works for peace, dignity and sustainable development — supporting communities at home and working with partners internationally."
        image={ABOUT_IMAGE}
        imageAlt="Village elders and young people meeting together under a tree"
      />

      <section className="bg-background py-20 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <SectionHeading
            eyebrow="Our story"
            title="Founded on a simple conviction."
            description="That compassion should be practical — and that humanitarian work should leave a community stronger than it found it."
          />
          <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
            <p>
              The foundation was established to bring together people who wanted to respond to
              hardship with something more durable than one-off assistance: structured programmes,
              local partnerships and accountable stewardship of every donation.
            </p>
            <p>
              Our work spans education, healthcare, food security, clean water, livelihoods, child
              welfare, emergency relief and peacebuilding. These are not separate projects to us —
              they are the same commitment seen from different angles.
            </p>
            <p>
              We are deliberately careful about what we claim. Verified registration details,
              financial reports and programme results are published in our transparency section as
              they are approved. Until then, our pages describe what we do and how, not figures we
              cannot yet stand behind.
            </p>
            <Link
              to="/financial-transparency"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-foreground"
            >
              Financial transparency
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-mist py-20 sm:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="How we work"
            title="Three commitments that shape every programme."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PILLARS.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 0.07}>
                <div className="h-full rounded-sm border border-border bg-white p-8">
                  <pillar.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-5 text-[18px] font-semibold text-foreground">{pillar.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{pillar.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading eyebrow="Where we work" title="Pakistan, and with partners worldwide." />
            <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
              Our programmes are delivered in Pakistan, where the foundation is registered. We accept
              donations from donors in any country and welcome partnerships with organizations that
              share our standards of safeguarding and accountability.
            </p>
            <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
              <div className="bg-white p-6">
                <p className="font-heading text-3xl text-foreground">Pakistan</p>
                <p className="mt-2 text-[13px] text-muted-foreground">Registered and operating</p>
              </div>
              <div className="bg-white p-6">
                <p className="font-heading text-3xl text-foreground">Worldwide</p>
                <p className="mt-2 text-[13px] text-muted-foreground">Donors and partners</p>
              </div>
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="Governance" title="Accountable stewardship." />
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                The foundation is governed by a leadership team responsible for programme delivery,
                financial oversight and safeguarding. Named board members and their biographies will
                be published here once confirmed for publication.
              </p>
              <p>
                Registration details and certificates are published in the transparency section when
                approved. Donations are recorded individually with a reference, verified before a
                receipt is issued, and reported in our annual and project reports.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/mission-vision"
                className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Mission &amp; vision
              </Link>
              <Link
                to="/safeguarding"
                className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Safeguarding policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTABand
        title="Partner with a foundation that shows its work."
        description="Whether you give, volunteer or collaborate, you can follow exactly what happens next."
      />
    </>
  );
}