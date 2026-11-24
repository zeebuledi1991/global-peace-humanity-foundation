import Reveal from "@/components/site/Reveal";

export default function ImpactSection({ stats = {} }) {
  const impactStats = [
    {
      value: String(stats.programs ?? 0),
      label: "Humanitarian focus areas",
      note: "Education, health, water, relief and more",
    },
    { value: "Pakistan", label: "Registered and operating", note: "Serving communities locally" },
    { value: "Worldwide", label: "Donor and partner reach", note: "International donations accepted" },
    {
      value: "Verified",
      label: "Donations before receipts",
      note: "Every payment confirmed server-side",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-primary py-16 text-white sm:py-20">
      <div className="shell relative">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="max-w-2xl text-balance text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight text-white">
            How we work, in plain terms.
          </h2>
          <p className="max-w-xl text-[13px] leading-relaxed text-white/65">
            Verified beneficiary and financial figures are published only once confirmed. Until then,
            we show what is true today.
          </p>
        </div>

        <div className="mt-10 grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {impactStats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.07}>
              <div className="border-white/20 pr-4 lg:border-l lg:pl-6">
                <p className="font-heading text-[clamp(2rem,3.4vw,2.75rem)] leading-none text-white">
                  {stat.value}
                </p>
                <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/85">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/55">{stat.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}