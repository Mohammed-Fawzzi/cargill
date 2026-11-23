import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

export const SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook", Icon: FaFacebookF },
  { id: "instagram", label: "Instagram", Icon: FaInstagram },
  { id: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  { id: "youtube", label: "YouTube", Icon: FaYoutube },
];

export function resolveCompanySocial(social) {
  if (!social || typeof social !== "object") return [];
  return SOCIAL_PLATFORMS.map((platform) => {
    const url = String(social[platform.id] || "").trim();
    if (!url) return null;
    return { ...platform, url };
  }).filter(Boolean);
}
