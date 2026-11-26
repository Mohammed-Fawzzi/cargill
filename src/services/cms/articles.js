import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toMillis } from "@/lib/time";
import { asString, readLocalized } from "@/services/cms/parse";

export function mapArticle(id, data = {}) {
  const createdAt = toMillis(data.createdAt);
  const excerpt = readLocalized(data, "excerpt");
  const description = readLocalized(data, "description");
  const category = readLocalized(data, "category");
  const caption = readLocalized(data, "caption");
  const imageCaption = readLocalized(data, "imageCaption");
  return {
    id,
    title: readLocalized(data, "title"),
    excerpt: {
      ar: excerpt.ar || description.ar,
      en: excerpt.en || description.en,
    },
    content: readLocalized(data, "content"),
    imageUrl: asString(data.imageUrl),
    videoUrl: asString(data.videoUrl || data.heroVideoUrl),
    category,
    caption: {
      ar: caption.ar || imageCaption.ar,
      en: caption.en || imageCaption.en,
    },
    author: readLocalized(data, "author"),
    createdAt,
    updatedAt: toMillis(data.updatedAt),
    _sort: createdAt,
  };
}

export async function getArticles() {
  const snap = await getDocs(collection(db, "articles"));
  return snap.docs
    .map((item) => mapArticle(item.id, item.data()))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getArticle(articleId) {
  const snap = await getDoc(doc(db, "articles", articleId));
  if (!snap.exists()) return null;
  return mapArticle(snap.id, snap.data());
}
