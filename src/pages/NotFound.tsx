import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useEffect } from "react";

export default function NotFound() {
  const { t } = useI18n();
  useEffect(() => { document.title = "404 — Univers Maison"; }, []);
  return (
    <div className="container-luxe flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="font-serif text-[10rem] leading-none text-gold/30">404</div>
      <h1 className="font-serif text-3xl md:text-4xl">{t("common.notfound")}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">La page que vous cherchez s'est égarée. Rejoignons l'essentiel.</p>
      <Button asChild variant="luxe" size="lg" className="mt-8"><Link to="/">{t("common.backhome")}</Link></Button>
    </div>
  );
}
