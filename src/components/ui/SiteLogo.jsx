import React from "react";
import { t } from "@/lib/i18n";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import logoCargill from "@/assets/logo-cargill.png";
import logoCargillWhite from "@/assets/logo-cargill-white.png";

export default function SiteLogo({
  className = "h-12 w-auto object-contain",
  alt = "",
  loading,
  variant = "auto",
}) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const name = t(contact?.companyName, locale);
  const resolved = variant === "auto" ? "white" : variant;
  const fallback = resolved === "white" ? logoCargillWhite : logoCargill;
  const src =
    resolved === "white" ? fallback : contact?.logoUrl || fallback;

  return (
    <img
      src={src}
      alt={alt || name || "Cargill"}
      className={className}
      loading={loading}
    />
  );
}
