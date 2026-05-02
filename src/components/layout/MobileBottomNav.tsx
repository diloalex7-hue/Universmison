import { NavLink } from "react-router-dom";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Capacitor } from "@capacitor/core";

export default function MobileBottomNav() {
  const { t } = useI18n();
  const { count } = useCart();
  const { user } = useAuth();
  
  // N'afficher que si on est sur une plateforme native (iOS/Android)
  if (!Capacitor.isNativePlatform()) return null;

  const navItems = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/categories", label: t("nav.categories"), icon: LayoutGrid },
    { to: "/cart", label: t("nav.cart"), icon: ShoppingBag, badge: count },
    { to: user ? "/account" : "/auth", label: t("nav.profile") || "Profil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border/60 bg-background/95 pb-safe backdrop-blur-xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 px-3 py-2 transition-luxe ${
                isActive ? "text-gold" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? "fill-gold/10" : ""}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-gold-foreground">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
