import heroImage from "@/assets/hero.jpg";
import { useHero } from "@/hooks/useHero";

export const HeroSection = () => {
  const { hero } = useHero();
  const scrollDown = () =>
    document.getElementById("trip-intro")?.scrollIntoView({ behavior: "smooth" });

  const eyebrow = hero?.eyebrow ?? "A 14-day journal · May 2025";
  const headline = hero?.headline ?? "Across the warm south,";
  const italic = hero?.headline_italic ?? "slowly";
  const intro =
    hero?.intro ??
    "Two weeks tracing the Iberian coast — small towns, long lunches, and the kind of light that ruins you for everywhere else.";
  const buttonLabel = hero?.button_label ?? "Begin the journal";

  return (
    <section className="relative -mt-16 h-[100svh] min-h-[640px] w-full overflow-hidden">
      <img
        src={heroImage}
        alt="Golden hour over a winding coastal road in southern Europe"
        width={1920}
        height={1080}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/95" />

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-1" />
        <div className="container-editorial pb-16 sm:pb-24 animate-fade-up">
          {eyebrow && <p className="eyebrow text-foreground/80 mb-4">{eyebrow}</p>}
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl leading-[0.95] max-w-4xl">
            {headline}
            {italic && (
              <>
                <br />
                <em className="italic text-primary">{italic}</em>
              </>
            )}
          </h1>
          {intro && (
            <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {intro}
            </p>
          )}
          <button
            onClick={scrollDown}
            className="mt-10 inline-flex items-center gap-2 text-sm tracking-wider uppercase border-b border-foreground/40 pb-1 hover:border-foreground transition-colors"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
};
