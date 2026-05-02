import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, MessageSquareQuote } from "lucide-react";

const empty = { name: "", city: "", text: "", rating: 5, is_visible: true, display_order: 0 };

export default function AdminTestimonials() {
  const [items, setItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<any>({ ...empty });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("display_order");
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditingId(null); setForm({ ...empty, display_order: items.length + 1 }); setDialogOpen(true); };
  const openEdit = (t: any) => {
    setEditingId(t.id);
    setForm({ name: t.name, city: t.city || "", text: t.text, rating: t.rating, is_visible: t.is_visible, display_order: t.display_order });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.text.trim()) return toast.error("Le nom et le texte sont obligatoires");
    const payload = { ...form };
    if (editingId) {
      const { error } = await supabase.from("testimonials").update(payload).eq("id", editingId);
      if (error) return toast.error(error.message);
      toast.success("Avis mis à jour !");
    } else {
      const { error } = await supabase.from("testimonials").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Avis ajouté !");
    }
    setDialogOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast.success("Avis supprimé");
    load();
  };

  const toggleVisible = async (id: string, current: boolean) => {
    await supabase.from("testimonials").update({ is_visible: !current }).eq("id", id);
    load();
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif tracking-tight flex items-center gap-3">
            <MessageSquareQuote className="h-7 w-7 text-gold" /> Avis clients
          </h1>
          <p className="text-muted-foreground mt-1">{items.length} avis</p>
        </div>
        <Button onClick={openNew} className="bg-gold hover:bg-gold/90 text-gold-foreground">
          <Plus className="h-4 w-4 mr-2" /> Nouvel avis
        </Button>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <MessageSquareQuote className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Aucun avis. Ajoutez des témoignages de vos clients !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="flex items-start gap-4 border rounded-2xl p-4 bg-background hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{t.name}</span>
                  {t.city && <span className="text-xs text-muted-foreground">— {t.city}</span>}
                  <div className="flex gap-0.5 ml-2">
                    {Array(t.rating).fill(0).map((_, i) => <Star key={i} className="h-3 w-3 fill-gold text-gold" />)}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 line-clamp-2">« {t.text} »</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={t.is_visible} onCheckedChange={() => toggleVisible(t.id, t.is_visible)} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editingId ? "Modifier l'avis" : "Nouvel avis"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nom du client *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Amina B." className="mt-1" /></div>
              <div><Label>Ville</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="Ex: Alger" className="mt-1" /></div>
            </div>
            <div><Label>Avis *</Label><Textarea value={form.text} onChange={e => setForm({...form, text: e.target.value})} placeholder="Le texte de l'avis..." rows={4} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Note (1-5)</Label>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm({...form, rating: n})} className="p-1">
                      <Star className={`h-6 w-6 ${n <= form.rating ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div><Label>Ordre d'affichage</Label><Input type="number" value={form.display_order} onChange={e => setForm({...form, display_order: parseInt(e.target.value) || 0})} className="mt-1" /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_visible} onCheckedChange={checked => setForm({...form, is_visible: checked})} />
              <Label>Visible sur le site</Label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={save} className="bg-gold hover:bg-gold/90 text-gold-foreground">{editingId ? "Enregistrer" : "Ajouter"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
