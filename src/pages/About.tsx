import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function About() {
  const { data: pageData } = useQuery({
    queryKey: ["page", "about"],
    queryFn: async () => {
      const { data } = await supabase.from("pages").select("*").eq("slug", "about").limit(1);
      return data?.[0] ?? null;
    },
  });

  const title = pageData?.title ?? "L'art de la table, en héritage.";
  const content = pageData?.content ?? "Née à Alger en 2024, Univers Maison est une maison dédiée à l'élégance discrète des objets du quotidien.";

  useEffect(() => { document.title = "À propos — Univers Maison"; }, []);

  return (
    <div className="container-luxe py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">Notre histoire</p>
        <h1 className="mt-3 font-serif text-5xl">{title}</h1>
        <div className="mt-8 whitespace-pre-line text-lg leading-relaxed text-foreground/80">
          {content}
        </div>
        <div className="my-12 gold-divider" />
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { n: "120+", l: "Références" },
            { n: "48 Wilayas", l: "Livraison" },
            { n: "4.9 / 5", l: "Avis clients" },
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
