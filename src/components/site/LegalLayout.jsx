import { Link } from "@tanstack/react-router";
import { LEGAL_PAGES } from "@/content/legal";

export default function LegalLayout({ slug }) {
  const page = LEGAL_PAGES[slug];

  return (
    <article className="bg-background">
      <div className="shell max-w-3xl py-14 sm:py-20">
        <p className="eyebrow">Policies</p>
        <h1 className="mt-4 text-balance text-[clamp(2rem,3.8vw,3rem)] leading-[1.05]">{page.title}</h1>
        <p className="mt-4 text-[15px] text-muted-foreground">Last updated {page.updated}</p>
        <p className="mt-6 border-l-2 border-primary pl-5 text-[16px] leading-relaxed text-foreground/80">
          {page.intro}
        </p>

        <div className="mt-12 space-y-10">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-[21px] leading-snug">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="text-[15px] leading-[1.75] text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-sm border border-border bg-mist p-6">
          <h2 className="text-[18px]">Questions about this policy?</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Write to us at{" "}
            <a className="font-medium text-primary hover:underline" href="mailto:support@gphf.pk">
              support@gphf.pk
            </a>{" "}
            and our team will respond.
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary hover:text-foreground"
          >
            Contact us
          </Link>
        </div>
      </div>
    </article>
  );
}