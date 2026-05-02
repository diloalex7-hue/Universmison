import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Mail, MailOpen, Eye, Inbox } from "lucide-react";

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMessages(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const unreadCount = messages.filter(m => !m.is_read).length;

  const openMessage = async (msg: any) => {
    setSelected(msg);
    if (!msg.is_read) {
      await supabase.from("contact_messages").update({ is_read: true }).eq("id", msg.id);
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    toast.success("Message supprimé");
    setSelected(null);
    load();
  };

  const markAllRead = async () => {
    await supabase.from("contact_messages").update({ is_read: true }).eq("is_read", false);
    toast.success("Tous les messages marqués comme lus");
    load();
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", { dateStyle: "medium" }) + " à " + date.toLocaleTimeString("fr-FR", { timeStyle: "short" });
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif tracking-tight flex items-center gap-3">
            <Inbox className="h-7 w-7 text-gold" /> Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            {messages.length} message(s){unreadCount > 0 && <span className="ml-2 text-gold font-semibold">· {unreadCount} non lu(s)</span>}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <MailOpen className="h-4 w-4 mr-2" /> Tout marquer comme lu
          </Button>
        )}
      </header>

      {messages.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Inbox className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Aucun message reçu pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(m => (
            <div
              key={m.id}
              onClick={() => openMessage(m)}
              className={`flex items-start gap-4 border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md ${
                m.is_read ? "bg-background" : "bg-gold/5 border-gold/20"
              }`}
            >
              <div className="shrink-0 mt-1">
                {m.is_read ? (
                  <MailOpen className="h-5 w-5 text-muted-foreground/50" />
                ) : (
                  <Mail className="h-5 w-5 text-gold" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${!m.is_read ? "text-foreground" : "text-foreground/70"}`}>{m.name}</span>
                  <span className="text-xs text-muted-foreground">· {m.email}</span>
                </div>
                <p className="text-sm text-foreground/70 line-clamp-1 mt-0.5">{m.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(m.created_at)}</p>
              </div>
              <Button
                variant="ghost" size="icon"
                className="text-destructive shrink-0"
                onClick={(e) => { e.stopPropagation(); remove(m.id); }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-gold" /> Message de {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Nom</span>
                  <p className="font-medium mt-0.5">{selected.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs uppercase tracking-wider">Email</span>
                  <p className="font-medium mt-0.5">
                    <a href={`mailto:${selected.email}`} className="text-gold hover:underline">{selected.email}</a>
                  </p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-xs uppercase tracking-wider">Date</span>
                <p className="text-sm mt-0.5">{formatDate(selected.created_at)}</p>
              </div>
              <div className="border-t pt-4">
                <span className="text-muted-foreground text-xs uppercase tracking-wider">Message</span>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/85">{selected.message}</p>
              </div>
              <div className="flex justify-between pt-4 border-t">
                <Button variant="destructive" size="sm" onClick={() => remove(selected.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                </Button>
                <a href={`mailto:${selected.email}?subject=Re: Votre message — Univers Maison`}>
                  <Button variant="gold" size="sm">
                    <Mail className="h-4 w-4 mr-1" /> Répondre par email
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
