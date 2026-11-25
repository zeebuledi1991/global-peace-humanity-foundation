import { cn } from "@/lib/utils";

export default function PortalStat({ label, value, note, icon: Icon, tone = "forest" }) {
  const tones = {
    forest: "bg-primary/10 text-primary",
    navy: "bg-navy/10 text-navy",
    gold: "bg-gold/20 text-[#7a5c10]",
    muted: "bg-secondary text-muted-foreground",
  };

  return (
    <div className="rounded-sm border border-border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-sm", tones[tone])}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 font-heading text-[26px] leading-none text-foreground">{value}</p>
      {note && <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{note}</p>}
    </div>
  );
}