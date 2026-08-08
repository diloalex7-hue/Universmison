import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Ticket, Copy, Loader2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyCoupon = {
  code: "",
  discount_type: "percentage" as const,
  discount_value: 10,
  min_order_amount: 0,
  max_uses: null as number | null,
  expires_at: "",
  is_active: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCoupon);

  const load = async () => {
    const { data } = await supabase
      .from("coupons" as any)
      .select("*")
      .order("created_at", { ascending: false });
    setCoupons((data as any as Coupon[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyCoupon);
    setDialog(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_amount: c.min_order_amount ?? 0,
      max_uses: c.max_uses,
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "",
      is_active: c.is_active,
    });
    setDialog(true);
  };

  const save = async () => {
    if (!form.code.trim()) { toast.error("Le code est obligatoire"); return; }
    if (form.discount_value <= 0) { toast.error("La valeur de remise doit être positive"); return; }
    setSaving(true);

    const payload: any = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_order_amount: form.min_order_amount || 0,
      max_uses: form.max_uses || null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    };

    let error;
    if (editingId) {
      const res = await supabase.from("coupons" as any).update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("coupons" as any).insert(payload);
      error = res.error;
    }

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Coupon mis à jour" : "Coupon créé");
    setDialog(false);
    load();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Supprimer ce coupon ?")) return;
    await supabase.from("coupons" as any).delete().eq("id", id);
    toast.success("Coupon supprimé");
    load();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copié !");
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-6xl">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif tracking-tight flex items-center gap-2">
            <Ticket className="h-7 w-7 text-amber-500" /> Coupons de réduction
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{coupons.length} coupons</p>
        </div>
        <Button onClick={openNew} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> Nouveau coupon
        </Button>
      </header>

      {coupons.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
          <Ticket className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Aucun coupon créé</p>
          <Button onClick={openNew} variant="outline" className="mt-4">Créer votre premier coupon</Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Code</th>
                <th className="p-3 font-medium">Réduction</th>
                <th className="p-3 font-medium">Min. commande</th>
                <th className="p-3 font-medium">Utilisation</th>
                <th className="p-3 font-medium">Expire</th>
                <th className="p-3 font-medium">Statut</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                const isMaxed = c.max_uses !== null && c.current_uses >= c.max_uses;
                const active = c.is_active && !isExpired && !isMaxed;

                return (
                  <tr key={c.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <code className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-bold text-xs tracking-wider">
                          {c.code}
                        </code>
                        <button onClick={() => copyCode(c.code)} className="text-muted-foreground hover:text-foreground">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3 font-medium">
                      {c.discount_type === "percentage" ? `${c.discount_value}%` : `${c.discount_value} DA`}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {c.min_order_amount > 0 ? `${c.min_order_amount} DA` : "—"}
                    </td>
                    <td className="p-3">
                      <span className="text-muted-foreground">
                        {c.current_uses}{c.max_uses !== null ? ` / ${c.max_uses}` : " / ∞"}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString("fr-FR") : "Jamais"}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        active ? "bg-emerald-500/10 text-emerald-700" :
                        isExpired ? "bg-red-500/10 text-red-700" :
                        "bg-neutral-500/10 text-neutral-500"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : isExpired ? "bg-red-500" : "bg-neutral-400"}`} />
                        {active ? "Actif" : isExpired ? "Expiré" : isMaxed ? "Épuisé" : "Inactif"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCoupon(c.id)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Ticket className="h-5 w-5 text-amber-500" />
              {editingId ? "Modifier le coupon" : "Nouveau coupon"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Code promo</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="EX: SUMMER25"
                className="mt-1 font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Type</Label>
                <Select value={form.discount_type} onValueChange={(v: any) => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed">Montant fixe (DA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Valeur</Label>
                <Input
                  type="number"
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                  className="mt-1"
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Min. commande (DA)</Label>
                <Input
                  type="number"
                  value={form.min_order_amount}
                  onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
                  className="mt-1"
                  min={0}
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Max utilisations</Label>
                <Input
                  type="number"
                  value={form.max_uses ?? ""}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })}
                  className="mt-1"
                  placeholder="Illimité"
                  min={0}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date d'expiration</Label>
              <Input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Label className="text-sm">Coupon actif</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialog(false)}>Annuler</Button>
              <Button onClick={save} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editingId ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
