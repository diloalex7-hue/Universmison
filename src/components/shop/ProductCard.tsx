import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useI18n, localized } from "@/lib/i18n";
import { useCart, useFavorites, formatDA } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  name_en: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  rating?: number;
  reviews_count?: number;
  is_new?: boolean;
  is_bestseller?: boolean;
  stock?: number;
}

const optimizeImage = (url: string, width = 600) => {
  if (!url) return "";
  if (url.includes("unsplash.com")) {
    const baseUrl = url.split("?")[0];
    return `${baseUrl}?w=${width}&q=80&auto=format`;
  }
  return url;
};

export default function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { t, lang } = useI18n();
  const { add } = useCart();
  const { ids: favIds, toggle } = useFavorites();
  const [loaded, setLoaded] = useState(false);
  
  const isFav = favIds.has(product.id);
  const name = localized(product, "name", lang);

  const discount = product.compare_at_price
    ? Math.round(((Number(product.compare_at_price) - Number(product.price)) / Number(product.compare_at_price)) * 100)
    : 0;

  return (
    <article className={cn("product-card group flex flex-col", className)}>
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-secondary/40">
        {!loaded && <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}
        <img
          src={optimizeImage(product.images?.[0])}
          alt={name}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            "h-full w-full object-cover transition-all duration-700 group-hover:scale-105",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
        {/* Badges */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5">
          {product.is_new && <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur">New</span>}
          {discount > 0 && <span className="rounded-full bg-gradient-gold px-2.5 py-1 text-[10px] font-bold text-gold-foreground">−{discount}%</span>}
        </div>
        {/* Fav */}
        <button
          onClick={(e) => { e.preventDefault(); toggle.mutate(product.id); }}
          aria-label="Favorite"
          className="absolute top-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-luxe hover:bg-background active:scale-90"
        >
          <Heart className={cn("h-4 w-4 transition-luxe", isFav && "fill-gold text-gold")} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-medium text-[15px] leading-snug">
          <Link to={`/product/${product.slug}`} className="transition-luxe hover:text-gold-deep">{name}</Link>
        </h3>

        {!!product.rating && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-gold">★</span>
            <span className="font-semibold text-foreground">{Number(product.rating).toFixed(1)}</span>
            <span>· {product.reviews_count} {t("prod.reviews")}</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-[17px] text-foreground">{formatDA(Number(product.price))}</span>
            {product.compare_at_price && (
              <span className="text-xs text-muted-foreground line-through">{formatDA(Number(product.compare_at_price))}</span>
            )}
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full bg-secondary/60 hover:bg-gold hover:text-gold-foreground text-foreground shrink-0 transition-all duration-200 active:scale-90"
            onClick={(e) => { e.preventDefault(); add.mutate({ product_id: product.id }); }}
          >
            <ShoppingBag className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
