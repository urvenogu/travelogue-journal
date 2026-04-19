import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/blog/Navbar";
import { HeroSection } from "@/components/blog/HeroSection";
import { TripIntro } from "@/components/blog/TripIntro";
import { DaySection } from "@/components/blog/DaySection";
import { Footer } from "@/components/blog/Footer";
import { useTrip } from "@/hooks/useTrip";

const Index = () => {
  const { data, loading } = useTrip();
  const [activeDay, setActiveDay] = useState<number | undefined>();

  // observe day sections to highlight active in nav
  useEffect(() => {
    if (!data.length) return;
    const observers: IntersectionObserver[] = [];
    const handler = (n: number) => (entries: IntersectionObserverEntry[]) => {
      if (entries.some((e) => e.isIntersecting)) setActiveDay(n);
    };
    data.forEach((d) => {
      const el = document.getElementById(`day-${d.day_number}`);
      if (!el) return;
      const o = new IntersectionObserver(handler(d.day_number), {
        rootMargin: "-40% 0px -55% 0px",
      });
      o.observe(el);
      observers.push(o);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [data]);

  // jump to hash after load
  useEffect(() => {
    if (loading) return;
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => document.getElementById(id)?.scrollIntoView(), 100);
    }
  }, [loading]);

  const ogImage = useMemo(() => `${window.location.origin}/og-image.jpg`, []);

  return (
    <>
      <Helmet>
        <title>Fourteen Days — A 14-day travel journal across Iberia</title>
        <meta
          name="description"
          content="A 14-day travel journal across Portugal and Spain — daily entries, photo galleries, and notes from the road."
        />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="Fourteen Days — A travel journal" />
        <meta
          property="og:description"
          content="Two weeks tracing the Iberian coast in words and photographs."
        />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Navbar activeDay={activeDay} />
      <main>
        <HeroSection />
        <TripIntro />
        {loading ? (
          <div className="container-editorial py-24 text-center text-muted-foreground">
            Loading the journal…
          </div>
        ) : (
          data.map((d) => <DaySection key={d.id} day={d} />)
        )}
      </main>
      <Footer />
    </>
  );
};

export default Index;
