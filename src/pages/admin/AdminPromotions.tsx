import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Clock, Megaphone, Upload, ImageIcon, X, Loader2 } from "lucide-react";

const empty = {
  title: "",
  subtitle: "",
  description: "",
  discount_text: "",
  button_text: "",
  button_link: "",
  image_url: "",
  end_date: "",
  is_active: false,
};

export default function AdminPromotions() {
  const [promos, setPromos] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<any>({ ...empty });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
    setPromos(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...empty });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title || "",
      subtitle: p.subtitle || "",
      description: p.description || "",
      discount_text: p.discount_text || "",
      button_text: p.button_text || "",
      button_link: p.button_link || "",
      image_url: p.image_url || "",
      end_date: p.end_date ? new Date(p.end_date).toISOString().slice(0, 16) : "",
      is_active: p.is_active ?? false,
    });
    setDialogOpen(true);
  };

  /* ---------- Image Upload ---------- */
  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image (PNG, JPG, WebP...)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    setUploading(true);
    const { compressImage } = await import("@/lib/imageCompressor");
    const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.85 });
    const ext = compressed.name.split(".").pop() || "webp";
    const fileName = `promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(`promotions/${fileName}`, compressed, { cacheControl: "3600", upsert: false });

    if (error) {
      setUploading(false);
      toast.error("Erreur d'upload : " + error.message);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(`promotions/${fileName}`);

    setForm((prev: any) => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Image uploadée avec succès !");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadImage(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = "";
  };

  const removeImage = () => {
    setForm((prev: any) => ({ ...prev, image_url: "" }));
  };

  /* ---------- Save / Delete ---------- */
  const save = async () => {
    if (!form.title.trim()) return toast.error("Le titre est obligatoire");

    const payload: any = {
      title: form.title,
      subtitle: form.subtitle || null,
      description: form.description || null,
      discount_text: form.discount_text || null,
      button_text: form.button_text || null,
      button_link: form.button_link || null,
      image_url: form.image_url || null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase.from("promotions").update(payload).eq("id", editingId);
      if (error) return toast.error(error.message);
      toast.success("Promotion mise à jour !");
    } else {
      const { error } = await supabase.from("promotions").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Promotion créée !");
    }
    setDialogOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette promotion ?")) return;
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Promotion supprimée");
    load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("promotions").update({ is_active: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif tracking-tight flex items-center gap-3">
            <Megaphone className="h-7 w-7 text-gold" /> Promotions
          </h1>
          <p className="text-muted-foreground mt-1">{promos.length} promotion(s)</p>
        </div>
        <Button onClick={openNew} className="bg-gold hover:bg-gold/90 text-gold-foreground">
          <Plus className="h-4 w-4 mr-2" /> Nouvelle promotion
        </Button>
      </header>

      {promos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Aucune promotion. Cliquez sur "Nouvelle promotion" pour en créer une !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {promos.map((p) => (
            <div key={p.id} className="flex items-center gap-4 border rounded-2xl p-4 bg-background hover:shadow-md transition-shadow">
              {p.image_url ? (
                <img src={p.image_url} alt="" className="h-20 w-20 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center shrink-0 text-xs text-muted-foreground">Image</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  {p.discount_text && <span className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full font-medium">{p.discount_text}</span>}
                </div>
                {p.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{p.subtitle}</p>}
                {p.end_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    Expire le {new Date(p.end_date).toLocaleDateString("fr-FR", { dateStyle: "medium" })} à {new Date(p.end_date).toLocaleTimeString("fr-FR", { timeStyle: "short" })}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p.id, p.is_active)} />
                  <span className={`text-xs font-medium ${p.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">{editingId ? "Modifier la promotion" : "Nouvelle promotion"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Titre *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Soldes d'été" className="mt-1" />
              </div>
              <div>
                <Label>Sous-titre</Label>
                <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Ex: ÉDITION LIMITÉE" className="mt-1" />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Texte descriptif de l'offre..." className="mt-1" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Texte de réduction</Label>
                <Input value={form.discount_text} onChange={(e) => setForm({ ...form, discount_text: e.target.value })} placeholder="Ex: −30% ou −50%" className="mt-1" />
              </div>
              <div>
                <Label>🕐 Date de fin (compte à rebours)</Label>
                <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="mt-1" />
              </div>
            </div>

            {/* Image Upload Zone */}
            <div>
              <Label className="mb-2 block">Image de la promotion</Label>
              {form.image_url ? (
                <div className="relative group rounded-2xl overflow-hidden border-2 border-gold/30 bg-muted/20">
                  <img src={form.image_url} alt="Aperçu" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileRef.current?.click()}
                      className="shadow-lg"
                    >
                      <Upload className="h-4 w-4 mr-1" /> Remplacer
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={removeImage}
                      className="shadow-lg"
                    >
                      <X className="h-4 w-4 mr-1" /> Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`
                    relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all
                    ${dragOver
                      ? "border-gold bg-gold/5 scale-[1.01]"
                      : "border-border hover:border-gold/50 hover:bg-muted/30"
                    }
                    ${uploading ? "pointer-events-none opacity-60" : ""}
                  `}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 text-gold animate-spin" />
                      <p className="text-sm text-muted-foreground">Upload en cours...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
                        <ImageIcon className="h-7 w-7 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Glissez-déposez une image ici</p>
                        <p className="text-xs text-muted-foreground mt-1">ou cliquez pour sélectionner — PNG, JPG, WebP (max 5 Mo)</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Texte du bouton</Label>
                <Input value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} placeholder="Ex: Profiter de l'offre" className="mt-1" />
              </div>
              <div>
                <Label>Lien du bouton</Label>
                <Input value={form.button_link} onChange={(e) => setForm({ ...form, button_link: e.target.value })} placeholder="Ex: /shop ou /categories" className="mt-1" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
              <Label>Promotion active (visible sur le site)</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={save} disabled={uploading} className="bg-gold hover:bg-gold/90 text-gold-foreground">
                {editingId ? "Enregistrer" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
