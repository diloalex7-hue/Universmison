import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, X, Globe, ArrowLeft, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { useI18n, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useCart, useFavorites } from "@/lib/store";
import { useAdmin } from "@/lib/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const langs: { code: Lang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "ar", label: "العربية" },
  { code: "en", label: "EN" },
];

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { count } = useCart();
  const { items: favs } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const showBackButton = location.pathname.startsWith("/product/");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
      setShowMobileSearch(false);
    }
  };

  const navItems = [
    { to: "/", label: t("nav.home") },
    { to: "/shop", label: t("nav.shop") },
    { to: "/categories", label: t("nav.categories") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/40 dark:border-neutral-800/40 bg-background/90 pt-safe backdrop-blur-xl">
      <div className="container-luxe">
        {/* Top utility bar */}
        <div className="hidden items-center justify-between border-b border-border/40 py-1.5 text-xs text-muted-foreground md:flex">
          <span>{t("foot.tagline")}</span>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-luxe">
                <Globe className="h-3.5 w-3.5" />
                {langs.find(l => l.code === lang)?.label}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[8rem]">
                {langs.map(l => (
                  <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>{l.label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main row */}
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          {showMobileSearch ? (
            /* Expandable Search Input for iOS Style */
            <div className="flex flex-1 items-center gap-2 animate-scale-in">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowMobileSearch(false)}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <form onSubmit={onSearch} className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground"
                  style={{ [lang === "ar" ? "right" : "left"]: "0.85rem" } as any} />
                <Input 
                  autoFocus
                  value={q} 
                  onChange={(e) => setQ(e.target.value)} 
                  placeholder={t("nav.search")}
                  className={`h-11 w-full rounded-full border-neutral-200/60 dark:border-neutral-800 bg-secondary/50 ${lang === "ar" ? "pr-10" : "pl-10"} focus-visible:ring-gold text-sm`} 
                />
              </form>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setQ(""); setShowMobileSearch(false); }}
                className="text-xs font-medium text-gold shrink-0"
              >
                {lang === "ar" ? "إلغاء" : "Annuler"}
              </Button>
            </div>
          ) : (
            <>
              {/* Logo & optional Back button */}
              <div className="flex items-center gap-2">
                {showBackButton && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate(-1)} 
                    className="h-10 w-10 text-muted-foreground hover:text-foreground active:scale-95 transition-transform duration-200"
                    aria-label="Back"
                  >
                    <ArrowLeft className={cn("h-6 w-6 text-gold-deep", lang === "ar" && "rotate-180")} />
                  </Button>
                )}
                <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 active:scale-95 transition-transform duration-200 -ml-1">
                  <img src="/logo.png" alt="Univers Maison Logo" className="h-10 w-auto sm:h-12 object-contain drop-shadow-sm" />
                  <div className="leading-none flex flex-col">
                    <div className="font-serif text-lg sm:text-xl font-medium tracking-tight whitespace-nowrap">
                      {lang === "ar" ? (
                        t("brand.name")
                      ) : (
                        <>Univers <span className="text-gold">Maison</span></>
                      )}
                    </div>
                    <div className="text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted-foreground whitespace-nowrap">
                      {t("brand.tagline")}
                    </div>
                  </div>
                </Link>
              </div>

              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-7">
                {navItems.map(n => (
                  <NavLink key={n.to} to={n.to}
                    className={({ isActive }) => `relative text-sm font-medium transition-luxe hover:text-foreground ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {({ isActive }) => (<>
                      {n.label}
                      {isActive && <span className="absolute -bottom-1.5 left-0 right-0 mx-auto h-px w-6 bg-gradient-gold" />}
                    </>)}
                  </NavLink>
                ))}
              </nav>

              {/* Search + actions */}
              <div className="flex items-center gap-1 md:gap-2 -mr-2 md:mr-0">
                {/* Theme toggle */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
                  className="active:scale-95 transition-transform duration-200"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5.5 w-5.5 text-gold animate-scale-in" />
                  ) : (
                    <Moon className="h-5.5 w-5.5 text-foreground animate-scale-in" />
                  )}
                </Button>

                {/* Search Toggle Trigger on Mobile */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowMobileSearch(true)} 
                  className="md:hidden"
                >
                  <Search className="h-5.5 w-5.5 text-foreground" />
                </Button>

                {/* Language switcher on mobile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Globe className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[8rem]">
                    {langs.map(l => (
                      <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>
                        <span className={lang === l.code ? "font-bold text-gold" : ""}>{l.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Desktop search form */}
                <form onSubmit={onSearch} className="relative hidden md:block">
                  <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    style={{ [lang === "ar" ? "right" : "left"]: "0.75rem" } as any} />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("nav.search")}
                    className={`h-10 w-48 rounded-full border-border/60 bg-secondary/40 ${lang === "ar" ? "pr-9" : "pl-9"} lg:w-64 focus-visible:ring-gold`} />
                </form>

                <Button asChild variant="ghost" size="icon" className="relative hidden md:flex active:scale-95 transition-transform duration-200">
                  <Link to="/account/favorites" aria-label={t("nav.favorites")}>
                    <Heart className="h-5 w-5" />
                    {favs.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-gold-foreground animate-scale-in">{favs.length}</span>
                    )}
                  </Link>
                </Button>

                {/* Desktop-only Cart Button (Mobile is in Bottom Nav) */}
                <Button asChild variant="ghost" size="icon" className="relative hidden md:flex active:scale-95 transition-transform duration-200">
                  <Link to="/cart" aria-label={t("nav.cart")}>
                    <ShoppingBag className="h-5 w-5" />
                    {count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-gold-foreground animate-scale-in">{count}</span>
                    )}
                  </Link>
                </Button>

                {/* Desktop-only Profile Menu */}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hidden md:flex"><User className="h-5 w-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild><Link to="/account">{t("acc.profile")}</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to="/account/orders">{t("acc.orders")}</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to="/account/favorites">{t("acc.favorites")}</Link></DropdownMenuItem>
                      {isAdmin && (<>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link to="/admin" className="text-gold font-medium">⚡ Admin Console</Link></DropdownMenuItem>
                      </>)}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut}>{t("nav.signout")}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="ghost" size="icon" className="hidden md:flex"><Link to="/auth"><User className="h-5 w-5" /></Link></Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
