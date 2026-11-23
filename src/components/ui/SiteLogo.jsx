import React from "react";
import { t } from "@/lib/i18n";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";

export default function SiteLogo({
  className = "h-12 w-auto object-contain",
  alt = "",
  loading,
}) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const name = t(contact?.companyName, locale);
  const logoUrl = contact?.logoUrl;

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={alt || name}
        className={className}
        loading={loading}
      />
    );
  }

  if (name) {
    return (
      <span className="max-w-[12rem] text-sm font-extrabold leading-5 text-white sm:text-base">
        {name}
      </span>
    );
  }

  return null;
}
