import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  FileText,
  FolderKanban,
  HandCoins,
  Handshake,
  Images,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquare,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";
import Logo from "@/components/site/Logo";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/donations", label: "Donations", icon: HandCoins },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/programs", label: "Programs", icon: BookOpen },
  { to: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/admin/news", label: "News & Stories", icon: Newspaper },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
  { to: "/admin/documents", label: "Reports", icon: FileText },
  { to: "/admin/volunteers", label: "Volunteers", icon: Users },
  { to: "/admin/partnerships", label: "Partnerships", icon: Handshake },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
];

export default function AdminShell({ user }) {
  const { logout } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="min-h-screen bg-mist">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-navy/20 bg-navy text-white lg:min-h-screen lg:w-[248px] lg:shrink-0 lg:border-b-0">
          <div className="flex items-center justify-between gap-3 px-5 py-5">
            <Link to="/admin" className="flex items-center gap-2.5">
              <Logo className="h-9 w-9" withText={false} tone="light" />
              <span className="leading-tight">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                  GPHF Admin
                </span>
                <span className="block text-[12px] text-white/70">Management</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/20 text-white/70 transition-colors hover:border-white hover:text-white lg:hidden"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible lg:pb-6" aria-label="Admin navigation">
            {NAV.map((item) => {
              const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-sm px-3 py-2.5 text-[12.5px] transition-colors",
                    active
                      ? "bg-white/12 text-white"
                      : "text-white/60 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden border-t border-white/15 px-5 py-4 lg:block">
            <p className="truncate text-[12px] text-white/70">{user?.email}</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/" className="text-[11px] uppercase tracking-[0.14em] text-white/60 hover:text-white">
                View website
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-2 text-left text-[11px] uppercase tracking-[0.14em] text-white/60 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-mist px-4 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}