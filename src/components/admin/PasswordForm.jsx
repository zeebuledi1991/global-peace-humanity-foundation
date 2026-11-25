import { useState } from "react";
import { Loader2, KeyRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Panel, adminButton, adminInput, adminLabel } from "@/components/admin/adminUi";
import { notifyPasswordChanged } from "@/lib/login-security-fns";

const EMPTY = { currentPassword: "", newPassword: "", confirm: "" };

// Changing the password runs through the platform's own authentication (it
// verifies the current password and stores the new one hashed); this app never
// sees or stores a password.
export default function PasswordForm({ userId }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setDone("");
    if (form.newPassword.length < 10) {
      setError("Choose a new password of at least 10 characters.");
      return;
    }
    if (form.newPassword !== form.confirm) {
      setError("The new passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await base44.auth.changePassword({
        userId,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      await notifyPasswordChanged().catch(() => {});
      setForm(EMPTY);
      setDone("Your password has been changed. A confirmation email has been sent to your address.");
    } catch (err) {
      setError(err?.message || "We could not change your password. Check your current password and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel>
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">Change password</h2>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          Your current password is required for this change.
        </p>
      </div>
      <form onSubmit={submit} className="grid gap-4 p-4 sm:grid-cols-3">
        <div>
          <label className={adminLabel} htmlFor="current-password">
            Current password
          </label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            required
            value={form.currentPassword}
            onChange={update("currentPassword")}
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel} htmlFor="new-password">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            value={form.newPassword}
            onChange={update("newPassword")}
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel} htmlFor="confirm-password">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            value={form.confirm}
            onChange={update("confirm")}
            className={adminInput}
          />
        </div>

        {error && (
          <p className="sm:col-span-3 rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive">
            {error}
          </p>
        )}
        {done && (
          <p className="sm:col-span-3 rounded-sm border border-primary/30 bg-primary/5 px-3 py-2 text-[12px] text-primary">
            {done}
          </p>
        )}

        <div className="sm:col-span-3">
          <button type="submit" disabled={busy} className={adminButton}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />}
            Update password
          </button>
        </div>
      </form>
    </Panel>
  );
}