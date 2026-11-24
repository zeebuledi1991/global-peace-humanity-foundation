import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

export const LOGO_URL =
  "https://media.base44.com/images/public/user_6aeda2ecb9f864218d6cd8a6/32dc3e87a05943671603e36a4f455eb3_GlobalPeaceandHumanityEmblem.png";

export default function Logo({ className, withText = true, tone = "dark" }) {
  return (
    <span className="flex items-center gap-3">
      <Image
        src={LOGO_URL}
        alt="Global Peace & Humanity Foundation emblem"
        fittingType="fit"
        className={cn("h-12 w-12 shrink-0", className)}
      />
      {withText && (
        <span className="hidden leading-tight sm:block">
          <span
            className={cn(
              "block font-heading text-[17px] tracking-tight",
              tone === "light" ? "text-white" : "text-foreground"
            )}
          >
            Global Peace &amp; Humanity
          </span>
          <span
            className={cn(
              "mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.3em]",
              tone === "light" ? "text-white/70" : "text-muted-foreground"
            )}
          >
            Foundation
          </span>
        </span>
      )}
    </span>
  );
}