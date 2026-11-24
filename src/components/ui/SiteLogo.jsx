import React from "react";
import { t } from "@/lib/i18n";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import logoCargill from "@/assets/logo-cargill.png";

export default function SiteLogo({
  className = "h-12 w-auto object-contain",
  alt = "",
  loading,
}) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const name = t(contact?.companyName, locale);
  const src = contact?.logoUrl || logoCargill;

  return (
    <img
      src={src}
      alt={alt || name || "Cargill"}
      className={className}
      loading={loading}
    />
  );
}
