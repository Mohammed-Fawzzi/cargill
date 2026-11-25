import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { asString, parseLocalized, readLocalized } from "@/services/cms/parse";
import { slugifyLabel } from "@/lib/fieldIndex";

function mapDistributor(id, data = {}) {
  const name = readLocalized(data, "name");
  const governorateRaw =
    asString(data.governorateId) ||
    asString(data.governorate) ||
    asString(data.governorateAr) ||
    "";
  const phone = asString(data.phone) || asString(data.mobile) || "";
  if (!name.ar && !name.en && !asString(data.name)) return null;
  if (!governorateRaw && !phone) return null;

  return {
    id,
    name: name.ar || name.en ? name : parseLocalized(data.name),
    governorateId: slugifyLabel(governorateRaw),
    governorateLabel: parseLocalized(
      typeof data.governorate === "object"
        ? data.governorate
        : { ar: asString(data.governorateAr) || governorateRaw, en: asString(data.governorateEn) || governorateRaw },
    ),
    phone,
    address: readLocalized(data, "address"),
    whatsapp: asString(data.whatsapp) || phone,
  };
}

export async function getDistributors() {
  try {
    const snap = await getDocs(collection(db, "distributors"));
    return snap.docs
      .map((item) => mapDistributor(item.id, item.data()))
      .filter(Boolean);
  } catch {
    return [];
  }
}
