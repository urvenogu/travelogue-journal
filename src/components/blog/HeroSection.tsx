import heroImage from "@/assets/hero.jpg";

export const HeroSection = () => {
  const scrollDown = () =>
    document.getElementById("trip-intro")?.scrollIntoView({ behavior: "smooth" });

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
          <p className="eyebrow text-foreground/80 mb-4">A 14-day journal · May 2025</p>
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl leading-[0.95] max-w-4xl">
            Across the warm south,<br />
            <em className="italic text-primary">slowly</em>.
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Two weeks tracing the Iberian coast — small towns, long lunches,
            and the kind of light that ruins you for everywhere else.
          </p>
          <button
            onClick={scrollDown}
            className="mt-10 inline-flex items-center gap-2 text-sm tracking-wider uppercase border-b border-foreground/40 pb-1 hover:border-foreground transition-colors"
          >
            Begin the journal
          </button>
        </div>
      </div>
    </section>
  );
};
