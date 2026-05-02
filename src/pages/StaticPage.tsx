import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const content: Record<string, { title: string; type?: "faq" | "text"; body: any }> = {
  faq: {
    title: "Questions fréquentes",
    type: "faq",
    body: [
      { q: "Quels sont les délais de livraison ?", a: "Nous livrons partout en Algérie sous 48 à 72h ouvrées." },
      { q: "Puis-je payer à la livraison ?", a: "Oui, le paiement à la livraison (cash on delivery) est notre méthode principale." },
      { q: "Comment retourner un article ?", a: "Vous disposez de 14 jours après réception pour retourner un article non utilisé dans son emballage d'origine." },
      { q: "Mes paquets sont-ils assurés ?", a: "Oui, chaque colis est emballé avec soin et assuré contre la casse durant le transport." },
      { q: "Proposez-vous des cartes cadeaux ?", a: "Bientôt — inscrivez-vous à la newsletter pour être informé." },
    ],
  },
  shipping: {
    title: "Politique de livraison",
    body: `Nous expédions dans toute l'Algérie sous 48 à 72h ouvrées.

• Livraison à domicile : 700 DA (offerte dès 15 000 DA d'achats)
• Livraison en bureau : 500 DA
• Suivi par SMS à chaque étape de votre commande
• Emballage premium offert sur tous les produits fragiles`,
  },
  returns: {
    title: "Politique de retour",
    body: `Vous disposez de 14 jours après réception pour nous retourner un article qui ne vous conviendrait pas.

Conditions :
• Article non utilisé, dans son emballage d'origine
• Présentation du bon de commande
• Frais de retour à votre charge (sauf défaut produit)
• Remboursement sous 7 jours après réception du retour`,
  },
  privacy: {
    title: "Politique de confidentialité",
    body: `Univers Maison s'engage à protéger vos données personnelles.

• Vos informations ne sont jamais revendues
• Cryptage SSL sur toutes les pages
• Vous pouvez demander la suppression de votre compte à tout moment
• Conformité RGPD`,
  },
};

export default function StaticPage({ page }: { page: keyof typeof content }) {
  const c = content[page];
  useEffect(() => { document.title = `${c.title} — Univers Maison`; }, [c.title]);

  return (
    <div className="container-luxe py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-5xl">{c.title}</h1>
        <div className="my-8 gold-divider" />

        {c.type === "faq" ? (
          <Accordion type="single" collapsible className="space-y-2">
            {(c.body as { q: string; a: string }[]).map((it, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border border-border bg-card px-5">
                <AccordionTrigger className="font-serif text-lg">{it.q}</AccordionTrigger>
                <AccordionContent className="text-foreground/75">{it.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="whitespace-pre-line leading-relaxed text-foreground/80">{c.body as string}</div>
        )}
      </div>
    </div>
  );
}
