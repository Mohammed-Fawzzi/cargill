import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  asString,
  emptyLocalized,
  readLocalized,
  readStringList,
} from "@/services/cms/parse";

function emptySocial() {
  return {
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  };
}

function pickSocialUrl(links, host) {
  return links.find((item) => item.toLowerCase().includes(host)) ?? "";
}

function readSocial(raw, socialLinks) {
  const base = emptySocial();
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    base.facebook = asString(raw.facebook);
    base.instagram = asString(raw.instagram);
    base.linkedin = asString(raw.linkedin);
    base.youtube = asString(raw.youtube);
  }

  return {
    facebook: base.facebook || pickSocialUrl(socialLinks, "facebook.com"),
    instagram: base.instagram || pickSocialUrl(socialLinks, "instagram.com"),
    linkedin: base.linkedin || pickSocialUrl(socialLinks, "linkedin.com"),
    youtube: base.youtube || pickSocialUrl(socialLinks, "youtube.com"),
  };
}

export function emptyCompanyContact() {
  return {
    companyName: emptyLocalized(),
    aboutHeading: emptyLocalized(),
    about: emptyLocalized(),
    vision: emptyLocalized(),
    mission: emptyLocalized(),
    logoUrl: "",
    bannerUrl: "",
    heading: emptyLocalized(),
    subtitle: emptyLocalized(),
    description: emptyLocalized(),
    address: emptyLocalized(),
    phones: [],
    emails: [],
    social: emptySocial(),
    mapUrl: "",
    updatedAt: null,
  };
}

export async function getCompanyContact() {
  const snap = await getDoc(doc(db, "contact", "page"));
  if (!snap.exists()) return emptyCompanyContact();

  const data = snap.data();
  const phones = readStringList(data.phones);
  const emails = readStringList(data.emails)
    .flatMap((item) => item.split(/\s+/))
    .filter((item) => item.includes("@"));
  const legacyEmail = asString(data.email);
  const socialLinks = readStringList(data.socialLinks);

  return {
    companyName: readLocalized(data, "companyName"),
    aboutHeading: readLocalized(data, "aboutHeading"),
    about: readLocalized(data, "about"),
    vision: readLocalized(data, "vision"),
    mission: readLocalized(data, "mission"),
    logoUrl: asString(data.logoUrl),
    bannerUrl: asString(data.bannerUrl),
    heading: readLocalized(data, "heading"),
    subtitle: readLocalized(data, "subtitle"),
    description: readLocalized(data, "description"),
    address: readLocalized(data, "address"),
    phones,
    emails: emails.length > 0 ? emails : legacyEmail ? [legacyEmail] : [],
    social: readSocial(data.social, socialLinks),
    mapUrl: asString(data.mapUrl) || asString(data.mapEmbedUrl),
    updatedAt: data.updatedAt ?? null,
  };
}
