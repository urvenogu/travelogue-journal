import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { X, Upload, LogOut } from "lucide-react";
import type { Day } from "@/types/blog";

const Admin = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [days, setDays] = useState<Day[]>([]);

  // form
  const [dayId, setDayId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [text, setText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // hero settings
  const [heroId, setHeroId] = useState<string | null>(null);
  const [heroBrand, setHeroBrand] = useState("");
  const [heroEyebrow, setHeroEyebrow] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroItalic, setHeroItalic] = useState("");
  const [heroIntro, setHeroIntro] = useState("");
  const [heroButton, setHeroButton] = useState("");
  const [savingHero, setSavingHero] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }
      const { data } = await supabase.from("days").select("*").order("day_number");
      setDays((data as Day[]) ?? []);
      const { data: hero } = await supabase
        .from("site_settings")
        .select("*")
        .eq("setting_key", "hero")
        .maybeSingle();
      if (hero) {
        setHeroId(hero.id);
        setHeroBrand(hero.brand_name ?? "");
        setHeroEyebrow(hero.eyebrow ?? "");
        setHeroHeadline(hero.headline ?? "");
        setHeroItalic(hero.headline_italic ?? "");
        setHeroIntro(hero.intro ?? "");
        setHeroButton(hero.button_label ?? "");
      }
      setChecking(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("entry-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("entry-images").getPublicUrl(path);
      setImages((arr) => [...arr, data.publicUrl]);
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addUrlImage = () => {
    if (!imageUrl.trim()) return;
    setImages((arr) => [...arr, imageUrl.trim()]);
    setImageUrl("");
  };

  const removeImage = (i: number) =>
    setImages((arr) => arr.filter((_, idx) => idx !== i));

  const reset = () => {
    setTitle(""); setTime(""); setText(""); setVideoUrl("");
    setCaption(""); setImageUrl(""); setImages([]);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayId) {
      toast.error("Pick a day first");
      return;
    }
    setSaving(true);
    try {
      // determine next position
      const { count } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true })
        .eq("day_id", dayId);
      const { error } = await supabase.from("entries").insert({
        day_id: dayId,
        title,
        time: time || null,
        text: text || null,
        images,
        video_url: videoUrl || null,
        caption: caption || null,
        position: (count ?? 0) + 1,
      });
      if (error) throw error;
      toast.success("Entry saved");
      reset();
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking session…</p>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin — New Entry</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <main className="min-h-screen pb-24">
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border">
          <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
            <Link to="/" className="font-serif text-lg">Fourteen Days</Link>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </header>

        <div className="max-w-xl mx-auto px-5 pt-8">
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="font-serif text-3xl mb-8">New entry</h1>

          <form onSubmit={save} className="space-y-5">
            <div>
              <Label>Day</Label>
              <Select value={dayId} onValueChange={setDayId}>
                <SelectTrigger><SelectValue placeholder="Select a day" /></SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      Day {d.day_number} — {d.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title" required value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Morning at the harbour"
              />
            </div>

            <div>
              <Label htmlFor="time">Time (optional)</Label>
              <Input
                id="time" value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="08:30"
              />
            </div>

            <div>
              <Label htmlFor="text">Text</Label>
              <Textarea
                id="text" rows={6} value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write something. Empty lines = new paragraph."
              />
            </div>

            <div className="space-y-3">
              <Label>Images</Label>
              <label className="flex items-center justify-center gap-2 w-full h-12 border border-dashed border-border rounded-sm cursor-pointer hover:bg-secondary/50 transition-colors">
                <Upload className="size-4" />
                <span className="text-sm">{uploading ? "Uploading…" : "Upload from device"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpload(f);
                    e.target.value = "";
                  }}
                />
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="…or paste an image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={addUrlImage}>Add</Button>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="w-full h-24 object-cover rounded-sm" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-background/90 rounded-full p-1 shadow-soft"
                        aria-label="Remove image"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption" value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Sunset over the bay"
              />
            </div>

            <div>
              <Label htmlFor="video">Video URL (YouTube, optional)</Label>
              <Input
                id="video" value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full h-12">
              {saving ? "Saving…" : "Save entry"}
            </Button>
          </form>
        </div>
      </main>
    </>
  );
};

export default Admin;
