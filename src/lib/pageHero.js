import { t } from "@/lib/i18n";

function asTrimmed(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function uniqueMediaUrls(values = []) {
  const seen = new Set();
  const out = [];
  values.forEach((value) => {
    const src = asTrimmed(value);
    if (!src || seen.has(src)) return;
    seen.add(src);
    out.push(src);
  });
  return out;
}

export function resolvePageHero({
  section,
  contact,
  locale,
  fallbackTitle,
  fallbackSubtitle,
  fallbackImage = "",
  fallbackVideo = "",
  videoCandidates = [],
}) {
  const sectionTitle = t(section?.title, locale);
  const sectionBody = t(section?.body, locale);
  const contactHeading = t(contact?.heading, locale);
  const contactSubtitle = t(contact?.subtitle, locale);
  const contactDescription = t(contact?.description, locale);

  const sectionSlideImage = asTrimmed(section?.slides?.[0]?.imageUrl);
  const imageUrl =
    asTrimmed(section?.imageUrl) ||
    sectionSlideImage ||
    asTrimmed(fallbackImage) ||
    "";

  const videoUrls = uniqueMediaUrls([
    section?.videoUrl,
    section?.heroVideoUrl,
    section?.slides?.[0]?.videoUrl,
    fallbackVideo,
    ...videoCandidates,
  ]);

  return {
    title: sectionTitle || contactHeading || fallbackTitle || "",
    subtitle:
      sectionBody || contactSubtitle || contactDescription || fallbackSubtitle || "",
    imageUrl,
    videoUrl: videoUrls[0] || "",
    videoUrls,
  };
}
