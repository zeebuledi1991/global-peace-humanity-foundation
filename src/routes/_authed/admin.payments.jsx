import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { AdminHeader } from "@/components/admin/adminUi";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/admin/payments", label: "Payment Overview", exact: true },
  { to: "/admin/payments/gateways", label: "Payment Gateways" },
  { to: "/admin/payments/bank-transfers", label: "Bank Transfer Settings" },
  { to: "/admin/payments/transactions", label: "Transaction History" },
  { to: "/admin/payments/reports", label: "Payment Reports" },
  { to: "/admin/payments/logs", label: "Configuration Logs" },
];

export const Route = createFileRoute("/_authed/admin/payments")({
  component: PaymentsLayout,
});

function PaymentsLayout() {
  const { user, isLoadingAuth } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const role = user?.admin_role || "administrator";

  if (isLoadingAuth) return null;

  if (role === "project_manager") {
    return (
      <div className="mx-auto max-w-xl rounded-sm border border-border bg-white p-8 text-center">
        <Lock className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 text-[22px]">Payment management is restricted</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          Payment credentials, bank details and financial verification are limited to the Super Admin,
          Administrators and Finance Managers.
        </p>
        <Link to="/admin" className="mt-5 inline-block text-[12px] font-semibold text-primary hover:underline">
          Back to overview
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Payment Management"
        description="Configure every payment provider, manage bank transfer instructions, verify payments and review the full transaction ledger."
      />

      <nav className="flex gap-1 overflow-x-auto border-b border-border pb-px" aria-label="Payment sections">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}