import { Link } from "@tanstack/react-router";
import { ArrowRight, Handshake, Users } from "lucide-react";
import Reveal from "@/components/site/Reveal";

const OPTIONS = [
  {
    icon: Users,
    eyebrow: "Volunteer",
    title: "Give your time and skills",
    text: "Field support, medical outreach, teaching, translation, design and administration — volunteers make our work possible.",
    to: "/volunteer",
    cta: "Become a volunteer",
    tone: "bg-primary text-white",
    headingTone: "text-white",
    muted: "text-white/70",
    iconTone: "bg-white/10 text-white",
    ctaTone: "text-white hover:text-gold",
  },
  {
    icon: Handshake,
    eyebrow: "Partner",
    title: "Build something lasting with us",
    text: "Corporate partnerships, NGO collaboration, project sponsorship and fundraising partnerships that scale real impact.",
    to: "/partner",
    cta: "Become a partner",
    tone: "bg-sage text-foreground",
    headingTone: "text-foreground",
    muted: "text-muted-foreground",
    iconTone: "bg-white text-primary",
    ctaTone: "text-primary hover:text-foreground",
  },
];

export default function InvolvementSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-2">
          {OPTIONS.map((option, index) => (
            <Reveal key={option.eyebrow} delay={index * 0.08}>
              <div className={`flex h-full flex-col rounded-sm p-8 sm:p-12 ${option.tone}`}>
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-sm ${option.iconTone}`}>
                  <option.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className={`mt-7 text-[11px] font-semibold uppercase tracking-[0.22em] ${option.muted}`}>
                  {option.eyebrow}
                </p>
                <h3 className={`mt-3 text-balance text-[clamp(1.5rem,2.4vw,2rem)] leading-tight ${option.headingTone}`}>
                  {option.title}
                </h3>
                <p className={`mt-4 flex-1 text-[15px] leading-relaxed ${option.muted}`}>{option.text}</p>
                <Link
                  to={option.to}
                  className={`mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${option.ctaTone}`}
                >
                  {option.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}