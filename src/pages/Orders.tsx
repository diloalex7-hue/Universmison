import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatDA } from "@/lib/store";
import { Package, Star, MessageSquareQuote, Loader2, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  shipped: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusLabel: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function Orders() {
  const { user } = useAuth();
  const { t } = useI18n();
  useEffect(() => { document.title = "Mes commandes — Univers Maison"; }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  // Track which orders the user has already reviewed (stored locally)
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("reviewed_orders");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const openReview = (order: any) => {
    setReviewOrder(order);
    setReviewText("");
    setReviewRating(5);
    setReviewDialog(true);
  };

  const submitReview = async () => {
    if (!reviewText.trim() || reviewText.trim().length < 10) {
      toast.error("Votre avis doit contenir au moins 10 caractères");
      return;
    }

    setSubmitting(true);
    const userName = reviewOrder?.full_name || user?.email?.split("@")[0] || "Client";
    const city = reviewOrder?.city || "";

    const { error } = await supabase.from("testimonials").insert({
      name: userName,
      city: city,
      text: reviewText.trim(),
      rating: reviewRating,
      is_visible: false, // Admin approves
      display_order: 99,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Erreur lors de l'envoi");
      console.error(error);
      return;
    }

    // Mark as reviewed locally
    const updated = new Set(reviewedOrders);
    updated.add(reviewOrder.id);
    setReviewedOrders(updated);
    localStorage.setItem("reviewed_orders", JSON.stringify([...updated]));

    toast.success("Merci pour votre avis ! Il sera publié après validation.");
    setReviewDialog(false);
  };

  if (!user) return <div className="container-luxe py-20 text-center"><Link to="/auth" className="underline">Se connecter</Link></div>;

  return (
    <div className="container-luxe py-10">
      <h1 className="font-serif text-4xl md:text-5xl">{t("acc.orders")}</h1>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-secondary/40 p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">Aucune commande pour le moment.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o: any) => {
            const canReview = (o.status === "delivered" || o.status === "confirmed" || o.status === "shipped") && !reviewedOrders.has(o.id);
            const alreadyReviewed = reviewedOrders.has(o.id);

            return (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-serif text-lg">{o.order_number}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[o.status]}`}>
                    {statusLabel[o.status] || o.status}
                  </span>
                </div>
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {o.order_items?.map((it: any) => (
                    <div key={it.id} className="flex shrink-0 items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs">
                      <img src={it.product_image} alt="" className="h-10 w-10 rounded object-cover" />
                      <span className="max-w-[140px] truncate">{it.product_name}</span>
                      <span className="text-muted-foreground">×{it.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <div className="flex items-center gap-3">
                    {alreadyReviewed && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Avis envoyé
                      </span>
                    )}
                    {canReview && (
                      <Button variant="outline" size="sm" onClick={() => openReview(o)} className="text-xs">
                        <Star className="h-3.5 w-3.5 mr-1 text-gold" /> Donner mon avis
                      </Button>
                    )}
                    <span className="font-serif text-xl font-semibold">{formatDA(Number(o.total))}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5 text-gold" /> Votre avis
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            {reviewOrder && (
              <div className="bg-secondary/30 rounded-xl p-3 text-sm">
                <span className="text-muted-foreground">Commande :</span>{" "}
                <span className="font-medium">{reviewOrder.order_number}</span>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Comment évaluez-vous votre expérience ?</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewRating(n)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star className={`h-8 w-8 ${n <= reviewRating ? "fill-gold text-gold" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {reviewRating === 5 ? "Excellent !" : reviewRating === 4 ? "Très bien" : reviewRating === 3 ? "Correct" : reviewRating === 2 ? "Peut mieux faire" : "Décevant"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Votre commentaire</p>
              <Textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                rows={4}
                placeholder="Partagez votre expérience : qualité des produits, emballage, livraison..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setReviewDialog(false)}>Annuler</Button>
              <Button onClick={submitReview} disabled={submitting} className="bg-gold hover:bg-gold/90 text-gold-foreground">
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Star className="h-4 w-4 mr-2" />}
                {submitting ? "Envoi..." : "Envoyer mon avis"}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Votre avis sera publié après validation par notre équipe.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
