import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseHomepageSection, resolveSelection } from "@/services/cms/parse";
import { getArticles } from "@/services/cms/articles";
import { getCompanyContact } from "@/services/cms/contact";
import { getEvents } from "@/services/cms/events";
import { getCategories, getProducts } from "@/services/cms/products";

export const HOMEPAGE_IDS = [
  "hero",
  "featured_products",
  "company_cta",
  "product_categories",
  "articles",
  "events",
  "contact",
  "footer",
];

export async function getHomepage() {
  const layoutSnap = await getDoc(doc(db, "homepage", "layout"));
  const layoutSections = Array.isArray(layoutSnap.data()?.sections)
    ? layoutSnap
        .data()
        .sections.filter(
          (row) => typeof row?.id === "string" && HOMEPAGE_IDS.includes(row.id),
        )
        .map((row, index) => ({
          id: row.id,
          visible: row.visible !== false,
          order: typeof row.order === "number" ? row.order : index,
        }))
    : HOMEPAGE_IDS.map((id, order) => ({ id, visible: true, order }));

  const snaps = await getDocs(collection(db, "homepage"));
  const byId = new Map(
    snaps.docs.map((item) => [item.id, parseHomepageSection(item.id, item.data())]),
  );

  return layoutSections
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      ...item,
      data: byId.get(item.id) ?? parseHomepageSection(item.id),
    }));
}

export async function getFooterSection() {
  const snap = await getDoc(doc(db, "homepage", "footer"));
  if (!snap.exists()) return parseHomepageSection("footer");
  return parseHomepageSection(snap.id, snap.data());
}

export async function loadHomePage() {
  const [home, products, articles, events, categories, contact] =
    await Promise.all([
      getHomepage(),
      getProducts(),
      getArticles(),
      getEvents(),
      getCategories(),
      getCompanyContact(),
    ]);

  return home.map((section) => {
    const selectedIds = section.data?.selectedIds ?? [];
    const limit = typeof section.data?.limit === "number" ? section.data.limit : 0;

    if (section.id === "featured_products") {
      return { ...section, items: resolveSelection(products, selectedIds, limit), contact };
    }
    if (section.id === "articles") {
      return { ...section, items: resolveSelection(articles, selectedIds, limit), contact };
    }
    if (section.id === "events") {
      return { ...section, items: resolveSelection(events, selectedIds, limit), contact };
    }
    if (section.id === "product_categories") {
      return {
        ...section,
        items: resolveSelection(categories, selectedIds, limit),
        contact,
      };
    }
    if (section.id === "contact" || section.id === "footer") {
      return { ...section, contact };
    }
    return { ...section, contact };
  });
}
