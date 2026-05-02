import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(10).max(1000),
});

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  useEffect(() => { document.title = "Contact — Univers Maison"; }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error("Vérifiez les informations"); return; }
    toast.success("Message envoyé. Nous vous répondrons sous 24h.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="container-luxe py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">Contact</p>
          <h1 className="mt-3 font-serif text-5xl">Parlons-nous.</h1>
          <p className="mt-4 text-foreground/70">
            Notre équipe vous répond sous 24h ouvrées, en français, arabe ou anglais.
          </p>
          <div className="mt-8 space-y-4">
            <Item icon={MapPin} title="Showroom">Alger Centre, Algérie</Item>
            <Item icon={Phone} title="Téléphone">+213 (0) 555 00 00 00</Item>
            <Item icon={Mail} title="Email">hello@universmaison.dz</Item>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-elegant">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nom</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1.5 h-11" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-1.5 h-11" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Message</Label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} className="mt-1.5" />
          </div>
          <Button type="submit" variant="luxe" size="lg" className="w-full">Envoyer</Button>
        </form>
      </div>
    </div>
  );
}

function Item({ icon: Icon, title, children }: any) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-gold"><Icon className="h-4 w-4 text-gold-foreground" /></div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="font-medium">{children}</div>
      </div>
    </div>
  );
}
