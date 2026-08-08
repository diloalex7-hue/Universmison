import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useI18n, localized } from "@/lib/i18n";
import { useCart, formatDA } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getWilayas, getCommunesByWilayaId } from "algeria-locations";
import { ShieldCheck, Lock, Ticket, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  address: z.string().trim().min(5).max(255),
  city: z.string().trim().min(2).max(100),
  wilaya: z.string().trim().min(2).max(100),
  notes: z.string().max(500).optional(),
});

export default function Checkout() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", address: "", city: "", wilaya: "", notes: "" });
  const [wilayaId, setWilayaId] = useState<number | null>(null);
  const [shippingRates, setShippingRates] = useState<Record<string, number>>({});

  const wilayas = getWilayas();
  const communes = wilayaId ? getCommunesByWilayaId(wilayaId) : [];

  // Coupon state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string; discount_type: "percentage" | "fixed"; discount_value: number; id: string;
  } | null>(null);

  useEffect(() => { document.title = "Checkout — Univers Maison"; }, []);
  useEffect(() => {
    if (user?.email) setForm(f => ({ ...f, email: user.email! }));
  }, [user]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("shipping_rates").limit(1).maybeSingle();
      if (data && data.shipping_rates) {
        setShippingRates(data.shipping_rates as Record<string, number>);
      }
    })();
  }, []);

  if (items.length === 0) {
    return <div className="container-luxe py-20 text-center">
      <p>{t("checkout.cart_empty")}</p>
      <Button asChild variant="luxe" className="mt-4"><Link to="/shop">{t("checkout.view_shop")}</Link></Button>
    </div>;
  }
  if (!user) {
    return <div className="container-luxe py-20 text-center">
      <h2 className="font-serif text-2xl">{t("checkout.login_required")}</h2>
      <Button asChild variant="luxe" className="mt-4"><Link to="/auth?redirect=/checkout">{t("auth.signin")}</Link></Button>
    </div>;
  }

  const getShippingCost = () => {
    if (subtotal > 15000) return 0; // Free shipping threshold
    if (form.wilaya && shippingRates[form.wilaya] !== undefined) {
      return shippingRates[form.wilaya];
    }
    return 700; // Default fallback
  };
  
  const shipping = getShippingCost();
  const discount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? Math.round(subtotal * appliedCoupon.discount_value / 100)
      : appliedCoupon.discount_value
    : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const applyCoupon = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    const { data, error } = await supabase
      .from("coupons" as any)
      .select("*")
      .eq("code", promoCode.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    setPromoLoading(false);
    const coupon = data as any;
    if (error || !coupon) { toast.error(t("coupon.invalid")); return; }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) { toast.error(t("coupon.invalid")); return; }
    if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) { toast.error(t("coupon.invalid")); return; }
    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      toast.error(`${t("coupon.min_order")} ${formatDA(coupon.min_order_amount)}`);
      return;
    }
    setAppliedCoupon({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      id: coupon.id,
    });
    toast.success(t("coupon.applied"));
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setPromoCode("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(t("checkout.validation_error")); return; }
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user.id,
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        address: parsed.data.address,
        city: parsed.data.city,
        wilaya: parsed.data.wilaya,
        notes: parsed.data.notes || null,
        subtotal,
        shipping,
        total,
        coupon_code: appliedCoupon?.code || null,
        discount: discount || 0,
      }).select().single();
      if (error) throw error;

      // Increment coupon usage
      if (appliedCoupon) {
        await supabase.from("coupons" as any).update({ current_uses: (await supabase.from("coupons" as any).select("current_uses").eq("id", appliedCoupon.id).single()).data?.current_uses + 1 }).eq("id", appliedCoupon.id);
      }

      const orderItems = items.map((i: any) => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: localized(i.product, "name", lang),
        product_image: i.product.images?.[0] ?? null,
        unit_price: i.product.price,
        quantity: i.quantity,
        selected_color: i.selected_color,
      }));
      await supabase.from("order_items").insert(orderItems);
      await clear.mutateAsync();
      navigate(`/order/confirm/${order.id}`);
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-luxe py-10">
      <h1 className="font-serif text-4xl md:text-5xl">{t("checkout.title")}</h1>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> {t("checkout.secure")}</div>

      <form onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <Section title={t("checkout.contact")}>
            <Field label={t("checkout.fullname")}><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></Field>
            <Field label={t("checkout.phone")}><Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></Field>
            <Field label={t("checkout.email")} className="md:col-span-2"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </Section>

          <Section title={t("checkout.shipping")}>
            <Field label={t("checkout.address")} className="md:col-span-2"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></Field>
            <Field label={t("checkout.wilaya")}>
              <Select 
                value={wilayaId?.toString()} 
                onValueChange={(val) => {
                  const id = parseInt(val, 10);
                  const w = wilayas.find(x => x.id === id);
                  setWilayaId(id);
                  setForm({ ...form, wilaya: w ? w.name : "", city: "" });
                }}
              >
                <SelectTrigger className="w-full bg-secondary/20">
                  <SelectValue placeholder="Sélectionner une wilaya" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {wilayas.map(w => (
                    <SelectItem key={w.id} value={w.id.toString()}>
                      {w.code} - {lang === 'ar' ? w.name_ar : w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("checkout.city")}>
              <Select 
                value={form.city} 
                onValueChange={(val) => setForm({ ...form, city: val })}
                disabled={!wilayaId}
              >
                <SelectTrigger className="w-full bg-secondary/20">
                  <SelectValue placeholder="Sélectionner une commune" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {communes.map(c => (
                    <SelectItem key={c.id} value={c.name}>
                      {lang === 'ar' ? c.name_ar : c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("checkout.notes")} className="md:col-span-2"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></Field>
          </Section>

          <Section title={t("checkout.payment")}>
            <label className="md:col-span-2 flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-gold bg-gold/5 p-4">
              <input type="radio" defaultChecked className="accent-gold" />
              <div><div className="font-medium">{t("checkout.cod")}</div><div className="text-xs text-muted-foreground">{t("checkout.cod.desc")}</div></div>
            </label>

            {/* Promo Code */}
            <div className="md:col-span-2 mt-2">
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                <Ticket className="inline h-3.5 w-3.5 mr-1" />{t("coupon.code")}
              </Label>
              {appliedCoupon ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5">
                  <Ticket className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">{appliedCoupon.code}</span>
                    <span className="text-xs text-emerald-600 ml-2">
                      −{appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : formatDA(appliedCoupon.discount_value)}
                    </span>
                  </div>
                  <button type="button" onClick={removeCoupon} className="text-emerald-600 hover:text-red-500 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="EX: SUMMER25"
                    className="font-mono uppercase"
                  />
                  <Button type="button" variant="outline" onClick={applyCoupon} disabled={promoLoading || !promoCode.trim()}>
                    {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("coupon.apply")}
                  </Button>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-elegant lg:sticky lg:top-28">
          <h2 className="font-serif text-2xl">{t("order.your")}</h2>
          <ul className="mt-5 max-h-72 space-y-3 overflow-auto pr-1">
            {items.map((i: any) => (
              <li key={i.id} className="flex gap-3 text-sm">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <img src={i.product.images?.[0]} alt="" className="h-full w-full object-cover" />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{i.quantity}</span>
                </div>
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="line-clamp-2 leading-tight">{localized(i.product, "name", lang)}</span>
                  <span className="shrink-0 font-medium">{formatDA(Number(i.product.price) * i.quantity)}</span>
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">{t("cart.subtotal")}</dt><dd>{formatDA(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">{t("cart.shipping")}</dt><dd>{shipping === 0 ? t("common.free") : formatDA(shipping)}</dd></div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <dt className="flex items-center gap-1"><Ticket className="h-3.5 w-3.5" /> {t("coupon.discount")}</dt>
                <dd className="font-medium">−{formatDA(discount)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-3 border-t border-border">
              <dt className="font-serif text-lg">{t("cart.total")}</dt>
              <dd className="font-serif text-2xl font-semibold">{formatDA(total)}</dd>
            </div>
          </dl>
          <Button type="submit" disabled={submitting} variant="luxe" size="lg" className="mt-6 w-full">
            {submitting ? "..." : t("checkout.place")}
          </Button>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-gold-deep" /> Données chiffrées · Aucune CB stockée
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h3 className="font-serif text-xl">{title}</h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}
function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
