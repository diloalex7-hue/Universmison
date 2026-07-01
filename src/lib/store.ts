import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { toast } from "sonner";

const getLang = () => {
  try {
    return typeof window !== "undefined" ? localStorage.getItem("um_lang") : "fr";
  } catch {
    return "fr";
  }
};


export interface LocalCartItem {
  product_id: string;
  quantity: number;
  selected_color?: string | null;
}

function readLocal(): LocalCartItem[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch { return []; }
}
function writeLocal(items: LocalCartItem[]) { 
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items)); 
  } catch {}
}

export function useCart() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (user) {
        const { data, error } = await supabase
          .from("cart_items")
          .select("id, product_id, quantity, selected_color, product:products(id, slug, name_fr, name_ar, name_en, price, compare_at_price, images, stock)")
          .eq("user_id", user.id);
        if (error) throw error;
        return data ?? [];
      } else {
        const local = readLocal();
        if (local.length === 0) return [];
        const ids = local.map(l => l.product_id);
        const { data } = await supabase
          .from("products")
          .select("id, slug, name_fr, name_ar, name_en, price, compare_at_price, images, stock")
          .in("id", ids);
        return local.map(l => {
          const p = data?.find(d => d.id === l.product_id);
          return p ? { id: l.product_id, product_id: l.product_id, quantity: l.quantity, selected_color: l.selected_color, product: p } : null;
        }).filter(Boolean) as any[];
      }
    },
  });

  const add = useMutation({
    mutationFn: async ({ product_id, quantity = 1, selected_color = null }: { product_id: string; quantity?: number; selected_color?: string | null }) => {
      if (user) {
        const { data: existing } = await supabase
          .from("cart_items").select("id, quantity")
          .eq("user_id", user.id).eq("product_id", product_id)
          .is("selected_color", selected_color as any).maybeSingle();
        if (existing) {
          await supabase.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
        } else {
          await supabase.from("cart_items").insert({ user_id: user.id, product_id, quantity, selected_color });
        }
      } else {
        const local = readLocal();
        const ix = local.findIndex(l => l.product_id === product_id && (l.selected_color ?? null) === selected_color);
        if (ix >= 0) local[ix].quantity += quantity;
        else local.push({ product_id, quantity, selected_color });
        writeLocal(local);
      }
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["cart"] }); 
      const lang = getLang();
      const msg = lang === "ar" ? "تمت إضافة المنتج إلى السلة" : lang === "en" ? "Added to cart" : "Ajouté au panier";
      toast.success(msg); 
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (user) await supabase.from("cart_items").update({ quantity }).eq("id", id);
      else {
        const local = readLocal();
        const item = local.find(l => l.product_id === id);
        if (item) item.quantity = quantity;
        writeLocal(local);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (user) await supabase.from("cart_items").delete().eq("id", id);
      else writeLocal(readLocal().filter(l => l.product_id !== id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const clear = useMutation({
    mutationFn: async () => {
      if (user) await supabase.from("cart_items").delete().eq("user_id", user.id);
      else writeLocal([]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const items = cartQuery.data ?? [];
  const count = items.reduce((s, i: any) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i: any) => s + Number(i.product?.price ?? 0) * i.quantity, 0);

  return { items, count, subtotal, isLoading: cartQuery.isLoading, add, update, remove, clear };
}

export function useFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("favorites")
        .select("id, product_id, product:products(id, slug, name_fr, name_ar, name_en, price, compare_at_price, images, rating, reviews_count)")
        .eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const toggle = useMutation({
    mutationFn: async (product_id: string) => {
      if (!user) { 
        const lang = getLang();
        const msg = lang === "ar" ? "سجل الدخول لإضافة المنتج للمفضلة" : lang === "en" ? "Sign in to add to favorites" : "Connectez-vous pour ajouter aux favoris";
        toast.error(msg); 
        return; 
      }
      const existing = query.data?.find((f: any) => f.product_id === product_id);
      if (existing) await supabase.from("favorites").delete().eq("id", existing.id);
      else await supabase.from("favorites").insert({ user_id: user.id, product_id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const ids = new Set((query.data ?? []).map((f: any) => f.product_id));
  return { items: query.data ?? [], ids, toggle, isLoading: query.isLoading };
}

export function formatDA(n: number) {
  return new Intl.NumberFormat("fr-DZ").format(n) + " DA";
}
