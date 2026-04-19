import type { Entry } from "@/types/blog";
import { Gallery } from "./Gallery";
import { VideoBlock } from "./VideoBlock";

export const EntryCard = ({ entry }: { entry: Entry }) => (
  <article className="py-10 first:pt-0 border-t border-border first:border-t-0">
    <header className="mb-5">
      {entry.time && <p className="eyebrow mb-2">{entry.time}</p>}
      <h3 className="font-serif text-2xl sm:text-3xl leading-snug">{entry.title}</h3>
    </header>

    {entry.text && (
      <div className="prose prose-neutral max-w-none">
        {entry.text.split(/\n\n+/).map((p, i) => (
          <p key={i} className="text-foreground/85 leading-relaxed mb-4 text-[1.02rem]">
            {p}
          </p>
        ))}
      </div>
    )}

    {entry.images?.length > 0 && <Gallery images={entry.images} alt={entry.title} />}
    {entry.caption && (
      <p className="text-sm italic text-muted-foreground text-center -mt-2 mb-4">
        {entry.caption}
      </p>
    )}
    {entry.video_url && <VideoBlock url={entry.video_url} />}
  </article>
);
