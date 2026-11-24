import { createFileRoute, Link } from "@tanstack/react-router";
import PageHero from "@/components/site/PageHero";
import { FAQ_SECTIONS } from "@/content/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/_site/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "Answers about GPHF donations, payment methods, receipts, volunteering, partnerships, transparency and safeguarding.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions, answered plainly."
        description="If something is not covered here, write to support@gphf.pk and we will add the answer."
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="shell max-w-3xl">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.title} className="mb-12 last:mb-0">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                {section.title}
              </h2>
              <Accordion type="single" collapsible className="mt-4">
                {section.items.map((item, index) => (
                  <AccordionItem
                    key={item.q}
                    value={`${section.title}-${index}`}
                    className="border-b border-border"
                  >
                    <AccordionTrigger className="py-5 text-left text-[16px] font-medium text-foreground hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-[14px] leading-[1.8] text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          <div className="rounded-sm border border-border bg-mist p-7">
            <h2 className="text-[19px]">Still need help?</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              Our team replies to enquiries during office hours.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="rounded-sm bg-primary px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white hover:bg-foreground"
              >
                Contact us
              </Link>
              <a
                href="mailto:support@gphf.pk"
                className="rounded-sm border border-border bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground hover:border-primary hover:text-primary"
              >
                support@gphf.pk
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}