import { Lock, LogIn, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError, AuthLink, GoogleButton, OrDivider, SubmitButton } from "@/components/auth/parts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MfaFlow } from "@/components/auth/MfaFlow";
import { MfaScreen } from "@/components/auth/MfaParts";
import { loginWithMfa } from "@/lib/authMfa";
import { safeReturnTo } from "@/lib/authReturnTo";

// The /login page. ?returnTo= (or the platform's ?from_url=) is where the visitor
// goes after signing in — the login gate and the MCP consent page send people here with it.
export function LoginPage() {
  const returnTo = safeReturnTo();
  // Where the platform returns people after a social or two-factor step; the
  // destination there follows the role of the session.
  const next = returnTo && returnTo !== "/" ? returnTo : "/post-login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState(null);

  // A signed-in visitor never sees the sign-in form again: administrators go to
  // the admin dashboard, donors to their portal.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const authed = await base44.auth.isAuthenticated().catch(() => false);
      if (!authed || cancelled) return;
      const me = await base44.auth.me().catch(() => null);
      if (!me || cancelled) return;
      window.location.href = me.role === "admin" ? "/admin/dashboard" : "/dashboard";
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await loginWithMfa(email, password);
      if (result.mfa_required) {
        setMfaChallenge(result);
        return;
      }
      // The destination follows the role the server reports for this session.
      const me = await base44.auth.me().catch(() => null);
      const destination =
        me?.role === "admin"
          ? returnTo.startsWith("/admin")
            ? returnTo
            : "/admin/dashboard"
          : returnTo && returnTo !== "/"
            ? returnTo
            : "/dashboard";
      // A hard redirect: the app re-initializes with the new session.
      window.location.href = destination;
    } catch (err) {
      setError(err.message || "Invalid email or password");
      setBusy(false);
    }
  }

  // The second sign-in step (authenticator app or text message) replaces the whole page.
  if (mfaChallenge) return <MfaScreen><MfaFlow challenge={mfaChallenge} returnTo={next} /></MfaScreen>;

  return (
    <AuthLayout icon={LogIn} title="Welcome back" subtitle="Log in to your account">
      <GoogleButton returnTo={next} onError={setError} />
      <OrDivider />
      <AuthError>{error}</AuthError>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="login-email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <AuthLink to="/forgot-password" returnTo={returnTo} className="text-xs text-primary hover:underline">
              Forgot password?
            </AuthLink>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="login-password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <SubmitButton busy={busy} busyLabel="Logging in...">
          Log in
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <AuthLink to="/register" returnTo={returnTo}>
          Create one
        </AuthLink>
      </p>
    </AuthLayout>
  );
}