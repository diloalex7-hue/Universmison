import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, localized } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/shop/ProductCard";

export default function Home() {
  const { t, lang } = useI18n();

  useEffect(() => { document.title = "Univers Maison — Art de la table de luxe"; }, []);

  const { data: featured = [] } = useQuery({
    queryKey: ["home-featured"],
    queryFn: async () => (await supabase.from("products").select("*").eq("is_featured", true).limit(4)).data ?? [],
  });
  const { data: bestsellers = [] } = useQuery({
    queryKey: ["home-best"],
    queryFn: async () => (await supabase.from("products").select("*").eq("is_bestseller", true).limit(4)).data ?? [],
  });
  const { data: news = [] } = useQuery({
    queryKey: ["home-new"],
    queryFn: async () => (await supabase.from("products").select("*").eq("is_new", true).limit(8)).data ?? [],
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["home-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("display_order")).data ?? [],
  });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 70% 40%, hsl(38 55% 58% / 0.35), transparent 60%)" }}
        />
        <div className="container-luxe relative grid items-center gap-10 py-20 md:py-28 lg:grid-cols-2 lg:py-36">
          <div className="animate-fade-up max-w-xl">
            <span className="inline-block rounded-full border border-gold/40 px-4 py-1 text-xs uppercase tracking-[0.25em] text-gold">
              {t("hero.eyebrow")}
            </span>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
              {t("hero.title")}
            </h1>
            <p className="mt-6 max-w-md text-lg text-primary-foreground/75">
              {t("hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="xl"><Link to="/shop">{t("hero.cta")} <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/categories">{t("hero.cta2")}</Link>
              </Button>
            </div>
            <div className="mt-12 flex gap-8 text-xs text-primary-foreground/60">
              <div><div className="font-serif text-2xl text-gold">120+</div>références</div>
              <div><div className="font-serif text-2xl text-gold">4.9</div>note moyenne</div>
              <div><div className="font-serif text-2xl text-gold">48h</div>livraison</div>
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:200ms]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-luxury">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80"
                alt="Table dressée"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -start-6 hidden rounded-2xl border border-gold/30 bg-background/95 p-4 shadow-luxury backdrop-blur sm:block">
              <div className="flex items-center gap-3 text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold">
                  <Star className="h-5 w-5 fill-gold-foreground text-gold-foreground" />
                </div>
                <div>
                  <div className="font-serif text-base">4.9 / 5</div>
                  <div className="text-xs text-muted-foreground">+2 400 clients ravis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <Section title={t("sec.categories")} subtitle="Univers Maison">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c: any, i) => (
            <Link
              key={c.id}
              to={`/shop/${c.slug}`}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-secondary animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-90" />
              <div
                className="absolute inset-0 opacity-30 transition-luxe group-hover:opacity-50"
                style={{ backgroundImage: `url(${c.image_url || "https://images.unsplash.com/photo-1604908554049-24a4f7e8a3a4?w=600"})`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
              <div className="relative z-10 flex h-full flex-col justify-end p-4 text-primary-foreground">
                <div className="font-serif text-lg leading-tight">{localized(c, "name", lang)}</div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-gold opacity-80 transition-luxe group-hover:opacity-100">
                  Découvrir <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* FEATURED */}
      <Section title={t("sec.featured")} action={<Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">{t("sec.viewall")} →</Link>}>
        <ProductGrid items={featured} />
      </Section>

      {/* PROMO BANNER */}
      <section className="container-luxe my-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 text-primary-foreground md:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-gold">Édition limitée</span>
              <h3 className="mt-3 font-serif text-4xl md:text-5xl">Collection Hiver — jusqu'à <span className="text-gold">−30%</span></h3>
              <p className="mt-4 max-w-md text-primary-foreground/70">
                Sublimez vos tablées de fêtes avec notre sélection en or et bleu nuit.
              </p>
              <Button asChild variant="gold" size="lg" className="mt-6"><Link to="/shop">Profiter de l'offre</Link></Button>
            </div>
            <div className="flex justify-center md:justify-end">
              <img
                src="https://images.unsplash.com/photo-1602874801007-aa31b56409a4?w=600"
                alt=""
                className="h-64 w-64 rounded-2xl object-cover shadow-luxury md:h-80 md:w-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <Section title={t("sec.bestsellers")} action={<Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">{t("sec.viewall")} →</Link>}>
        <ProductGrid items={bestsellers} />
      </Section>

      {/* BENEFITS */}
      <section className="bg-secondary/30 py-20 mt-20">
        <div className="container-luxe">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">{t("sec.benefits")}</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Une expérience pensée dans le détail</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, title: t("ben.shipping"), desc: t("ben.shipping.d") },
              { icon: ShieldCheck, title: t("ben.payment"), desc: t("ben.payment.d") },
              { icon: RotateCcw, title: t("ben.return"), desc: t("ben.return.d") },
              { icon: Headphones, title: t("ben.support"), desc: t("ben.support.d") },
            ].map((b, i) => (
              <div key={i} className="rounded-2xl bg-background p-6 text-center shadow-elegant">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold">
                  <b.icon className="h-6 w-6 text-gold-foreground" />
                </div>
                <h4 className="mt-4 font-serif text-lg">{b.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW */}
      <Section title={t("sec.new")} action={<Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">{t("sec.viewall")} →</Link>}>
        <ProductGrid items={news} />
      </Section>

      {/* TESTIMONIALS */}
      <section className="container-luxe my-20">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">{t("sec.testimonials")}</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">Ce qu'en disent nos clients</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { name: "Amina B.", city: "Alger", text: "Vaisselle d'une qualité exceptionnelle, l'emballage est digne d'un cadeau de luxe." },
            { name: "Karim L.", city: "Oran", text: "Service client impeccable et livraison ultra rapide. Je recommande à 100%." },
            { name: "Lina R.", city: "Constantine", text: "Mes invités sont sous le charme à chaque fois. Univers Maison transforme une table." },
          ].map((r, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <div className="flex gap-0.5 text-gold">{Array(5).fill(0).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-4 leading-relaxed text-foreground/85">« {r.text} »</p>
              <div className="mt-6 text-sm">
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.city}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="container-luxe my-20">
        <div className="rounded-3xl bg-gradient-primary p-10 text-center text-primary-foreground md:p-16">
          <h3 className="font-serif text-3xl md:text-4xl">{t("sec.newsletter")}</h3>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/70">{t("sec.newsletter.desc")}</p>
          <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <Input type="email" required placeholder={t("common.email")}
              className="h-12 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-gold" />
            <Button type="submit" variant="gold" size="lg">{t("common.subscribe")}</Button>
          </form>
        </div>
      </section>
    </>
  );
}

function Section({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="container-luxe my-20">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          {subtitle && <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">{subtitle}</p>}
          <h2 className="mt-2 font-serif text-3xl md:text-4xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProductGrid({ items }: { items: any[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {items.map((p, i) => (
        <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
