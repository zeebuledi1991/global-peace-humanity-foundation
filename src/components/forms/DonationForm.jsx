import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Loader2, Lock, Repeat, ShieldCheck } from "lucide-react";
import { submitDonation } from "@/lib/forms-fns";
import { COUNTRIES, CURRENCIES, SUGGESTED_AMOUNTS } from "@/content/options";
import { inputClass, labelClass, selectClass, textareaClass } from "@/components/site/formStyles";
import { cn } from "@/lib/utils";

export default function DonationForm({
  campaigns = [],
  projects = [],
  initialAmount,
  initialFrequency,
  initialProject,
}) {
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState(initialFrequency === "monthly" ? "monthly" : "one_time");
  const [amount, setAmount] = useState(
    SUGGESTED_AMOUNTS.includes(Number(initialAmount)) ? String(initialAmount) : "50"
  );
  const [currency, setCurrency] = useState("USD");
  const [values, setValues] = useState({
    donor_name: "",
    donor_email: "",
    donor_phone: "",
    country: "",
    dedication: "",
    campaign_id: campaigns[0]?.id || "",
    project_id: initialProject || "",
    website: "",
  });
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    const numeric = Number(amount);
    const nextErrors = {};
    if (!numeric || numeric < 1) nextErrors.amount = "Enter an amount of at least 1.";
    if (values.donor_name.trim().length < 2) nextErrors.donor_name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.donor_email.trim()))
      nextErrors.donor_email = "Enter a valid email address.";
    if (!values.country) nextErrors.country = "Please select your country.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const result = await submitDonation({
        data: {
          ...values,
          amount: numeric,
          currency,
          frequency,
          is_anonymous: anonymous,
          payment_method: "bank_transfer",
        },
      });
      if (!result?.reference) {
        toast.error("We could not record your donation. Please try again.");
        return;
      }
      navigate({ to: "/donation-confirmation", search: { ref: result.reference } });
    } catch (error) {
      toast.error(error?.message || "We could not record your donation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-sm border border-border bg-white p-6 sm:p-8">
      <div className="flex rounded-sm border border-border p-1">
        {[
          { value: "one_time", label: "One-time", icon: Check },
          { value: "monthly", label: "Monthly", icon: Repeat },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFrequency(option.value)}
            aria-pressed={frequency === option.value}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-sm px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors",
              frequency === option.value ? "bg-primary text-white" : "text-foreground/70 hover:text-primary"
            )}
          >
            <option.icon className="h-3.5 w-3.5" aria-hidden="true" />
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <span className={labelClass}>Choose an amount</span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {SUGGESTED_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              aria-pressed={Number(amount) === preset}
              className={cn(
                "rounded-sm border px-2 py-3 text-[14px] font-semibold transition-colors",
                Number(amount) === preset
                  ? "border-primary bg-primary text-white"
                  : "border-border text-foreground hover:border-primary hover:text-primary"
              )}
            >
              ${preset}
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          <div>
            <label className={labelClass} htmlFor="donation-amount">
              Amount
            </label>
            <input
              id="donation-amount"
              type="number"
              min="1"
              step="1"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={inputClass}
            />
            {errors.amount && <p className="mt-1 text-[12px] text-destructive">{errors.amount}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="donation-currency">
              Currency
            </label>
            <select
              id="donation-currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className={selectClass}
            >
              {CURRENCIES.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">
          {frequency === "monthly"
            ? "You are setting up a monthly commitment. Recurring billing begins once the payment gateway is active."
            : "You are making a one-time pledge."}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="donor-name">
            Full name *
          </label>
          <input
            id="donor-name"
            required
            value={values.donor_name}
            onChange={update("donor_name")}
            className={inputClass}
          />
          {errors.donor_name && <p className="mt-1 text-[12px] text-destructive">{errors.donor_name}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="donor-email">
            Email *
          </label>
          <input
            id="donor-email"
            type="email"
            required
            value={values.donor_email}
            onChange={update("donor_email")}
            className={inputClass}
          />
          {errors.donor_email && <p className="mt-1 text-[12px] text-destructive">{errors.donor_email}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="donor-country">
            Country *
          </label>
          <select
            id="donor-country"
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
          {errors.country && <p className="mt-1 text-[12px] text-destructive">{errors.country}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="donor-phone">
            Phone (optional)
          </label>
          <input id="donor-phone" value={values.donor_phone} onChange={update("donor_phone")} className={inputClass} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="donor-campaign">
            Support a campaign
          </label>
          <select
            id="donor-campaign"
            value={values.campaign_id}
            onChange={update("campaign_id")}
            className={selectClass}
          >
            <option value="">Where it is needed most</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="donor-project">
            Or a specific project
          </label>
          <select
            id="donor-project"
            value={values.project_id}
            onChange={update("project_id")}
            className={selectClass}
          >
            <option value="">No specific project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass} htmlFor="donor-dedication">
          Dedication message (optional)
        </label>
        <textarea
          id="donor-dedication"
          value={values.dedication}
          onChange={update("dedication")}
          maxLength={400}
          placeholder="Dedicate this gift or leave a short message"
          className={textareaClass}
        />
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-sm border border-border p-4">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(event) => setAnonymous(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#174D38]"
        />
        <span className="text-[13px] leading-relaxed text-foreground/80">
          Give anonymously — your name will not be shown publicly. We still keep your details for your
          receipt.
        </span>
      </label>

      <div className="mt-6">
        <span className={labelClass}>Payment method</span>
        <div className="space-y-2">
          <div className="flex items-start gap-3 rounded-sm border border-primary bg-primary/5 p-4">
            <input type="radio" checked readOnly className="mt-1 h-4 w-4 accent-[#174D38]" aria-label="Bank transfer" />
            <div>
              <p className="text-[14px] font-semibold text-foreground">Bank transfer</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Available now. Transfer instructions are shown on the confirmation page.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-sm border border-border bg-secondary/40 p-4 opacity-70">
            <input type="radio" disabled className="mt-1 h-4 w-4" aria-label="Card payment unavailable" />
            <div>
              <p className="text-[14px] font-semibold text-foreground">Card / hosted checkout</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Awaiting payment gateway activation. Card payments are not accepted yet.
              </p>
            </div>
          </div>
        </div>
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

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-sm bg-primary px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-foreground disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Continue to confirmation
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Card details are never stored here
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Donations verified before receipts
        </span>
      </div>
    </form>
  );
}