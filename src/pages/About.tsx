import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export default function About() {
  const { t } = useI18n();
  const { data: pageData } = useQuery({
    queryKey: ["page", "about"],
    queryFn: async () => {
      const { data } = await supabase.from("pages").select("*").eq("slug", "about").limit(1);
      return data?.[0] ?? null;
    },
  });

  const title = pageData?.title ?? t("about.default_title");
  const content = pageData?.content ?? t("about.default_content");

  useEffect(() => { document.title = "À propos — Univers Maison"; }, []);

  return (
    <div className="container-luxe py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">{t("about.story")}</p>
        <h1 className="mt-3 font-serif text-5xl animate-fade-up">{title}</h1>
        <div className="mt-8 whitespace-pre-line text-lg leading-relaxed text-foreground/80 animate-fade-up [animation-delay:150ms]">
          {content}
        </div>
        <div className="my-12 gold-divider" />
        <div className="grid gap-8 sm:grid-cols-3 animate-fade-up [animation-delay:250ms]">
          {[
            { n: "120+", l: t("about.refs") },
            { n: "48 Wilayas", l: t("about.delivery") },
            { n: "4.9 / 5", l: t("about.reviews") },
          ].map(s => (
            <div key={s.l} className="text-center">
              <div className="font-serif text-4xl text-gold">{s.n}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
