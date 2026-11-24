import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Target } from "lucide-react";
import Reveal from "@/components/site/Reveal";

export default function MissionVisionSection() {
  return (
    <section className="relative overflow-hidden bg-navy py-20 text-white sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-1/2 h-[260px] w-[260px] -translate-y-1/2 rounded-full border border-white/10"
      />

      <div className="shell relative">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            Mission &amp; Vision
          </p>
          <h2 className="mt-4 max-w-3xl text-balance text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.1] text-white">
            Peace is built in ordinary places — a classroom, a clinic, a shared meal.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal delay={0.08}>
            <div className="h-full rounded-sm border border-white/15 bg-white/[0.04] p-8">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-white/10 text-gold">
                <Target className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-[22px] text-white">Our Mission</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/75">
                To relieve suffering and advance human dignity by delivering education, healthcare,
                nutrition, clean water, livelihood support and emergency relief — while strengthening
                the local institutions that carry this work forward.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="h-full rounded-sm border border-white/15 bg-white/[0.04] p-8">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-white/10 text-gold">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-[22px] text-white">Our Vision</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/75">
                A world where every community lives in peace, safety and dignity — where compassion
                crosses borders, and where sustainable development is shaped by the people who live
                it every day.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-white/15 pt-8">
            <p className="text-[13px] uppercase tracking-[0.22em] text-white/60">
              Together for Peace. Together for Humanity.
            </p>
            <Link
              to="/mission-vision"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:text-white"
            >
              Read our mission in full
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}