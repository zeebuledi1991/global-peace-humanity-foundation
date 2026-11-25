import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Logo from "@/components/site/Logo";
import { adminButton, adminInput, adminLabel } from "@/components/admin/adminUi";
import { continueMfa, loginWithMfa } from "@/lib/authMfa";

export const Route = createFileRoute("/admin_/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Administrator sign in — GPHF" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await loginWithMfa(email.trim(), password);
      if (result?.mfa_required) {
        await continueMfa(result, "/admin");
        return;
      }
      const me = await base44.auth.me();
      if (me?.role !== "admin") {
        await base44.auth.logout(window.location.origin);
        setError("This account does not have administrator access to the GPHF dashboard.");
        setBusy(false);
        return;
      }
      window.location.href = "/admin";
    } catch (err) {
      setError(err?.message || "We could not sign you in.");
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-mist lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-primary p-12 text-white lg:flex">
        <Logo className="h-12 w-12" tone="light" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">GPHF Administration</p>
          <h1 className="mt-4 max-w-md font-heading text-[34px] leading-tight text-white">
            Secure access for the foundation team.
          </h1>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/70">
            This dashboard manages donations, projects, donors and financial records. Access is limited to
            authorized GPHF administrators and every action is recorded in the audit log.
          </p>
        </div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
          Together for Peace. Together for Humanity.
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 lg:hidden">
            <Logo className="h-11 w-11" />
          </div>
          <h2 className="mt-6 font-heading text-[26px] leading-tight text-foreground lg:mt-0">
            Administrator sign in
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Use your GPHF team account. Donor accounts cannot open this dashboard.
          </p>

          {error && (
            <p className="mt-5 rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3 text-[12.5px] text-destructive">
              {error}
            </p>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className={adminLabel} htmlFor="admin-email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={`${adminInput} pl-9`}
                  placeholder="name@gphf.pk"
                />
              </div>
            </div>
            <div>
              <label className={adminLabel} htmlFor="admin-password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${adminInput} pl-9`}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" disabled={busy} className={`${adminButton} w-full`}>
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              Sign in to dashboard
            </button>
          </form>

          <p className="mt-5 inline-flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            Protected area. Every sign-in and administrative action is logged.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-5 text-[11px]">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Donor sign in
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-primary">
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}