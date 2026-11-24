import { createFileRoute } from "@tanstack/react-router";
import { Building2, Globe2, HeartHandshake, Megaphone } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import PartnerForm from "@/components/forms/PartnerForm";
import Reveal from "@/components/site/Reveal";
import CTABand from "@/components/site/CTABand";

export const Route = createFileRoute("/_site/partner")({
  head: () => ({
    meta: [
      { title: "Become a Partner — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "Corporate partnerships, NGO collaboration, fundraising partnerships and project sponsorship with GPHF in Pakistan and worldwide.",
      },
    ],
  }),
  component: PartnerPage,
});

const TYPES = [
  {
    icon: Building2,
    title: "Corporate partnerships",
    text: "Employee giving, cause campaigns and in-kind support, delivered with clear reporting on what your contribution funded.",
  },
  {
    icon: Globe2,
    title: "NGO collaboration",
    text: "Joint programmes with organizations that share our safeguarding and accountability standards.",
  },
  {
    icon: Megaphone,
    title: "Fundraising partnerships",
    text: "Community fundraisers, events and campaigns run on our behalf with agreed branding and transparency.",
  },
  {
    icon: HeartHandshake,
    title: "Project sponsorship",
    text: "Fund a specific project end to end, with named recognition where appropriate and progress updates.",
  },
];

function PartnerPage() {
  return (
    <>
      <PageHero
        eyebrow="Partner with us"
        title="Build something lasting with us."
        description="We work with companies, NGOs, community groups and individuals who want their support to produce measurable, accountable change. Every partnership begins with a conversation about what you want to achieve."
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="shell">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TYPES.map((type, index) => (
              <Reveal key={type.title} delay={index * 0.06}>
                <div className="h-full rounded-sm border border-border bg-white p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <type.icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 text-[17px] font-semibold text-foreground">{type.title}</h2>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{type.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <div>
              <h2 className="text-[26px] leading-tight">What we ask of partners</h2>
              <ul className="mt-6 space-y-4 text-[14px] leading-relaxed text-muted-foreground">
                <li className="border-l-2 border-primary pl-4">
                  A shared commitment to safeguarding, dignity and non-discrimination.
                </li>
                <li className="border-l-2 border-primary pl-4">
                  Agreement on how the partnership is described publicly — no claims we cannot verify.
                </li>
                <li className="border-l-2 border-primary pl-4">
                  Willingness to receive honest reporting, including when a project is behind schedule.
                </li>
                <li className="border-l-2 border-primary pl-4">
                  Independence from any political or commercial condition on how aid is delivered.
                </li>
              </ul>

              <div className="mt-8 rounded-sm border border-border bg-mist p-6">
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  Prefer to speak first? Write to{" "}
                  <a className="font-medium text-primary hover:underline" href="mailto:support@gphf.pk">
                    support@gphf.pk
                  </a>{" "}
                  with a short outline and our team will respond.
                </p>
              </div>
            </div>

            <div className="rounded-sm border border-border bg-white p-6 sm:p-8">
              <h2 className="text-[22px]">Partnership enquiry</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                Tell us about your organization and the partnership you have in mind.
              </p>
              <div className="mt-6">
                <PartnerForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABand
        eyebrow="Sponsorship"
        title="Sponsor a project from start to finish."
        description="We will scope it with you, deliver it with local partners, and report on it honestly."
        primary={{ to: "/projects", label: "See projects" }}
        secondary={{ to: "/contact", label: "Talk to our team" }}
      />
    </>
  );
}