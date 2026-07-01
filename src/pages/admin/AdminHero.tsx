import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Save, Loader2, ImageIcon, Upload, X, LayoutTemplate,
  Plus, Trash2, Pencil, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown,
} from "lucide-react";

interface SlideData {
  id?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image_url: string;
  button1_text: string;
  button1_link: string;
  button2_text: string;
  button2_link: string;
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  stat3_value: string;
  stat3_label: string;
  badge_text: string;
  badge_subtitle: string;
  display_order?: number;
  is_active?: boolean;
}

const emptySlide: SlideData = {
  eyebrow: "",
  title: "",
  subtitle: "",
  image_url: "",
  button1_text: "",
  button1_link: "/shop",
  button2_text: "",
  button2_link: "/categories",
  stat1_value: "",
  stat1_label: "",
  stat2_value: "",
  stat2_label: "",
  stat3_value: "",
  stat3_label: "",
  badge_text: "",
  badge_subtitle: "",
  is_active: true,
};

export default function AdminHero() {
  const queryClient = useQueryClient();
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<SlideData | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from("hero_settings")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) console.error("Load slides error:", error);
    setSlides((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchSlides(); }, []);

  /* ─── Image Upload ─── */
  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Sélectionnez une image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5 Mo"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const fileName = `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(`hero/${fileName}`, file, { cacheControl: "3600", upsert: false });
    if (error) { setUploading(false); toast.error(error.message); return; }
    const { data: u } = supabase.storage.from("product-images").getPublicUrl(`hero/${fileName}`);
    setEditingSlide(prev => prev ? { ...prev, image_url: u.publicUrl } : prev);
    setUploading(false);
    toast.success("Image uploadée !");
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadImage(f); };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; };

  /* ─── Save (Insert or Update) ─── */
  const save = async () => {
    if (!editingSlide) return;
    if (!editingSlide.title.trim()) { toast.error("Le titre est obligatoire"); return; }
    setSaving(true);

    const { id, ...payload } = editingSlide;
    // Clean payload — remove undefined
    const cleanPayload: Record<string, any> = {};
    for (const [k, v] of Object.entries(payload)) {
      cleanPayload[k] = v ?? "";
    }

    let error;
    if (isNew) {
      cleanPayload.display_order = slides.length;
      const res = await supabase.from("hero_settings").insert(cleanPayload);
      error = res.error;
    } else {
      const res = await supabase.from("hero_settings").update(cleanPayload).eq("id", id);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      console.error("Save slide error:", error);
      toast.error("Erreur : " + error.message);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["home-hero-slides"] });
    queryClient.invalidateQueries({ queryKey: ["home-hero"] });
    toast.success(isNew ? "Slide ajouté !" : "Slide mis à jour !");
    setEditingSlide(null);
    setIsNew(false);
    fetchSlides();
  };

  /* ─── Delete ─── */
  const deleteSlide = async (slideId: string) => {
    if (!confirm("Supprimer ce slide ?")) return;
    setDeletingId(slideId);
    const { error } = await supabase.from("hero_settings").delete().eq("id", slideId);
    setDeletingId(null);
    if (error) { toast.error("Erreur : " + error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["home-hero-slides"] });
    queryClient.invalidateQueries({ queryKey: ["home-hero"] });
    toast.success("Slide supprimé");
    fetchSlides();
  };

  /* ─── Reorder ─── */
  const moveSlide = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const updated = [...slides];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Optimistic update
    setSlides(updated);

    // Persist new order
    const promises = updated.map((s, i) =>
      supabase.from("hero_settings").update({ display_order: i }).eq("id", s.id)
    );
    await Promise.all(promises);
    queryClient.invalidateQueries({ queryKey: ["home-hero-slides"] });
  };

  /* ─── Open editor ─── */
  const openNew = () => {
    setEditingSlide({ ...emptySlide });
    setIsNew(true);
  };

  const openEdit = (slide: SlideData) => {
    setEditingSlide({ ...slide });
    setIsNew(false);
  };

  if (loading) return <div className="p-8 text-muted-foreground">Chargement…</div>;

  /* ═══════════════ EDITOR DIALOG ═══════════════ */
  if (editingSlide) {
    const g = (key: keyof SlideData) => (editingSlide[key] as string) || "";
    const set = (key: keyof SlideData, val: string | boolean) =>
      setEditingSlide(prev => prev ? { ...prev, [key]: val } : prev);

    return (
      <div className="p-8 max-w-3xl">
        <header className="mb-8">
          <button
            onClick={() => { setEditingSlide(null); setIsNew(false); }}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
          >
            ← Retour à la liste
          </button>
          <h1 className="text-3xl font-serif tracking-tight flex items-center gap-3">
            <LayoutTemplate className="h-7 w-7 text-gold" />
            {isNew ? "Nouveau Slide" : "Modifier le Slide"}
          </h1>
        </header>

        <div className="space-y-6 bg-background border rounded-2xl p-6">

          {/* Texts */}
          <h3 className="font-semibold text-lg border-b pb-2">📝 Textes</h3>
          <div>
            <Label>Badge (petit texte au-dessus du titre)</Label>
            <Input value={g("eyebrow")} onChange={e => set("eyebrow", e.target.value)} placeholder="NOUVELLE COLLECTION" className="mt-1" />
          </div>
          <div>
            <Label>Titre principal *</Label>
            <Textarea value={g("title")} onChange={e => set("title", e.target.value)} placeholder="L'art de recevoir, redéfini." rows={2} className="mt-1" />
          </div>
          <div>
            <Label>Sous-titre</Label>
            <Textarea value={g("subtitle")} onChange={e => set("subtitle", e.target.value)} placeholder="Description courte..." rows={3} className="mt-1" />
          </div>

          {/* Image */}
          <h3 className="font-semibold text-lg border-b pb-2 pt-4">🖼️ Image</h3>
          <div>
            {g("image_url") ? (
              <div className="relative group rounded-2xl overflow-hidden border-2 border-gold/30">
                <img src={g("image_url")} alt="Slide" className="w-full h-56 object-cover" />
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

          {/* Actions */}
          <div className="pt-4 border-t flex justify-between">
            <Button variant="outline" onClick={() => { setEditingSlide(null); setIsNew(false); }}>
              Annuler
            </Button>
            <Button onClick={save} disabled={saving || uploading} className="bg-gold hover:bg-gold/90 text-gold-foreground">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isNew ? "Ajouter le slide" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════ SLIDE LIST ═══════════════ */
  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif tracking-tight flex items-center gap-3">
            <LayoutTemplate className="h-7 w-7 text-gold" /> Slider Hero
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les slides de la bannière principale — ajoutez, modifiez, réorganisez ou supprimez.
          </p>
        </div>
        <Button onClick={openNew} className="bg-gold hover:bg-gold/90 text-gold-foreground">
          <Plus className="h-4 w-4 mr-2" /> Ajouter un slide
        </Button>
      </header>

      {slides.length === 0 ? (
        <div className="border-2 border-dashed rounded-2xl p-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 mx-auto mb-4">
            <LayoutTemplate className="h-8 w-8 text-gold" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Aucun slide</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Ajoutez votre premier slide pour la bannière de la page d'accueil.
          </p>
          <Button onClick={openNew} className="bg-gold hover:bg-gold/90 text-gold-foreground">
            <Plus className="h-4 w-4 mr-2" /> Créer le premier slide
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="group relative bg-background border rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:border-gold/30"
            >
              <div className="flex items-stretch">
                {/* Reorder handle + image */}
                <div className="relative w-48 min-h-[140px] flex-shrink-0 bg-secondary/30">
                  {slide.image_url ? (
                    <img src={slide.image_url} alt={slide.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Slide number badge */}
                  <div className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-gold-foreground text-xs font-bold shadow">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {slide.eyebrow && (
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gold-deep font-semibold">
                          {slide.eyebrow}
                        </span>
                      )}
                      <h3 className="font-serif text-lg leading-tight mt-0.5 truncate">
                        {slide.title || "Sans titre"}
                      </h3>
                      {slide.subtitle && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    {slide.button1_text && (
                      <span className="bg-secondary rounded px-2 py-0.5">
                        🔘 {slide.button1_text}
                      </span>
                    )}
                    {slide.stat1_value && (
                      <span className="bg-secondary rounded px-2 py-0.5">
                        📊 {slide.stat1_value} {slide.stat1_label}
                      </span>
                    )}
                    {slide.badge_text && (
                      <span className="bg-secondary rounded px-2 py-0.5">
                        ⭐ {slide.badge_text}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center gap-1 p-3 border-l bg-muted/20">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveSlide(index, "up")}
                    disabled={index === 0}
                    title="Monter"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveSlide(index, "down")}
                    disabled={index === slides.length - 1}
                    title="Descendre"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <div className="h-px bg-border my-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => openEdit(slide)}
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => slide.id && deleteSlide(slide.id)}
                    disabled={deletingId === slide.id}
                    title="Supprimer"
                  >
                    {deletingId === slide.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {slides.length > 0 && (
        <p className="text-xs text-muted-foreground mt-6 text-center">
          {slides.length} slide{slides.length > 1 ? "s" : ""} — Les slides s'affichent dans l'ordre sur la page d'accueil avec un défilement automatique.
        </p>
      )}
    </div>
  );
}
