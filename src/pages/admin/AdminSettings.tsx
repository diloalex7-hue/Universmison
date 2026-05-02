import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Save, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const [form, setForm] = useState<any>({
    phone: "", email: "", address: "",
    instagram_url: "", facebook_url: "", tiktok_url: "", whatsapp: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*").limit(1);
      if (data && data[0]) {
        setSettingsId(data[0].id);
        setForm({
          phone: data[0].phone || "",
          email: data[0].email || "",
          address: data[0].address || "",
          instagram_url: data[0].instagram_url || "",
          facebook_url: data[0].facebook_url || "",
          tiktok_url: data[0].tiktok_url || "",
          whatsapp: data[0].whatsapp || "",
        });
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = settingsId
      ? await supabase.from("site_settings").update(form).eq("id", settingsId)
      : await supabase.from("site_settings").insert(form);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Paramètres enregistrés !");
  };

  if (loading) return <div className="p-8 text-muted-foreground">Chargement…</div>;

  return (
    <div className="p-8 max-w-2xl">
      <header className="mb-8">
        <h1 className="text-3xl font-serif tracking-tight flex items-center gap-3">
          <Settings className="h-7 w-7 text-gold" /> Paramètres du site
        </h1>
        <p className="text-muted-foreground mt-1">Informations affichées dans le Footer et la page Contact</p>
      </header>

      <div className="space-y-6 bg-background border rounded-2xl p-6">
        <h3 className="font-semibold text-lg border-b pb-2">📞 Coordonnées</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="mt-1" /></div>
          <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1" /></div>
        </div>
        <div><Label>Adresse</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="mt-1" /></div>
        <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="+213..." className="mt-1" /></div>

        <h3 className="font-semibold text-lg border-b pb-2 pt-4">🌐 Réseaux sociaux</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Instagram URL</Label><Input value={form.instagram_url} onChange={e => setForm({...form, instagram_url: e.target.value})} placeholder="https://instagram.com/..." className="mt-1" /></div>
          <div><Label>Facebook URL</Label><Input value={form.facebook_url} onChange={e => setForm({...form, facebook_url: e.target.value})} placeholder="https://facebook.com/..." className="mt-1" /></div>
          <div><Label>TikTok URL</Label><Input value={form.tiktok_url} onChange={e => setForm({...form, tiktok_url: e.target.value})} placeholder="https://tiktok.com/@..." className="mt-1" /></div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button onClick={save} disabled={saving} className="bg-gold hover:bg-gold/90 text-gold-foreground">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
