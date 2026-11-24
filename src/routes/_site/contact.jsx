import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import ContactForm from "@/components/forms/ContactForm";
import { getSiteSettings } from "@/lib/content-fns";

export const Route = createFileRoute("/_site/contact")({
  loader: () => getSiteSettings(),
  head: () => ({
    meta: [
      { title: "Contact Us — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "Contact Global Peace & Humanity Foundation. Email support@gphf.pk, send an enquiry, or find our office details.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const settings = Route.useLoaderData() || {};
  const email = settings.email || "support@gphf.pk";
  const mapQuery = encodeURIComponent(settings.address || settings.map_query || "Pakistan");

  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="We would like to hear from you."
        description="Questions about our programmes, a donation, volunteering or a partnership — send us a message and our team will reply."
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="text-[26px] leading-tight">Reach the foundation</h2>

            <div className="mt-7 space-y-5">
              <div className="flex gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <Mail className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">Email</p>
                  <a className="mt-1 block text-[15px] font-medium text-foreground hover:text-primary" href={`mailto:${email}`}>
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <Phone className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">Phone</p>
                  <p className="mt-1 text-[15px] text-foreground">
                    {settings.phone || "Phone number to be published"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <MapPin className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">Office</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-foreground">
                    {settings.address || "Head office address to be published"}
                  </p>
                  <p className="mt-1 text-[13px] text-muted-foreground">Registered in Pakistan</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <Clock className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">Office hours</p>
                  <p className="mt-1 text-[15px] text-foreground">
                    {settings.office_hours || "Monday to Friday, 9:00 – 17:00 (PKT)"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-9 overflow-hidden rounded-sm border border-border bg-mist">
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
                <p className="text-[13px] font-medium text-foreground">Office location</p>
                <p className="max-w-[24ch] text-[12px] leading-relaxed text-muted-foreground">
                  {settings.address || "Map integration placeholder — the office address will appear here once confirmed."}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary hover:underline"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>

            <p className="mt-6 text-[12px] leading-relaxed text-muted-foreground">
              For safeguarding concerns, email {email} with the subject "Safeguarding concern". If
              someone is in immediate danger, contact local emergency services first.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-white p-6 sm:p-8">
            <h2 className="text-[22px]">Send a message</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              Every message is stored securely and reviewed by our team.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}