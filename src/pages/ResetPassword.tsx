import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, KeyRound } from "lucide-react";

const resetSchema = z.object({
  email: z.string().trim().email(),
});

export default function ResetPassword() {
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { document.title = `${t("auth.forgot")} — Univers Maison`; }, [lang]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = resetSchema.safeParse({ email });
    if (!parsed.success) {
      toast.error(t("checkout.validation_error") || "Erreur de validation");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSubmitted(true);
      toast.success(t("review.sent"));
    }
  };

  return (
    <div className="container-luxe min-h-[80vh] py-12">
      <div className="mx-auto max-w-md">
        <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("auth.back_login")}
        </Link>
        
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
            <KeyRound className="h-5 w-5 text-gold" />
          </div>
          <h1 className="mt-4 font-serif text-3xl">{t("auth.forgot")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.reset_desc")}
          </p>
        </div>

        <div className="mt-8">
          {submitted ? (
            <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-900/20">
              <h3 className="mb-2 font-medium text-green-800 dark:text-green-300">{t("auth.check_email")}</h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                {t("auth.reset_sent")} <strong>{email}</strong>, {t("auth.reset_sent_2")}
              </p>
              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={() => setSubmitted(false)}
              >
                {t("auth.try_another")}
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.email")}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@exemple.com"
                  className="mt-1.5 h-11"
                  dir="ltr"
                />
              </div>
              <Button type="submit" disabled={loading} variant="luxe" size="lg" className="w-full">
                {loading ? t("auth.sending") : t("auth.send_link")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
