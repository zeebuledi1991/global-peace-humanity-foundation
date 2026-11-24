import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, FileText, Printer, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { getDonationReceipt } from "@/lib/forms-fns";
import { getSiteSettings } from "@/lib/content-fns";

export const Route = createFileRoute("/_site/donation-confirmation")({
  validateSearch: (search) => ({
    ref: search.ref ? String(search.ref) : undefined,
  }),
  loaderDeps: ({ search }) => ({ ref: search.ref }),
  loader: async ({ deps }) => {
    const [donation, settings] = await Promise.all([
      deps.ref ? getDonationReceipt({ data: { reference: deps.ref } }) : Promise.resolve(null),
      getSiteSettings(),
    ]);
    return { donation, settings };
  },
  head: () => ({
    meta: [
      { title: "Donation confirmation — Global Peace & Humanity Foundation" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

const STATUS_META = {
  pending: {
    icon: Clock,
    tone: "text-[#8a6d1a]",
    badge: "bg-gold/20 text-[#6f5710]",
    label: "Awaiting payment",
  },
  completed: {
    icon: CheckCircle2,
    tone: "text-primary",
    badge: "bg-primary/10 text-primary",
    label: "Verified and complete",
  },
  failed: { icon: XCircle, tone: "text-destructive", badge: "bg-destructive/10 text-destructive", label: "Payment failed" },
  cancelled: { icon: XCircle, tone: "text-muted-foreground", badge: "bg-secondary text-muted-foreground", label: "Cancelled" },
};

function ConfirmationPage() {
  const { donation, settings } = Route.useLoaderData();

  if (!donation) {
    return (
      <div className="shell max-w-xl py-24 text-center">
        <h1 className="text-[28px]">Donation not found</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          We could not find a donation for that reference. Please check the reference in your
          confirmation email, or contact us and we will help.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/donate"
            className="rounded-sm bg-primary px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white hover:bg-foreground"
          >
            Start a donation
          </Link>
          <a
            href="mailto:support@gphf.pk"
            className="rounded-sm border border-border px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground hover:border-primary hover:text-primary"
          >
            Contact support
          </a>
        </div>
      </div>
    );
  }

  const meta = STATUS_META[donation.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;
  const amount = formatCurrency(donation.amount, donation.currency);

  return (
    <section className="bg-mist py-14 sm:py-20">
      <div className="shell max-w-3xl">
        <div className="rounded-sm border border-border bg-white p-7 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Donation {donation.reference}
            </p>
            <span
              className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${meta.badge}`}
            >
              <StatusIcon className="h-3 w-3" aria-hidden="true" />
              {meta.label}
            </span>
          </div>

          <h1 className="mt-5 text-[clamp(1.8rem,3.4vw,2.5rem)] leading-tight">
            {donation.status === "completed" ? "Thank you — your donation is confirmed." : "Thank you for your pledge."}
          </h1>

          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            {donation.status === "completed"
              ? "Your payment has been verified and your receipt is issued below. Keep this page or your reference for your records."
              : "Your pledge has been recorded. Your donation is not complete until the payment is confirmed on our side."}
          </p>

          <dl className="mt-8 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
            <div className="bg-white p-5">
              <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Amount</dt>
              <dd className="mt-1.5 font-heading text-[24px] text-foreground">{amount}</dd>
            </div>
            <div className="bg-white p-5">
              <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Frequency</dt>
              <dd className="mt-1.5 text-[15px] text-foreground">
                {donation.frequency === "monthly" ? "Monthly commitment" : "One-time gift"}
              </dd>
            </div>
            <div className="bg-white p-5">
              <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Donor</dt>
              <dd className="mt-1.5 text-[15px] text-foreground">{donation.donor_display}</dd>
            </div>
            <div className="bg-white p-5">
              <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Pledge date</dt>
              <dd className="mt-1.5 text-[15px] text-foreground">{formatDate(donation.created_date)}</dd>
            </div>
          </dl>

          {donation.dedication && (
            <div className="mt-6 rounded-sm border border-border bg-mist p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Dedication</p>
              <p className="mt-2 text-[14px] leading-relaxed text-foreground/80">{donation.dedication}</p>
            </div>
          )}

          {donation.status === "completed" ? (
            <div className="mt-8 rounded-sm border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h2 className="text-[17px] font-semibold text-foreground">Official receipt</h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    Receipt number <span className="font-medium text-foreground">{donation.receipt_number}</span>
                    {donation.verified_date ? ` · verified ${formatDate(donation.verified_date)}` : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="mt-4 inline-flex items-center gap-2 rounded-sm border border-primary px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary hover:bg-primary hover:text-white"
                  >
                    <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                    Print receipt
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              <div className="rounded-sm border border-border bg-mist p-6">
                <h2 className="text-[17px] font-semibold text-foreground">Next step: complete your payment</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  Please transfer{" "}
                  <span className="font-semibold text-foreground">{amount}</span> and include your
                  reference <span className="font-semibold text-foreground">{donation.reference}</span> so
                  we can match it to your pledge.
                </p>
                {settings?.bank_details ? (
                  <p className="mt-4 whitespace-pre-line rounded-sm border border-border bg-white p-4 text-[13px] leading-relaxed text-foreground/80">
                    {settings.bank_details}
                  </p>
                ) : (
                  <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                    Our team will email transfer instructions to the address you provided. If you do not
                    receive them, write to{" "}
                    <a className="font-medium text-primary hover:underline" href="mailto:support@gphf.pk">
                      support@gphf.pk
                    </a>
                    .
                  </p>
                )}
                {donation.frequency === "monthly" && (
                  <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                    You selected a monthly commitment. Recurring billing begins once the payment gateway
                    is active, and you will be contacted before the first recurring charge.
                  </p>
                )}
              </div>

              <p className="text-[12px] leading-relaxed text-muted-foreground">
                Your receipt number is issued automatically once the payment is verified. Bookmark this
                page — the status will update when our team confirms your donation.
              </p>
            </div>
          )}

          <div className="mt-9 flex flex-wrap gap-3 border-t border-border pt-6">
            <Link
              to="/"
              className="rounded-sm bg-primary px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white hover:bg-foreground"
            >
              Back to home
            </Link>
            <Link
              to="/projects"
              className="rounded-sm border border-border px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground hover:border-primary hover:text-primary"
            >
              See our projects
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}