import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import ProductFormDialog from "./ProductFormDialog";
import { toast } from "sonner";

interface Product {
  id: string;
  slug: string;
  name_fr: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: string[];
  category_id: string | null;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name_fr"),
    ]);
    setProducts((p as any) ?? []);
    setCategories(c ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Produit supprimé");
    load();
  };

  const filtered = products.filter((p) =>
    p.name_fr.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name_fr ?? "—";

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Produits</h1>
          <p className="text-muted-foreground mt-1">{products.length} produits au catalogue</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Nouveau produit
        </Button>
      </header>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" className="pl-9" />
      </div>

      <div className="bg-background border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Image</th>
              <th className="p-3 font-medium">Nom</th>
              <th className="p-3 font-medium">Catégorie</th>
              <th className="p-3 font-medium">Prix</th>
              <th className="p-3 font-medium">Promo</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">Tags</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Aucun produit</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className="border-t hover:bg-muted/30">
                <td className="p-3">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="h-12 w-12 object-cover rounded-lg" />
                  ) : (
                    <div className="h-12 w-12 bg-muted rounded-lg" />
                  )}
                </td>
                <td className="p-3 font-medium">{p.name_fr}</td>
                <td className="p-3 text-muted-foreground">{catName(p.category_id)}</td>
                <td className="p-3">{Number(p.price).toFixed(0)} DA</td>
                <td className="p-3 text-destructive">{p.compare_at_price ? `${Number(p.compare_at_price).toFixed(0)} DA` : "—"}</td>
                <td className="p-3">
                  <span className={p.stock === 0 ? "text-destructive" : p.stock < 5 ? "text-amber-600" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-3 space-x-1">
                  {p.is_new && <span className="text-[10px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded">NEW</span>}
                  {p.is_featured && <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">★</span>}
                  {p.is_bestseller && <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">BS</span>}
                </td>
                <td className="p-3 text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductFormDialog
        open={open}
        onOpenChange={setOpen}
        product={editing}
        categories={categories}
        onSaved={() => { setOpen(false); load(); }}
      />
    </div>
  );
}
