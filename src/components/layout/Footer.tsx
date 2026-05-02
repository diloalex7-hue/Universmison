import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-gradient-primary text-primary-foreground">
      <div className="container-luxe py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40">
                <span className="font-serif text-lg text-gold">U</span>
              </div>
              <div className="font-serif text-2xl">Univers <span className="text-gold">Maison</span></div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
              {t("foot.tagline")}
            </p>
            <div className="mt-6 space-y-2 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> Alger, Algérie</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> +213 (0) 555 00 00 00</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /> hello@universmaison.dz</div>
            </div>
            <div className="mt-6 flex gap-3">
              <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 transition-luxe hover:border-gold hover:text-gold"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 transition-luxe hover:border-gold hover:text-gold"><Facebook className="h-4 w-4" /></a>
            </div>
          </div>

          <FooterCol title={t("foot.about")} links={[
            { to: "/about", label: t("foot.about") },
            { to: "/contact", label: t("foot.contact") },
          ]} />
          <FooterCol title={t("foot.help")} links={[
            { to: "/faq", label: t("foot.faq") },
            { to: "/account/orders", label: t("acc.orders") },
            { to: "/shipping", label: t("foot.shipping") },
            { to: "/returns", label: t("foot.return") },
          ]} />
          <FooterCol title={t("foot.legal")} links={[
            { to: "/privacy", label: t("foot.privacy") },
          ]}>
            <form onSubmit={(e) => e.preventDefault()} className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">{t("sec.newsletter")}</p>
              <div className="flex gap-2">
                <Input type="email" required placeholder={t("common.email")}
                  className="h-9 border-primary-foreground/20 bg-primary-foreground/5 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-gold" />
                <Button type="submit" size="sm" variant="gold">{t("common.subscribe")}</Button>
              </div>
            </form>
          </FooterCol>
        </div>

        <div className="mt-14 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/50">
          © {year} Univers Maison · {t("foot.rights")}
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, children }: { title: string; links: { to: string; label: string }[]; children?: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-gold">{title}</h4>
      <ul className="space-y-2.5 text-sm text-primary-foreground/70">
        {links.map(l => (
          <li key={l.to}><Link to={l.to} className="transition-luxe hover:text-gold">{l.label}</Link></li>
        ))}
      </ul>
      {children}
    </div>
  );
}
