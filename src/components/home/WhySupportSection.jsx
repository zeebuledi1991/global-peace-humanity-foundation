import { ShieldCheck, Users, FileCheck2, HeartHandshake } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Verified giving",
    text: "Donations are marked complete only after server-side payment confirmation. Nothing is simulated.",
  },
  {
    icon: Users,
    title: "Local knowledge",
    text: "Programmes are shaped with community representatives, so support fits the place it serves.",
  },
  {
    icon: FileCheck2,
    title: "Open reporting",
    text: "Annual and project reports are published in our transparency section as they are approved.",
  },
  {
    icon: HeartHandshake,
    title: "Dignity in delivery",
    text: "Aid is distributed without discrimination, with safeguarding standards applied in every setting.",
  },
];

export default function WhySupportSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Why support GPHF"
          title="Trust is the foundation of every donation."
          description="We keep our promises small enough to keep them. Here is what you can expect when you give, volunteer or partner with us."
          align="center"
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason, index) => (
            <Reveal key={reason.title} delay={index * 0.06}>
              <div className="h-full bg-white p-7">
                <reason.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="mt-5 text-[17px] font-semibold text-foreground">{reason.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{reason.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}