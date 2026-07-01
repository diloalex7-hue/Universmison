import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, Package, Heart, LogOut, Info, HelpCircle, 
  Phone, Truck, RotateCcw, Mail, MapPin, Lock 
} from "lucide-react";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

export default function Account() {
  const { t } = useI18n();
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    full_name: "", 
    phone: "", 
    email: "", 
    address: "",
    password: "" 
  });
  const [saving, setSaving] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => { document.title = "Mon compte — Univers Maison"; }, []);
  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  useEffect(() => {
    if (profile) {
      setForm(prev => ({ 
        ...prev,
        full_name: profile.full_name || "", 
        phone: profile.phone || "",
        email: user?.email || "",
        address: (profile as any).address || ""
      }));
    }
  }, [profile, user]);

  if (!user) return null;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          full_name: form.full_name, 
          phone: form.phone,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      const updateData: any = {};
      if (form.email !== user.email) updateData.email = form.email;
      if (form.password) updateData.password = form.password;

      if (Object.keys(updateData).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updateData);
        if (authError) throw authError;
        if (updateData.email) toast.info("Vérifiez votre nouvel e-mail pour confirmer le changement");
      }

      toast.success("Profil mis à jour avec succès");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-luxe py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl">{t("acc.profile")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-1">
          <div className="rounded-2xl border border-border bg-card p-2 shadow-sm">
            <SidebarLink to="/account" icon={User} active>{t("acc.profile")}</SidebarLink>
            <SidebarLink to="/account/orders" icon={Package}>{t("acc.orders")}</SidebarLink>
            <SidebarLink to="/account/favorites" icon={Heart}>{t("acc.favorites")}</SidebarLink>
          </div>
          
          {isNative && (
            <div className="mt-6 space-y-1 rounded-2xl border border-border bg-card p-2 shadow-sm">
              <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{t("acc.help")}</p>
              <SidebarLink to="/about" icon={Info}>{t("nav.about") || "À propos"}</SidebarLink>
              <SidebarLink to="/contact" icon={Phone}>{t("nav.contact") || "Contact"}</SidebarLink>
              <SidebarLink to="/faq" icon={HelpCircle}>FAQ</SidebarLink>
              <SidebarLink to="/shipping" icon={Truck}>{t("foot.shipping")}</SidebarLink>
              <SidebarLink to="/returns" icon={RotateCcw}>{t("foot.return")}</SidebarLink>
            </div>
          )}

          <button onClick={signOut} className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-luxe hover:bg-destructive/5">
            <LogOut className="h-4 w-4" /> {t("nav.signout")}
          </button>
        </aside>

        <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="border-b border-border bg-secondary/30 px-6 py-4">
            <h2 className="font-serif text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-gold" />
              {t("acc.info")}
            </h2>
          </div>
          
          <form onSubmit={onSave} className="p-6 md:p-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground ml-1">{t("common.fullname")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={form.full_name} 
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })} 
                    className="pl-10 h-12 bg-secondary/20 border-border/50 focus:border-gold" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground ml-1">{t("common.phone")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                    className="pl-10 h-12 bg-secondary/20 border-border/50 focus:border-gold" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground ml-1">{t("auth.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email"
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    className="pl-10 h-12 bg-secondary/20 border-border/50 focus:border-gold" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground ml-1">{t("acc.address")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={form.address} 
                    onChange={(e) => setForm({ ...form, address: e.target.value })} 
                    className="pl-10 h-12 bg-secondary/20 border-border/50 focus:border-gold" 
                    placeholder={t("acc.address")}
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground ml-1">{t("acc.password_new")} <span className="normal-case opacity-60">{t("acc.password_hint")}</span></Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password"
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                    className="pl-10 h-12 bg-secondary/20 border-border/50 focus:border-gold" 
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex pt-4">
              <Button type="submit" variant="luxe" size="xl" disabled={saving} className="w-full md:w-fit min-w-[200px]">
                {saving ? t("common.saving") : t("acc.save")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon: Icon, children, active }: any) {
  return (
    <Link to={to} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
      active ? "bg-gold/10 text-gold-deep" : "text-foreground/70 hover:bg-secondary"
    }`}>
      <Icon className={`h-4 w-4 ${active ? "text-gold-deep" : "text-muted-foreground"}`} /> 
      {children}
    </Link>
  );
}
