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
  "nav.profile": { fr: "Profil", ar: "حسابي", en: "Profile" },

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
  "filter.sort.all": { fr: "Tout", ar: "الكل", en: "All" },
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
  "acc.info": { fr: "Informations personnelles", ar: "المعلومات الشخصية", en: "Personal information" },
  "acc.address": { fr: "Adresse", ar: "العنوان", en: "Address" },
  "acc.password_new": { fr: "Nouveau mot de passe", ar: "كلمة مرور جديدة", en: "New password" },
  "acc.password_hint": { fr: "(laisser vide pour ne pas changer)", ar: "(اتركه فارغاً لعدم التغيير)", en: "(leave blank to keep current)" },
  "acc.save_success": { fr: "Profil mis à jour avec succès", ar: "تم تحديث الملف الشخصي بنجاح", en: "Profile updated successfully" },
  "acc.email_confirm": { fr: "Vérifiez votre nouvel e-mail pour confirmer le changement", ar: "يرجى التحقق من بريدك الإلكتروني الجديد لتأكيد التغيير", en: "Please check your new email to confirm the change" },
  "acc.help": { fr: "Aide & Information", ar: "المساعدة والمعلومات", en: "Help & Information" },

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
  "brand.name": { fr: "Univers Maison", ar: "يونيفرس ميزون", en: "Univers Maison" },
  "brand.tagline": { fr: "Art de la table", ar: "فن الطاولة", en: "Tableware" },
  "common.saving": { fr: "Enregistrement...", ar: "جاري الحفظ...", en: "Saving..." },
  "common.fullname": { fr: "Nom complet", ar: "الاسم الكامل", en: "Full name" },
  "common.phone": { fr: "Téléphone", ar: "رقم الهاتف", en: "Phone number" },

  // Additional Premium translations
  "common.discover": { fr: "Découvrir", ar: "اكتشف المجموعة", en: "Discover" },
  "common.summary": { fr: "Récapitulatif", ar: "ملخص الطلب", en: "Summary" },
  "common.free": { fr: "Offert", ar: "مجاني", en: "Free" },
  "common.articles": { fr: "articles", ar: "منتجات", en: "items" },
  "common.article": { fr: "article", ar: "منتج", en: "item" },
  "common.noorders": { fr: "Aucune commande pour le moment.", ar: "لا توجد طلبات حالياً.", en: "No orders yet." },
  "common.nofavorites": { fr: "Aucun favori pour le moment.", ar: "لا توجد منتجات في المفضلة حالياً.", en: "No favorites yet." },
  "common.signin_required": { fr: "Se connecter", ar: "تسجيل الدخول", en: "Sign in" },
  
  "order.thanks": { fr: "Merci pour votre commande !", ar: "شكراً لطلبك!", en: "Thank you for your order!" },
  "order.received": { fr: "Nous avons bien reçu votre commande. Vous recevrez un appel de confirmation dans les plus brefs délais.", ar: "لقد تلقينا طلبك بنجاح. ستتلقى مكالمة تأكيد في أقرب وقت ممكن.", en: "We have received your order. You will receive a confirmation call shortly." },
  "order.number": { fr: "Numéro", ar: "رقم الطلب", en: "Order number" },
  "order.view": { fr: "Voir mes commandes", ar: "عرض طلباتي", en: "View my orders" },
  "order.continue": { fr: "Continuer mes achats", ar: "متابعة التسوق", en: "Continue shopping" },
  "order.track": { fr: "Suivi de commande", ar: "تتبع الطلب", en: "Order tracking" },
  "order.track.desc": { fr: "Saisissez votre numéro de commande (ex: UM-20260502-abc123)", ar: "أدخل رقم طلبك (مثال: UM-20260502-abc123)", en: "Enter your order number (e.g. UM-20260502-abc123)" },
  "order.notfound": { fr: "Commande introuvable. Vérifiez votre numéro.", ar: "الطلب غير موجود. يرجى التحقق من الرقم.", en: "Order not found. Please verify the number." },
  "order.your": { fr: "Votre commande", ar: "طلبك", en: "Your order" },
  
  "checkout.secure": { fr: "Paiement sécurisé · Vos données sont protégées", ar: "دفع آمن 100٪ · بياناتك محمية ومشفرة", en: "Secure Payment · Your data is protected" },
  "checkout.cod.desc": { fr: "Payez en espèces à la réception du colis", ar: "الدفع نقداً عند استلام الطرد الخاص بك", en: "Pay cash upon delivery of the package" },
  "checkout.cart_empty": { fr: "Votre panier est vide.", ar: "سلتك فارغة تماماً.", en: "Your cart is empty." },
  "checkout.login_required": { fr: "Connectez-vous pour finaliser", ar: "يرجى تسجيل الدخول لإتمام الطلب", en: "Please sign in to complete checkout" },
  "checkout.view_shop": { fr: "Voir la boutique", ar: "الذهاب للمتجر", en: "View shop" },
  "checkout.validation_error": { fr: "Vérifiez les informations saisies", ar: "يرجى التحقق من المعلومات المدخلة", en: "Please check the information entered" },
  
  "cat.explore": { fr: "Explorer nos univers", ar: "اكتشف تشكيلاتنا الفريدة", en: "Explore our collections" },
  "cat.desc": { fr: "Chaque catégorie est une invitation à composer une table inoubliable.", ar: "كل فئة هي دعوة لتنسيق طاولة طعام لا تُنسى.", en: "Each category is an invitation to arrange an unforgettable dining table." },
  
  "about.story": { fr: "Notre histoire", ar: "قصة يونيفرس ميزون", en: "Our story" },
  "about.refs": { fr: "Références", ar: "منتج مميز", en: "Products" },
  "about.delivery": { fr: "Livraison", ar: "شحن سريع", en: "Fast delivery" },
  "about.reviews": { fr: "Avis clients", ar: "آراء عملاء ممتنين", en: "Happy reviews" },
  "about.default_title": { fr: "L'art de la table, en héritage.", ar: "فن ضيافة المائدة، كإرث متجدد.", en: "Table art, as a legacy." },
  "about.default_content": { fr: "Née à Alger en 2024, Univers Maison est une maison dédiée à l'élégance discrète des objets du quotidien.", ar: "تأسست يونيفرس ميزون في الجزائر عام 2024، وهي دار متخصصة في الأناقة البسيطة والراقية للمستلزمات اليومية.", en: "Born in Algiers in 2024, Univers Maison is dedicated to the discreet elegance of everyday objects." },

  "review.give": { fr: "Donner mon avis", ar: "تقييم تجربتي", en: "Give review" },
  "review.sent": { fr: "Avis envoyé", ar: "تم إرسال التقييم", en: "Review sent" },
  "review.your": { fr: "Votre avis", ar: "رأيك يهمنا", en: "Your feedback" },
  "review.rate": { fr: "Comment évaluez-vous votre expérience ?", ar: "كيف تقيم تجربتك معنا بشكل عام؟", en: "How do you rate your overall experience?" },
  "review.comment": { fr: "Votre commentaire", ar: "تعليقك وملاحظاتك", en: "Your comment" },
  "review.send": { fr: "Envoyer mon avis", ar: "إرسال التقييم", en: "Submit review" },
  "review.pending": { fr: "Votre avis sera publié après validation par notre équipe.", ar: "سيتم نشر تقييمك بعد مراجعته من قبل فريقنا.", en: "Your review will be published after team approval." },
  
  "status.pending": { fr: "En attente", ar: "قيد الانتظار", en: "Pending" },
  "status.confirmed": { fr: "Confirmée", ar: "مؤكدة", en: "Confirmed" },
  "status.shipped": { fr: "Expédiée", ar: "تم الشحن", en: "Shipped" },
  "status.delivered": { fr: "Livrée", ar: "تم التوصيل", en: "Delivered" },
  "status.cancelled": { fr: "Annulée", ar: "ملغاة", en: "Cancelled" },

  "benefits.title": { fr: "Une expérience pensée dans le détail", ar: "تجربة تسوق مصممة بأدق التفاصيل", en: "A shopping experience crafted in detail" },
  "testimonials.title": { fr: "Ce qu'en disent nos clients", ar: "ماذا يقول عملاؤنا عن خدماتنا", en: "What our clients say about us" },
  "cart.added": { fr: "Ajouté au panier", ar: "تمت إضافة المنتج إلى السلة", en: "Added to cart" },
  "fav.login_required": { fr: "Connectez-vous pour ajouter aux favoris", ar: "سجل الدخول لإضافة المنتج للمفضلة", en: "Sign in to add to favorites" },
  "common.error": { fr: "Une erreur est survenue", ar: "حدث خطأ ما، يرجى المحاولة لاحقاً", en: "An error has occurred" },
  
  // Hero dynamic stats fallback translation
  "hero.stat1_label": { fr: "références", ar: "منتج فاخر", en: "exclusive designs" },
  "hero.stat2_label": { fr: "note moyenne", ar: "متوسط التقييم", en: "average rating" },
  "hero.stat3_label": { fr: "livraison", ar: "شحن سريع", en: "express shipping" },

  // Static Pages Translations
  "static.faq.title": { fr: "Questions fréquentes", ar: "الأسئلة الشائعة", en: "Frequently Asked Questions" },
  "static.faq.content": { fr: "Q: Quels sont les délais de livraison ?\nR: Nous livrons partout en Algérie sous 48 à 72h ouvrées.", ar: "Q: ما هي مدة التوصيل؟\nR: نقوم بالتوصيل لجميع الولايات الجزائرية خلال 48 إلى 72 ساعة عمل.", en: "Q: What are the shipping times?\nR: We deliver all over Algeria within 48 to 72 business hours." },
  "static.shipping.title": { fr: "Politique de livraison", ar: "سياسة الشحن والتوصيل", en: "Shipping Policy" },
  "static.shipping.content": { fr: "Nous expédions dans toute l'Algérie sous 48 à 72h ouvrées.", ar: "نقوم بشحن الطلبات إلى كافة الولايات الجزائرية في غضون 48 إلى 72 ساعة عمل.", en: "We ship across Algeria within 48 to 72 business hours." },
  "static.returns.title": { fr: "Politique de retour", ar: "سياسة الإرجاع والاستبدال", en: "Return Policy" },
  "static.returns.content": { fr: "Vous disposez de 14 jours après réception pour retourner un article.", ar: "يمكنكم إرجاع أو استبدال المنتجات خلال 14 يوماً من تاريخ استلام الطلب.", en: "You have 14 days after receiving your item to request a return." },
  "static.privacy.title": { fr: "Politique de confidentialité", ar: "سياسة الخصوصية", en: "Privacy Policy" },
  "static.privacy.content": { fr: "Univers Maison s'engage à protéger vos données personnelles.", ar: "يلتزم يونيفرس ميزون بحماية بياناتكم الشخصية وخصوصيتكم.", en: "Univers Maison is committed to protecting your personal data." },
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
    try {
      const saved = typeof window !== "undefined" ? (localStorage.getItem("um_lang") as Lang | null) : null;
      return saved && ["fr", "ar", "en"].includes(saved) ? saved : "fr";
    } catch {
      return "fr";
    }
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = dir;
    try {
      localStorage.setItem("um_lang", lang);
    } catch {}
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
