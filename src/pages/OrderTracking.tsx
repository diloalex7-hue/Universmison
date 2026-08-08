import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDA } from "@/lib/store";
import { Search, Package, CheckCircle2, X } from "lucide-react";
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
    const trimmed = num.trim();
    const { data, error } = await supabase.from("orders").select("*, order_items(*)").ilike("order_number", trimmed).maybeSingle();
    setLoading(false);
    if (error) {
      console.error("Tracking error:", error);
      setErr(t("order.notfound"));
    } else if (!data) {
      setErr(t("order.notfound"));
    } else {
      setOrder(data);
    }
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
            {order.status === "cancelled" ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <X className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="mt-4 font-serif text-xl text-destructive">{t("status.cancelled")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t("status.cancelled.desc")}</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between relative z-10">
                  {steps.map((s, i) => {
                    const done = steps.indexOf(order.status) >= i;
                    const current = order.status === s;
                    return (
                      <div key={s} className="flex flex-col items-center text-center w-1/4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 shadow-sm
                          ${done ? "bg-gradient-gold text-gold-foreground" : "bg-secondary text-muted-foreground"}
                          ${current ? "ring-4 ring-gold/20 scale-110" : ""}
                        `}>
                          {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                        </div>
                        <div className={`mt-3 text-xs font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                          {t("status." + s)}
                        </div>
                        <div className="mt-1 hidden sm:block text-[10px] text-muted-foreground max-w-[120px] px-2 leading-tight">
                          {t(`status.${s}.desc`)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="relative mt-[-55px] sm:mt-[-70px] mb-12 sm:mb-16 mx-auto h-[3px] w-[75%] bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-gold transition-all duration-1000 ease-in-out" 
                    style={{ width: `${(steps.indexOf(order.status) / (steps.length - 1)) * 100}%` }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
