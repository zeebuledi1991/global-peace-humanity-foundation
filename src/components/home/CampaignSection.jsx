import { Link } from "@tanstack/react-router";
import { ArrowRight, Repeat } from "lucide-react";
import { Image } from "@/components/ui/image";
import Reveal from "@/components/site/Reveal";
import { formatCurrency } from "@/lib/format";

export default function CampaignSection({ campaign }) {
  if (!campaign) return null;
  const featuredCampaign = campaign;
  const goal = Number(featuredCampaign.goal_amount) || 0;
  const raised = Number(featuredCampaign.raised_amount) || 0;
  const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <section className="bg-mist py-20 sm:py-28">
      <div className="shell">
        <div className="grid overflow-hidden rounded-sm border border-border bg-white lg:grid-cols-2">
          <div className="relative min-h-[280px]">
            <Image
              src={featuredCampaign.image_url}
              alt={featuredCampaign.image_alt}
              className="h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" aria-hidden="true" />
            <p className="absolute bottom-5 left-5 rounded-sm bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Featured campaign
            </p>
          </div>

          <Reveal className="p-8 sm:p-12">
            <p className="eyebrow">Give with purpose</p>
            <h2 className="mt-4 text-balance text-[clamp(1.7rem,2.8vw,2.4rem)] leading-tight">
              {featuredCampaign.title}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              {featuredCampaign.description}
            </p>

            <div className="mt-8">
              <div className="flex items-end justify-between">
                <p className="font-heading text-3xl text-foreground">
                  {formatCurrency(raised, featuredCampaign.currency)}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  of {formatCurrency(goal, featuredCampaign.currency)} goal
                </p>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {raised > 0 ? `${percent}% funded by verified donations` : "Awaiting the first verified donation"}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/donate"
                className="group inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-foreground"
              >
                Support this campaign
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                to="/donate"
                search={{ frequency: "monthly" }}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Repeat className="h-4 w-4" aria-hidden="true" />
                Give monthly
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}