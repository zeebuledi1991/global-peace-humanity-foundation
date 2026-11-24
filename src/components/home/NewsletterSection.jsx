import NewsletterForm from "@/components/site/NewsletterForm";

export default function NewsletterSection() {
  return (
    <section className="bg-navy py-16 text-white sm:py-20">
      <div className="shell grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Stay connected</p>
          <h2 className="mt-4 text-balance text-[clamp(1.7rem,2.8vw,2.3rem)] leading-tight text-white">
            Receive field updates and announcements.
          </h2>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/70">
            Occasional emails about our programmes, reports and ways to help. No spam, and you can
            unsubscribe at any time.
          </p>
        </div>
        <NewsletterForm />
      </div>
    </section>
  );
}