import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites, formatDA } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import ProductCard from "@/components/shop/ProductCard";
import { Heart, TrendingDown } from "lucide-react";

export default function Favorites() {
  const { user } = useAuth();
  const { items } = useFavorites();
  const { t } = useI18n();
  const [droppedPrices, setDroppedPrices] = useState<Record<string, string>>({});

  useEffect(() => { document.title = "Favoris — Univers Maison"; }, []);

  useEffect(() => {
    if (!items.length) return;
    try {
      const storedStr = localStorage.getItem("fav_prices") || "{}";
      const stored = JSON.parse(storedStr);
      const drops: Record<string, string> = {};
      let changed = false;

      items.forEach((f: any) => {
        const id = f.product.id;
        const currentPrice = Number(f.product.price);
        
        if (stored[id]) {
          const oldPrice = Number(stored[id]);
          if (currentPrice < oldPrice) {
            drops[id] = formatDA(oldPrice);
          } else if (currentPrice > oldPrice) {
            // Price went up, update stored
            stored[id] = currentPrice;
            changed = true;
          }
        } else {
          // New favorite, store current price
          stored[id] = currentPrice;
          changed = true;
        }
      });

      if (Object.keys(drops).length > 0) setDroppedPrices(drops);
      if (changed) localStorage.setItem("fav_prices", JSON.stringify(stored));
      
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  if (!user) return <div className="container-luxe py-20 text-center"><Link to="/auth" className="underline">{t("common.signin_required")}</Link></div>;

  return (
    <div className="container-luxe py-10">
      <h1 className="font-serif text-4xl md:text-5xl">{t("acc.favorites")}</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-secondary/40 p-12 text-center animate-fade-up">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">{t("common.nofavorites")}</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
          {items.map((f: any) => (
            <div key={f.id} className="relative group">
              <ProductCard product={f.product} />
              {droppedPrices[f.product.id] && (
                <div className="absolute -top-3 -right-2 z-10 flex flex-col items-end">
                  <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md animate-bounce">
                    <TrendingDown className="h-3 w-3" /> {t("fav.price_drop")}
                  </span>
                  <span className="mt-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-white/90 shadow-sm">
                    {t("fav.price_was")} {droppedPrices[f.product.id]}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
