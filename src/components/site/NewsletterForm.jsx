import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { subscribeNewsletter } from "@/lib/forms-fns";
import { cn } from "@/lib/utils";

export default function NewsletterForm({ tone = "dark", className }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await subscribeNewsletter({ data: { email: email.trim(), website } });
      setDone(true);
      setEmail("");
      toast.success("You're subscribed. Thank you for staying close to our work.");
    } catch (error) {
      toast.error(error?.message || "We could not save your email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p className={cn("text-[14px] leading-relaxed", tone === "dark" ? "text-white/80" : "text-muted-foreground", className)}>
        Thank you — you are on the list. We send occasional updates and never share your email.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("w-full", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={cn(
            "h-12 w-full rounded-sm border px-4 text-[14px] outline-none transition-colors",
            tone === "dark"
              ? "border-white/25 bg-white/10 text-white placeholder:text-white/50 focus:border-white"
              : "border-border bg-white text-foreground placeholder:text-muted-foreground focus:border-primary"
          )}
        />
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          className="hidden"
          aria-hidden="true"
        />
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-sm px-6 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors disabled:opacity-60",
            tone === "dark"
              ? "bg-white text-navy hover:bg-gold hover:text-navy"
              : "bg-primary text-white hover:bg-foreground"
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Subscribe
          {!loading && <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}