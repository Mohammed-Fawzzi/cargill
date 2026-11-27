import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toMillis } from "@/lib/time";
import {
  asString,
  parseLocalized,
  readLocalized,
} from "@/services/cms/parse";

const DEFAULT_COLUMNS = [
  { id: "crop", name: { ar: "المحصول", en: "Crop" } },
  { id: "disease", name: { ar: "المرض", en: "Disease" } },
  { id: "dose", name: { ar: "الجرعة", en: "Dose" } },
  { id: "phi", name: { ar: "PHI", en: "PHI" } },
];

function uniqueImageList(values = []) {
  const seen = new Set();
  const out = [];
  values.forEach((value) => {
    const src = asString(value);
    if (!src || seen.has(src)) return;
    seen.add(src);
    out.push(src);
  });
  return out;
}

function parseSection(item) {
  if (!item || typeof item !== "object") return null;
  const id = asString(item.id);
  const name = parseLocalized(item.name);
  if (!id || !name.ar) return null;
  const subcategories = Array.isArray(item.subcategories)
    ? item.subcategories
        .map((sub) => {
          const subId = asString(sub?.id);
          const subName = parseLocalized(sub?.name);
          if (!subId || !subName.ar) return null;
          return {
            id: subId,
            name: subName,
            order: typeof sub.order === "number" ? sub.order : 0,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.order - b.order)
    : [];

  return {
    id,
    name,
    order: typeof item.order === "number" ? item.order : 0,
    imageUrl: asString(item.imageUrl || item.image),
    videoUrl: asString(item.videoUrl || item.heroVideoUrl),
    subcategories,
    _sort: typeof item.order === "number" ? item.order : 0,
  };
}

export function isSeedsCategory(category) {
  const ar = String(category?.name?.ar || "").toLowerCase();
  const en = String(category?.name?.en || "").toLowerCase();
  const id = String(category?.id || "").toLowerCase();
  return (
    ar.includes("بذور") ||
    ar.includes("بذر") ||
    en.includes("seed") ||
    id.includes("seed") ||
    id.includes("بذور")
  );
}

async function readCategoriesPage() {
  const snap = await getDoc(doc(db, "product_categories", "page"));
  const data = snap.exists() ? snap.data() || {} : {};
  const sections = Array.isArray(data.sections)
    ? data.sections.map(parseSection).filter(Boolean)
    : [];
  return {
    imageUrl: asString(data.imageUrl),
    videoUrl: asString(data.videoUrl || data.heroVideoUrl),
    sections,
  };
}

async function readAllSections() {
  const page = await readCategoriesPage();
  return page.sections;
}

export async function getCategoriesPage() {
  const page = await readCategoriesPage();
  return {
    imageUrl: page.imageUrl,
    videoUrl: page.videoUrl,
  };
}

export async function getCategories() {
  const sections = await readAllSections();
  return sections
    .filter((category) => !isSeedsCategory(category))
    .sort((a, b) => a.order - b.order);
}

async function getSeedSectionIds() {
  const sections = await readAllSections();
  return new Set(
    sections.filter((category) => isSeedsCategory(category)).map((item) => item.id),
  );
}

function parseFeature(item, index) {
  if (!item || typeof item !== "object") return null;
  const text = item.text
    ? parseLocalized(item.text)
    : {
        ar: asString(item.textAr),
        en: asString(item.textEn),
      };
  return {
    id: asString(item.id) || `feature-${index}`,
    text,
  };
}

function parseIngredient(item, index) {
  if (!item || typeof item !== "object") return null;
  return {
    id: asString(item.id) || `ing-${index}`,
    name: parseLocalized(item.name),
    percentage: asString(item.percentage),
  };
}

function parseColumn(item, index) {
  if (!item || typeof item !== "object") return null;
  const id = asString(item.id) || `col-${index}`;
  return { id, name: parseLocalized(item.name) };
}

function parseUse(item, index, columns) {
  if (!item || typeof item !== "object") return null;
  const cells = {};
  const source = item.cells && typeof item.cells === "object" ? item.cells : {};
  for (const column of columns) {
    cells[column.id] =
      source[column.id] !== undefined
        ? parseLocalized(source[column.id])
        : parseLocalized(item[column.id]);
  }
  return {
    id: asString(item.id) || `use-${index}`,
    cells,
  };
}

export function mapProduct(id, data = {}) {
  const columns = Array.isArray(data.agriculturalColumns)
    ? data.agriculturalColumns.map(parseColumn).filter(Boolean)
    : [];
  const agriculturalColumns = columns.length > 0 ? columns : DEFAULT_COLUMNS;
  const createdAt = toMillis(data.createdAt);

  const gallery = Array.isArray(data.images)
    ? data.images.map((item) => asString(item)).filter(Boolean)
    : [];
  const imageUrl = asString(data.imageUrl) || gallery[0] || "";
  const images = uniqueImageList([imageUrl, ...gallery]);

  return {
    id,
    name: readLocalized(data, "name"),
    sectionId: asString(data.sectionId),
    subcategoryId: asString(data.subcategoryId),
    imageUrl,
    videoUrl: asString(data.videoUrl || data.heroVideoUrl),
    images,
    registrationNumber:
      asString(data.registrationNumber) ||
      asString(data.ministryRegistration) ||
      asString(data.agricultureRegistrationNumber),
    originCountry: readLocalized(data, "originCountry"),
    packaging: readLocalized(data, "packaging"),
    packageSize: readLocalized(data, "packageSize"),
    datasheetUrl:
      asString(data.datasheetUrl) ||
      asString(data.pdfUrl) ||
      asString(data.technicalSheetUrl),
    activeIngredients: Array.isArray(data.activeIngredients)
      ? data.activeIngredients.map(parseIngredient).filter(Boolean)
      : [],
    overview: readLocalized(data, "overview"),
    details: readLocalized(data, "details"),
    features: Array.isArray(data.features)
      ? data.features.map(parseFeature).filter(Boolean)
      : [],
    agriculturalColumns,
    agriculturalUses: Array.isArray(data.agriculturalUses)
      ? data.agriculturalUses
          .map((row, index) => parseUse(row, index, agriculturalColumns))
          .filter(Boolean)
      : [],
    createdAt,
    updatedAt: toMillis(data.updatedAt),
    _sort: createdAt,
  };
}

export async function getProducts() {
  const [snap, seedIds] = await Promise.all([
    getDocs(collection(db, "products")),
    getSeedSectionIds(),
  ]);
  return snap.docs
    .map((item) => mapProduct(item.id, item.data()))
    .filter((item) => !seedIds.has(item.sectionId))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getProductsBySection(sectionId) {
  const seedIds = await getSeedSectionIds();
  if (seedIds.has(sectionId) || isSeedsCategory({ id: sectionId })) {
    return [];
  }
  const snap = await getDocs(
    query(collection(db, "products"), where("sectionId", "==", sectionId)),
  );
  return snap.docs.map((item) => mapProduct(item.id, item.data()));
}

export async function getProductsBySubcategory(subcategoryId) {
  const [snap, seedIds] = await Promise.all([
    getDocs(
      query(
        collection(db, "products"),
        where("subcategoryId", "==", subcategoryId),
      ),
    ),
    getSeedSectionIds(),
  ]);
  return snap.docs
    .map((item) => mapProduct(item.id, item.data()))
    .filter((item) => !seedIds.has(item.sectionId));
}

export async function getProduct(productId) {
  const [snap, seedIds] = await Promise.all([
    getDoc(doc(db, "products", productId)),
    getSeedSectionIds(),
  ]);
  if (!snap.exists()) return null;
  const product = mapProduct(snap.id, snap.data());
  if (seedIds.has(product.sectionId)) return null;
  return product;
}
