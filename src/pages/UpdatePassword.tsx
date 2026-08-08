import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export default function UpdatePassword() {
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const updateSchema = z.object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

  useEffect(() => { document.title = `${t("auth.new_password")} — Univers Maison`; }, [lang]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session invalide ou expirée. Veuillez refaire une demande.");
        navigate("/reset-password");
      }
    };
    checkSession();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = updateSchema.safeParse({ password, confirmPassword });
    
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("acc.save_success"));
      navigate("/account");
    }
  };

  return (
    <div className="container-luxe min-h-[80vh] py-12">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
            <KeyRound className="h-5 w-5 text-gold" />
          </div>
          <h1 className="mt-4 font-serif text-3xl">{t("auth.new_password")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.new_password_desc")}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.new_password")}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1.5 h-11"
              dir="ltr"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.confirm_password")}</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1.5 h-11"
              dir="ltr"
            />
          </div>
          <Button type="submit" disabled={loading} variant="luxe" size="lg" className="w-full">
            {loading ? t("auth.updating") : t("auth.update_password")}
          </Button>
        </form>
      </div>
    </div>
  );
}
