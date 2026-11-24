import { cn } from "@/lib/utils";

export default function SectionHeading({ eyebrow, title, description, align = "left", className, children }) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className={cn("eyebrow flex items-center gap-3", align === "center" && "justify-center")}>
          {align === "center" && <span className="hidden h-px w-8 bg-primary/40 sm:block" aria-hidden="true" />}
          {eyebrow}
          {align === "center" && <span className="hidden h-px w-8 bg-primary/40 sm:block" aria-hidden="true" />}
        </p>
      )}
      <h2 className="mt-3 text-balance text-[clamp(1.9rem,3.4vw,2.85rem)] leading-[1.08]">{title}</h2>
      {description && (
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]">{description}</p>
      )}
      {children}
    </div>
  );
}