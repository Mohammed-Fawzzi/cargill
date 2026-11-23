import React from "react";
import { Helmet } from "react-helmet";
import { getCanonicalUrl } from "@/constants/site";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { dirFor, t } from "@/lib/i18n";

export default function Seo({
  title,
  description = "",
  path = "/",
  noindex = false,
}) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const companyName = t(contact?.companyName, locale);
  const pageTitle = title
    ? companyName
      ? `${title} | ${companyName}`
      : title
    : companyName;
  const pageDescription = description || t(contact?.about, locale);
  const canonicalUrl = getCanonicalUrl(path);
  const ogImage = contact?.logoUrl || contact?.bannerUrl || "";

  return (
    <Helmet>
      <html lang={locale} dir={dirFor(locale)} />
      {pageTitle ? <title>{pageTitle}</title> : null}
      {pageDescription ? <meta name="description" content={pageDescription} /> : null}
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
      {companyName ? <meta name="author" content={companyName} /> : null}
      <meta name="theme-color" content="#0c120e" />
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      {companyName ? <meta property="og:site_name" content={companyName} /> : null}
      {pageTitle ? <meta property="og:title" content={pageTitle} /> : null}
      {pageDescription ? (
        <meta property="og:description" content={pageDescription} />
      ) : null}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={locale === "ar" ? "ar_AR" : "en_US"} />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      {pageTitle ? <meta name="twitter:title" content={pageTitle} /> : null}
      {pageDescription ? (
        <meta name="twitter:description" content={pageDescription} />
      ) : null}
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
    </Helmet>
  );
}
