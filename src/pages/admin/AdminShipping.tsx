import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Truck, Save, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara",
  "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt",
  "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa",
  "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam",
  "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

export default function AdminShipping() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("site_settings").select("id, shipping_rates").limit(1);
        if (error) {
          if (error.code === 'PGRST204') {
            toast.error("La colonne 'shipping_rates' n'existe pas encore dans Supabase.");
          }
          console.error(error);
        } else if (data && data[0]) {
          setSettingsId(data[0].id);
          // @ts-ignore
          setRates(data[0].shipping_rates || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (wilaya: string, price: string) => {
    const val = parseInt(price) || 0;
    setRates(prev => ({ ...prev, [wilaya]: val }));
  };

  const save = async () => {
    if (!settingsId) {
      toast.error("Veuillez d'abord sauvegarder les paramètres du site dans la page Paramètres.");
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase.from("site_settings")
        // @ts-ignore
        .update({ shipping_rates: rates })
        .eq("id", settingsId);
        
      if (error) {
        toast.error(error.message);
        console.error(error);
      } else {
        toast.success("Tarifs de livraison mis à jour !");
      }
    } catch (err: any) {
      toast.error("Erreur lors de la sauvegarde.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const applyDefault = () => {
    const defaultRates: Record<string, number> = {};
    WILAYAS.forEach(w => defaultRates[w] = 700);
    setRates(defaultRates);
  };

  if (loading) return <div className="p-8 text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin h-5 w-5" /> Chargement…</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-tight flex items-center gap-3">
            <Truck className="h-7 w-7 text-gold" /> Tarifs de Livraison
          </h1>
          <p className="text-muted-foreground mt-1">Configurez le prix de livraison pour chaque Wilaya.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={applyDefault}>
            700 DA pour tous
          </Button>
          <Button onClick={save} disabled={saving} className="bg-gold hover:bg-gold/90 text-gold-foreground">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </header>

      <Alert className="mb-8 bg-blue-500/10 text-blue-700 border-blue-500/20">
        <Info className="h-4 w-4" color="currentColor" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Les clients bénéficieront d'une livraison gratuite si le total de leur commande dépasse 15 000 DA (règle globale).
        </AlertDescription>
      </Alert>

      <div className="bg-background border rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {WILAYAS.map((wilaya, i) => (
            <div key={wilaya} className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex gap-1">
                <span className="text-muted-foreground font-mono w-5">{i + 1}.</span> {wilaya}
              </label>
              <div className="relative">
                <Input 
                  type="number" 
                  min="0"
                  step="50"
                  value={rates[wilaya] === undefined ? "" : rates[wilaya]} 
                  onChange={(e) => handleChange(wilaya, e.target.value)} 
                  placeholder="700"
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">DA</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
