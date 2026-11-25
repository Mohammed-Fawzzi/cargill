import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { asString, parseLocalized, readLocalized } from "@/services/cms/parse";
import { SHOCK_STAT, SEED_TO_HARVEST, GROWTH_STAGE_LABELS } from "@/constants/editorial";

export async function getShockStat() {
  try {
    const snap = await getDoc(doc(db, "homepage", "shock_stat"));
    if (!snap.exists()) {
      return {
        statement: SHOCK_STAT.statement,
        source: SHOCK_STAT.source,
        imageUrl: SHOCK_STAT.imageUrl,
      };
    }
    const data = snap.data() || {};
    return {
      statement: readLocalized(data, "statement") || parseLocalized(data.statement),
      source: readLocalized(data, "source") || parseLocalized(data.source),
      imageUrl: asString(data.imageUrl),
    };
  } catch {
    return {
      statement: SHOCK_STAT.statement,
      source: SHOCK_STAT.source,
      imageUrl: SHOCK_STAT.imageUrl,
    };
  }
}

export async function getSeedToHarvest() {
  try {
    const snap = await getDoc(doc(db, "homepage", "seed_to_harvest"));
    if (!snap.exists()) {
      return { stages: SEED_TO_HARVEST.stages };
    }
    const data = snap.data() || {};
    const raw = Array.isArray(data.stages)
      ? data.stages
      : Array.isArray(data.images)
        ? data.images
        : [];
    const stages = raw
      .map((item, index) => {
        if (typeof item === "string") {
          return {
            id: `stage-${index}`,
            imageUrl: item,
            label: GROWTH_STAGE_LABELS[index] || {
              ar: `مرحلة ${index + 1}`,
              en: `Stage ${index + 1}`,
            },
          };
        }
        if (!item || typeof item !== "object") return null;
        const imageUrl = asString(item.imageUrl) || asString(item.url);
        if (!imageUrl) return null;
        return {
          id: asString(item.id) || `stage-${index}`,
          imageUrl,
          label:
            readLocalized(item, "label") ||
            parseLocalized(item.label) ||
            GROWTH_STAGE_LABELS[index] || {
              ar: `مرحلة ${index + 1}`,
              en: `Stage ${index + 1}`,
            },
        };
      })
      .filter(Boolean);
    return { stages };
  } catch {
    return { stages: SEED_TO_HARVEST.stages };
  }
}
