import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import HeroSection from "@/components/home/HeroSection";
import HomepageIntro from "@/components/home/HomepageIntro";
import ValuesTrio from "@/components/home/ValuesTrio";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import ArticlesSection from "@/components/home/ArticlesSection";
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
import { useHomePage } from "@/hooks/useHomePage";
import { useLocale } from "@/context/LocaleContext";
import { getCategories, getProducts } from "@/services/cms/products";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import {
  buildHomeIntroTiles,
  markHomeIntroSeen,
  shouldPlayHomeIntro,
} from "@/lib/homeIntro";

export default function Home() {
  const { locale } = useLocale();
  const { data, isPending, isError, refetch } = useHomePage();
  const sections = data || [];
  const hero = sections.find((section) => section.id === "hero");
  const featured = sections.find((section) => section.id === "featured_products");
  const articles = sections.find((section) => section.id === "articles");
  const hasContent = Boolean(hero || featured || articles);

  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });
  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });

  const [wantIntro] = useState(() => shouldPlayHomeIntro());
  const [introDone, setIntroDone] = useState(() => !shouldPlayHomeIntro());
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth < 768);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const heroImage = useMemo(() => {
    const slides = hero?.data?.slides || [];
    const slideImage =
      slides.map((item) => item?.imageUrl).filter(Boolean)[0] || "";
    const sectionImage = hero?.data?.imageUrl || "";
    if (isMobile) return sectionImage || slideImage;
    return slideImage || sectionImage;
  }, [hero, isMobile]);

  const introTiles = useMemo(
    () =>
      buildHomeIntroTiles({
        categories: categoriesQuery.data || [],
        products: productsQuery.data || [],
        heroImage,
        mobile: isMobile,
      }),
    [categoriesQuery.data, productsQuery.data, heroImage, isMobile],
  );

  const catalogReady =
    !categoriesQuery.isPending && !productsQuery.isPending;

  const waitingForIntro = wantIntro && !introDone && Boolean(heroImage);

  const showIntro =
    waitingForIntro &&
    !isPending &&
    !isError &&
    hasContent &&
    catalogReady &&
    introTiles.some((tile) => tile.isHero && tile.src);

  useEffect(() => {
    if (waitingForIntro) {
      document.documentElement.dataset.homeIntro = "playing";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.documentElement.dataset.homeIntro = "done";
    return undefined;
  }, [waitingForIntro]);

  useEffect(() => {
    if (!waitingForIntro || isPending || isError || !catalogReady) return;
    const hasHeroTile = introTiles.some((tile) => tile.isHero && tile.src);
    if (!hasHeroTile) {
      markHomeIntroSeen();
      setIntroDone(true);
    }
  }, [
    waitingForIntro,
    isPending,
    isError,
    catalogReady,
    introTiles,
  ]);

  const onIntroComplete = () => {
    markHomeIntroSeen();
    setIntroDone(true);
  };

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
          {showIntro ? (
            <HomepageIntro tiles={introTiles} onComplete={onIntroComplete} />
          ) : null}
          {hero ? (
            <HeroSection
              section={hero}
              entranceReady={!waitingForIntro}
            />
          ) : null}
          <ValuesTrio />
          {featured ? <FeaturedProductsSection section={featured} /> : null}
          {articles ? <ArticlesSection section={articles} /> : null}
          <GrowTogetherBanner />
        </main>
      ) : null}
    </>
  );
}
