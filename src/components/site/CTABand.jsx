import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart } from "lucide-react";

export default function CTABand({
  eyebrow = "Get involved",
  title = "Your support becomes someone's next meal, lesson or clean drink of water.",
  description = "Give once or monthly, volunteer your skills, or partner with us on a project.",
  primary = { to: "/donate", label: "Donate now" },
  secondary = { to: "/contact", label: "Talk to our team" },
}) {
  return (
    <section className="bg-primary py-16 text-white sm:py-20">
      <div className="shell flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">{eyebrow}</p>
          <h2 className="mt-4 text-balance text-[clamp(1.7rem,3vw,2.5rem)] leading-tight text-white">{title}</h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/70">{description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to={primary.to}
            className="group inline-flex items-center justify-center gap-2 rounded-sm bg-white px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-gold hover:text-navy"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            {primary.label}
          </Link>
          <Link
            to={secondary.to}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/35 px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-white hover:bg-white/10"
          >
            {secondary.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}