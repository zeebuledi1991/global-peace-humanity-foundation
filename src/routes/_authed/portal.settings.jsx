import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { KeyRound, Loader2, LogOut, Mail, ShieldCheck } from "lucide-react";
import { Panel, StatusBadge, adminButton, adminInput, adminLabel } from "@/components/admin/adminUi";
import { useAuth } from "@/lib/AuthContext";
import { getPortalProfile, setPreferredPaymentMethod } from "@/lib/portal-fns";

export const Route = createFileRoute("/_authed/portal/settings")({
  component: AccountSettingsPage,
});

function AccountSettingsPage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPortalProfile().then(setProfile);
  }, []);

  const saveMethod = async (event) => {
    const method = event.target.value;
    setSaving(true);
    try {
      await setPreferredPaymentMethod({ data: { method } });
      setProfile((prev) => ({ ...prev, user: { ...prev.user, preferred_payment_method: method } }));
      toast.success("Payment preference updated.");
    } catch (error) {
      toast.error(error?.message || "We could not save your preference.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-[26px] leading-tight text-foreground">Account Settings</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Sign-in, security and giving preferences for your GPHF donor account.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground">Sign-in email</p>
              <p className="mt-1 truncate text-[12.5px] text-muted-foreground">{profile?.user.email || "—"}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Your account is protected by a verified email address and password.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/forgot-password" className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary">
              <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
              Change password
            </Link>
            <Link to="/mfa" className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Two-factor authentication
            </Link>
          </div>
        </Panel>

        <Panel className="p-5">
          <p className="text-[13px] font-semibold text-foreground">Account status</p>
          <div className="mt-2">
            <StatusBadge status={profile?.user.account_status || "active"} />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Only GPHF administrators can change an account status. Contact support@gphf.pk if you need help.
          </p>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-4 inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-destructive hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Log out
          </button>
        </Panel>
      </div>

      <Panel className="p-5 sm:p-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">Giving preferences</h2>
        <div className="mt-4 max-w-md">
          <label className={adminLabel} htmlFor="preferred-method">
            Preferred payment method
          </label>
          <select
            id="preferred-method"
            value={profile?.user.preferred_payment_method || ""}
            onChange={saveMethod}
            disabled={saving || !profile}
            className={adminInput}
          >
            <option value="">No preference</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="card">Card / hosted checkout</option>
          </select>
          {saving && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Saving
            </p>
          )}
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            This is only a preference. Card details are never stored by GPHF; payments are handled by the approved
            provider.
          </p>
        </div>
        <Link to="/portal/profile" className={`${adminButton} mt-5`}>
          Edit personal details
        </Link>
      </Panel>
    </div>
  );
}