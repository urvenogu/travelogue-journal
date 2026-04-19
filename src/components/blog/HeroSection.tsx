import heroImage from "@/assets/hero.jpg";
import { useHero } from "@/hooks/useHero";

export const HeroSection = () => {
  const { hero } = useHero();
  const scrollDown = () =>
    document.getElementById("trip-intro")?.scrollIntoView({ behavior: "smooth" });

  // Once hero is loaded from DB, respect empty values (hide those fields). Only fall back to defaults before load.
  const isLoaded = hero !== null;
  const eyebrow = isLoaded ? hero.eyebrow : "A 14-day journal · May 2025";
  const headline = isLoaded ? hero.headline : "Across the warm south,";
  const italic = isLoaded ? hero.headline_italic : "slowly";
  const intro = isLoaded
    ? hero.intro
    : "Two weeks tracing the Iberian coast — small towns, long lunches, and the kind of light that ruins you for everywhere else.";
  const buttonLabel = isLoaded ? hero.button_label : "Begin the journal";
  const bgImage = hero?.hero_image_url || heroImage;

  return (
    <section className="relative h-[calc(100svh-4rem)] min-h-[640px] w-full overflow-hidden">
      <img
        src={bgImage}
        alt="Hero background"
        width={1920}
        height={1080}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background/95" />

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-1" />
        <div className="container-editorial pb-16 sm:pb-24 animate-fade-up">
          <div className="max-w-4xl rounded-2xl bg-black/30 backdrop-blur-sm p-6 sm:p-8 [text-shadow:_0_2px_16px_rgb(0_0_0_/_60%)]">
            {eyebrow && <p className="eyebrow text-white/90 mb-4">{eyebrow}</p>}
            <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl leading-[0.95] text-white">
              {headline}
              {italic && (
                <>
                  <br />
                  <em className="italic text-primary-foreground/95">{italic}</em>
                </>
              )}
            </h1>
            {intro && (
              <p className="mt-6 max-w-xl text-base sm:text-lg text-white/90 leading-relaxed whitespace-pre-line">
                {intro}
              </p>
            )}
            <button
              onClick={scrollDown}
              className="mt-10 inline-flex items-center gap-2 text-sm tracking-wider uppercase text-white border-b border-white/60 pb-1 hover:border-white transition-colors"
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
