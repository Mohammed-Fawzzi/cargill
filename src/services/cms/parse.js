export function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function emptyLocalized() {
  return { ar: "", en: "" };
}

export function parseLocalized(value) {
  if (typeof value === "string") {
    return { ar: value, en: "" };
  }
  if (value && typeof value === "object") {
    return {
      ar: asString(value.ar),
      en: asString(value.en),
    };
  }
  return emptyLocalized();
}

export function readLocalized(data, key) {
  if (!data || typeof data !== "object") return emptyLocalized();
  if (data[key] !== undefined) return parseLocalized(data[key]);
  return {
    ar: asString(data[`${key}Ar`]),
    en: asString(data[`${key}En`]),
  };
}

export function readStringList(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function emptyCta() {
  return { label: emptyLocalized(), href: "" };
}

export function parseCta(value) {
  if (!value || typeof value !== "object") return emptyCta();
  return {
    label: parseLocalized(value.label),
    href: asString(value.href),
  };
}

export function parseSlide(value, index = 0) {
  if (!value || typeof value !== "object") return null;
  const id = asString(value.id) || `slide-${index + 1}`;
  const ctaSource =
    value.cta && typeof value.cta === "object"
      ? value.cta
      : {
          label: value.buttonText ?? value.buttonLabel,
          href: value.buttonUrl ?? value.href ?? value.url,
        };
  return {
    id,
    title: parseLocalized(value.title),
    body: parseLocalized(value.body ?? value.description),
    imageUrl: asString(value.imageUrl || value.image),
    cta: parseCta(ctaSource),
  };
}

export function parseHomepageSection(id, data = {}) {
  return {
    id,
    title: parseLocalized(data.title),
    body: parseLocalized(data.body),
    imageUrl: asString(data.imageUrl),
    cta: parseCta(data.cta),
    mapEmbedUrl: asString(data.mapEmbedUrl),
    limit: typeof data.limit === "number" ? data.limit : 0,
    selectedIds: Array.isArray(data.selectedIds)
      ? data.selectedIds.filter((item) => typeof item === "string")
      : [],
    slides: Array.isArray(data.slides)
      ? data.slides
          .map((item, index) => parseSlide(item, index))
          .filter(Boolean)
      : [],
    updatedAt: data.updatedAt ?? null,
  };
}

export function resolveSelection(items, selectedIds, limit) {
  const byId = new Map(items.map((item) => [item.id, item]));

  if (selectedIds.length > 0) {
    const picked = selectedIds.map((id) => byId.get(id)).filter(Boolean);
    return limit > 0 ? picked.slice(0, limit) : picked;
  }

  const latest = [...items].sort(
    (a, b) => (b._sort ?? 0) - (a._sort ?? 0),
  );
  return limit > 0 ? latest.slice(0, limit) : latest;
}
