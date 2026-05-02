import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, FileText, Save, Loader2 } from "lucide-react";

export default function AdminPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<any>({ title: "", content: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("pages").select("*").order("slug");
    setPages(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({ title: p.title, content: p.content });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase.from("pages").update({ title: form.title, content: form.content }).eq("id", editingId);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Page mise à jour !");
    setDialogOpen(false);
    load();
  };

  const slugLabels: Record<string, string> = {
    about: "📖 À propos",
    faq: "❓ Questions fréquentes",
    shipping: "🚚 Politique de livraison",
    returns: "↩️ Politique de retour",
    privacy: "🔒 Politique de confidentialité",
  };

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-serif tracking-tight flex items-center gap-3">
          <FileText className="h-7 w-7 text-gold" /> Pages du site
        </h1>
        <p className="text-muted-foreground mt-1">Modifiez le contenu des pages statiques</p>
      </header>

      <div className="space-y-3">
        {pages.map((p) => (
          <div key={p.id} className="flex items-center justify-between border rounded-2xl p-5 bg-background hover:shadow-md transition-shadow">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{slugLabels[p.slug] || p.slug}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{p.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Dernière modification : {new Date(p.updated_at).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
              </p>
            </div>
            <Button variant="outline" onClick={() => openEdit(p)}>
              <Pencil className="h-4 w-4 mr-2" /> Modifier
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Modifier la page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Titre de la page</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>Contenu</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Pour la page FAQ, utilisez le format : <code className="bg-muted px-1 rounded">Q: Question</code> sur une ligne, puis <code className="bg-muted px-1 rounded">R: Réponse</code> sur la ligne suivante.
              </p>
              <Textarea
                value={form.content}
                onChange={e => setForm({...form, content: e.target.value})}
                rows={18}
                className="mt-1 font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={save} disabled={saving} className="bg-gold hover:bg-gold/90 text-gold-foreground">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
