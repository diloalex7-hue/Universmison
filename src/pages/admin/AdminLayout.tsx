import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdmin } from "@/lib/useAdmin";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Package, Tags, ShoppingBag, LogOut, Home, Megaphone, Settings, MessageSquareQuote, FileText, LayoutTemplate, Inbox, GalleryHorizontalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Produits", icon: Package },
  { to: "/admin/categories", label: "Catégories", icon: Tags },
  { to: "/admin/orders", label: "Commandes", icon: ShoppingBag },
  { to: "/admin/promotions", label: "Promotions", icon: Megaphone },
  { to: "/admin/hero", label: "Slider", icon: GalleryHorizontalEnd },
  { to: "/admin/testimonials", label: "Avis clients", icon: MessageSquareQuote },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
  { to: "/admin/pages", label: "Pages", icon: FileText },
  { to: "/admin/settings", label: "Paramètres", icon: Settings },
];

export default function AdminLayout() {
  const { isAdmin, loading } = useAdmin();
  const { user, signOut } = useAuth();
  const loc = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement…</div>;
  }
  if (!user) return <Navigate to={`/auth?redirect=${encodeURIComponent(loc.pathname)}`} replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-serif">Accès refusé</h1>
        <p className="text-muted-foreground">Vous n'avez pas les permissions d'administrateur.</p>
        <Link to="/"><Button variant="outline">Retour à l'accueil</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex" dir="ltr">
      <aside className="w-64 bg-background border-r flex flex-col">
        <div className="p-6 border-b">
          <Link to="/admin" className="font-serif text-xl tracking-tight">Univers Maison</Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Console</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted">
            <Home className="h-4 w-4" /> Voir le site
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
