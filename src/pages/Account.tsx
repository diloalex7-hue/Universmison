import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Package, Heart, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Account() {
  const { t } = useI18n();
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = "Mon compte — Univers Maison"; }, []);
  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name || "", phone: profile.phone || "" });
  }, [profile]);

  if (!user) return null;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profil mis à jour");
  };

  return (
    <div className="container-luxe py-10">
      <h1 className="font-serif text-4xl md:text-5xl">{t("acc.profile")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-1">
          <SidebarLink to="/account" icon={User}>{t("acc.profile")}</SidebarLink>
          <SidebarLink to="/account/orders" icon={Package}>{t("acc.orders")}</SidebarLink>
          <SidebarLink to="/account/favorites" icon={Heart}>{t("acc.favorites")}</SidebarLink>
          <button onClick={signOut} className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-luxe hover:bg-secondary hover:text-destructive">
            <LogOut className="h-4 w-4" /> {t("nav.signout")}
          </button>
        </aside>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <h2 className="font-serif text-2xl">Informations personnelles</h2>
          <form onSubmit={onSave} className="mt-6 grid max-w-lg gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nom complet</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1.5 h-11" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Téléphone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 h-11" />
            </div>
            <Button type="submit" variant="luxe" disabled={saving} className="w-fit">{saving ? "..." : t("acc.save")}</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon: Icon, children }: any) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-luxe hover:bg-secondary">
      <Icon className="h-4 w-4 text-gold-deep" /> {children}
    </Link>
  );
}
