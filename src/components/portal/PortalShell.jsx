import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  CheckCircle2,
  CreditCard,
  FolderKanban,
  HandCoins,
  LayoutDashboard,
  Layers,
  LogOut,
  ReceiptText,
  Settings,
  User,
} from "lucide-react";
import Logo from "@/components/site/Logo";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/portal", label: "Overview", icon: LayoutDashboard },
  { to: "/portal/donations", label: "My Donations", icon: HandCoins },
  { to: "/portal/transactions", label: "My Transactions", icon: ReceiptText },
  { to: "/portal/payment-methods", label: "Payment Methods", icon: CreditCard },
  { to: "/portal/projects", label: "My Projects", icon: FolderKanban },
  { to: "/portal/projects/active", label: "Active Projects", icon: Activity },
  { to: "/portal/projects/completed", label: "Completed Projects", icon: CheckCircle2 },
  { to: "/portal/notifications", label: "Notifications", icon: Bell },
  { to: "/portal/profile", label: "My Profile", icon: User },
  { to: "/portal/settings", label: "Account Settings", icon: Settings },
];

export default function PortalShell({ user }) {
  const { logout } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const firstName = String(user?.full_name || user?.email || "").split(" ")[0] || "friend";

  return (
    <div className="min-h-screen bg-mist">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-border bg-white lg:min-h-screen lg:w-[268px] lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 px-5 py-5">
            <Link to="/portal" className="flex items-center gap-2.5">
              <Logo className="h-10 w-10" withText={false} />
              <span className="leading-tight">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Donor Portal
                </span>
                <span className="block text-[12px] text-muted-foreground">GPHF</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary lg:hidden"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <nav
            className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible lg:pb-6"
            aria-label="Donor portal navigation"
          >
            {NAV.map((item) => {
              const active = item.to === "/portal" ? pathname === "/portal" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-sm px-3 py-2.5 text-[12.5px] transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground/65 hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/projects"
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-sm px-3 py-2.5 text-[12.5px] text-foreground/65 transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              All GPHF Projects
            </Link>
          </nav>

          <div className="hidden border-t border-border px-5 py-4 lg:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Signed in as</p>
            <p className="mt-1 truncate text-[13px] font-medium text-foreground">{user?.full_name || firstName}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link to="/" className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-primary">
                View website
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-2 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-primary"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}