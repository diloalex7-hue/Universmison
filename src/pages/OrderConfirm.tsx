import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDA } from "@/lib/store";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

export default function OrderConfirm() {
  const { id } = useParams();
  const { t } = useI18n();
  useEffect(() => { document.title = "Commande confirmée — Univers Maison"; }, []);

  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").eq("id", id!).maybeSingle()).data,
  });

  return (
    <div className="container-luxe py-16">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 animate-scale-in">
          <CheckCircle2 className="h-9 w-9 text-success" />
        </div>
        <h1 className="mt-6 font-serif text-4xl">{t("order.thanks")}</h1>
        <p className="mt-3 text-muted-foreground">
          {t("order.received")}
        </p>

        {order && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-start shadow-elegant animate-fade-up">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("order.number")}</span>
              <span className="font-serif text-lg">{order.order_number}</span>
            </div>
            <div className="my-4 gold-divider" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">{t("cart.total")}</span>
              <span className="font-serif text-2xl font-semibold">{formatDA(Number(order.total))}</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="luxe"><Link to="/account/orders">{t("order.view")}</Link></Button>
          <Button asChild variant="outline"><Link to="/shop">{t("order.continue")}</Link></Button>
        </div>
      </div>
    </div>
  );
}
