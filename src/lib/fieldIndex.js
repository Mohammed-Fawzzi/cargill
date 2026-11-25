import { t } from "@/lib/i18n";

function cellText(cell, locale) {
  return t(cell, locale) || "";
}

export function slugifyLabel(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/gi, "");
}

export function collectUsageIndex(products = [], locale = "ar") {
  const crops = new Map();
  const diseases = new Map();
  const pairs = [];

  for (const product of products) {
    for (const row of product.agriculturalUses || []) {
      const crop = cellText(row.cells?.crop, locale);
      const disease = cellText(row.cells?.disease, locale);
      const dose = cellText(row.cells?.dose, locale);
      const phi = cellText(row.cells?.phi, locale);
      if (!crop) continue;

      const cropKey = slugifyLabel(crop);
      if (!crops.has(cropKey)) {
        crops.set(cropKey, {
          key: cropKey,
          label: crop,
          imageUrl: product.imageUrl || "",
          count: 0,
        });
      }
      const cropEntry = crops.get(cropKey);
      cropEntry.count += 1;
      if (!cropEntry.imageUrl && product.imageUrl) {
        cropEntry.imageUrl = product.imageUrl;
      }

      if (disease) {
        const diseaseKey = slugifyLabel(disease);
        if (!diseases.has(diseaseKey)) {
          diseases.set(diseaseKey, {
            key: diseaseKey,
            label: disease,
            imageUrl: product.imageUrl || "",
            count: 0,
            crops: new Set(),
          });
        }
        const diseaseEntry = diseases.get(diseaseKey);
        diseaseEntry.count += 1;
        diseaseEntry.crops.add(cropKey);
        if (!diseaseEntry.imageUrl && product.imageUrl) {
          diseaseEntry.imageUrl = product.imageUrl;
        }
      }

      pairs.push({
        productId: product.id,
        product,
        crop,
        cropKey,
        disease,
        diseaseKey: disease ? slugifyLabel(disease) : "",
        dose,
        phi,
        row,
      });
    }
  }

  return {
    crops: Array.from(crops.values()).sort((a, b) => b.count - a.count),
    diseases: Array.from(diseases.values())
      .map((item) => ({
        ...item,
        crops: Array.from(item.crops),
      }))
      .sort((a, b) => b.count - a.count),
    pairs,
  };
}

export function diseasesForCrop(index, cropKey) {
  if (!cropKey) return [];
  return (index.diseases || []).filter((item) =>
    item.crops.includes(cropKey),
  );
}

export function matchProducts(index, cropKey, diseaseKey) {
  return (index.pairs || []).filter((pair) => {
    if (cropKey && pair.cropKey !== cropKey) return false;
    if (diseaseKey && pair.diseaseKey !== diseaseKey) return false;
    return Boolean(cropKey || diseaseKey);
  });
}
