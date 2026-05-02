import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatDA } from "@/lib/store";
import { Package } from "lucide-react";
import { useEffect } from "react";

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  shipped: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function Orders() {
  const { user } = useAuth();
  const { t } = useI18n();
  useEffect(() => { document.title = "Mes commandes — Univers Maison"; }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  if (!user) return <div className="container-luxe py-20 text-center"><Link to="/auth" className="underline">Se connecter</Link></div>;

  return (
    <div className="container-luxe py-10">
      <h1 className="font-serif text-4xl md:text-5xl">{t("acc.orders")}</h1>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-secondary/40 p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">Aucune commande pour le moment.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-serif text-lg">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[o.status]}`}>{o.status}</span>
              </div>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {o.order_items?.map((it: any) => (
                  <div key={it.id} className="flex shrink-0 items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs">
                    <img src={it.product_image} alt="" className="h-10 w-10 rounded object-cover" />
                    <span className="max-w-[140px] truncate">{it.product_name}</span>
                    <span className="text-muted-foreground">×{it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-serif text-xl font-semibold">{formatDA(Number(o.total))}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
