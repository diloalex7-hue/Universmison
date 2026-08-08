import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const signinSchema = z.object({ email: z.string().trim().email().max(255), password: z.string().min(6).max(100) });
const signupSchema = z.object({ full_name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(255), password: z.string().min(8).max(100) });

export default function Auth() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/account";

  useEffect(() => { document.title = "Connexion — Univers Maison"; }, []);
  useEffect(() => { if (user) navigate(redirect, { replace: true }); }, [user, navigate, redirect]);

  return (
    <div className="container-luxe min-h-[80vh] py-12">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary">
            <Lock className="h-5 w-5 text-gold" />
          </div>
          <h1 className="mt-4 font-serif text-3xl">Bienvenue chez Univers Maison</h1>
          <p className="mt-1 text-sm text-muted-foreground">Accédez à votre espace personnel</p>
        </div>

        <Tabs defaultValue="signin" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 rounded-full bg-secondary">
            <TabsTrigger value="signin" className="rounded-full">{t("auth.signin")}</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-full">{t("auth.signup")}</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-6"><SignInForm /></TabsContent>
          <TabsContent value="signup" className="mt-6"><SignUpForm /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SignInForm() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signinSchema.safeParse(form);
    if (!parsed.success) { toast.error("Email ou mot de passe invalide"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    setLoading(false);
    if (error) {
      if (error.message.includes("rate limit")) {
        toast.error("لقد قمت بمحاولات كثيرة جداً، يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Connecté");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.email")}</Label>
        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-1.5 h-11" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.password")}</Label>
          <Link to="/reset-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("auth.forgot")}</Link>
        </div>
        <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="mt-1.5 h-11" />
      </div>
      <Button type="submit" disabled={loading} variant="luxe" size="lg" className="w-full">{loading ? "..." : t("auth.signin")}</Button>
    </form>
  );
}

function SignUpForm() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) { toast.error("Vérifiez les informations (mot de passe ≥ 8 caractères)"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { full_name: parsed.data.full_name }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("rate limit")) {
        toast.error("لقد قمت بمحاولات كثيرة جداً، يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Compte créé !");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.fullname")}</Label>
        <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="mt-1.5 h-11" />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.email")}</Label>
        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-1.5 h-11" />
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.password")}</Label>
        <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="mt-1.5 h-11" minLength={8} />
        <p className="mt-1 text-xs text-muted-foreground">Minimum 8 caractères</p>
      </div>
      <Button type="submit" disabled={loading} variant="luxe" size="lg" className="w-full">{loading ? "..." : t("auth.signup")}</Button>
    </form>
  );
}
