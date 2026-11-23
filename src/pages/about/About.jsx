import React from "react";
import Seo from "@/components/seo/Seo";
import PageBanner from "@/components/ui/PageBanner";
import { EmptyState, PageShell } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function About() {
  const { locale } = useLocale();
  const { contact, isPending } = useSiteData();
  const name = t(contact?.companyName, locale);
  const about = t(contact?.about, locale);

  return (
    <>
      <Seo title={t(UI.nav.about, locale)} description={about} path="/about" />
      <PageShell>
        <PageBanner
          title={name || t(UI.nav.about, locale)}
          subtitle={t(UI.nav.about, locale)}
          imageUrl={contact?.bannerUrl}
        />
        <div className="container mx-auto max-w-3xl px-4 py-12 lg:px-8">
          {!isPending && !about ? <EmptyState /> : null}
          {about ? (
            <p className="whitespace-pre-wrap text-base leading-8 text-text-muted">
              {about}
            </p>
          ) : null}
          {contact?.logoUrl ? (
            <img
              src={contact.logoUrl}
              alt={name}
              className="mt-10 h-24 w-auto object-contain"
            />
          ) : null}
        </div>
      </PageShell>
    </>
  );
}
