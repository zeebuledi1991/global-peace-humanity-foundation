import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitVolunteerApplication } from "@/lib/forms-fns";
import { COUNTRIES, VOLUNTEER_AREAS } from "@/content/options";
import { inputClass, labelClass, selectClass, submitClass, textareaClass } from "@/components/site/formStyles";
import { cn } from "@/lib/utils";

const EMPTY = {
  full_name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  availability: "",
  skills: "",
  motivation: "",
  website: "",
};

export default function VolunteerForm() {
  const [values, setValues] = useState(EMPTY);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const toggleArea = (area) =>
    setAreas((prev) => (prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]));

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await submitVolunteerApplication({ data: { ...values, areas_of_interest: areas } });
      setSent(true);
      setValues(EMPTY);
      setAreas([]);
      toast.success("Your volunteer application has been submitted.");
    } catch (error) {
      toast.error(error?.message || "We could not submit your application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-sm border border-border bg-mist p-8 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
        <h3 className="mt-4 text-[20px]">Application received</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          Thank you for offering your time. Our team reviews applications and will contact you if
          there is a suitable role. Volunteers working with children complete safeguarding checks
          before starting.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary hover:text-foreground"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="vol-name">
            Full name *
          </label>
          <input id="vol-name" required value={values.full_name} onChange={update("full_name")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="vol-email">
            Email *
          </label>
          <input
            id="vol-email"
            type="email"
            required
            value={values.email}
            onChange={update("email")}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="vol-phone">
            Phone
          </label>
          <input id="vol-phone" value={values.phone} onChange={update("phone")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="vol-country">
            Country *
          </label>
          <select id="vol-country" required value={values.country} onChange={update("country")} className={selectClass}>
            <option value="">Select country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="vol-city">
            City
          </label>
          <input id="vol-city" value={values.city} onChange={update("city")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="vol-availability">
            Availability
          </label>
          <input
            id="vol-availability"
            value={values.availability}
            onChange={update("availability")}
            placeholder="e.g. weekends, 4 hours per week"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>Areas of interest</span>
        <div className="flex flex-wrap gap-2">
          {VOLUNTEER_AREAS.map((area) => {
            const active = areas.includes(area);
            return (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                aria-pressed={active}
                className={cn(
                  "rounded-sm border px-3 py-2 text-[12px] transition-colors",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-foreground/75 hover:border-primary hover:text-primary"
                )}
              >
                {area}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="vol-skills">
          Skills and experience
        </label>
        <textarea
          id="vol-skills"
          value={values.skills}
          onChange={update("skills")}
          placeholder="Tell us about your background, languages and any relevant experience"
          className={textareaClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="vol-motivation">
          Why would you like to volunteer?
        </label>
        <textarea
          id="vol-motivation"
          value={values.motivation}
          onChange={update("motivation")}
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
        Submit application
      </button>
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        By applying you agree to our Safeguarding &amp; Child Protection Policy. Applications are
        stored securely and reviewed only by our team.
      </p>
    </form>
  );
}