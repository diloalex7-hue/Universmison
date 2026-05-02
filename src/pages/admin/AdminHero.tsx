import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Loader2, ImageIcon, Upload, X, LayoutTemplate } from "lucide-react";

const fieldKeys = [
  "eyebrow", "title", "subtitle", "image_url",
  "button1_text", "button1_link", "button2_text", "button2_link",
  "stat1_value", "stat1_label", "stat2_value", "stat2_label",
  "stat3_value", "stat3_label", "badge_text", "badge_subtitle",
] as const;

const defaultValues: Record<string, string> = {
  eyebrow: "NOUVELLE COLLECTION",
  title: "L'art de recevoir, redéfini.",
  subtitle: "Vaisselle, verrerie et objets d'exception, sélectionnés pour les tables qui racontent une histoire.",
  image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
  button1_text: "Découvrir la collection",
  button1_link: "/shop",
  button2_text: "Voir les catégories",
  button2_link: "/categories",
  stat1_value: "120+", stat1_label: "références",
  stat2_value: "4.9", stat2_label: "note moyenne",
  stat3_value: "48h", stat3_label: "livraison",
  badge_text: "4.9 / 5", badge_subtitle: "+2 400 clients ravis",
};

export default function AdminHero() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({ ...defaultValues });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [heroId, setHeroId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("hero_settings").select("*").limit(1);
      if (error) { console.error("Load hero error:", error); }
      if (data && data[0]) {
        setHeroId(data[0].id);
        const d = data[0];
        const loaded: Record<string, string> = {};
        for (const key of fieldKeys) {
          loaded[key] = d[key] || defaultValues[key] || "";
        }
        setForm(loaded);
      }
      setLoading(false);
    })();
  }, []);

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Sélectionnez une image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5 Mo"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const fileName = `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(`hero/${fileName}`, file, { cacheControl: "3600", upsert: false });
    if (error) { setUploading(false); toast.error(error.message); return; }
    const { data: u } = supabase.storage.from("product-images").getPublicUrl(`hero/${fileName}`);
    setForm(p => ({ ...p, image_url: u.publicUrl }));
    setUploading(false);
    toast.success("Image uploadée !");
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadImage(f); };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; };

  const save = async () => {
    setSaving(true);
    // Build clean payload with only the DB fields
    const payload: Record<string, string> = {};
    for (const key of fieldKeys) {
      payload[key] = form[key] || "";
    }

    let error;
    if (heroId) {
      const res = await supabase.from("hero_settings").update(payload).eq("id", heroId);
      error = res.error;
    } else {
      const res = await supabase.from("hero_settings").insert(payload);
      error = res.error;
      if (!error) {
        const { data } = await supabase.from("hero_settings").select("id").limit(1);
        if (data?.[0]) setHeroId(data[0].id);
      }
    }

    setSaving(false);
    if (error) {
      console.error("Save hero error:", error);
      toast.error("Erreur : " + error.message);
      return;
    }

    // Invalidate cache so the home page shows updated content immediately
    queryClient.invalidateQueries({ queryKey: ["home-hero"] });
    toast.success("Hero enregistré !");
  };

  if (loading) return <div className="p-8 text-muted-foreground">Chargement…</div>;

  const g = (key: string) => form[key] || "";
  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-serif tracking-tight flex items-center gap-3">
          <LayoutTemplate className="h-7 w-7 text-gold" /> Section Hero
        </h1>
        <p className="text-muted-foreground mt-1">Personnalisez la bannière principale de la page d'accueil</p>
      </header>

      <div className="space-y-6 bg-background border rounded-2xl p-6">

        {/* Texts */}
        <h3 className="font-semibold text-lg border-b pb-2">📝 Textes</h3>
        <div>
          <Label>Badge (petit texte au-dessus du titre)</Label>
          <Input value={g("eyebrow")} onChange={e => set("eyebrow", e.target.value)} placeholder="NOUVELLE COLLECTION" className="mt-1" />
        </div>
        <div>
          <Label>Titre principal</Label>
          <Textarea value={g("title")} onChange={e => set("title", e.target.value)} placeholder="L'art de recevoir, redéfini." rows={2} className="mt-1" />
        </div>
        <div>
          <Label>Sous-titre</Label>
          <Textarea value={g("subtitle")} onChange={e => set("subtitle", e.target.value)} placeholder="Description courte..." rows={3} className="mt-1" />
        </div>

        {/* Image */}
        <h3 className="font-semibold text-lg border-b pb-2 pt-4">🖼️ Image Hero</h3>
        <div>
          {g("image_url") ? (
            <div className="relative group rounded-2xl overflow-hidden border-2 border-gold/30">
              <img src={g("image_url")} alt="Hero" className="w-full h-56 object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <Button type="button" size="sm" variant="secondary" onClick={() => fileRef.current?.click()} className="shadow-lg">
                  <Upload className="h-4 w-4 mr-1" /> Remplacer
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => set("image_url", "")} className="shadow-lg">
                  <X className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? "border-gold bg-gold/5" : "border-border hover:border-gold/50 hover:bg-muted/30"} ${uploading ? "pointer-events-none opacity-60" : ""}`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3"><Loader2 className="h-10 w-10 text-gold animate-spin" /><p className="text-sm text-muted-foreground">Upload en cours...</p></div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10"><ImageIcon className="h-7 w-7 text-gold" /></div>
                  <p className="text-sm font-medium">Glissez-déposez une image ici</p>
                  <p className="text-xs text-muted-foreground">ou cliquez pour sélectionner — PNG, JPG, WebP (max 5 Mo)</p>
                </div>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>

        {/* Buttons */}
        <h3 className="font-semibold text-lg border-b pb-2 pt-4">🔘 Boutons</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Bouton 1 — Texte</Label><Input value={g("button1_text")} onChange={e => set("button1_text", e.target.value)} className="mt-1" /></div>
          <div><Label>Bouton 1 — Lien</Label><Input value={g("button1_link")} onChange={e => set("button1_link", e.target.value)} className="mt-1" /></div>
          <div><Label>Bouton 2 — Texte</Label><Input value={g("button2_text")} onChange={e => set("button2_text", e.target.value)} className="mt-1" /></div>
          <div><Label>Bouton 2 — Lien</Label><Input value={g("button2_link")} onChange={e => set("button2_link", e.target.value)} className="mt-1" /></div>
        </div>

        {/* Stats */}
        <h3 className="font-semibold text-lg border-b pb-2 pt-4">📊 Statistiques</h3>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Stat 1 — Valeur</Label><Input value={g("stat1_value")} onChange={e => set("stat1_value", e.target.value)} placeholder="120+" className="mt-1" /></div>
          <div><Label>Stat 2 — Valeur</Label><Input value={g("stat2_value")} onChange={e => set("stat2_value", e.target.value)} placeholder="4.9" className="mt-1" /></div>
          <div><Label>Stat 3 — Valeur</Label><Input value={g("stat3_value")} onChange={e => set("stat3_value", e.target.value)} placeholder="48h" className="mt-1" /></div>
          <div><Label>Stat 1 — Label</Label><Input value={g("stat1_label")} onChange={e => set("stat1_label", e.target.value)} placeholder="références" className="mt-1" /></div>
          <div><Label>Stat 2 — Label</Label><Input value={g("stat2_label")} onChange={e => set("stat2_label", e.target.value)} placeholder="note moyenne" className="mt-1" /></div>
          <div><Label>Stat 3 — Label</Label><Input value={g("stat3_label")} onChange={e => set("stat3_label", e.target.value)} placeholder="livraison" className="mt-1" /></div>
        </div>

        {/* Badge */}
        <h3 className="font-semibold text-lg border-b pb-2 pt-4">⭐ Badge flottant</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Texte principal</Label><Input value={g("badge_text")} onChange={e => set("badge_text", e.target.value)} placeholder="4.9 / 5" className="mt-1" /></div>
          <div><Label>Sous-texte</Label><Input value={g("badge_subtitle")} onChange={e => set("badge_subtitle", e.target.value)} placeholder="+2 400 clients ravis" className="mt-1" /></div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button onClick={save} disabled={saving || uploading} className="bg-gold hover:bg-gold/90 text-gold-foreground">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
