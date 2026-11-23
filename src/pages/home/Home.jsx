import React from "react";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import CompanyCtaSection from "@/components/home/CompanyCtaSection";
import ProductCategoriesSection from "@/components/home/ProductCategoriesSection";
import ArticlesSection from "@/components/home/ArticlesSection";
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
            return <Component key={section.id} section={section} />;
          })}
        </main>
      ) : null}
    </>
  );
}
