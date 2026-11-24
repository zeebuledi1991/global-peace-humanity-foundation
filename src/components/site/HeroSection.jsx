import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Image } from "@/components/ui/image";

const HERO_IMAGE =
  "https://media.base44.com/images/public/6b05c6dfcc821afc5baa03e2/9806a4ce3f438ec7a008843b8905ba82_generated_a4a1a7e8.png";
const QUICK_AMOUNTS = [25, 50, 100];

const rise = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay: 0.06 * i, ease: [0.2, 0.7, 0.2, 1] },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-mist">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] bg-sage lg:block"
      />
      <div className="shell relative grid items-center gap-12 py-14 lg:grid-cols-[1.04fr_1fr] lg:gap-16 lg:py-24">
        <div>
          <motion.p
            custom={0}
            variants={rise}
            initial="hidden"
            animate="show"
            className="eyebrow"
          >
            Pakistan &amp; Worldwide
          </motion.p>

          <motion.h1
            custom={1}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-5 text-balance text-[clamp(2.5rem,5.4vw,4.4rem)] leading-[0.98] tracking-[-0.01em] text-foreground"
          >
            Together, We Can Build a Better Tomorrow.
          </motion.h1>

          <motion.p
            custom={2}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-[52ch] text-[17px] leading-[1.7] text-muted-foreground"
          >
            Global Peace &amp; Humanity Foundation works alongside communities for peace, dignity
            and sustainable development — through education, healthcare, clean water, food security
            and emergency relief.
          </motion.p>

          <motion.div
            custom={3}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              to="/donate"
              className="group inline-flex items-center justify-center gap-3 rounded-sm bg-primary px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-foreground"
            >
              Donate Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              to="/mission-vision"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-foreground/20 bg-transparent px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Explore Our Mission
            </Link>
          </motion.div>

          <motion.p
            custom={4}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-8 flex items-center gap-2 text-[12px] text-muted-foreground"
          >
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            Registered in Pakistan · Donations accepted locally and internationally
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
          className="relative"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm shadow-[0_28px_70px_-30px_rgba(23,52,81,0.45)] sm:aspect-[16/11] lg:aspect-[5/6]">
            <Image
              src={HERO_IMAGE}
              alt="Volunteers in green vests handing food parcels to families in a rural village at sunrise"
              className="h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/35 via-transparent to-transparent" aria-hidden="true" />
          </div>

          <div className="relative -mt-10 ml-4 w-[calc(100%-2rem)] max-w-[330px] rounded-sm border border-border bg-white/95 p-5 shadow-[0_18px_45px_-24px_rgba(23,52,81,0.5)] backdrop-blur-md sm:-mt-14 sm:ml-6 lg:absolute lg:bottom-6 lg:left-6 lg:mt-0 lg:ml-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Give once
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                <Link
                  key={amount}
                  to="/donate"
                  search={{ amount }}
                  className="rounded-sm border border-border px-3 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-white"
                >
                  ${amount}
                </Link>
              ))}
            </div>
            <Link
              to="/donate"
              className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:text-foreground"
            >
              Other amount
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}