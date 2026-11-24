import { createFileRoute } from "@tanstack/react-router";
import PageHero from "@/components/site/PageHero";
import ProgramCard from "@/components/site/ProgramCard";
import Reveal from "@/components/site/Reveal";
import CTABand from "@/components/site/CTABand";
import { getPrograms } from "@/lib/content-fns";

export const Route = createFileRoute("/_site/programs/")({
  loader: () => getPrograms(),
  head: () => ({
    meta: [
      { title: "Our Programs — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "Explore GPHF's humanitarian programmes: education, healthcare, food security, clean water, livelihoods, women's empowerment, child welfare, emergency relief and peacebuilding.",
      },
    ],
  }),
  component: ProgramsPage,
});

function ProgramsPage() {
  const programs = Route.useLoaderData() || [];

  return (
    <>
      <PageHero
        eyebrow="Our programmes"
        title="Nine areas of work, one purpose."
        description="Each programme meets a specific need — and reinforces the others, because a child cannot learn on an empty stomach or without clean water. Programmes are delivered in Pakistan and supported by donors and partners worldwide."
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="shell">
          {programs.length === 0 ? (
            <p className="rounded-sm border border-border bg-white p-8 text-center text-[15px] text-muted-foreground">
              Programme information is being published. Please check back shortly.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((program, index) => (
                <Reveal key={program.id} delay={(index % 3) * 0.06}>
                  <ProgramCard program={program} />
                </Reveal>
              ))}
            </div>
          )}

          <p className="mt-10 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
            Programme results are published only after verification. Verified beneficiary figures and
            expenditure reports appear in our{" "}
            <a className="text-primary hover:underline" href="/financial-transparency">
              transparency section
            </a>{" "}
            as they are approved.
          </p>
        </div>
      </section>

      <CTABand
        eyebrow="Support a programme"
        title="Choose the cause closest to you."
        description="Every programme accepts one-time and monthly support, and donations can be directed to a specific project."
      />
    </>
  );
}