import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_DAYS = Array.from({ length: 14 }, (_, i) => i + 1);

export const Navbar = ({
  activeDay,
  availableDays,
}: {
  activeDay?: number;
  availableDays?: number[];
}) => {
  const days = availableDays && availableDays.length > 0 ? availableDays : ALL_DAYS;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jump = (n: number) => {
    setOpen(false);
    if (pathname !== "/") {
      window.location.href = `/#day-${n}`;
      return;
    }
    document.getElementById(`day-${n}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        "bg-black/30 backdrop-blur-sm border-b border-white/10"
      )}
    >
      <div className="container-editorial flex items-center justify-between h-16">
        <Link to="/" className="font-serif text-xl tracking-tight text-white [text-shadow:_0_1px_8px_rgb(0_0_0_/_50%)]">
          Fourteen Days
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Day navigation">
          {days.map((n) => (
            <button
              key={n}
              onClick={() => jump(n)}
              className={cn(
                "px-2.5 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors [text-shadow:_0_1px_6px_rgb(0_0_0_/_50%)]",
                activeDay === n
                  ? "text-white bg-white/20"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              aria-current={activeDay === n ? "true" : undefined}
            >
              {n}
            </button>
          ))}
        </nav>

        <button
          className="lg:hidden p-2 -mr-2 text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container-editorial py-4 grid grid-cols-2 gap-1">
            {days.map((n) => (
              <button
                key={n}
                onClick={() => jump(n)}
                className={cn(
                  "text-left py-3 px-3 text-sm tracking-wide rounded-sm transition-colors",
                  activeDay === n
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60"
                )}
              >
                <span className="eyebrow mr-2">Day</span>
                <span className="font-serif text-base">{n}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
