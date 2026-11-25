import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CreditCard, Landmark, Loader2, Lock, ShieldCheck } from "lucide-react";
import { DataTable, Panel, adminButton } from "@/components/admin/adminUi";
import { getPortalPaymentMethods, setPreferredPaymentMethod } from "@/lib/portal-fns";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/portal/payment-methods")({
  component: PaymentMethodsPage,
});

function PaymentMethodsPage() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState("");

  const load = () => getPortalPaymentMethods().then(setData);

  useEffect(() => {
    load();
  }, []);

  const choose = async (method) => {
    setSaving(method);
    try {
      await setPreferredPaymentMethod({ data: { method } });
      toast.success(method ? "Preferred payment method saved." : "Preferred payment method cleared.");
      await load();
    } catch (error) {
      toast.error(error?.message || "We could not save your preference.");
    } finally {
      setSaving("");
    }
  };

  const columns = [
    {
      key: "label",
      header: "Method",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          {row.method === "card" ? (
            <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
          ) : (
            <Landmark className="h-4 w-4 text-primary" aria-hidden="true" />
          )}
          <span className="text-[13px] font-medium text-foreground">{row.label}</span>
        </div>
      ),
    },
    { key: "count", header: "Verified donations", render: (row) => <span className="text-[13px] text-foreground">{row.count}</span> },
    {
      key: "total",
      header: "Total given",
      render: (row) => (
        <span className="whitespace-nowrap text-[13px] font-semibold text-foreground">
          {Object.entries(row.totals)
            .map(([currency, total]) => formatCurrency(total, currency))
            .join(" · ")}
        </span>
      ),
    },
    {
      key: "last",
      header: "Last used",
      render: (row) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{formatDate(row.last_used)}</span>,
    },
  ];

  const preferred = data?.preferred || "";

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-[26px] leading-tight text-foreground">My Payment Methods</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Choose how you prefer to give and review the methods used for your verified donations.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          {
            value: "bank_transfer",
            title: "Bank transfer",
            text: "Available now. Transfer instructions are issued with every donation confirmation.",
            icon: Landmark,
          },
          {
            value: "card",
            title: "Card / hosted checkout",
            text: "Cards are added and stored only through the approved payment provider once card payments are activated. GPHF never stores card numbers, CVV codes or PINs.",
            icon: CreditCard,
          },
        ].map((option) => {
          const selected = preferred === option.value;
          return (
            <div
              key={option.value}
              className={cn(
                "flex h-full flex-col rounded-sm border bg-white p-5 transition-colors",
                selected ? "border-primary" : "border-border"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <option.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {selected && (
                  <span className="rounded-sm bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                    Default
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-[16px] font-semibold text-foreground">{option.title}</h2>
              <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-muted-foreground">{option.text}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => choose(option.value)}
                  disabled={saving === option.value || selected}
                  className={adminButton}
                >
                  {saving === option.value && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                  {selected ? "Set as default" : "Make default"}
                </button>
                {selected && (
                  <button
                    type="button"
                    onClick={() => choose("")}
                    disabled={saving === ""}
                    className="inline-flex h-10 items-center rounded-sm border border-border px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:border-destructive hover:text-destructive"
                  >
                    Remove default
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Panel>
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">
            Methods used for your donations
          </h2>
        </div>
        <DataTable
          columns={columns}
          rows={data?.methods || []}
          loading={!data}
          empty="No verified donation has been recorded on your account yet."
        />
      </Panel>

      <div className="rounded-sm border border-border bg-white p-5">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Your payment details stay with the provider.</span> GPHF
            never stores complete card numbers, CVV codes, PINs or banking passwords. Saved payment methods belong
            only to your account and are never visible to other donors.
          </p>
        </div>
        <div className="mt-3 flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Donations are recorded as pending until the finance team verifies the payment with the provider or bank.
          </p>
        </div>
      </div>
    </div>
  );
}