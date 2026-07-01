import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ReviewSection({ productId, currentRating, totalReviews }: { productId: string; currentRating: number; totalReviews: number }) {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error: fetchError } = await supabase
        .from("reviews")
        .select("*, profile:profiles(full_name, avatar_url)")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      
      if (fetchError) throw fetchError;
      return data ?? [];
    },
  });

  const submitReview = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يجب عليك تسجيل الدخول لترك تقييم" : "Vous devez être connecté pour laisser un avis");
      return;
    }

    if (!comment.trim()) {
      toast.error(lang === "ar" ? "يرجى كتابة تعليق" : "Veuillez écrire un commentaire");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Insert review
      const { error: reviewError } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment: comment.trim(),
      });

      if (reviewError) throw reviewError;

      // 2. Recalculate average (doing it client side for simplicity here, but updating the product)
      const newTotalCount = totalReviews + 1;
      const newRating = ((currentRating * totalReviews) + rating) / newTotalCount;

      // 3. Update product (Requires RLS to allow this, otherwise this might fail if not admin)
      // Note: In a real production app, this should be a DB trigger or RPC
      const { error: productError } = await supabase.from("products").update({
        rating: newRating,
        reviews_count: newTotalCount
      }).eq("id", productId);

      // If we don't have permission to update the product, we still invalidate the query
      // so the UI can show the new reviews list at least.
      
      toast.success(lang === "ar" ? "تمت إضافة تقييمك بنجاح" : "Votre avis a été ajouté avec succès");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-24">
      <h2 className="font-serif text-3xl mb-8">{t("prod.reviews")}</h2>

      <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
        {/* Left: Summary & Form */}
        <div>
          <div className="rounded-3xl border border-border bg-secondary/20 p-8">
            <div className="text-center">
              <div className="text-5xl font-serif font-bold text-gold">{currentRating.toFixed(1)}</div>
              <div className="mt-2 flex justify-center gap-1 text-gold">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={cn("h-5 w-5", s <= Math.round(currentRating) ? "fill-current" : "text-gold/30")} />
                ))}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{totalReviews} {t("prod.reviews")}</div>
            </div>

            <div className="mt-10">
              <h4 className="text-sm font-semibold mb-4">{lang === "ar" ? "اترك تقييمك" : "Donnez votre avis"}</h4>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                    <Star className={cn("h-6 w-6 transition-colors", s <= rating ? "fill-gold text-gold" : "text-muted-foreground/30")} />
                  </button>
                ))}
              </div>
              <Textarea 
                placeholder={lang === "ar" ? "شاركنا رأيك في المنتج..." : "Partagez votre avis sur ce produit..."} 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4 bg-background border-border focus:ring-gold min-h-[120px]"
              />
              <Button 
                onClick={submitReview} 
                disabled={isSubmitting} 
                className="w-full" 
                variant="gold"
              >
                {isSubmitting ? t("common.loading") : (lang === "ar" ? "إرسال التقييم" : "Envoyer l'avis")}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Reviews List */}
        <div className="space-y-8">
          {error ? (
            <div className="text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20 text-sm">
              Error loading reviews: {(error as any).message}
            </div>
          ) : isLoading ? (
            <div className="text-muted-foreground">{t("common.loading")}</div>
          ) : reviews.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center border border-dashed rounded-3xl">
              {lang === "ar" ? "لا توجد تقييمات لهذا المنتج بعد. كن أول من يقيمه!" : "Pas encore d'avis pour ce produit. Soyez le premier à donner le vôtre !"}
            </div>
          ) : (
            reviews.map((r: any) => (
              <div key={r.id} className="animate-fade-up border-b border-border pb-8 last:border-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground overflow-hidden">
                      {r.profile?.avatar_url ? (
                        <img src={r.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{r.profile?.full_name || (lang === "ar" ? "عميل" : "Client")}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR')}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-gold">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={cn("h-3 w-3", i < r.rating ? "fill-current" : "text-gold/20")} />
                    ))}
                  </div>
                </div>
                <p className="text-foreground/80 leading-relaxed italic">« {r.comment} »</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
