import { useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdmin } from "@/lib/useAdmin";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Package, Tags, ShoppingBag, LogOut, Home,
  Megaphone, Settings, MessageSquareQuote, FileText, Inbox,
  GalleryHorizontalEnd, ChevronRight, Zap, Ticket, Truck, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navSections = [
  {
    title: "PRINCIPAL",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/admin/orders", label: "Commandes", icon: ShoppingBag },
      { to: "/admin/products", label: "Produits", icon: Package },
      { to: "/admin/categories", label: "Catégories", icon: Tags },
    ],
  },
  {
    title: "MARKETING",
    items: [
      { to: "/admin/promotions", label: "Promotions", icon: Megaphone },
      { to: "/admin/coupons", label: "Coupons", icon: Ticket },
      { to: "/admin/hero", label: "Slider", icon: GalleryHorizontalEnd },
      { to: "/admin/testimonials", label: "Avis clients", icon: MessageSquareQuote },
    ],
  },
  {
    title: "CONTENU",
    items: [
      { to: "/admin/messages", label: "Messages", icon: Inbox },
      { to: "/admin/pages", label: "Pages", icon: FileText },
      { to: "/admin/settings", label: "Paramètres", icon: Settings },
      { to: "/admin/shipping", label: "Livraison", icon: Truck },
    ],
  },
];

export default function AdminLayout() {
  const { isAdmin, loading } = useAdmin();
  const { user, signOut } = useAuth();
  const loc = useLocation();

  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement…</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to={`/auth?redirect=${encodeURIComponent(loc.pathname)}`} replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-neutral-50 dark:bg-neutral-950">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-2">
          <Zap className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-serif">Accès refusé</h1>
        <p className="text-muted-foreground max-w-sm">Vous n'avez pas les permissions d'administrateur pour accéder à cette section.</p>
        <Link to="/"><Button variant="outline">Retour à l'accueil</Button></Link>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="w-full h-full bg-neutral-950 dark:bg-neutral-900 text-neutral-300 flex flex-col shrink-0 overflow-y-auto">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 shrink-0">
        <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow duration-300">
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <div className="font-serif text-base font-semibold text-white tracking-tight leading-none">Univers Maison</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 mt-0.5">Admin Console</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-5 overflow-y-auto pb-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-amber-400" />
                      )}
                      <span className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-200 ${
                        isActive ? "bg-amber-500/20 text-amber-400" : "bg-white/[0.04] text-neutral-500 group-hover:text-neutral-300"
                      }`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1">{label}</span>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/[0.06] space-y-0.5 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 transition-all duration-200"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] text-neutral-500">
            <Home className="h-3.5 w-3.5" />
          </span>
          Voir le site
        </Link>
        <button
          onClick={() => {
            if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
              signOut();
            }
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] text-neutral-500">
            <LogOut className="h-3.5 w-3.5" />
          </span>
          Déconnexion
        </button>
      </div>

      {/* User pill */}
      <div className="px-4 py-3 border-t border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-white truncate">{user.email}</p>
            <p className="text-[10px] text-neutral-500">Administrateur</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row" dir="ltr">
      {/* ─── Mobile Header ─── */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-neutral-950 text-white border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="font-serif text-sm font-semibold tracking-tight">Univers Maison Admin</div>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[260px] border-r-neutral-800 bg-neutral-950">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </header>

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex w-[260px] bg-neutral-950 shrink-0">
        <SidebarContent />
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
        <Outlet />
      </main>
    </div>
  );
}
