import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

const empty = { slug: "", name_fr: "", name_ar: "", name_en: "", description_fr: "", description_ar: "", description_en: "", image_url: "", display_order: 0 };

export default function AdminCategories() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("display_order");
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `categories/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    set("image_url", data.publicUrl);
    setUploading(false);
  };

  const openNew = () => { setForm(empty); setEditId(null); setOpen(true); };
  const openEdit = (c: any) => { setForm({ ...empty, ...c }); setEditId(c.id); setOpen(true); };

  const save = async () => {
    if (!form.name_fr || !form.slug) return toast.error("Nom et slug requis");
    const payload = { ...form, display_order: Number(form.display_order) };
    delete (payload as any).created_at;
    const { error } = editId
      ? await supabase.from("categories").update(payload).eq("id", editId)
      : await supabase.from("categories").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Enregistré");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supprimée"); load();
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Catégories</h1>
          <p className="text-muted-foreground mt-1">{items.length} catégories</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Nouvelle catégorie</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c) => (
          <div key={c.id} className="bg-background border rounded-2xl overflow-hidden">
            <div className="aspect-[4/3] bg-muted">
              {c.image_url ? <img src={c.image_url} alt="" className="w-full h-full object-cover" /> : null}
            </div>
            <div className="p-4">
              <div className="font-medium">{c.name_fr}</div>
              <div className="text-xs text-muted-foreground">/{c.slug} • ordre {c.display_order}</div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}><Pencil className="h-3 w-3 mr-1" />Modifier</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl" dir="ltr">
          <DialogHeader><DialogTitle>{editId ? "Modifier" : "Nouvelle catégorie"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nom (FR) *</Label><Input value={form.name_fr} onChange={(e) => set("name_fr", e.target.value)} /></div>
              <div><Label>Slug *</Label><Input value={form.slug} onChange={(e) => set("slug", e.target.value)} /></div>
              <div><Label>Nom (AR)</Label><Input value={form.name_ar} onChange={(e) => set("name_ar", e.target.value)} /></div>
              <div><Label>Nom (EN)</Label><Input value={form.name_en} onChange={(e) => set("name_en", e.target.value)} /></div>
            </div>
            <div><Label>Ordre</Label><Input type="number" value={form.display_order} onChange={(e) => set("display_order", e.target.value)} /></div>
            <div>
              <Label>Image</Label>
              <div className="flex items-center gap-3 mt-1">
                {form.image_url && (
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden border">
                    <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => set("image_url", "")} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                  </div>
                )}
                <label className="cursor-pointer border-2 border-dashed rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-muted flex items-center gap-2">
                  <Upload className="h-4 w-4" /> {uploading ? "Upload…" : "Choisir une image"}
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
