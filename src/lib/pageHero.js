import { t } from "@/lib/i18n";

export function resolvePageHero({
  section,
  contact,
  locale,
  fallbackTitle,
  fallbackSubtitle,
  fallbackImage = "",
}) {
  const sectionTitle = t(section?.title, locale);
  const sectionBody = t(section?.body, locale);
  const contactHeading = t(contact?.heading, locale);
  const contactSubtitle = t(contact?.subtitle, locale);
  const contactDescription = t(contact?.description, locale);

  return {
    title: sectionTitle || contactHeading || fallbackTitle || "",
    subtitle:
      sectionBody || contactSubtitle || contactDescription || fallbackSubtitle || "",
    imageUrl:
      section?.imageUrl ||
      contact?.bannerUrl ||
      fallbackImage ||
      "",
  };
}
