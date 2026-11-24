import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

export default function PageHero({ eyebrow, title, description, image, imageAlt, children, className }) {
  return (
    <section className={cn("border-b border-border bg-mist", className)}>
      <div className="shell grid gap-10 py-14 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:py-20">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-4 max-w-[24ch] text-balance text-[clamp(2.1rem,4.2vw,3.4rem)] leading-[1.02]">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-[60ch] text-[16px] leading-[1.7] text-muted-foreground sm:text-[17px]">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
        {image && (
          <div className="relative aspect-[16/10] overflow-hidden rounded-sm lg:aspect-[4/3]">
            <Image src={image} alt={imageAlt || title} className="h-full w-full" />
          </div>
        )}
      </div>
    </section>
  );
}