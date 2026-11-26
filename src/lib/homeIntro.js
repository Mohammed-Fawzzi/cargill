import { uniqueImages } from "@/lib/introMedia";

let introPlayedInSpa = false;

const CATEGORY_MATCHERS = [
  {
    id: "pesticides",
    needles: ["مبيدات", "مبيد", "pesticide", "insect", "fungic"],
  },
  {
    id: "fertilizers",
    needles: ["أسمدة", "اسمدة", "سماد", "fertiliz", "npk"],
  },
  {
    id: "growth",
    needles: ["منظمات", "نمو", "growth", "regulator", "hormone"],
  },
];

export function shouldPlayHomeIntro() {
  if (typeof window === "undefined") return false;
  if (introPlayedInSpa) return false;
  try {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function markHomeIntroSeen() {
  introPlayedInSpa = true;
}

function categoryHaystack(category) {
  return [
    category?.name?.ar,
    category?.name?.en,
    category?.id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function findCategoryImage(categoriesWithImages, matcher) {
  const found = (categoriesWithImages || []).find((category) => {
    const hay = categoryHaystack(category);
    return matcher.needles.some((needle) =>
      hay.includes(String(needle).toLowerCase()),
    );
  });
  return found?.imageUrl || "";
}

function pickFallbackSides(categoriesWithImages, usedIds, count) {
  return (categoriesWithImages || [])
    .filter((category) => category.imageUrl && !usedIds.has(category.id))
    .slice(0, count)
    .map((category) => category.imageUrl);
}

export function homepageSlideImages(source) {
  const data =
    source?.data && (Array.isArray(source.data.slides) || source.data.imageUrl)
      ? source.data
      : source || {};
  const list = [];
  const push = (src) => {
    const value = String(src || "").trim();
    if (value && !list.includes(value)) list.push(value);
  };
  (data.slides || []).forEach((slide) => push(slide?.imageUrl));
  push(data.imageUrl);
  return list;
}

function resolveCategoryCover(category, products) {
  return (
    category?.imageUrl ||
    (products || []).find(
      (product) => product.sectionId === category?.id && product.imageUrl,
    )?.imageUrl ||
    ""
  );
}

export function categoryCoverImages(categories, products) {
  const list = [];
  (categories || []).forEach((category) => {
    const cover = resolveCategoryCover(category, products);
    if (cover && !list.includes(cover)) list.push(cover);
  });
  return list;
}

export function matchedCategoryCover(categories, products, matcherId) {
  const matcher = CATEGORY_MATCHERS.find((item) => item.id === matcherId);
  const withImages = (categories || []).map((category) => ({
    ...category,
    imageUrl: resolveCategoryCover(category, products),
  }));
  if (matcher) {
    const found = findCategoryImage(withImages, matcher);
    if (found) return found;
  }
  return withImages.find((item) => item.imageUrl)?.imageUrl || "";
}

export function buildHomeIntroTiles({
  categories = [],
  products = [],
  heroImage = "",
  heroSlides = [],
  mobile = false,
}) {
  if (!heroImage) return [];

  const categoriesWithImages = (categories || []).map((category) => ({
    ...category,
    imageUrl: resolveCategoryCover(category, products),
  }));

  const matched = CATEGORY_MATCHERS.map((matcher) => ({
    id: matcher.id,
    src: findCategoryImage(categoriesWithImages, matcher),
  }));

  const used = new Set(
    CATEGORY_MATCHERS.filter((_, index) => matched[index].src).map(
      (matcher) => {
        const hayMatches = categoriesWithImages.find((category) => {
          const hay = categoryHaystack(category);
          return matcher.needles.some((needle) =>
            hay.includes(String(needle).toLowerCase()),
          );
        });
        return hayMatches?.id;
      },
    ),
  );

  const imagePool = uniqueImages([
    ...heroSlides,
    ...categoriesWithImages.map((category) => category.imageUrl),
    ...(products || []).map((product) => product.imageUrl),
  ], heroImage);

  const fillMissing = (list) => {
    const extras = [
      ...pickFallbackSides(
        categoriesWithImages,
        used,
        list.filter((item) => !item.src).length + 4,
      ),
      ...imagePool,
    ].filter((src) => src && src !== heroImage);
    const taken = new Set(
      list.map((item) => item.src).filter((src) => src && src !== heroImage),
    );
    let cursor = 0;
    return list.map((item) => {
      if (item.src && item.src !== heroImage && !taken.has(item.src)) {
        taken.add(item.src);
        return item;
      }
      if (item.src && item.src !== heroImage) return item;
      while (cursor < extras.length && taken.has(extras[cursor])) cursor += 1;
      const src = extras[cursor] || "";
      if (src) taken.add(src);
      cursor += 1;
      return { ...item, src };
    });
  };

  if (mobile) {
    const left = matched[0];
    const right = matched[1].src ? matched[1] : matched[2];
    const sides = fillMissing([left, right]);
    return [
      { id: sides[0].id || "side-a", src: sides[0].src, isHero: false },
      { id: "hero", src: heroImage, isHero: true },
      { id: sides[1].id || "side-b", src: sides[1].src, isHero: false },
    ];
  }

  const sides = fillMissing([
    matched[0],
    matched[1],
    matched[2],
    { id: "side-d", src: "" },
  ]);

  return [
    { id: sides[0].id || "side-a", src: sides[0].src, isHero: false },
    { id: sides[1].id || "side-b", src: sides[1].src, isHero: false },
    { id: "hero", src: heroImage, isHero: true },
    { id: sides[2].id || "side-c", src: sides[2].src, isHero: false },
    { id: sides[3].id || "side-d", src: sides[3].src, isHero: false },
  ];
}
