import React from "react";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import HeroSection from "@/components/home/HeroSection";
import ValuesTrio from "@/components/home/ValuesTrio";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import ArticlesSection from "@/components/home/ArticlesSection";
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
import { useHomePage } from "@/hooks/useHomePage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function Home() {
  const { locale } = useLocale();
  const { data, isPending, isError, refetch } = useHomePage();
  const sections = data || [];
  const hero = sections.find((section) => section.id === "hero");
  const featured = sections.find((section) => section.id === "featured_products");
  const articles = sections.find((section) => section.id === "articles");
  const hasContent = Boolean(hero || featured || articles);

  return (
    <>
      <Seo title={t(UI.nav.home, locale)} path="/" />
      {isPending ? <Loading /> : null}
      {!isPending && isError ? (
        <main className="pt-navbar">
          <ErrorState onRetry={refetch} />
        </main>
      ) : null}
      {!isPending && !isError && !hasContent ? (
        <main className="pt-navbar">
          <EmptyState />
        </main>
      ) : null}
      {!isPending && !isError && hasContent ? (
        <main>
          {hero ? <HeroSection section={hero} /> : null}
          <ValuesTrio />
          {featured ? <FeaturedProductsSection section={featured} /> : null}
          {articles ? <ArticlesSection section={articles} /> : null}
          <GrowTogetherBanner />
        </main>
      ) : null}
    </>
  );
}
