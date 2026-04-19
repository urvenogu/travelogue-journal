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
import { X, Upload, LogOut, Trash2, Pencil } from "lucide-react";
import type { Day, Entry } from "@/types/blog";

const Admin = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [days, setDays] = useState<Day[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);

  // new-entry form
  const [dayId, setDayId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // day editor
  const [editDayId, setEditDayId] = useState<string>("");
  const [dTitle, setDTitle] = useState("");
  const [dDate, setDDate] = useState("");
  const [dLocation, setDLocation] = useState("");
  const [dSummary, setDSummary] = useState("");
  const [savingDay, setSavingDay] = useState(false);

  // hero settings
  const [heroId, setHeroId] = useState<string | null>(null);
  const [heroBrand, setHeroBrand] = useState("");
  const [heroEyebrow, setHeroEyebrow] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [heroItalic, setHeroItalic] = useState("");
  const [heroIntro, setHeroIntro] = useState("");
  const [heroButton, setHeroButton] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroUploading, setHeroUploading] = useState(false);
  const [savingHero, setSavingHero] = useState(false);

  const loadDays = async () => {
    const { data } = await supabase.from("days").select("*").order("day_number");
    setDays((data as Day[]) ?? []);
  };
  const loadEntries = async () => {
    const { data } = await supabase.from("entries").select("*").order("position");
    setEntries((data as Entry[]) ?? []);
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }
      await Promise.all([loadDays(), loadEntries()]);
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
        setHeroImageUrl(hero.hero_image_url ?? "");
      }
      setChecking(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  // Load day fields when picking from Days tab
  useEffect(() => {
    if (!editDayId) return;
    const d = days.find((x) => x.id === editDayId);
    if (d) {
      setDTitle(d.title ?? "");
      setDDate(d.date ?? "");
      setDLocation(d.location ?? "");
      setDSummary(d.summary ?? "");
    }
  }, [editDayId, days]);

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

  const onHeroUpload = async (file: File) => {
    setHeroUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `hero/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("entry-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("entry-images").getPublicUrl(path);
      setHeroImageUrl(data.publicUrl);
      toast.success("Hero image uploaded — don't forget to save");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setHeroUploading(false);
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
    setEditingEntryId(null);
    setTitle(""); setText(""); setVideoUrl("");
    setImageUrl(""); setImages([]);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayId) {
      toast.error("Pick a day first");
      return;
    }
    setSaving(true);
    try {
      if (editingEntryId) {
        const { error } = await supabase
          .from("entries")
          .update({
            day_id: dayId,
            title,
            text: text || null,
            images,
            video_url: videoUrl || null,
          })
          .eq("id", editingEntryId);
        if (error) throw error;
        toast.success("Entry updated");
      } else {
        const { count } = await supabase
          .from("entries")
          .select("*", { count: "exact", head: true })
          .eq("day_id", dayId);
        const { error } = await supabase.from("entries").insert({
          day_id: dayId,
          title,
          text: text || null,
          images,
          video_url: videoUrl || null,
          position: (count ?? 0) + 1,
        });
        if (error) throw error;
        toast.success("Entry saved");
      }
      reset();
      await loadEntries();
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const startEditEntry = (entry: Entry) => {
    setEditingEntryId(entry.id);
    setDayId(entry.day_id);
    setTitle(entry.title ?? "");
    setText(entry.text ?? "");
    setVideoUrl(entry.video_url ?? "");
    setImages(entry.images ?? []);
    setActiveTab("entry");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Entry deleted");
    if (editingEntryId === id) reset();
    await loadEntries();
  };

  const saveDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDayId) {
      toast.error("Pick a day first");
      return;
    }
    setSavingDay(true);
    try {
      const { error } = await supabase
        .from("days")
        .update({
          title: dTitle,
          date: dDate || null,
          location: dLocation.trim() || null,
          summary: dSummary.trim() || null,
        })
        .eq("id", editDayId);
      if (error) throw error;
      toast.success("Day updated");
      await loadDays();
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSavingDay(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  const saveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroId) {
      toast.error("Hero settings not loaded");
      return;
    }
    setSavingHero(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({
          brand_name: heroBrand.trim(),
          eyebrow: heroEyebrow.trim() || null,
          headline: heroHeadline,
          headline_italic: heroItalic.trim() || null,
          intro: heroIntro.trim() || null,
          button_label: heroButton,
          hero_image_url: heroImageUrl.trim() || null,
        })
        .eq("id", heroId);
      if (error) throw error;
      toast.success("Hero updated");
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSavingHero(false);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking session…</p>
      </main>
    );
  }

  const dayLabel = (id: string) => {
    const d = days.find((x) => x.id === id);
    return d ? `Day ${d.day_number}` : "—";
  };

  return (
    <>
      <Helmet>
        <title>Admin — Manage</title>
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
          <h1 className="font-serif text-3xl mb-8">Manage</h1>

          <Tabs defaultValue="entry" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="entry">{editingEntryId ? "Edit" : "New"}</TabsTrigger>
              <TabsTrigger value="entries">Entries</TabsTrigger>
              <TabsTrigger value="days">Days</TabsTrigger>
              <TabsTrigger value="hero">Hero</TabsTrigger>
            </TabsList>

            {/* NEW / EDIT ENTRY */}
            <TabsContent value="entry">
              <form onSubmit={save} className="space-y-5">
                {editingEntryId && (
                  <div className="flex items-center justify-between rounded-sm border border-border bg-secondary/40 px-3 py-2 text-sm">
                    <span>Editing existing entry</span>
                    <button
                      type="button"
                      onClick={reset}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                )}

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
                  <Label htmlFor="video">Video URL (YouTube, optional)</Label>
                  <Input
                    id="video" value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=…"
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full h-12">
                  {saving ? "Saving…" : editingEntryId ? "Update entry" : "Save entry"}
                </Button>
              </form>
            </TabsContent>

            {/* MANAGE ENTRIES */}
            <TabsContent value="entries">
              {entries.length === 0 ? (
                <p className="text-muted-foreground italic">No entries yet.</p>
              ) : (
                <ul className="space-y-2">
                  {entries.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-3 border border-border rounded-sm px-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{dayLabel(e.day_id)}</p>
                        <p className="font-serif text-base truncate">{e.title}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => startEditEntry(e)}
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteEntry(e.id)}
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            {/* DAYS EDITOR */}
            <TabsContent value="days">
              <form onSubmit={saveDay} className="space-y-5">
                <div>
                  <Label>Day</Label>
                  <Select value={editDayId} onValueChange={setEditDayId}>
                    <SelectTrigger><SelectValue placeholder="Select a day to edit" /></SelectTrigger>
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
                  <Label htmlFor="dtitle">Title *</Label>
                  <Input
                    id="dtitle" required value={dTitle}
                    onChange={(e) => setDTitle(e.target.value)}
                    disabled={!editDayId}
                  />
                </div>

                <div>
                  <Label htmlFor="ddate">Date</Label>
                  <Input
                    id="ddate" type="date" value={dDate}
                    onChange={(e) => setDDate(e.target.value)}
                    disabled={!editDayId}
                  />
                </div>

                <div>
                  <Label htmlFor="dloc">Location</Label>
                  <Input
                    id="dloc" value={dLocation}
                    onChange={(e) => setDLocation(e.target.value)}
                    placeholder="Las Vegas, NV"
                    disabled={!editDayId}
                  />
                </div>

                <div>
                  <Label htmlFor="dsum">Short description</Label>
                  <Textarea
                    id="dsum" rows={4} value={dSummary}
                    onChange={(e) => setDSummary(e.target.value)}
                    placeholder="A short paragraph that introduces the day."
                    disabled={!editDayId}
                  />
                </div>

                <Button type="submit" disabled={savingDay || !editDayId} className="w-full h-12">
                  {savingDay ? "Saving…" : "Save day"}
                </Button>
              </form>
            </TabsContent>

            {/* HERO */}
            <TabsContent value="hero">
              <form onSubmit={saveHero} className="space-y-5">
                <div>
                  <Label htmlFor="brand">Brand name</Label>
                  <Input id="brand" value={heroBrand} onChange={(e) => setHeroBrand(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="eyebrow">Eyebrow (small label above headline)</Label>
                  <Input
                    id="eyebrow" value={heroEyebrow}
                    onChange={(e) => setHeroEyebrow(e.target.value)}
                    placeholder="A 14-day journal · May 2025"
                  />
                </div>
                <div>
                  <Label htmlFor="headline">Headline *</Label>
                  <Input
                    id="headline" required value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    placeholder="Across the warm south,"
                  />
                </div>
                <div>
                  <Label htmlFor="italic">Italic word (shown on second line)</Label>
                  <Input
                    id="italic" value={heroItalic}
                    onChange={(e) => setHeroItalic(e.target.value)}
                    placeholder="slowly"
                  />
                </div>
                <div>
                  <Label htmlFor="intro">Intro paragraph</Label>
                  <Textarea
                    id="intro" rows={4} value={heroIntro}
                    onChange={(e) => setHeroIntro(e.target.value)}
                    placeholder="Two weeks chasing Route 66 from California to Texas…"
                  />
                </div>
                <div>
                  <Label htmlFor="button">Button label *</Label>
                  <Input
                    id="button" required value={heroButton}
                    onChange={(e) => setHeroButton(e.target.value)}
                    placeholder="Begin the journal"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Hero background image</Label>
                  {heroImageUrl && (
                    <div className="relative">
                      <img src={heroImageUrl} alt="Hero" className="w-full h-40 object-cover rounded-sm" />
                      <button
                        type="button"
                        onClick={() => setHeroImageUrl("")}
                        className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5 shadow-soft"
                        aria-label="Remove hero image"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 w-full h-12 border border-dashed border-border rounded-sm cursor-pointer hover:bg-secondary/50 transition-colors">
                    <Upload className="size-4" />
                    <span className="text-sm">
                      {heroUploading ? "Uploading…" : heroImageUrl ? "Replace image" : "Upload hero image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onHeroUpload(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use the default image. Click "Save hero" after uploading.
                  </p>
                </div>
                <Button type="submit" disabled={savingHero} className="w-full h-12">
                  {savingHero ? "Saving…" : "Save hero"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default Admin;
