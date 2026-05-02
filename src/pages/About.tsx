import { useEffect } from "react";

export default function About() {
  useEffect(() => { document.title = "À propos — Univers Maison"; }, []);
  return (
    <div className="container-luxe py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">Notre histoire</p>
        <h1 className="mt-3 font-serif text-5xl">L'art de la table, en héritage.</h1>
        <p className="mt-8 text-lg leading-relaxed text-foreground/80">
          Née à Alger en 2024, <strong>Univers Maison</strong> est une maison dédiée à l'élégance discrète des objets du quotidien.
          Nous sélectionnons, pièce par pièce, des vaisselles, verreries et accessoires qui transforment un repas en moment d'exception.
        </p>
        <p className="mt-4 leading-relaxed text-foreground/70">
          Chaque collection est pensée pour durer : matières nobles, finitions soignées, design intemporel. Notre équipe parcourt l'Europe et l'Asie pour rapporter
          le meilleur de la porcelaine, du cristal soufflé et des métaux précieux.
        </p>
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
