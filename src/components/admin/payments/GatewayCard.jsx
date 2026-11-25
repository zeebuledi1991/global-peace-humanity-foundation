import { BadgeCheck, CreditCard, PlugZap, ShieldAlert, Webhook } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { StatusBadge, adminButton, adminGhostButton } from "@/components/admin/adminUi";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_LABEL = {
  not_configured: "Not configured",
  configured: "Configured — test pending",
  connected: "Connected",
  failed: "Connection failed",
};

export default function GatewayCard({ gateway, busy, onConfigure, onTest, onToggle }) {
  const connected = gateway.connection_status === "connected";

  return (
    <div className="flex flex-col rounded-sm border border-border bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="text-[16px] font-semibold text-foreground">{gateway.name}</h3>
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {gateway.environment === "live" ? "Live / production" : "Sandbox / test mode"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={gateway.connection_status} />
          <span className="text-[11px] text-muted-foreground">{STATUS_LABEL[gateway.connection_status]}</span>
        </div>
      </div>

      <dl className="grid gap-3 px-5 py-4 text-[12.5px]">
        {[
          ["International cards", gateway.capabilities.international],
          ["Local cards", gateway.capabilities.local],
          ["Recurring payments", gateway.capabilities.recurring],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className={cn("text-right font-medium", value ? "text-foreground" : "text-muted-foreground")}>
              {value || "—"}
            </dd>
          </div>
        ))}
      </dl>

      <div className="space-y-2 border-t border-border px-5 py-4 text-[12px]">
        <p className="flex items-start gap-2 text-muted-foreground">
          <Webhook className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span className="break-all">{gateway.webhook_url}</span>
        </p>
        {gateway.last_test_message && (
          <p
            className={cn(
              "flex items-start gap-2",
              connected ? "text-primary" : "text-destructive"
            )}
          >
            {connected ? (
              <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>
              {gateway.last_test_message}
              {gateway.last_tested_at ? ` · ${formatDateTime(gateway.last_tested_at)}` : ""}
            </span>
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border px-5 py-4">
        <button type="button" onClick={onConfigure} className={adminGhostButton} disabled={busy}>
          Configure API
        </button>
        <button type="button" onClick={onTest} className={adminGhostButton} disabled={busy || !gateway.configured}>
          <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
          Test connection
        </button>
        <label className="ml-auto flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/70">
          {gateway.is_enabled ? "Active" : "Inactive"}
          <Switch
            checked={gateway.is_enabled}
            disabled={busy || (!gateway.is_enabled && !connected)}
            onCheckedChange={(checked) => onToggle(checked)}
            aria-label={`Toggle ${gateway.name}`}
          />
        </label>
      </div>
    </div>
  );
}