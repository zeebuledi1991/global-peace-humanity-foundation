import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitContactMessage } from "@/lib/forms-fns";
import { COUNTRIES } from "@/content/options";
import { inputClass, labelClass, submitClass, textareaClass } from "@/components/site/formStyles";

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "", website: "" };

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await submitContactMessage({ data: { ...values } });
      setSent(true);
      setValues(EMPTY);
      toast.success("Your message has been sent to our team.");
    } catch (error) {
      toast.error(error?.message || "We could not send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-sm border border-border bg-mist p-8 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
        <h3 className="mt-4 text-[20px]">Message received</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          Thank you for writing to us. Our team reviews every message and will reply to the email
          address you provided.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary hover:text-foreground"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="contact-name">
            Full name *
          </label>
          <input id="contact-name" required value={values.name} onChange={update("name")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="contact-email">
            Email *
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={values.email}
            onChange={update("email")}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="contact-phone">
            Phone (optional)
          </label>
          <input id="contact-phone" value={values.phone} onChange={update("phone")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="contact-country">
            Country (optional)
          </label>
          <select id="contact-country" className={inputClass} defaultValue="" aria-label="Country">
            <option value="">Select country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="contact-subject">
          Subject
        </label>
        <input
          id="contact-subject"
          value={values.subject}
          onChange={update("subject")}
          placeholder="How can we help?"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="contact-message">
          Message *
        </label>
        <textarea
          id="contact-message"
          required
          minLength={10}
          value={values.message}
          onChange={update("message")}
          placeholder="Write your message here"
          className={textareaClass}
        />
      </div>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={values.website}
        onChange={update("website")}
        className="hidden"
        aria-hidden="true"
      />

      <button type="submit" disabled={loading} className={submitClass}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Send message
      </button>
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Your message is stored securely and visible only to our team. Never send card details by
        email.
      </p>
    </form>
  );
}