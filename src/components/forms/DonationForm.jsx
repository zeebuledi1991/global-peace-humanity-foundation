import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Loader2, Lock, Repeat, ShieldCheck } from "lucide-react";
import { startGatewayPayment, submitBankTransferDonation } from "@/lib/payment-fns";
import { submitCheckoutAction } from "@/lib/payments/checkout";
import PaymentMethodPicker from "@/components/checkout/PaymentMethodPicker";
import BankTransferFields from "@/components/checkout/BankTransferFields";
import { COUNTRIES, CURRENCIES, SUGGESTED_AMOUNTS } from "@/content/options";
import { inputClass, labelClass, selectClass, textareaClass } from "@/components/site/formStyles";
import { cn } from "@/lib/utils";

export default function DonationForm({
  campaigns = [],
  projects = [],
  methods = { gateways: [], banks: [] },
  initialAmount,
  initialFrequency,
  initialProject,
}) {
  const navigate = useNavigate();
  const gateways = methods.gateways || [];
  const banks = methods.banks || [];

  const [frequency, setFrequency] = useState(initialFrequency === "monthly" ? "monthly" : "one_time");
  const [amount, setAmount] = useState(
    SUGGESTED_AMOUNTS.includes(Number(initialAmount)) ? String(initialAmount) : "50"
  );
  const [currency, setCurrency] = useState(gateways[0]?.currencies?.[0] || "USD");
  const [method, setMethod] = useState(gateways[0]?.id || (banks.length ? "bank_transfer" : ""));
  const [bank, setBank] = useState({
    bank_account_id: banks[0]?.id || "",
    transfer_reference: "",
    transfer_date: "",
    proof_file_uri: "",
    proof_name: "",
  });
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

  const gateway = gateways.find((entry) => entry.id === method) || null;
  const isBank = method === "bank_transfer";
  const currencyOptions = gateway
    ? CURRENCIES.filter((option) => gateway.currencies.includes(option.code))
    : CURRENCIES;
  const monthlySupported = !gateway || gateway.supportsRecurring;

  const update = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const chooseMethod = (next) => {
    setMethod(next);
    setErrors({});
    const nextGateway = gateways.find((entry) => entry.id === next);
    if (nextGateway) {
      if (!nextGateway.currencies.includes(currency)) setCurrency(nextGateway.currencies[0] || currency);
      if (!nextGateway.supportsRecurring && frequency === "monthly") setFrequency("one_time");
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const numeric = Number(amount);
    const nextErrors = {};
    if (!method) nextErrors.method = "Choose a payment method.";
    if (!numeric || numeric < 1) nextErrors.amount = "Enter an amount of at least 1.";
    if (values.donor_name.trim().length < 2) nextErrors.donor_name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.donor_email.trim()))
      nextErrors.donor_email = "Enter a valid email address.";
    if (!values.country) nextErrors.country = "Please select your country.";
    if (isBank && bank.transfer_reference.trim().length < 2)
      nextErrors.transfer_reference = "Add the reference your bank shows for this transfer.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    const payload = {
      donor_name: values.donor_name,
      donor_email: values.donor_email,
      donor_phone: values.donor_phone,
      country: values.country,
      amount: numeric,
      currency,
      frequency,
      is_anonymous: anonymous,
      dedication: values.dedication,
      campaign_id: values.campaign_id,
      project_id: values.project_id,
      website: values.website,
    };

    try {
      if (isBank) {
        const result = await submitBankTransferDonation({
          data: {
            ...payload,
            bank_account_id: bank.bank_account_id || banks[0]?.id,
            transfer_reference: bank.transfer_reference,
            transfer_date: bank.transfer_date || "",
            proof_file_uri: bank.proof_file_uri || "",
          },
        });
        if (!result?.ok || !result?.reference) {
          toast.error(result?.error || "We could not record your transfer. Please try again.");
          return;
        }
        navigate({ to: "/donation-confirmation", search: { ref: result.reference } });
        return;
      }

      const result = await startGatewayPayment({ data: { ...payload, gateway_id: method } });
      if (!result?.ok) {
        toast.error(result?.error || "The payment could not be started. Please try again.");
        return;
      }
      toast.success("Taking you to the secure checkout…");
      submitCheckoutAction(result.action);
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
            disabled={option.value === "monthly" && !monthlySupported}
            onClick={() => setFrequency(option.value)}
            aria-pressed={frequency === option.value}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-sm px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
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
              {currencyOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">
          {frequency === "monthly"
            ? "You are setting up a monthly commitment with the selected provider."
            : "You are making a one-time gift."}
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
        <PaymentMethodPicker
          gateways={gateways}
          banks={banks}
          value={method}
          onChange={chooseMethod}
          monthly={frequency === "monthly"}
        />
        {errors.method && <p className="mt-1 text-[12px] text-destructive">{errors.method}</p>}
        {isBank && banks.length > 0 && (
          <BankTransferFields banks={banks} value={bank} onChange={(patch) => setBank((prev) => ({ ...prev, ...patch }))} error={errors} />
        )}
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
        disabled={loading || !method}
        className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-sm bg-primary px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-foreground disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isBank ? "Submit transfer for verification" : "Continue to secure checkout"}
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Card details are entered on the provider's secure page, never here
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Donations verified before receipts
        </span>
      </div>
    </form>
  );
}