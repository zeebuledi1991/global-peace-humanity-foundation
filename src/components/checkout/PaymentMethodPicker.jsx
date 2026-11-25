import { Building2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PaymentMethodPicker({ gateways = [], banks = [], value, onChange, monthly }) {
  return (
    <div className="space-y-2">
      {gateways.map((gateway) => {
        const selected = value === gateway.id;
        return (
          <label
            key={gateway.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-sm border p-4 transition-colors",
              selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
          >
            <input
              type="radio"
              name="payment-method"
              checked={selected}
              onChange={() => onChange(gateway.id)}
              className="mt-1 h-4 w-4 accent-[#174D38]"
            />
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
                <CreditCard className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {gateway.name}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {gateway.methods.join(" · ")}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Accepts {gateway.currencies.join(", ")}</p>
              {monthly && !gateway.supportsRecurring && (
                <p className="mt-1.5 text-[11px] font-medium text-destructive">
                  Recurring gifts are not enabled for this provider — your gift will be recorded as one-time.
                </p>
              )}
            </div>
          </label>
        );
      })}

      {banks.length > 0 && (
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-sm border p-4 transition-colors",
            value === "bank_transfer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          )}
        >
          <input
            type="radio"
            name="payment-method"
            checked={value === "bank_transfer"}
            onChange={() => onChange("bank_transfer")}
            className="mt-1 h-4 w-4 accent-[#174D38]"
          />
          <div>
            <p className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
              <Building2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Bank transfer
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Transfer directly to our {banks.length > 1 ? "accounts" : "account"} and submit your transfer
              reference. Our finance team verifies every transfer before a receipt is issued.
            </p>
          </div>
        </label>
      )}

      {gateways.length === 0 && banks.length === 0 && (
        <p className="rounded-sm border border-border bg-secondary/40 p-4 text-[12px] leading-relaxed text-muted-foreground">
          Payment methods are being finalised. Please write to{" "}
          <a className="font-medium text-primary hover:underline" href="mailto:support@gphf.pk">
            support@gphf.pk
          </a>{" "}
          and our team will help you complete your gift.
        </p>
      )}
    </div>
  );
}