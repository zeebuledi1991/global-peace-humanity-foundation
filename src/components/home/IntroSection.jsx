import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import Reveal from "@/components/site/Reveal";
import SectionHeading from "@/components/site/SectionHeading";

const ABOUT_IMAGE =
  "https://media.base44.com/images/public/6b05c6dfcc821afc5baa03e2/90fec5628c4d5fa9d809caa58b3cd330_generated_7a420e36.png";

const PRINCIPLES = [
  {
    title: "Community first",
    text: "Programmes are designed with local families, not for them.",
  },
  {
    title: "Accountable by default",
    text: "Donations are recorded only after verification, with reports published openly.",
  },
  {
    title: "Safeguarding always",
    text: "Child protection and dignity guide every field interaction.",
  },
];

export default function IntroSection() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src={ABOUT_IMAGE}
                alt="Village elders and young people meeting together under a tree"
                className="h-full w-full"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden rounded-sm bg-primary px-6 py-5 text-white sm:block lg:-right-8">
              <p className="font-heading text-3xl leading-none">GPHF</p>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-white/70">
                Pakistan &amp; Worldwide
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <SectionHeading
            eyebrow="Who we are"
            title="A foundation built on dignity, service and trust."
            description="Global Peace & Humanity Foundation is a humanitarian organization registered in Pakistan, working with communities at home and with partners internationally. We focus on the essentials that let people live in safety and hope — learning, health, clean water, food, livelihoods and peace."
          />

          <div className="mt-9 space-y-5">
            {PRINCIPLES.map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="mt-2 h-px w-8 shrink-0 bg-primary" aria-hidden="true" />
                <div>
                  <h3 className="text-[16px] font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/about"
            className="mt-9 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-foreground"
          >
            About the foundation
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}