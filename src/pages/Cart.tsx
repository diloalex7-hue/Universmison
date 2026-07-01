import { Link } from "react-router-dom";
import { useI18n, localized } from "@/lib/i18n";
import { useCart, formatDA } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { t, lang } = useI18n();
  const { items, subtotal, update, remove } = useCart();
  const shipping = subtotal > 0 ? (subtotal > 15000 ? 0 : 700) : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container-luxe py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-serif text-3xl">{t("cart.empty")}</h1>
        <Button asChild variant="luxe" size="lg" className="mt-8"><Link to="/shop">{t("cart.empty.cta")}</Link></Button>
      </div>
    );
  }

  return (
    <div className="container-luxe py-10">
      <h1 className="font-serif text-4xl md:text-5xl">{t("nav.cart")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} {items.length > 1 ? t("common.articles") : t("common.article")}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((item: any) => {
            const name = localized(item.product, "name", lang);
            return (
              <div key={item.id} className="flex gap-4 rounded-2xl bg-card p-4 shadow-soft">
                <Link to={`/product/${item.product.slug}`} className="block h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  <img src={item.product.images?.[0]} alt={name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/product/${item.product.slug}`} className="font-serif text-lg leading-tight hover:text-gold-deep">{name}</Link>
                      {item.selected_color && <div className="mt-1 text-xs text-muted-foreground">{t("prod.color")}: {item.selected_color}</div>}
                    </div>
                    <button onClick={() => remove.mutate(item.id)} className="text-muted-foreground transition-luxe hover:text-destructive" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button onClick={() => update.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })} className="flex h-8 w-8 items-center justify-center hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => update.mutate({ id: item.id, quantity: item.quantity + 1 })} className="flex h-8 w-8 items-center justify-center hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                    </div>
                    <div className="font-serif text-lg font-semibold">{formatDA(Number(item.product.price) * item.quantity)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <h2 className="font-serif text-2xl">{t("common.summary")}</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">{t("cart.subtotal")}</dt><dd className="font-medium">{formatDA(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">{t("cart.shipping")}</dt><dd className="font-medium">{shipping === 0 ? t("common.free") : formatDA(shipping)}</dd></div>
            <div className="gold-divider !h-px" />
            <div className="flex items-baseline justify-between pt-1">
              <dt className="font-serif text-lg">{t("cart.total")}</dt>
              <dd className="font-serif text-2xl font-semibold">{formatDA(total)}</dd>
            </div>
          </dl>
          <Button asChild variant="luxe" size="lg" className="mt-6 w-full"><Link to="/checkout">{t("cart.checkout")} <ArrowRight className="h-4 w-4" /></Link></Button>
          <Button asChild variant="ghost" size="sm" className="mt-2 w-full"><Link to="/shop">{t("cart.continue")}</Link></Button>
        </aside>
      </div>
    </div>
  );
}
