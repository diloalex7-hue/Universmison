import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

// Fallback content in case DB hasn't been seeded
const fallback: Record<string, { title: string; content: string }> = {
  faq: { title: "Questions fréquentes", content: "Q: Quels sont les délais de livraison ?\nR: Nous livrons partout en Algérie sous 48 à 72h ouvrées." },
  shipping: { title: "Politique de livraison", content: "Nous expédions dans toute l'Algérie sous 48 à 72h ouvrées." },
  returns: { title: "Politique de retour", content: "Vous disposez de 14 jours après réception pour retourner un article." },
  privacy: { title: "Politique de confidentialité", content: "Univers Maison s'engage à protéger vos données personnelles." },
};

export default function StaticPage({ page }: { page: string }) {
  const { t } = useI18n();
  const { data: pageData } = useQuery({
    queryKey: ["page", page],
    queryFn: async () => {
      const { data } = await supabase.from("pages").select("*").eq("slug", page).limit(1);
      return data?.[0] ?? null;
    },
  });

  const defaultTitle = t(`static.${page}.title`) || fallback[page]?.title || page;
  const defaultContent = t(`static.${page}.content`) || fallback[page]?.content || "";

  const title = pageData?.title ?? defaultTitle;
  const content = pageData?.content ?? defaultContent;

  useEffect(() => { document.title = `${title} — Univers Maison`; }, [title]);

  // Parse FAQ format: lines starting with Q: and R:
  const isFaq = page === "faq";
  const faqItems = isFaq ? parseFaq(content) : [];

  return (
    <div className="container-luxe py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-5xl">{title}</h1>
        <div className="my-8 gold-divider" />

        {isFaq && faqItems.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((it, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border border-border bg-card px-5">
                <AccordionTrigger className="font-serif text-lg">{it.q}</AccordionTrigger>
                <AccordionContent className="text-foreground/75">{it.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="whitespace-pre-line leading-relaxed text-foreground/80">{content}</div>
        )}
      </div>
    </div>
  );
}

function parseFaq(content: string): { q: string; a: string }[] {
  const lines = content.split("\n");
  const items: { q: string; a: string }[] = [];
  let currentQ = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Q:") || trimmed.startsWith("Q :")) {
      currentQ = trimmed.replace(/^Q\s*:\s*/, "");
    } else if ((trimmed.startsWith("R:") || trimmed.startsWith("R :")) && currentQ) {
      items.push({ q: currentQ, a: trimmed.replace(/^R\s*:\s*/, "") });
      currentQ = "";
    }
  }
  return items;
}
