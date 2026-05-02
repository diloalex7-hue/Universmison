import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, Tags, ShoppingBag, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      const [p, c, o] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
      ]);
      const revenue = (o.data ?? []).reduce((s, r: any) => s + Number(r.total || 0), 0);
      setStats({
        products: p.count ?? 0,
        categories: c.count ?? 0,
        orders: o.data?.length ?? 0,
        revenue,
      });
    })();
  }, []);

  const cards = [
    { label: "Produits", value: stats.products, icon: Package, color: "from-blue-500/10 to-blue-500/5" },
    { label: "Catégories", value: stats.categories, icon: Tags, color: "from-purple-500/10 to-purple-500/5" },
    { label: "Commandes", value: stats.orders, icon: ShoppingBag, color: "from-emerald-500/10 to-emerald-500/5" },
    { label: "Chiffre d'affaires", value: `${stats.revenue.toFixed(0)} DA`, icon: TrendingUp, color: "from-amber-500/10 to-amber-500/5" },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-serif tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre boutique</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} border rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <c.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-serif">{c.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
