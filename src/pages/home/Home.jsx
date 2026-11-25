import React from "react";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import HeroSection from "@/components/home/HeroSection";
import ImpactStrip from "@/components/home/ImpactStrip";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import KnowledgeHub from "@/components/home/KnowledgeHub";
import MediaStrip from "@/components/home/MediaStrip";
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
import ValuesTrio from "@/components/home/ValuesTrio";
import EventsSection from "@/components/home/EventsSection";
import ContactSection from "@/components/home/ContactSection";
import { useHomePage } from "@/hooks/useHomePage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

const HIDDEN_HOME_SECTIONS = new Set([
  "product_categories",
  "company_cta",
]);

const SECTION_COMPONENTS = {
  hero: HeroSection,
  featured_products: FeaturedProductsSection,
  events: EventsSection,
  contact: ContactSection,
};

export default function Home() {
  const { locale } = useLocale();
  const { data, isPending, isError, refetch } = useHomePage();
  const sections = (data || []).filter(
    (section) => section.id !== "footer" && !HIDDEN_HOME_SECTIONS.has(section.id),
  );

  return (
    <>
      <Seo title={t(UI.nav.home, locale)} path="/" />
      {isPending ? <Loading /> : null}
      {!isPending && isError ? (
        <main className="pt-navbar">
          <ErrorState onRetry={refetch} />
        </main>
      ) : null}
      {!isPending && !isError && sections.length === 0 ? (
        <main className="pt-navbar">
          <EmptyState />
        </main>
      ) : null}
      {!isPending && !isError && sections.length > 0 ? (
        <main>
          {sections.map((section) => {
            if (section.id === "articles") {
              return (
                <React.Fragment key={section.id}>
                  <KnowledgeHub items={section.items} section={section} />
                  <MediaStrip items={section.items} />
                </React.Fragment>
              );
            }

            const Component = SECTION_COMPONENTS[section.id];
            if (!Component) return null;

            return (
              <React.Fragment key={section.id}>
                {section.id === "contact" ? <GrowTogetherBanner /> : null}
                <Component section={section} />
                {section.id === "hero" ? (
                  <>
                    <ImpactStrip />
                    <ValuesTrio />
                  </>
                ) : null}
              </React.Fragment>
            );
          })}
        </main>
      ) : null}
    </>
  );
}
