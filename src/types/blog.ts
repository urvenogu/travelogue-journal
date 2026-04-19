export type Day = {
  id: string;
  day_number: number;
  title: string;
  date: string | null;
  location: string | null;
  summary: string | null;
};

export type Entry = {
  id: string;
  day_id: string;
  title: string;
  time: string | null;
  text: string | null;
  images: string[];
  video_url: string | null;
  caption: string | null;
  position: number;
  published: boolean;
};

export type DayWithEntries = Day & { entries: Entry[] };
