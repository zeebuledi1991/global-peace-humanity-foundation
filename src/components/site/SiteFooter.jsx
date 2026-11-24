import { Link } from "@tanstack/react-router";
import { Mail, MapPin, ShieldCheck } from "lucide-react";
import Logo from "@/components/site/Logo";

const COLUMNS = [
  {
    title: "Organization",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Mission & Vision", to: "/mission-vision" },
      { label: "Our Impact", to: "/impact" },
      { label: "Financial Transparency", to: "/financial-transparency" },
      { label: "Accessibility", to: "/accessibility" },
    ],
  },
  {
    title: "Programs",
    links: [
      { label: "Education & Child Development", to: "/programs" },
      { label: "Healthcare & Medical Support", to: "/programs" },
      { label: "Clean Water & Sanitation", to: "/programs" },
      { label: "Emergency & Disaster Relief", to: "/programs" },
      { label: "All Programs", to: "/programs" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { label: "Donate", to: "/donate" },
      { label: "Become a Volunteer", to: "/volunteer" },
      { label: "Become a Partner", to: "/partner" },
      { label: "News & Stories", to: "/news" },
      { label: "Gallery", to: "/gallery" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "FAQ", to: "/faq" },
      { label: "Donation Policy", to: "/donation-policy" },
      { label: "Refund & Cancellation", to: "/refund-policy" },
      { label: "Safeguarding Policy", to: "/safeguarding" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="shell py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2.6fr]">
          <div>
            <Logo className="h-14 w-14" />
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
              Together for Peace. Together for Humanity. A Pakistan-registered foundation serving
              communities in Pakistan and worldwide.
            </p>
            <div className="mt-6 space-y-3 text-[14px] text-muted-foreground">
              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a className="transition-colors hover:text-primary" href="mailto:support@gphf.pk">
                  support@gphf.pk
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                Head office address to be published
              </p>
              <p className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                Registered in Pakistan
              </p>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-[14px] text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Global Peace &amp; Humanity Foundation. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/privacy-policy" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-primary">
              Terms &amp; Conditions
            </Link>
            <Link to="/login" className="transition-colors hover:text-primary">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}