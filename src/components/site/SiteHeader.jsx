import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Heart, ShieldCheck, UserRound } from "lucide-react";
import Logo from "@/components/site/Logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "About", to: "/about" },
  { label: "Programs", to: "/programs" },
  { label: "Projects", to: "/projects" },
  { label: "Impact", to: "/impact" },
  { label: "Stories", to: "/news" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
];

const MORE = [
  { label: "Our Mission & Vision", to: "/mission-vision" },
  { label: "Become a Volunteer", to: "/volunteer" },
  { label: "Become a Partner", to: "/partner" },
  { label: "Financial Transparency", to: "/financial-transparency" },
  { label: "FAQ", to: "/faq" },
];

export default function SiteHeader() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-white/95 backdrop-blur-md"
          : "border-b border-transparent bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="shell flex h-[74px] items-center justify-between gap-6">
        <Link to="/" aria-label="Global Peace & Humanity Foundation — home">
          <Logo className={cn("transition-all", scrolled ? "h-11 w-11" : "h-12 w-12")} />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[13px] font-medium tracking-wide text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user?.role === "admin" && (
            <Link
              to="/admin/dashboard"
              className="hidden items-center gap-2 rounded-sm border border-navy/25 bg-navy/5 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white lg:inline-flex"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Admin dashboard
            </Link>
          )}
          <Link
            to="/portal"
            className="hidden items-center gap-2 rounded-sm border border-border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:text-primary lg:inline-flex"
          >
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            User Portal
          </Link>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-foreground"
          >
            <Heart className="h-3.5 w-3.5" aria-hidden="true" />
            Donate
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86%] max-w-sm overflow-y-auto bg-background">
              <SheetHeader className="text-left">
                <SheetTitle className="font-heading text-2xl font-normal">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col" aria-label="Mobile navigation">
                {[...NAV, ...MORE].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="border-b border-border py-3.5 text-[15px] text-foreground/80 transition-colors hover:text-primary"
                    activeProps={{ className: "text-primary" }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link
                to="/donate"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                Donate Now
              </Link>
              <Link
                to="/portal"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground"
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
                User Portal
              </Link>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}