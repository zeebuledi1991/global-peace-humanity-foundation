import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, FileText, Loader2, ShieldCheck } from "lucide-react";
import PageHero from "@/components/site/PageHero";
import SectionHeading from "@/components/site/SectionHeading";
import CTABand from "@/components/site/CTABand";
import { base44 } from "@/api/base44Client";
import { getDocuments } from "@/lib/content-fns";
import { formatDate } from "@/lib/format";

const CATEGORY_LABELS = {
  annual_report: "Annual reports",
  financial_report: "Financial reports",
  project_expenditure: "Project expenditure",
  governance: "Governance",
  registration: "Registration documents",
};

const CATEGORY_ORDER = ["annual_report", "financial_report", "project_expenditure", "governance", "registration"];

export const Route = createFileRoute("/_site/financial-transparency")({
  loader: () => getDocuments(),
  head: () => ({
    meta: [
      { title: "Financial Transparency — Global Peace & Humanity Foundation" },
      {
        name: "description",
        content:
          "Annual reports, financial reports, project expenditure reports and registration documents published by GPHF.",
      },
    ],
  }),
  component: TransparencyPage,
});

function DocumentRow({ document }) {
  const [loading, setLoading] = useState(false);

  const openDocument = async () => {
    if (!document.file_uri) {
      toast.error("This document has no file attached yet.");
      return;
    }
    setLoading(true);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: document.file_uri,
        expires_in: 300,
      });
      window.open(signed_url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error?.message || "We could not open this document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 border-b border-border py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="text-[15px] font-medium text-foreground">{document.title}</p>
          {document.description && (
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{document.description}</p>
          )}
          {document.published_date && (
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Published {formatDate(document.published_date)}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={openDocument}
        disabled={loading}
        className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Download className="h-3.5 w-3.5" aria-hidden="true" />}
        Open
      </button>
    </div>
  );
}

function TransparencyPage() {
  const documents = Route.useLoaderData() || [];
  const grouped = CATEGORY_ORDER.map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
    items: documents.filter((document) => document.category === key),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Financial transparency"
        title="Every donation should be traceable."
        description="Annual reports, financial statements, project expenditure reports and registration documents are published here as they are approved. We do not publish figures or registration numbers before they are verified."
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            {grouped.length === 0 ? (
              <div className="rounded-sm border border-border bg-white p-8">
                <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
                <h2 className="mt-4 text-[20px]">No documents published yet</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                  Reports and registration documents will appear here once they have been verified and
                  approved for publication by the foundation. Authorized administrators can upload them
                  from the dashboard.
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {grouped.map((group) => (
                  <div key={group.key}>
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                      {group.label}
                    </h2>
                    <div className="mt-3 rounded-sm border border-border bg-white px-6">
                      {group.items.map((document) => (
                        <DocumentRow key={document.id} document={document} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-sm border border-border bg-mist p-6">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-3 text-[17px] font-semibold text-foreground">How donations are accounted for</h2>
              <ul className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-muted-foreground">
                <li>Each donation receives a unique reference when it is pledged.</li>
                <li>It is marked complete only after payment is confirmed.</li>
                <li>A receipt number is issued on verification.</li>
                <li>Spending is reported against the original programme budget.</li>
              </ul>
            </div>

            <div className="rounded-sm border border-border bg-white p-6">
              <h2 className="text-[17px] font-semibold text-foreground">Registration</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                Global Peace & Humanity Foundation is registered in Pakistan. Certificate details will be
                published in the registration documents section once approved for publication.
              </p>
            </div>

            <div className="rounded-sm border border-border bg-white p-6">
              <h2 className="text-[17px] font-semibold text-foreground">Request a document</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                If a report you need is not published yet, write to{" "}
                <a className="font-medium text-primary hover:underline" href="mailto:support@gphf.pk">
                  support@gphf.pk
                </a>{" "}
                and we will respond.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="shell">
          <SectionHeading
            eyebrow="Policies"
            title="The rules we hold ourselves to."
            description="Our policies explain how donations, refunds, safeguarding and privacy are handled."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { to: "/donation-policy", label: "Donation Policy" },
              { to: "/refund-policy", label: "Refund & Cancellation Policy" },
              { to: "/safeguarding", label: "Safeguarding & Child Protection" },
              { to: "/privacy-policy", label: "Privacy Policy" },
              { to: "/terms", label: "Terms & Conditions" },
              { to: "/accessibility", label: "Accessibility Statement" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-sm border border-border px-5 py-4 text-[13px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        eyebrow="Transparent giving"
        title="Give with confidence that your gift is recorded."
        description="Every donation is traceable by reference, from pledge to receipt."
      />
    </>
  );
}