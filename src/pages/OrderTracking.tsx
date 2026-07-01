import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDA } from "@/lib/store";
import { Search, Package } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const steps = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderTracking() {
  const { t } = useI18n();
  const [num, setNum] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { document.title = "Suivi de commande — Univers Maison"; }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(""); setOrder(null);
    const { data } = await supabase.from("orders").select("*, order_items(*)").eq("order_number", num.trim().toUpperCase()).maybeSingle();
    setLoading(false);
    if (!data) setErr(t("order.notfound"));
    else setOrder(data);
  };

  return (
    <div className="container-luxe py-12">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary animate-pulse-slow"><Package className="h-5 w-5 text-gold" /></div>
        <h1 className="mt-4 font-serif text-4xl">{t("order.track")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("order.track.desc")}</p>

        <form onSubmit={onSubmit} className="mt-8 flex gap-2">
          <Input value={num} onChange={(e) => setNum(e.target.value)} placeholder="UM-..." required className="h-12" />
          <Button type="submit" variant="luxe" disabled={loading}><Search className="h-4 w-4" /></Button>
        </form>
        {err && <p className="mt-3 text-sm text-destructive animate-fade-in">{err}</p>}
      </div>

      {order && (
        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-elegant animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif text-2xl">{order.order_number}</div>
              <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</div>
            </div>
            <div className="font-serif text-2xl font-semibold">{formatDA(Number(order.total))}</div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between">
              {steps.map((s, i) => {
                const done = steps.indexOf(order.status) >= i;
                return (
                  <div key={s} className="flex flex-col items-center text-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${done ? "bg-gradient-gold text-gold-foreground" : "bg-secondary text-muted-foreground"}`}>{i + 1}</div>
                    <div className="mt-2 text-[11px] capitalize text-muted-foreground">{t("status." + s)}</div>
                  </div>
                );
              })}
            </div>
            <div className="relative mt-[-30px] mb-8 mx-auto h-[2px] w-[80%] bg-secondary">
              <div className="h-full bg-gradient-gold transition-all" style={{ width: `${(steps.indexOf(order.status) / (steps.length - 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
