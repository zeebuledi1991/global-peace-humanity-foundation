import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CreditCard, FileCheck2, Globe2, ShieldCheck } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import DonationForm from "@/components/forms/DonationForm";
import { getCampaigns, getProjects, getSiteSettings } from "@/lib/content-fns";

export const Route = createFileRoute("/_site/donate")({
  validateSearch: (search) => ({
    amount: search.amount ? String(search.amount) : undefined,
    frequency: search.frequency ? String(search.frequency) : undefined,
    project: search.project ? String(search.project) : undefined,
  }),
  loader: async () => {
    const [campaigns, projects, settings] = await Promise.all([
      getCampaigns(),
      getProjects(),
      getSiteSettings(),
    ]);
    return { campaigns, projects, settings };
  },
  head: () => ({
    meta: [
      { title: "Donate — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "Give once or monthly to support humanitarian programmes in Pakistan and worldwide. Donations are verified before receipts are issued.",
      },
    ],
  }),
  component: DonatePage,
});

function DonatePage() {
  const { campaigns, projects, settings } = Route.useLoaderData();
  const search = Route.useSearch();

  return (
    <>
      <PageHero
        eyebrow="Donate"
        title="Your gift becomes someone's next meal, lesson or clean drink of water."
        description="Give from anywhere in the world. Every donation is recorded with a reference, verified before a receipt is issued, and reported in our transparency section."
      />

      <section className="bg-background py-14 sm:py-20">
        <div className="shell grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <div>
            <DonationForm
              campaigns={campaigns || []}
              projects={projects || []}
              initialAmount={search.amount}
              initialFrequency={search.frequency}
              initialProject={search.project}
            />
          </div>

          <aside className="space-y-5">
            <div className="rounded-sm border border-border bg-white p-6">
              <h2 className="text-[17px] font-semibold text-foreground">Payment methods</h2>
              <ul className="mt-4 space-y-4">
                <li className="flex gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-[14px] font-medium text-foreground">Bank transfer</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      Available now. Transfer instructions appear on your confirmation page and are
                      emailed to you.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-[14px] font-medium text-foreground">Card / hosted checkout</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      Awaiting payment gateway activation. We will list it here once it is live — we do
                      not accept card payments before then.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-[14px] font-medium text-foreground">International donors</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      Give from any country and choose your currency. Bank charges, if any, are set by
                      your bank.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-sm border border-border bg-mist p-6">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-3 text-[17px] font-semibold text-foreground">How your donation is handled</h2>
              <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-muted-foreground">
                <li className="flex gap-2">
                  <FileCheck2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  Your pledge is recorded with a unique reference the moment you submit it.
                </li>
                <li className="flex gap-2">
                  <FileCheck2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  It is marked complete only after payment is confirmed — never automatically.
                </li>
                <li className="flex gap-2">
                  <FileCheck2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  A receipt number is issued once verified. Card details are never stored on this site.
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
                <Link to="/donation-policy" className="text-primary hover:underline">
                  Donation Policy
                </Link>
                <Link to="/refund-policy" className="text-primary hover:underline">
                  Refund Policy
                </Link>
                <Link to="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </div>

            {settings?.bank_details ? (
              <div className="rounded-sm border border-border bg-white p-6">
                <h2 className="text-[17px] font-semibold text-foreground">Bank transfer details</h2>
                <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">
                  {settings.bank_details}
                </p>
              </div>
            ) : (
              <div className="rounded-sm border border-border bg-white p-6">
                <h2 className="text-[17px] font-semibold text-foreground">Bank transfer details</h2>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                  Bank details are sent with your confirmation, along with your donation reference.
                  Please always include the reference so we can match your transfer.
                </p>
              </div>
            )}

            <div className="rounded-sm border border-border bg-white p-6">
              <h2 className="text-[17px] font-semibold text-foreground">Need help?</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                Write to{" "}
                <a className="font-medium text-primary hover:underline" href="mailto:support@gphf.pk">
                  support@gphf.pk
                </a>{" "}
                and our team will assist with your donation, receipt or a recurring commitment.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}