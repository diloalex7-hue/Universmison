import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "fr" | "ar" | "en";

type Dict = Record<string, Record<Lang, string>>;

const dict: Dict = {
  // Nav
  "nav.home": { fr: "Accueil", ar: "الرئيسية", en: "Home" },
  "nav.shop": { fr: "Boutique", ar: "المتجر", en: "Shop" },
  "nav.categories": { fr: "Catégories", ar: "الفئات", en: "Categories" },
  "nav.about": { fr: "À propos", ar: "من نحن", en: "About" },
  "nav.contact": { fr: "Contact", ar: "تواصل", en: "Contact" },
  "nav.account": { fr: "Compte", ar: "حسابي", en: "Account" },
  "nav.favorites": { fr: "Favoris", ar: "المفضلة", en: "Favorites" },
  "nav.cart": { fr: "Panier", ar: "السلة", en: "Cart" },
  "nav.search": { fr: "Rechercher un produit…", ar: "ابحث عن منتج…", en: "Search products…" },
  "nav.signin": { fr: "Connexion", ar: "تسجيل الدخول", en: "Sign in" },
  "nav.signout": { fr: "Déconnexion", ar: "تسجيل الخروج", en: "Sign out" },

  // Hero
  "hero.eyebrow": { fr: "Nouvelle collection", ar: "مجموعة جديدة", en: "New collection" },
  "hero.title": { fr: "L'art de recevoir, redéfini.", ar: "فن الاستقبال، بأناقة جديدة.", en: "The art of hosting, redefined." },
  "hero.subtitle": { fr: "Vaisselle, verrerie et objets d'exception, sélectionnés pour les tables qui racontent une histoire.", ar: "أوانٍ وأكواب وقطع فاخرة، مختارة للطاولات التي تحكي قصة.", en: "Curated tableware and glassware for tables that tell a story." },
  "hero.cta": { fr: "Découvrir la collection", ar: "اكتشف المجموعة", en: "Shop the collection" },
  "hero.cta2": { fr: "Voir les catégories", ar: "تصفح الفئات", en: "Browse categories" },

  // Sections
  "sec.categories": { fr: "Univers", ar: "العوالم", en: "Universes" },
  "sec.featured": { fr: "Coups de cœur", ar: "اختياراتنا", en: "Featured" },
  "sec.bestsellers": { fr: "Best-sellers", ar: "الأكثر مبيعاً", en: "Bestsellers" },
  "sec.new": { fr: "Nouveautés", ar: "الجديد", en: "New arrivals" },
  "sec.testimonials": { fr: "Ce qu'ils en disent", ar: "آراء العملاء", en: "What they say" },
  "sec.benefits": { fr: "Notre engagement", ar: "التزامنا", en: "Our commitment" },
  "sec.newsletter": { fr: "Restez inspiré", ar: "ابقَ على اطلاع", en: "Stay inspired" },
  "sec.newsletter.desc": { fr: "Recevez en avant-première nos nouvelles collections et offres privées.", ar: "كن أول من يكتشف مجموعاتنا الجديدة وعروضنا الحصرية.", en: "Be first to discover new collections and private offers." },
  "sec.viewall": { fr: "Tout voir", ar: "عرض الكل", en: "View all" },

  // Benefits
  "ben.shipping": { fr: "Livraison rapide", ar: "شحن سريع", en: "Fast shipping" },
  "ben.shipping.d": { fr: "48-72h dans toute l'Algérie", ar: "خلال 48-72 ساعة في كل الجزائر", en: "48-72h across Algeria" },
  "ben.payment": { fr: "Paiement sécurisé", ar: "دفع آمن", en: "Secure payment" },
  "ben.payment.d": { fr: "Paiement à la livraison disponible", ar: "الدفع عند الاستلام متاح", en: "Cash on delivery available" },
  "ben.return": { fr: "Retour facile", ar: "إرجاع سهل", en: "Easy returns" },
  "ben.return.d": { fr: "14 jours pour changer d'avis", ar: "14 يوماً لتغيير رأيك", en: "14 days to change your mind" },
  "ben.support": { fr: "Service dédié", ar: "خدمة مخصصة", en: "Dedicated support" },
  "ben.support.d": { fr: "Conseillers disponibles 7j/7", ar: "مستشارون متاحون 7 أيام", en: "Advisors available 7 days a week" },

  // Product
  "prod.add": { fr: "Ajouter au panier", ar: "أضف إلى السلة", en: "Add to cart" },
  "prod.buy": { fr: "Acheter maintenant", ar: "اشترِ الآن", en: "Buy now" },
  "prod.quickview": { fr: "Aperçu rapide", ar: "عرض سريع", en: "Quick view" },
  "prod.outofstock": { fr: "Rupture", ar: "نفد المخزون", en: "Out of stock" },
  "prod.instock": { fr: "En stock", ar: "متوفر", en: "In stock" },
  "prod.color": { fr: "Couleur", ar: "اللون", en: "Color" },
  "prod.qty": { fr: "Quantité", ar: "الكمية", en: "Quantity" },
  "prod.related": { fr: "Vous aimerez aussi", ar: "قد يعجبك أيضاً", en: "You may also like" },
  "prod.reviews": { fr: "avis", ar: "تقييم", en: "reviews" },
  "prod.description": { fr: "Description", ar: "الوصف", en: "Description" },

  // Filters
  "filter.title": { fr: "Filtres", ar: "التصفية", en: "Filters" },
  "filter.price": { fr: "Prix", ar: "السعر", en: "Price" },
  "filter.sort": { fr: "Trier", ar: "ترتيب", en: "Sort" },
  "filter.sort.new": { fr: "Nouveautés", ar: "الأحدث", en: "Newest" },
  "filter.sort.priceasc": { fr: "Prix croissant", ar: "السعر تصاعدي", en: "Price ↑" },
  "filter.sort.pricedesc": { fr: "Prix décroissant", ar: "السعر تنازلي", en: "Price ↓" },
  "filter.sort.rating": { fr: "Mieux notés", ar: "الأعلى تقييماً", en: "Top rated" },

  // Cart
  "cart.empty": { fr: "Votre panier est vide", ar: "سلتك فارغة", en: "Your cart is empty" },
  "cart.empty.cta": { fr: "Commencer mes achats", ar: "ابدأ التسوق", en: "Start shopping" },
  "cart.subtotal": { fr: "Sous-total", ar: "المجموع الفرعي", en: "Subtotal" },
  "cart.shipping": { fr: "Livraison", ar: "الشحن", en: "Shipping" },
  "cart.total": { fr: "Total", ar: "الإجمالي", en: "Total" },
  "cart.checkout": { fr: "Passer la commande", ar: "إكمال الطلب", en: "Checkout" },
  "cart.continue": { fr: "Continuer mes achats", ar: "متابعة التسوق", en: "Continue shopping" },

  // Checkout
  "checkout.title": { fr: "Finaliser la commande", ar: "إتمام الطلب", en: "Checkout" },
  "checkout.contact": { fr: "Coordonnées", ar: "بيانات الاتصال", en: "Contact" },
  "checkout.shipping": { fr: "Adresse de livraison", ar: "عنوان الشحن", en: "Shipping address" },
  "checkout.payment": { fr: "Paiement", ar: "الدفع", en: "Payment" },
  "checkout.fullname": { fr: "Nom complet", ar: "الاسم الكامل", en: "Full name" },
  "checkout.phone": { fr: "Téléphone", ar: "الهاتف", en: "Phone" },
  "checkout.email": { fr: "Email", ar: "البريد الإلكتروني", en: "Email" },
  "checkout.address": { fr: "Adresse", ar: "العنوان", en: "Address" },
  "checkout.city": { fr: "Ville", ar: "المدينة", en: "City" },
  "checkout.wilaya": { fr: "Wilaya", ar: "الولاية", en: "Wilaya" },
  "checkout.notes": { fr: "Notes (optionnel)", ar: "ملاحظات (اختياري)", en: "Notes (optional)" },
  "checkout.cod": { fr: "Paiement à la livraison", ar: "الدفع عند الاستلام", en: "Cash on delivery" },
  "checkout.place": { fr: "Confirmer la commande", ar: "تأكيد الطلب", en: "Place order" },

  // Auth
  "auth.signin": { fr: "Se connecter", ar: "تسجيل الدخول", en: "Sign in" },
  "auth.signup": { fr: "Créer un compte", ar: "إنشاء حساب", en: "Create account" },
  "auth.email": { fr: "Email", ar: "البريد الإلكتروني", en: "Email" },
  "auth.password": { fr: "Mot de passe", ar: "كلمة المرور", en: "Password" },
  "auth.fullname": { fr: "Nom complet", ar: "الاسم الكامل", en: "Full name" },
  "auth.google": { fr: "Continuer avec Google", ar: "المتابعة مع Google", en: "Continue with Google" },
  "auth.have": { fr: "Déjà un compte ?", ar: "لديك حساب بالفعل؟", en: "Already have an account?" },
  "auth.no": { fr: "Pas encore de compte ?", ar: "ليس لديك حساب؟", en: "Don't have an account?" },

  // Account
  "acc.profile": { fr: "Profil", ar: "الملف الشخصي", en: "Profile" },
  "acc.orders": { fr: "Mes commandes", ar: "طلباتي", en: "My orders" },
  "acc.favorites": { fr: "Favoris", ar: "المفضلة", en: "Favorites" },
  "acc.save": { fr: "Enregistrer", ar: "حفظ", en: "Save" },

  // Footer
  "foot.about": { fr: "À propos", ar: "من نحن", en: "About" },
  "foot.help": { fr: "Aide", ar: "المساعدة", en: "Help" },
  "foot.legal": { fr: "Légal", ar: "قانوني", en: "Legal" },
  "foot.contact": { fr: "Contact", ar: "تواصل", en: "Contact" },
  "foot.shipping": { fr: "Politique de livraison", ar: "سياسة الشحن", en: "Shipping policy" },
  "foot.return": { fr: "Politique de retour", ar: "سياسة الإرجاع", en: "Return policy" },
  "foot.privacy": { fr: "Confidentialité", ar: "الخصوصية", en: "Privacy" },
  "foot.faq": { fr: "FAQ", ar: "الأسئلة الشائعة", en: "FAQ" },
  "foot.tagline": { fr: "L'art de la table, élevé au rang d'expérience.", ar: "فن الطاولة، تجربة لا تُنسى.", en: "Tableware, elevated into an experience." },
  "foot.rights": { fr: "Tous droits réservés", ar: "جميع الحقوق محفوظة", en: "All rights reserved" },

  // Generic
  "common.from": { fr: "Dès", ar: "ابتداءً من", en: "From" },
  "common.products": { fr: "produits", ar: "منتج", en: "products" },
  "common.loading": { fr: "Chargement…", ar: "جارٍ التحميل…", en: "Loading…" },
  "common.subscribe": { fr: "S'inscrire", ar: "اشتراك", en: "Subscribe" },
  "common.email": { fr: "Votre email", ar: "بريدك الإلكتروني", en: "Your email" },
  "common.notfound": { fr: "Page introuvable", ar: "الصفحة غير موجودة", en: "Page not found" },
  "common.backhome": { fr: "Retour à l'accueil", ar: "العودة إلى الرئيسية", en: "Back home" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("um_lang") as Lang | null) : null;
    return saved && ["fr", "ar", "en"].includes(saved) ? saved : "fr";
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = dir;
    localStorage.setItem("um_lang", lang);
  }, [lang, dir]);

  const setLang = (l: Lang) => setLangState(l);
  const t = (key: string) => dict[key]?.[lang] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t, dir }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function localized<T extends Record<string, any>>(obj: T, field: string, lang: Lang): string {
  return obj[`${field}_${lang}`] ?? obj[`${field}_fr`] ?? "";
}
