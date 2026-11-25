import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Panel, adminButton, adminInput, adminLabel } from "@/components/admin/adminUi";
import { getPortalProfile, updatePortalProfile } from "@/lib/portal-fns";
import { COUNTRIES } from "@/content/options";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authed/portal/profile")({
  component: MyProfilePage,
});

function MyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [values, setValues] = useState({ full_name: "", country: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPortalProfile().then((result) => {
      setProfile(result);
      setValues({
        full_name: result.user.full_name || "",
        country: result.user.country || "",
        phone: result.user.phone || "",
      });
    });
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await updatePortalProfile({ data: values });
      setProfile((prev) => ({ ...prev, user: result.user }));
      toast.success(
        result.welcomeSent
          ? "Profile saved. A welcome email is on its way."
          : "Your profile has been updated."
      );
    } catch (error) {
      toast.error(error?.message || "We could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading your profile
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-[26px] leading-tight text-foreground">My Profile</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Your details are used on receipts and to keep you informed about the projects you support.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-border bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Member since</p>
          <p className="mt-2 text-[15px] font-medium text-foreground">{formatDate(profile.memberSince) || "—"}</p>
        </div>
        <div className="rounded-sm border border-border bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Verified donations</p>
          <p className="mt-2 text-[15px] font-medium text-foreground">{profile.verifiedCount}</p>
        </div>
        <div className="rounded-sm border border-border bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Total given</p>
          <p className="mt-2 text-[15px] font-medium text-foreground">
            {Object.entries(profile.totals).length
              ? Object.entries(profile.totals)
                  .map(([currency, total]) => formatCurrency(total, currency))
                  .join(" · ")
              : formatCurrency(0, "USD")}
          </p>
        </div>
      </div>

      <Panel className="p-5 sm:p-6">
        <form onSubmit={submit} className="max-w-xl space-y-4">
          <div>
            <label className={adminLabel} htmlFor="profile-name">
              Full name
            </label>
            <input
              id="profile-name"
              required
              minLength={2}
              value={values.full_name}
              onChange={(event) => setValues((prev) => ({ ...prev, full_name: event.target.value }))}
              className={adminInput}
            />
          </div>
          <div>
            <label className={adminLabel} htmlFor="profile-email">
              Email address
            </label>
            <input id="profile-email" value={profile.user.email} readOnly className={`${adminInput} bg-mist`} />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Your email is verified and used to sign in. Contact support@gphf.pk to change it.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabel} htmlFor="profile-country">
                Country
              </label>
              <select
                id="profile-country"
                value={values.country}
                onChange={(event) => setValues((prev) => ({ ...prev, country: event.target.value }))}
                className={adminInput}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={adminLabel} htmlFor="profile-phone">
                Phone number (optional)
              </label>
              <input
                id="profile-phone"
                value={values.phone}
                onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
                className={adminInput}
              />
            </div>
          </div>
          <button type="submit" disabled={saving} className={adminButton}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            Save profile
          </button>
        </form>
      </Panel>
    </div>
  );
}