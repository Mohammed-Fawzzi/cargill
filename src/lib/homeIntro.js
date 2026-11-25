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
  {
    id: "seeds",
    needles: ["بذور", "بذر", "seed"],
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

export function buildHomeIntroTiles({
  categories = [],
  products = [],
  heroImage = "",
  mobile = false,
}) {
  if (!heroImage) return [];

  const categoriesWithImages = (categories || []).map((category) => {
    const cover = (products || []).find(
      (product) => product.sectionId === category.id && product.imageUrl,
    );
    return {
      ...category,
      imageUrl: cover?.imageUrl || "",
    };
  });

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

  const fillMissing = (list) => {
    const need = list.filter((item) => !item.src).length;
    const extras = pickFallbackSides(categoriesWithImages, used, need);
    let cursor = 0;
    return list.map((item) => {
      if (item.src) return item;
      const src = extras[cursor] || "";
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
    matched[3],
  ]);

  return [
    { id: sides[0].id || "side-a", src: sides[0].src, isHero: false },
    { id: sides[1].id || "side-b", src: sides[1].src, isHero: false },
    { id: "hero", src: heroImage, isHero: true },
    { id: sides[2].id || "side-c", src: sides[2].src, isHero: false },
    { id: sides[3].id || "side-d", src: sides[3].src, isHero: false },
  ];
}
