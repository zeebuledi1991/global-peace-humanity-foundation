import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, HeartHandshake, MapPin, ShieldCheck, Users } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import VolunteerForm from "@/components/forms/VolunteerForm";
import CTABand from "@/components/site/CTABand";

export const Route = createFileRoute("/_site/volunteer")({
  head: () => ({
    meta: [
      { title: "Become a Volunteer — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "Volunteer with GPHF in education, healthcare, relief, livelihoods and communications. Apply online and join a safeguarding-first team.",
      },
    ],
  }),
  component: VolunteerPage,
});

const REASONS = [
  { icon: Users, title: "Work alongside communities", text: "Support local facilitators and field teams rather than working around them." },
  { icon: HeartHandshake, title: "Use the skills you have", text: "Teaching, medicine, design, translation, logistics and administration are all needed." },
  { icon: Clock, title: "Give the time you can", text: "Weekend sessions, remote support or full field placements — tell us what fits." },
  { icon: ShieldCheck, title: "Safeguarding first", text: "Everyone working with children completes screening and safeguarding induction." },
];

function VolunteerPage() {
  return (
    <>
      <PageHero
        eyebrow="Volunteer"
        title="Give your time and skills to work that matters."
        description="Volunteers make our programmes possible — as tutors, health support workers, distribution assistants, translators and administrators. Applications are reviewed by our team, and every volunteer is inducted in our safeguarding standards before starting."
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <h2 className="text-[26px] leading-tight">What volunteering looks like</h2>
            <div className="mt-7 space-y-6">
              {REASONS.map((reason) => (
                <div key={reason.title} className="flex gap-4">
                  <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <reason.icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold text-foreground">{reason.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{reason.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-9 rounded-sm border border-border bg-mist p-6">
              <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-foreground">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                Where we place volunteers
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                Field placements are in Pakistan. Remote volunteering — translation, design, research
                and communications — is open to volunteers anywhere in the world.
              </p>
            </div>

            <p className="mt-6 text-[13px] leading-relaxed text-muted-foreground">
              Read our{" "}
              <Link to="/safeguarding" className="text-primary hover:underline">
                Safeguarding &amp; Child Protection Policy
              </Link>{" "}
              before applying.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-white p-6 sm:p-8">
            <h2 className="text-[22px]">Volunteer application</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              Tell us about yourself and how you would like to help. We will contact you if there is a
              suitable role.
            </p>
            <div className="mt-6">
              <VolunteerForm />
            </div>
          </div>
        </div>
      </section>

      <CTABand
        eyebrow="Prefer to give instead?"
        title="Not able to volunteer right now? A donation goes just as far."
        description="Monthly giving helps us plan programmes with confidence."
        primary={{ to: "/donate", label: "Donate" }}
        secondary={{ to: "/partner", label: "Partner with us" }}
      />
    </>
  );
}