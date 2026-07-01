import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, localized } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/shop/ProductCard";
import Countdown from "@/components/Countdown";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const optimizeImage = (url: string, width = 1200) => {
  if (!url) return "";
  if (url.includes("unsplash.com")) {
    const baseUrl = url.split("?")[0];
    return `${baseUrl}?w=${width}&q=80&auto=format`;
  }
  return url;
};

export default function Home() {
  const { t, lang } = useI18n();
  const [heroLoaded, setHeroLoaded] = useState(false);

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
  const { data: promo } = useQuery({
    queryKey: ["home-promo"],
    queryFn: async () => {
      const { data } = await supabase.from("promotions").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1);
      return (data && data.length > 0) ? data[0] : null;
    },
  });
  const { data: testimonials = [] } = useQuery({
    queryKey: ["home-testimonials"],
    queryFn: async () => (await supabase.from("testimonials").select("*").eq("is_visible", true).order("display_order").limit(6)).data ?? [],
  });
  const { data: heroSlides = [] } = useQuery({
    queryKey: ["home-hero-slides"],
    queryFn: async () => {
      const { data } = await supabase.from("hero_settings").select("*");
      return data ?? [];
    },
  });

  const defaultSlides = [
    {
      eyebrow: "Nouvelle Collection",
      title: "L'art de recevoir, redéfini.",
      subtitle: "Vaisselle, verrerie et objets d'exception, sélectionnés pour les tables qui racontent une histoire.",
      image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
      button1_text: "Découvrir la collection",
      button1_link: "/shop",
      button2_text: "Voir les catégories",
      button2_link: "/categories",
      stat1_value: "120+",
      stat1_label: "références",
      stat2_value: "4.9",
      stat2_label: "note moyenne",
      stat3_value: "48h",
      stat3_label: "livraison",
      badge_text: "4.9 / 5",
      badge_subtitle: "+2 400 clients ravis"
    },
    {
      eyebrow: "Art de la Table",
      title: "L'élégance à chaque repas.",
      subtitle: "Des assiettes en porcelaine fine et des couverts dorés pour sublimer vos dîners et impressionner vos convives.",
      image_url: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=1200&q=80",
      button1_text: "Découvrir la collection",
      button1_link: "/shop",
      button2_text: "Nos nouveautés",
      button2_link: "/shop",
      stat1_value: "50+",
      stat1_label: "modèles",
      stat2_value: "100%",
      stat2_label: "qualité",
      stat3_value: "24h",
      stat3_label: "expédition",
      badge_text: "Premium",
      badge_subtitle: "Porcelaine d'exception"
    },
    {
      eyebrow: "Décoration de Luxe",
      title: "Des détails qui font la différence.",
      subtitle: "Vases en cristal, bougeoirs dorés et accessoires raffinés pour illuminer votre intérieur de luxe.",
      image_url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
      button1_text: "Découvrir la collection",
      button1_link: "/shop",
      button2_text: "Voir tout",
      button2_link: "/shop",
      stat1_value: "200+",
      stat1_label: "articles",
      stat2_value: "Artisanat",
      stat2_label: "d'exception",
      stat3_value: "Gratuit",
      stat3_label: "retrait en magasin",
      badge_text: "Exclusif",
      badge_subtitle: "Finitions à la main"
    }
  ];

  const rawSlides = heroSlides.length > 0 ? heroSlides : defaultSlides;
  const slides = rawSlides.map((s: any, idx: number) => {
    const fallback = defaultSlides[idx % defaultSlides.length];
    return {
      id: s.id,
      eyebrow: s.eyebrow || fallback.eyebrow,
      title: s.title || fallback.title,
      subtitle: s.subtitle || fallback.subtitle,
      image_url: s.image_url || fallback.image_url,
      button1_text: s.button1_text || fallback.button1_text,
      button1_link: s.button1_link || fallback.button1_link,
      button2_text: s.button2_text || fallback.button2_text,
      button2_link: s.button2_link || fallback.button2_link,
      stat1_value: s.stat1_value,
      stat1_label: s.stat1_label,
      stat2_value: s.stat2_value,
      stat2_label: s.stat2_label,
      stat3_value: s.stat3_value,
      stat3_label: s.stat3_label,
      badge_text: s.badge_text || fallback.badge_text,
      badge_subtitle: s.badge_subtitle || fallback.badge_subtitle,
    };
  });

  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 6000);
  }, [nextSlide]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  const handleIndicatorClick = (idx: number) => {
    setActiveSlide(idx);
    startTimer();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    const threshold = 50;
    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }
    touchStartRef.current = null;
    startTimer();
  };

  const getLocalizedStatLabel = (label: string) => {
    const l = label?.toLowerCase()?.trim();
    if (!l) return "";
    if (l === "références" || l === "references") return t("hero.stat1_label");
    if (l === "note moyenne" || l === "average rating") return t("hero.stat2_label");
    if (l === "livraison" || l === "delivery") return t("hero.stat3_label");
    return label;
  };

  return (
    <>
      {/* HERO SLIDER */}
      <section 
        className="relative overflow-hidden bg-gradient-hero text-white w-full"
        onMouseEnter={stopTimer}
        onMouseLeave={startTimer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="absolute inset-0 opacity-30 z-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 70% 40%, hsl(38 55% 58% / 0.35), transparent 60%)" }}
        />

        <div className="relative w-full">
          {slides.map((s, index) => {
            const isActive = index === activeSlide;
            return (
              <div
                key={s.id || index}
                className={cn(
                  "w-full transition-all duration-1000 ease-in-out flex items-center min-h-[500px] sm:min-h-[600px] lg:min-h-0",
                  isActive 
                    ? "opacity-100 translate-x-0 relative z-10 pointer-events-auto" 
                    : "opacity-0 translate-x-8 absolute inset-0 pointer-events-none z-0"
                )}
              >
                {/* Mobile view background image */}
                <div className="absolute inset-0 block lg:hidden">
                  <img
                    src={optimizeImage(s.image_url, 1000)}
                    alt={s.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                </div>

                <div className="container-luxe relative z-20 grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2 lg:py-32 w-full">
                  <div className={cn(
                    "max-w-xl transition-all duration-700 delay-300 transform", 
                    isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  )}>
                    <span className="inline-block rounded-full border border-gold/40 px-4 py-1 text-xs uppercase tracking-[0.25em] text-gold">
                      {s.eyebrow}
                    </span>
                    <h1 className="mt-6 font-serif text-4xl leading-[1.1] md:text-5xl lg:text-6xl text-white">
                      {s.title}
                    </h1>
                    <p className="mt-6 max-w-md text-base md:text-lg text-white/80">
                      {s.subtitle}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Button asChild variant="gold" size="lg">
                        <Link to={s.button1_link || "/shop"}>
                          {s.button1_text || "Découvrir"} <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      {(s.button2_text && s.button2_link) && (
                        <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                          <Link to={s.button2_link}>{s.button2_text}</Link>
                        </Button>
                      )}
                    </div>
                    <div className="mt-10 flex gap-8 text-xs text-white/60">
                      {s.stat1_value && (
                        <div>
                          <div className="font-serif text-2xl text-gold">{s.stat1_value}</div>
                          {getLocalizedStatLabel(s.stat1_label)}
                        </div>
                      )}
                      {s.stat2_value && (
                        <div>
                          <div className="font-serif text-2xl text-gold">{s.stat2_value}</div>
                          {getLocalizedStatLabel(s.stat2_label)}
                        </div>
                      )}
                      {s.stat3_value && (
                        <div>
                          <div className="font-serif text-2xl text-gold">{s.stat3_value}</div>
                          {getLocalizedStatLabel(s.stat3_label)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={cn(
                    "hidden lg:block relative transition-all duration-700 delay-500 transform", 
                    isActive ? "scale-100 opacity-100" : "scale-95 opacity-0"
                  )}>
                    <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden rounded-3xl shadow-luxury bg-secondary/10">
                      <img
                        src={optimizeImage(s.image_url, 1200)}
                        alt={s.title}
                        className="h-full w-full object-cover transition-transform duration-10000 ease-out hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                    </div>
                    {(s.badge_text && s.badge_subtitle) && (
                      <div className="absolute -bottom-6 -start-6 rounded-2xl border border-gold/30 bg-background/95 p-4 shadow-luxury backdrop-blur">
                        <div className="flex items-center gap-3 text-foreground">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold">
                            <Star className="h-5 w-5 fill-gold-foreground text-gold-foreground" />
                          </div>
                          <div>
                            <div className="font-serif text-base">{s.badge_text}</div>
                            <div className="text-xs text-muted-foreground">{s.badge_subtitle}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full border border-white/10 bg-black/20 text-white/80 hover:bg-gold hover:text-gold-foreground transition-all duration-300 hover:scale-110 active:scale-95 hidden md:block"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full border border-white/10 bg-black/20 text-white/80 hover:bg-gold hover:text-gold-foreground transition-all duration-300 hover:scale-110 active:scale-95 hidden md:block"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleIndicatorClick(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === activeSlide ? "w-8 bg-gold" : "w-2 bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="my-14 md:my-20">
        <div className="container-luxe mb-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">{t("sec.categories")}</p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">{t("sec.categories")}</h2>
          </div>
        </div>
        
        {/* Horizontal scroll on mobile, centered flex on desktop */}
        <div className="flex gap-6 md:gap-8 overflow-x-auto px-5 md:px-0 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide md:justify-center md:flex-wrap">
          {categories.map((c: any, i) => (
            <Link
              key={c.id}
              to={`/shop/${c.slug}`}
              className="group flex flex-col items-center gap-3 flex-shrink-0 snap-center animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Circle Image */}
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full overflow-hidden border-2 border-neutral-200/60 dark:border-neutral-700/60 shadow-md transition-all duration-300 group-hover:border-gold/60 group-hover:shadow-lg group-hover:shadow-gold/10 group-active:scale-95">
                <img
                  src={optimizeImage(c.image_url || "https://images.unsplash.com/photo-1604908554049-24a4f7e8a3a4?w=300", 300)}
                  alt={localized(c, "name", lang)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              {/* Name */}
              <span className="text-xs sm:text-sm font-medium text-foreground/80 text-center whitespace-nowrap transition-colors duration-300 group-hover:text-gold">
                {localized(c, "name", lang)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <Section title={t("sec.featured")} action={<Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">{t("sec.viewall")} →</Link>}>
        <ProductGrid items={featured} />
      </Section>

      {/* PROMO BANNER (Dynamic) */}
      {promo && (
        <section className="container-luxe my-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-primary px-6 py-10 text-white md:p-16">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div>
                {promo.subtitle && (
                  <span className="text-xs uppercase tracking-[0.25em] text-gold">{promo.subtitle}</span>
                )}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
                  <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight max-w-[15ch]">
                    {promo.title}
                  </h3>
                  
                  {promo.discount_text && (
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:block h-16 w-px bg-gold/30" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold mb-1 opacity-80">
                          {lang === 'ar' ? 'خصم يصل إلى' : 'Jusqu\'à'}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-6xl sm:text-7xl md:text-8xl font-serif font-bold text-gold tracking-tighter drop-shadow-[0_2px_10px_rgba(197,165,114,0.3)]">
                            {promo.discount_text}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {promo.description && (
                  <p className="mt-4 max-w-md text-white/70">{promo.description}</p>
                )}
                {promo.end_date && <Countdown endDate={promo.end_date} />}
                {promo.button_text && promo.button_link && (
                  <Button asChild variant="gold" size="xl" className="mt-8 shadow-gold/20">
                    <Link to={promo.button_link}>{promo.button_text}</Link>
                  </Button>
                )}
              </div>
              {promo.image_url && (
                <div className="flex justify-center md:justify-end">
                  <img
                    src={promo.image_url}
                    alt={promo.title}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full max-w-[320px] rounded-3xl object-contain shadow-luxury md:max-w-md"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* BESTSELLERS */}
      <Section title={t("sec.bestsellers")} action={<Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">{t("sec.viewall")} →</Link>}>
        <ProductGrid items={bestsellers} />
      </Section>

      {/* NEW */}
      <Section title={t("sec.new")} action={<Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">{t("sec.viewall")} →</Link>}>
        <ProductGrid items={news} />
      </Section>

      {/* BENEFITS */}
      <section className="bg-secondary/30 py-20 mt-20">
        <div className="container-luxe">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">{t("sec.benefits")}</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">{t("benefits.title")}</h2>
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

      {/* TESTIMONIALS SLIDER */}
      {testimonials.length > 0 && <TestimonialSlider testimonials={testimonials} title={t("sec.testimonials")} />}

      {/* NEWSLETTER */}
      <section className="container-luxe my-20">
        <div className="rounded-3xl bg-gradient-primary p-10 text-center text-white md:p-16">
          <h3 className="font-serif text-3xl md:text-4xl">{t("sec.newsletter")}</h3>
          <p className="mx-auto mt-3 max-w-xl text-white/70">{t("sec.newsletter.desc")}</p>
          <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <Input type="email" required placeholder={t("common.email")}
              className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-gold" />
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

function TestimonialSlider({ testimonials, title }: { testimonials: any[]; title: string }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // How many cards to show per "page" based on screen size
  const getPerPage = useCallback(() => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }, []);

  const [perPage, setPerPage] = useState(getPerPage);
  const totalPages = Math.ceil(testimonials.length / perPage);

  useEffect(() => {
    const onResize = () => setPerPage(getPerPage());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [getPerPage]);

  // Auto-play
  useEffect(() => {
    if (paused || totalPages <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % totalPages);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, totalPages]);

  const prev = () => setCurrent(c => (c - 1 + totalPages) % totalPages);
  const next = () => setCurrent(c => (c + 1) % totalPages);

  const visibleItems = testimonials.slice(current * perPage, current * perPage + perPage);
  // If we're at the last page and there aren't enough items, pad from the beginning
  const displayed = visibleItems.length < perPage
    ? [...visibleItems, ...testimonials.slice(0, perPage - visibleItems.length)]
    : visibleItems;

  return (
    <section
      className="container-luxe my-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">{title}</p>
        <h2 className="mt-3 font-serif text-3xl md:text-4xl">{t("testimonials.title")}</h2>
      </div>

      <div className="relative mt-12">
        {/* Navigation Arrows */}
        {totalPages > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 shadow-lg backdrop-blur transition-all hover:border-gold hover:shadow-xl"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 shadow-lg backdrop-blur transition-all hover:border-gold hover:shadow-xl"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Cards */}
        <div className="overflow-hidden">
          <div
            className="grid gap-6 transition-all duration-500 ease-in-out"
            style={{ gridTemplateColumns: `repeat(${perPage}, 1fr)` }}
          >
            {displayed.map((r: any, i: number) => (
              <div
                key={`${current}-${i}`}
                className="rounded-2xl border border-border bg-card p-6 shadow-elegant animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex gap-0.5 text-gold">
                  {Array(r.rating).fill(0).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 leading-relaxed text-foreground/85 line-clamp-4">« {r.text} »</p>
                <div className="mt-6 text-sm">
                  <div className="font-medium">{r.name}</div>
                  {r.city && <div className="text-xs text-muted-foreground">{r.city}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array(totalPages).fill(0).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-8 bg-gold" : "w-2.5 bg-border hover:bg-gold/40"
                }`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

