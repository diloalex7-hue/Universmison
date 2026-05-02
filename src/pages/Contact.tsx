import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Star, MessageSquareQuote, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(10).max(1000),
});

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  // Review form
  const [reviewForm, setReviewForm] = useState({ name: "", city: "", text: "", rating: 5 });
  const [sendingReview, setSendingReview] = useState(false);

  useEffect(() => { document.title = "Contact — Univers Maison"; }, []);

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").limit(1);
      return data?.[0] ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });

  const phone = settings?.phone || "+213 (0) 555 00 00 00";
  const email2 = settings?.email || "hello@universmaison.dz";
  const address = settings?.address || "Alger Centre, Algérie";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error("Vérifiez les informations"); return; }

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    });
    setSending(false);

    if (error) {
      toast.error("Erreur lors de l'envoi. Réessayez.");
      console.error(error);
      return;
    }
    toast.success("Message envoyé ! Nous vous répondrons sous 24h.");
    setForm({ name: "", email: "", message: "" });
  };

  const onReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) {
      toast.error("Veuillez remplir votre nom et votre avis");
      return;
    }
    if (reviewForm.text.trim().length < 10) {
      toast.error("Votre avis doit contenir au moins 10 caractères");
      return;
    }

    setSendingReview(true);
    const { error } = await supabase.from("testimonials").insert({
      name: reviewForm.name.trim(),
      city: reviewForm.city.trim() || null,
      text: reviewForm.text.trim(),
      rating: reviewForm.rating,
      is_visible: false, // Admin must approve
      display_order: 99,
    });
    setSendingReview(false);

    if (error) {
      toast.error("Erreur lors de l'envoi. Réessayez.");
      console.error(error);
      return;
    }
    toast.success("Merci pour votre avis ! Il sera publié après validation.");
    setReviewForm({ name: "", city: "", text: "", rating: 5 });
  };

  return (
    <div className="container-luxe py-16">
      {/* Contact Section */}
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">Contact</p>
          <h1 className="mt-3 font-serif text-5xl">Parlons-nous.</h1>
          <p className="mt-4 text-foreground/70">
            Notre équipe vous répond sous 24h ouvrées, en français, arabe ou anglais.
          </p>
          <div className="mt-8 space-y-4">
            <ContactItem icon={MapPin} title="Showroom">{address}</ContactItem>
            <ContactItem icon={Phone} title="Téléphone">{phone}</ContactItem>
            <ContactItem icon={Mail} title="Email">{email2}</ContactItem>
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
          <Button type="submit" variant="luxe" size="lg" className="w-full" disabled={sending}>
            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {sending ? "Envoi en cours..." : "Envoyer"}
          </Button>
        </form>
      </div>

      {/* Review Section */}
      <div className="mt-24">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">Votre avis compte</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">Partagez votre expérience</h2>
          <p className="mt-3 text-foreground/60 max-w-lg mx-auto">
            Votre témoignage nous aide à nous améliorer et inspire d'autres clients.
          </p>
        </div>

        <form onSubmit={onReviewSubmit} className="mx-auto max-w-xl space-y-5 rounded-2xl border border-border bg-card p-8 shadow-elegant">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Votre nom *</Label>
              <Input value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} required placeholder="Ex: Amina B." className="mt-1.5 h-11" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Ville</Label>
              <Input value={reviewForm.city} onChange={e => setReviewForm({...reviewForm, city: e.target.value})} placeholder="Ex: Alger" className="mt-1.5 h-11" />
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Votre note</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewForm({...reviewForm, rating: n})}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star className={`h-7 w-7 ${n <= reviewForm.rating ? "fill-gold text-gold" : "text-muted-foreground/40"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Votre avis *</Label>
            <Textarea
              value={reviewForm.text}
              onChange={e => setReviewForm({...reviewForm, text: e.target.value})}
              required
              rows={4}
              placeholder="Partagez votre expérience avec Univers Maison..."
              className="mt-1.5"
            />
          </div>

          <Button type="submit" variant="luxe" size="lg" className="w-full" disabled={sendingReview}>
            {sendingReview ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquareQuote className="h-4 w-4 mr-2" />}
            {sendingReview ? "Envoi en cours..." : "Envoyer mon avis"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Votre avis sera publié après validation par notre équipe.</p>
        </form>
      </div>
    </div>
  );
}

function ContactItem({ icon: Icon, title, children }: any) {
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
