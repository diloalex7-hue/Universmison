import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, localized } from "@/lib/i18n";
import ProductCard from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";

type Sort = "new" | "priceasc" | "pricedesc" | "rating";

export default function Shop() {
  const { categorySlug } = useParams();
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const { t, lang } = useI18n();
  const [sort, setSort] = useState<Sort>("new");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 25000]);

  useEffect(() => { document.title = "Boutique — Univers Maison"; }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ["all-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("display_order")).data ?? [],
  });

  const currentCat = categories.find((c: any) => c.slug === categorySlug);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop", categorySlug, q, sort],
    queryFn: async () => {
      let query = supabase.from("products").select("*");
      if (currentCat) query = query.eq("category_id", currentCat.id);
      if (q) query = query.or(`name_fr.ilike.%${q}%,name_ar.ilike.%${q}%,name_en.ilike.%${q}%`);
      if (sort === "priceasc") query = query.order("price", { ascending: true });
      else if (sort === "pricedesc") query = query.order("price", { ascending: false });
      else if (sort === "rating") query = query.order("rating", { ascending: false });
      else query = query.order("created_at", { ascending: false });
      const { data } = await query;
      return data ?? [];
    },
  });

  const filtered = useMemo(
    () => products.filter((p: any) => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]),
    [products, priceRange]
  );

  return (
    <div className="container-luxe py-10">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">{t("nav.home")}</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-foreground">{t("nav.shop")}</Link>
          {currentCat && (<><span className="mx-2">/</span><span className="text-foreground">{localized(currentCat, "name", lang)}</span></>)}
        </nav>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">
          {currentCat ? localized(currentCat, "name", lang) : q ? `« ${q} »` : t("nav.shop")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{filtered.length} {t("common.products")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters desktop */}
        <aside className="hidden lg:block">
          <FilterPanel categories={categories} currentSlug={categorySlug} priceRange={priceRange} setPriceRange={setPriceRange} />
        </aside>

        <div>
          {/* Toolbar */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="sm"><SlidersHorizontal className="h-4 w-4" /> {t("filter.title")}</Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <FilterPanel categories={categories} currentSlug={categorySlug} priceRange={priceRange} setPriceRange={setPriceRange} />
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-52 rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">{t("filter.sort.new")}</SelectItem>
                <SelectItem value="priceasc">{t("filter.sort.priceasc")}</SelectItem>
                <SelectItem value="pricedesc">{t("filter.sort.pricedesc")}</SelectItem>
                <SelectItem value="rating">{t("filter.sort.rating")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-secondary/40 p-12 text-center">
              <p className="text-muted-foreground">Aucun produit trouvé.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
              {filtered.map((p: any, i) => (
                <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({ categories, currentSlug, priceRange, setPriceRange }: any) {
  const { t, lang } = useI18n();
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">{t("nav.categories")}</h3>
        <ul className="space-y-1.5">
          <li><Link to="/shop" className={`block rounded-lg px-3 py-2 text-sm transition-luxe hover:bg-secondary ${!currentSlug ? "bg-secondary font-medium" : ""}`}>Tout</Link></li>
          {categories.map((c: any) => (
            <li key={c.id}>
              <Link to={`/shop/${c.slug}`} className={`block rounded-lg px-3 py-2 text-sm transition-luxe hover:bg-secondary ${currentSlug === c.slug ? "bg-secondary font-medium" : ""}`}>
                {localized(c, "name", lang)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">{t("filter.price")}</h3>
        <Slider value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} min={0} max={25000} step={500} className="my-4" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{priceRange[0].toLocaleString()} DA</span>
          <span>{priceRange[1].toLocaleString()} DA</span>
        </div>
      </div>
    </div>
  );
}
