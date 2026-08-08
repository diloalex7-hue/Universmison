import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: any | null;
  categories: { id: string; name_fr: string }[];
  onSaved: () => void;
}

const empty = {
  slug: "", name_fr: "", name_ar: "", name_en: "",
  description_fr: "", description_ar: "", description_en: "",
  price: 0, compare_at_price: null as number | null,
  stock: 0, category_id: null as string | null,
  images: [] as string[], colors: [] as string[], sizes: [] as string[],
  is_featured: false, is_bestseller: false, is_new: false,
};

export default function ProductFormDialog({ open, onOpenChange, product, categories, onSaved }: Props) {
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) setForm({ ...empty, ...product });
    else setForm(empty);
  }, [product, open]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const { compressImage } = await import("@/lib/imageCompressor");
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const compressed = await compressImage(file);
      const ext = compressed.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, compressed);
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    set("images", [...(form.images || []), ...urls]);
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (url: string) => set("images", form.images.filter((u: string) => u !== url));

  const save = async () => {
    if (!form.name_fr || !form.slug || !form.price) {
      return toast.error("Nom, slug et prix sont requis");
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock: Number(form.stock),
      category_id: form.category_id || null,
    };
    delete (payload as any).created_at;
    delete (payload as any).updated_at;

    const { error } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);

    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(product ? "Produit mis à jour" : "Produit créé");
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="ltr">
        <DialogHeader>
          <DialogTitle>{product ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nom (FR) *</Label>
              <Input value={form.name_fr} onChange={(e) => set("name_fr", e.target.value)} />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
            <div>
              <Label>Nom (AR)</Label>
              <Input value={form.name_ar} onChange={(e) => set("name_ar", e.target.value)} />
            </div>
            <div>
              <Label>Nom (EN)</Label>
              <Input value={form.name_en} onChange={(e) => set("name_en", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Prix (DA) *</Label>
              <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </div>
            <div>
              <Label>Prix avant promo</Label>
              <Input type="number" value={form.compare_at_price ?? ""} onChange={(e) => set("compare_at_price", e.target.value || null)} />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Catégorie</Label>
            <Select value={form.category_id ?? "none"} onValueChange={(v) => set("category_id", v === "none" ? null : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Aucune —</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_fr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description (FR)</Label>
            <Textarea rows={3} value={form.description_fr ?? ""} onChange={(e) => set("description_fr", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Description (AR)</Label>
              <Textarea rows={3} value={form.description_ar ?? ""} onChange={(e) => set("description_ar", e.target.value)} />
            </div>
            <div>
              <Label>Description (EN)</Label>
              <Textarea rows={3} value={form.description_en ?? ""} onChange={(e) => set("description_en", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Couleurs (séparées par virgule)</Label>
              <Input
                value={(form.colors ?? []).join(",")}
                onChange={(e) => set("colors", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
              />
            </div>
            <div>
              <Label>Tailles (séparées par virgule)</Label>
              <Input
                value={(form.sizes ?? []).join(",")}
                onChange={(e) => set("sizes", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
              />
            </div>
          </div>

          <div>
            <Label>Images</Label>
            <div className="grid grid-cols-4 gap-3 mt-2">
              {(form.images ?? []).map((url: string) => (
                <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted text-muted-foreground text-xs">
                <Upload className="h-5 w-5 mb-1" />
                {uploading ? "Upload…" : "Ajouter"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2"><Switch checked={form.is_new} onCheckedChange={(v) => set("is_new", v)} /> Nouveau</label>
            <label className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={(v) => set("is_featured", v)} /> Mis en avant</label>
            <label className="flex items-center gap-2"><Switch checked={form.is_bestseller} onCheckedChange={(v) => set("is_bestseller", v)} /> Best-seller</label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
