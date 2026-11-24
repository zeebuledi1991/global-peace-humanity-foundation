import { createFileRoute } from "@tanstack/react-router";
import { Compass, Target } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import SectionHeading from "@/components/site/SectionHeading";
import Reveal from "@/components/site/Reveal";
import CTABand from "@/components/site/CTABand";

export const Route = createFileRoute("/_site/mission-vision")({
  head: () => ({
    meta: [
      { title: "Our Mission & Vision — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "The mission, vision and values that guide Global Peace & Humanity Foundation's humanitarian work in Pakistan and worldwide.",
      },
    ],
  }),
  component: MissionVisionPage,
});

const VALUES = [
  { title: "Dignity", text: "People are never a case study. Assistance respects privacy, choice and consent." },
  { title: "Integrity", text: "We record what we receive, verify what we report, and refuse what compromises our independence." },
  { title: "Impartiality", text: "Help is given on the basis of need, without discrimination of any kind." },
  { title: "Local ownership", text: "Communities lead, and every project is designed to keep working without us." },
  { title: "Transparency", text: "Reports are published openly, including the parts that are unflattering." },
  { title: "Accountability", text: "Every donation has a reference, a record and a person responsible for it." },
];

const STEPS = [
  {
    step: "01",
    title: "Listen",
    text: "Meet community representatives, including women and young people, and agree what matters most.",
  },
  {
    step: "02",
    title: "Deliver",
    text: "Run the programme with local facilitators, qualified professionals and clear safeguarding standards.",
  },
  {
    step: "03",
    title: "Hand over",
    text: "Agree who maintains the work locally, publish verified results, and stay available for support.",
  },
];

function MissionVisionPage() {
  return (
    <>
      <PageHero
        eyebrow="Mission & vision"
        title="Peace is built in ordinary places — a classroom, a clinic, a shared meal."
        description="Our mission describes what we do. Our vision describes why it matters. Together they set the boundaries of every programme we accept and every partnership we enter."
      />

      <section className="bg-background py-20 sm:py-24">
        <div className="shell grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-sm border border-border bg-white p-8 sm:p-10">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <Target className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-[24px]">Our Mission</h2>
              <p className="mt-4 text-[15px] leading-[1.8] text-muted-foreground">
                To relieve suffering and advance human dignity by delivering education, healthcare,
                nutrition, clean water, livelihood support and emergency relief — while strengthening
                the local institutions that carry this work forward.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="h-full rounded-sm border border-border bg-navy p-8 text-white sm:p-10">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-white/10 text-gold">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-[24px] text-white">Our Vision</h2>
              <p className="mt-4 text-[15px] leading-[1.8] text-white/75">
                A world where every community lives in peace, safety and dignity — where compassion
                crosses borders, and where sustainable development is shaped by the people who live it
                every day.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-mist py-20 sm:py-24">
        <div className="shell">
          <SectionHeading eyebrow="Our values" title="Six commitments we hold ourselves to." align="center" />
          <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value) => (
              <div key={value.title} className="bg-white p-7">
                <h3 className="text-[17px] font-semibold text-foreground">{value.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="shell">
          <SectionHeading eyebrow="How change happens" title="A three-step approach, repeated honestly." />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.step} className="border-t border-border pt-6">
                <p className="font-heading text-[34px] leading-none text-primary/25">{step.step}</p>
                <h3 className="mt-3 text-[19px] text-foreground">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title="Help us keep these commitments in the field."
        description="Donations fund programmes. Accountability makes them worth trusting."
      />
    </>
  );
}