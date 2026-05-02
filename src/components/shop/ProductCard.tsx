import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useI18n, localized } from "@/lib/i18n";
import { useCart, useFavorites, formatDA } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { t, lang } = useI18n();
  const { add } = useCart();
  const { ids: favIds, toggle } = useFavorites();
  const isFav = favIds.has(product.id);
  const name = localized(product, "name", lang);

  const discount = product.compare_at_price
    ? Math.round(((Number(product.compare_at_price) - Number(product.price)) / Number(product.compare_at_price)) * 100)
    : 0;

  return (
    <article className={cn("product-card group flex flex-col", className)}>
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-secondary/40">
        <img
          src={product.images?.[0]}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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
          className="absolute top-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-luxe hover:bg-background"
        >
          <Heart className={cn("h-4 w-4 transition-luxe", isFav && "fill-gold text-gold")} />
        </button>
        {/* Hover actions */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-3 gap-2 opacity-0 transition-all duration-500 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            type="button" size="sm" variant="luxe" className="flex-1"
            onClick={(e) => { e.preventDefault(); add.mutate({ product_id: product.id }); }}
          >
            <ShoppingBag className="h-4 w-4" />
            {t("prod.add")}
          </Button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-serif text-lg leading-snug">
          <Link to={`/product/${product.slug}`} className="transition-luxe hover:text-gold-deep">{name}</Link>
        </h3>

        {!!product.rating && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-gold">★</span>
            <span className="font-medium text-foreground">{Number(product.rating).toFixed(1)}</span>
            <span>· {product.reviews_count} {t("prod.reviews")}</span>
          </div>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-serif text-xl font-semibold">{formatDA(Number(product.price))}</span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">{formatDA(Number(product.compare_at_price))}</span>
          )}
        </div>
      </div>
    </article>
  );
}
