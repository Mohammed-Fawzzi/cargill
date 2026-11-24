import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { eventDayKey, readEventStatus, toMillis } from "@/lib/time";
import { asString, readLocalized } from "@/services/cms/parse";

export function mapEvent(id, data = {}) {
  const createdAt = toMillis(data.createdAt);
  const details = readLocalized(data, "details");
  const description = readLocalized(data, "description");
  return {
    id,
    title: readLocalized(data, "title"),
    details: {
      ar: details.ar || description.ar,
      en: details.en || description.en,
    },
    imageUrl: asString(data.imageUrl),
    date: asString(data.date),
    status: readEventStatus(data.status, data.date),
    createdAt,
    updatedAt: toMillis(data.updatedAt),
    _sort: createdAt,
  };
}

export async function getEvents() {
  const snap = await getDocs(collection(db, "events"));
  return snap.docs
    .map((item) => mapEvent(item.id, item.data()))
    .sort((a, b) => {
      const byDate = eventDayKey(b.date).localeCompare(eventDayKey(a.date));
      return byDate !== 0 ? byDate : b.createdAt - a.createdAt;
    });
}

export async function getEvent(eventId) {
  const snap = await getDoc(doc(db, "events", eventId));
  if (!snap.exists()) return null;
  return mapEvent(snap.id, snap.data());
}
