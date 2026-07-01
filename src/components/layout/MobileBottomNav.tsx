import { NavLink } from "react-router-dom";
import { Home, LayoutGrid, ShoppingBag, User, Store } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Capacitor } from "@capacitor/core";

export default function MobileBottomNav() {
  const { t } = useI18n();
  const { count } = useCart();
  const { user } = useAuth();

  const navItems = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/shop", label: t("nav.shop"), icon: Store },
    { to: "/categories", label: t("nav.categories"), icon: LayoutGrid },
    { to: "/cart", label: t("nav.cart"), icon: ShoppingBag, badge: count },
    { to: user ? "/account" : "/auth", label: t("nav.profile") || "Profil", icon: User },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 w-full z-[9999] flex md:hidden items-center justify-between px-6 sm:px-8 border-t border-neutral-200/40 dark:border-neutral-800/40 bg-background pt-2 pb-[calc(max(env(safe-area-inset-bottom,0px),36px)+6px)] shadow-[0_-8px_32px_rgba(0,0,0,0.05)]"
      style={{ left: 0, right: 0 }}
    >
      {navItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-300 active:scale-90 ${
                isActive ? "text-gold" : "text-muted-foreground hover:text-foreground"
              } ${index === 0 ? '-ml-5' : index === navItems.length - 1 ? '-mr-5' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex flex-col items-center justify-center">
                  <Icon className={`h-4.5 w-4.5 transition-all duration-300 ${isActive ? "scale-110 stroke-[2.2] fill-gold/15" : "stroke-[1.8]"}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[8px] font-bold text-gold-foreground animate-scale-in">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-semibold tracking-wide transition-all duration-300">{item.label}</span>
                {isActive && (
                  <span className="ios-tab-active-dot w-1 h-1 bg-gold rounded-full absolute bottom-1.5 animate-scale-in" />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
