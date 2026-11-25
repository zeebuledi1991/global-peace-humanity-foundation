import { useEffect, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  Menu,
  PanelLeft,
} from "lucide-react";
import Logo from "@/components/site/Logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

// Shared responsive shell for the admin and donor dashboards: a full-width
// layout with a sticky, collapsible sidebar on desktop, a slide-out drawer on
// mobile, and a sticky header. The main column always takes every pixel the
// sidebar does not, so nothing is clipped and no side gutters are wasted.
function NavList({ nav, activeTo, collapsed, onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3" aria-label="Dashboard navigation">
      {nav.map((item) => {
        const active = item.to === activeTo;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] transition-colors",
              collapsed && "justify-center px-0",
              active ? "bg-white/12 font-medium text-white" : "text-white/65 hover:bg-white/8 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand({ homeTo, brandLabel, brandSub, collapsed }) {
  return (
    <Link
      to={homeTo}
      className={cn("flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10 px-4", collapsed && "justify-center px-2")}
    >
      <Logo className="h-9 w-9 shrink-0" withText={false} tone="light" />
      {!collapsed && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            {brandLabel}
          </span>
          <span className="block truncate text-[12px] text-white/70">{brandSub}</span>
        </span>
      )}
    </Link>
  );
}

function ProfileMenu({ user, roleLabel, logout }) {
  const name = user?.full_name || user?.email || "Account";
  const initials = String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex max-w-[240px] items-center gap-2.5 rounded-sm border border-border bg-white px-2.5 py-1.5 text-left transition-colors hover:border-primary"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
            {initials || "G"}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-[150px] truncate text-[12px] font-medium text-foreground">{name}</span>
            <span className="block max-w-[150px] truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {roleLabel}
            </span>
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="truncate text-[12px] font-normal text-muted-foreground">
          {user?.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/" className="cursor-pointer">
            <ExternalLink className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
            View website
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({ nav, user, brandLabel, brandSub, roleLabel, homeTo }) {
  const { logout } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // The most specific matching entry is the current page.
  const activeTo = nav.reduce((best, item) => {
    const matches = pathname === item.to || pathname.startsWith(`${item.to}/`);
    if (!matches) return best;
    return !best || item.to.length > best.length ? item.to : best;
  }, null);
  const activeLabel = nav.find((item) => item.to === activeTo)?.label || brandLabel;

  return (
    <div className="flex min-h-screen w-full bg-mist">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-navy/20 bg-navy text-white transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-[256px]"
        )}
      >
        <SidebarBrand homeTo={homeTo} brandLabel={brandLabel} brandSub={brandSub} collapsed={collapsed} />
        <NavList nav={nav} activeTo={activeTo} collapsed={collapsed} />
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-sm px-3 py-2.5 text-[12px] text-white/60 transition-colors hover:bg-white/8 hover:text-white",
              collapsed && "justify-center px-0"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span>Collapse menu</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[86%] max-w-[300px] border-r-0 bg-navy p-0 text-white">
          <SheetHeader className="sr-only">
            <SheetTitle>{brandLabel} navigation</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <SidebarBrand homeTo={homeTo} brandLabel={brandLabel} brandSub={brandSub} collapsed={false} />
            <NavList nav={nav} activeTo={activeTo} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            <div className="shrink-0 border-t border-white/10 p-3">
              <button
                type="button"
                onClick={() => logout()}
                className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2.5 text-[12.5px] text-white/70 transition-colors hover:bg-white/8 hover:text-white"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2.5 border-b border-border bg-white/95 px-4 backdrop-blur sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:border-primary hover:text-primary lg:hidden"
            aria-label="Open dashboard menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:border-primary hover:text-primary lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {brandLabel}
            </p>
            <h1 className="truncate font-heading text-[17px] leading-tight text-foreground">{activeLabel}</h1>
          </div>

          <ProfileMenu user={user} roleLabel={roleLabel} logout={logout} />
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}