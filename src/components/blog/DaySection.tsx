import type { DayWithEntries } from "@/types/blog";
import { EntryCard } from "./EntryCard";

const formatDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

export const DaySection = ({ day }: { day: DayWithEntries }) => (
  <section
    id={`day-${day.day_number}`}
    className="scroll-mt-20 py-20 sm:py-28 border-t border-border"
  >
    <div className="container-editorial">
      <header className="mb-14 max-w-3xl">
        <p className="eyebrow mb-4">
          Day {String(day.day_number).padStart(2, "0")} {day.location ? `· ${day.location}` : ""}
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-5">
          {day.title}
        </h2>
        {day.date && (
          <p className="text-sm text-muted-foreground tracking-wide">{formatDate(day.date)}</p>
        )}
        {day.summary && (
          <p className="mt-6 text-lg text-foreground/75 leading-relaxed max-w-2xl">
            {day.summary}
          </p>
        )}
      </header>

      <div className="container-prose !px-0">
        {day.entries.length === 0 ? (
          <p className="text-muted-foreground italic">No entries yet for this day.</p>
        ) : (
          day.entries.map((e) => <EntryCard key={e.id} entry={e} />)
        )}
      </div>
    </div>
  </section>
);
