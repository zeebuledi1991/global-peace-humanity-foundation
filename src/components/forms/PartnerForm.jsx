import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitPartnership } from "@/lib/forms-fns";
import { COUNTRIES } from "@/content/options";
import { inputClass, labelClass, selectClass, submitClass, textareaClass } from "@/components/site/formStyles";

const EMPTY = {
  organization_name: "",
  contact_name: "",
  email: "",
  phone: "",
  country: "",
  partnership_type: "corporate",
  message: "",
  website: "",
};

const TYPES = [
  { value: "corporate", label: "Corporate partnership" },
  { value: "ngo", label: "NGO collaboration" },
  { value: "fundraising", label: "Fundraising partnership" },
  { value: "project_sponsorship", label: "Project sponsorship" },
];

export default function PartnerForm() {
  const [values, setValues] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await submitPartnership({ data: { ...values } });
      setSent(true);
      setValues(EMPTY);
      toast.success("Your partnership enquiry has been submitted.");
    } catch (error) {
      toast.error(error?.message || "We could not submit your enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-sm border border-border bg-mist p-8 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
        <h3 className="mt-4 text-[20px]">Enquiry received</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          Thank you for your interest in partnering with us. Our team will review your enquiry and
          respond to the contact email provided.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary hover:text-foreground"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="partner-org">
            Organization *
          </label>
          <input
            id="partner-org"
            required
            value={values.organization_name}
            onChange={update("organization_name")}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="partner-contact">
            Contact name *
          </label>
          <input
            id="partner-contact"
            required
            value={values.contact_name}
            onChange={update("contact_name")}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="partner-email">
            Email *
          </label>
          <input
            id="partner-email"
            type="email"
            required
            value={values.email}
            onChange={update("email")}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="partner-phone">
            Phone
          </label>
          <input id="partner-phone" value={values.phone} onChange={update("phone")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="partner-country">
            Country *
          </label>
          <select
            id="partner-country"
            required
            value={values.country}
            onChange={update("country")}
            className={selectClass}
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
          <label className={labelClass} htmlFor="partner-type">
            Partnership type *
          </label>
          <select
            id="partner-type"
            value={values.partnership_type}
            onChange={update("partnership_type")}
            className={selectClass}
          >
            {TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="partner-message">
          Tell us about your organization and what you have in mind
        </label>
        <textarea
          id="partner-message"
          value={values.message}
          onChange={update("message")}
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
        Submit enquiry
      </button>
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Partnership enquiries are stored securely and reviewed by our team.
      </p>
    </form>
  );
}