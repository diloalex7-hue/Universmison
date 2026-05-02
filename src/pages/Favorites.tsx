import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import ProductCard from "@/components/shop/ProductCard";
import { Heart } from "lucide-react";

export default function Favorites() {
  const { user } = useAuth();
  const { items } = useFavorites();
  const { t } = useI18n();
  useEffect(() => { document.title = "Favoris — Univers Maison"; }, []);

  if (!user) return <div className="container-luxe py-20 text-center"><Link to="/auth" className="underline">Se connecter</Link></div>;

  return (
    <div className="container-luxe py-10">
      <h1 className="font-serif text-4xl md:text-5xl">{t("acc.favorites")}</h1>
      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-secondary/40 p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">Aucun favori pour le moment.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
          {items.map((f: any) => <ProductCard key={f.id} product={f.product} />)}
        </div>
      )}
    </div>
  );
}
