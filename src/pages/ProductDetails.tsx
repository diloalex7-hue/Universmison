import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, localized } from "@/lib/i18n";
import { useCart, useFavorites, formatDA } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Heart, Truck, ShieldCheck, RotateCcw, Star, Minus, Plus, Check } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import ReviewSection from "@/components/shop/ReviewSection";
import { cn } from "@/lib/utils";

export default function ProductDetails() {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { add } = useCart();
  const { ids: favIds, toggle } = useFavorites();
  const [imgIx, setImgIx] = useState(0);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, category:categories(*)").eq("slug", slug!).maybeSingle();
      return data;
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ["product-related", product?.category_id],
    enabled: !!product?.category_id,
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("category_id", product!.category_id).neq("id", product!.id).limit(4);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (product) document.title = `${localized(product, "name", lang)} — Univers Maison`;
  }, [product, lang]);

  useEffect(() => {
    if (product?.colors?.length && !color) setColor(product.colors[0]);
  }, [product, color]);

  if (isLoading) return <div className="container-luxe py-20 text-center text-muted-foreground">{t("common.loading")}</div>;
  if (!product) return <div className="container-luxe py-20 text-center">Produit introuvable</div>;

  const name = localized(product, "name", lang);
  const desc = localized(product, "description", lang);
  const isFav = favIds.has(product.id);
  const discount = product.compare_at_price
    ? Math.round(((Number(product.compare_at_price) - Number(product.price)) / Number(product.compare_at_price)) * 100)
    : 0;

  return (
    <div className="container-luxe py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">{t("nav.home")}</Link>
        <span className="mx-2">/</span>
        {product.category && <>
          <Link to={`/shop/${product.category.slug}`} className="hover:text-foreground">{localized(product.category, "name", lang)}</Link>
          <span className="mx-2">/</span>
        </>}
        <span className="text-foreground">{name}</span>
      </nav>

      <div className="mt-0 md:mt-8 grid gap-6 md:gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* Gallery */}
        <div className="-mx-6 md:mx-0">
          <div className="overflow-hidden md:rounded-3xl bg-secondary/40 md:shadow-elegant">
            <img src={product.images?.[imgIx]} alt={name} className="aspect-square md:aspect-[4/5] w-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3 px-6 md:px-0">
              {product.images.map((src: string, i: number) => (
                <button key={i} onClick={() => setImgIx(i)}
                  className={cn("aspect-square overflow-hidden rounded-xl border-2 transition-luxe", imgIx === i ? "border-gold" : "border-transparent opacity-70 hover:opacity-100")}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="font-serif text-4xl md:text-5xl">{name}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-gold"><Star className="h-4 w-4 fill-current" /><span className="text-foreground font-medium">{Number(product.rating).toFixed(1)}</span></div>
            <span className="text-muted-foreground">· {product.reviews_count} {t("prod.reviews")}</span>
            <span className={cn("ms-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs", product.stock > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
              {product.stock > 0 ? <><Check className="h-3 w-3" /> {t("prod.instock")}</> : t("prod.outofstock")}
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-serif text-4xl font-semibold">{formatDA(Number(product.price))}</span>
            {product.compare_at_price && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatDA(Number(product.compare_at_price))}</span>
                <span className="rounded-full bg-gradient-gold px-2.5 py-1 text-xs font-bold text-gold-foreground">−{discount}%</span>
              </>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-foreground/80">{desc}</p>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mt-8">
              <div className="mb-3 text-sm font-medium">{t("prod.color")} : <span className="text-muted-foreground">{color}</span></div>
              <div className="flex gap-2">
                {product.colors.map((c: string) => (
                  <button key={c} onClick={() => setColor(c)}
                    className={cn("rounded-full border px-4 py-2 text-sm transition-luxe", color === c ? "border-gold bg-gold/10 font-medium" : "border-border hover:border-gold/50")}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-11 w-11 items-center justify-center transition-luxe hover:bg-secondary"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="flex h-11 w-11 items-center justify-center transition-luxe hover:bg-secondary"><Plus className="h-4 w-4" /></button>
            </div>

            <Button size="lg" variant="luxe" className="flex-1 min-w-[180px]"
              disabled={product.stock === 0}
              onClick={() => add.mutate({ product_id: product.id, quantity: qty, selected_color: color })}>
              {t("prod.add")}
            </Button>
            <Button size="lg" variant="gold" className="flex-1 min-w-[180px]"
              disabled={product.stock === 0}
              onClick={async () => { await add.mutateAsync({ product_id: product.id, quantity: qty, selected_color: color }); navigate("/cart"); }}>
              {t("prod.buy")}
            </Button>
            <Button size="icon" variant="outline" onClick={() => toggle.mutate(product.id)}>
              <Heart className={cn("h-4 w-4", isFav && "fill-gold text-gold")} />
            </Button>
          </div>

          {/* Trust */}
          <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-secondary/30 p-5 text-sm">
            {[
              { icon: Truck, label: t("ben.shipping"), d: t("ben.shipping.d") },
              { icon: ShieldCheck, label: t("ben.payment"), d: t("ben.payment.d") },
              { icon: RotateCcw, label: t("ben.return"), d: t("ben.return.d") },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <b.icon className="h-5 w-5 text-gold-deep" />
                <div><div className="font-medium">{b.label}</div><div className="text-xs text-muted-foreground">{b.d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ReviewSection 
        productId={product.id} 
        currentRating={product.rating} 
        totalReviews={product.reviews_count} 
      />

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-serif text-3xl">{t("prod.related")}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
