import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, localized } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function Categories() {
  const { t, lang } = useI18n();
  useEffect(() => { document.title = "Catégories — Univers Maison"; }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories-page"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*, products(count)").order("display_order");
      return data ?? [];
    },
  });

  return (
    <div className="container-luxe py-12">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">{t("sec.categories")}</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">{t("cat.explore")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          {t("cat.desc")}
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c: any, i) => {
          const count = c.products?.[0]?.count ?? 0;
          return (
            <Link
              key={c.id}
              to={`/shop/${c.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-primary text-white shadow-elegant animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="absolute inset-0 opacity-50 transition-luxe group-hover:scale-105 group-hover:opacity-70"
                style={{ backgroundImage: `url(${c.image_url || "https://images.unsplash.com/photo-1604908554049-24a4f7e8a3a4?w=900"})`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-end p-8">
                <p className="text-xs uppercase tracking-[0.25em] text-gold">{count} {t("common.products")}</p>
                <h3 className="mt-2 font-serif text-3xl">{localized(c, "name", lang)}</h3>
                <p className="mt-2 text-sm text-white/80">{localized(c, "description", lang)}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm text-gold opacity-0 transition-luxe group-hover:opacity-100">
                  {t("common.discover")} <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
