import React from "react";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import HeroSection from "@/components/home/HeroSection";
import ImpactStrip from "@/components/home/ImpactStrip";
import MarqueeBand from "@/components/home/MarqueeBand";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import CompanyCtaSection from "@/components/home/CompanyCtaSection";
import ProductCategoriesSection from "@/components/home/ProductCategoriesSection";
import KnowledgeHub from "@/components/home/KnowledgeHub";
import ArticlesSection from "@/components/home/ArticlesSection";
import MediaStrip from "@/components/home/MediaStrip";
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
import ValuesTrio from "@/components/home/ValuesTrio";
import WhyCargill from "@/components/home/WhyCargill";
import EventsSection from "@/components/home/EventsSection";
import ContactSection from "@/components/home/ContactSection";
import { useHomePage } from "@/hooks/useHomePage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

const SECTION_COMPONENTS = {
  hero: HeroSection,
  featured_products: FeaturedProductsSection,
  company_cta: CompanyCtaSection,
  product_categories: ProductCategoriesSection,
  articles: ArticlesSection,
  events: EventsSection,
  contact: ContactSection,
};

export default function Home() {
  const { locale } = useLocale();
  const { data, isPending, isError, refetch } = useHomePage();
  const sections = (data || []).filter((section) => section.id !== "footer");

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
            const Component = SECTION_COMPONENTS[section.id];
            if (!Component) return null;
            return (
              <React.Fragment key={section.id}>
                {section.id === "articles" ? (
                  <KnowledgeHub items={section.items} />
                ) : null}
                {section.id === "contact" ? <GrowTogetherBanner /> : null}
                <Component section={section} />
                {section.id === "hero" ? (
                  <>
                    <ImpactStrip />
                    <ValuesTrio />
                  </>
                ) : null}
                {section.id === "product_categories" ? (
                  <>
                    <MarqueeBand items={section.items} />
                    <WhyCargill />
                  </>
                ) : null}
                {section.id === "articles" ? (
                  <MediaStrip items={section.items} />
                ) : null}
              </React.Fragment>
            );
          })}
        </main>
      ) : null}
    </>
  );
}
