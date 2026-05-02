import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { useI18n, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useCart, useFavorites } from "@/lib/store";
import { useAdmin } from "@/lib/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const langs: { code: Lang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "ar", label: "العربية" },
  { code: "en", label: "EN" },
];

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const { items: favs } = useFavorites();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  const navItems = [
    { to: "/", label: t("nav.home") },
    { to: "/shop", label: t("nav.shop") },
    { to: "/categories", label: t("nav.categories") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
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
          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side={lang === "ar" ? "right" : "left"} className="w-[85%] sm:max-w-sm">
              <nav className="mt-8 flex flex-col gap-1">
                {navItems.map(n => (
                  <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)}
                    className={({ isActive }) => `rounded-lg px-3 py-3 text-base transition-luxe ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}>
                    {n.label}
                  </NavLink>
                ))}
                <div className="my-4 gold-divider" />
                <div className="flex gap-2">
                  {langs.map(l => (
                    <Button key={l.code} variant={lang === l.code ? "default" : "outline"} size="sm" onClick={() => setLang(l.code)}>{l.label}</Button>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary">
              <span className="font-serif text-lg text-gold">U</span>
            </div>
            <div className="leading-none">
              <div className="font-serif text-xl font-medium tracking-tight">Univers <span className="text-gold">Maison</span></div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:block">Art de la table</div>
            </div>
          </Link>

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
          <div className="flex items-center gap-1 md:gap-2">
            <form onSubmit={onSearch} className="relative hidden md:block">
              <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                style={{ [lang === "ar" ? "right" : "left"]: "0.75rem" } as any} />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("nav.search")}
                className={`h-10 w-48 rounded-full border-border/60 bg-secondary/40 ${lang === "ar" ? "pr-9" : "pl-9"} lg:w-64 focus-visible:ring-gold`} />
            </form>

            <Button asChild variant="ghost" size="icon" className="relative">
              <Link to="/account/favorites" aria-label={t("nav.favorites")}>
                <Heart className="h-5 w-5" />
                {favs.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-gold-foreground">{favs.length}</span>
                )}
              </Link>
            </Button>

            <Button asChild variant="ghost" size="icon" className="relative">
              <Link to="/cart" aria-label={t("nav.cart")}>
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-gold-foreground">{count}</span>
                )}
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild><Link to="/account">{t("acc.profile")}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/account/orders">{t("acc.orders")}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/account/favorites">{t("acc.favorites")}</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>{t("nav.signout")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="ghost" size="icon"><Link to="/auth"><User className="h-5 w-5" /></Link></Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
