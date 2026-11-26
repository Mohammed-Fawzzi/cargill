import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import HeroSection from "@/components/home/HeroSection";
import CategoryFilm from "@/components/home/CategoryFilm";
import HomepageIntro from "@/components/home/HomepageIntro";
import ValuesTrio from "@/components/home/ValuesTrio";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import ArticlesSection from "@/components/home/ArticlesSection";
import GrowTogetherBanner from "@/components/shared/GrowTogetherBanner";
import HomeScrollBg from "@/components/home/HomeScrollBg";
import { useHomePage } from "@/hooks/useHomePage";
import { useLocale } from "@/context/LocaleContext";
import { getCategories, getProducts } from "@/services/cms/products";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import {
  buildHomeIntroTiles,
  homepageSlideImages,
  markHomeIntroSeen,
  shouldPlayHomeIntro,
} from "@/lib/homeIntro";
import { captureVideoFrame } from "@/lib/introMedia";
import { getDrivePosterUrl } from "@/lib/image";
import { HERO_VIDEO_URL } from "@/config/media";

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
  const [videoPoster, setVideoPoster] = useState("");

  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth < 768);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const heroSlides = useMemo(() => homepageSlideImages(hero), [hero]);

  const heroVideoUrl = useMemo(() => {
    const slides = hero?.data?.slides || [];
    const fromSlide = slides
      .map((item) =>
        typeof item?.videoUrl === "string" ? item.videoUrl.trim() : "",
      )
      .find(Boolean);
    const fromSection =
      typeof hero?.data?.videoUrl === "string" ? hero.data.videoUrl.trim() : "";
    return fromSlide || fromSection || HERO_VIDEO_URL || "";
  }, [hero]);

  const heroImage = useMemo(() => {
    const slideImage = heroSlides[0] || "";
    const sectionImage = hero?.data?.imageUrl || "";
    const drivePoster = getDrivePosterUrl(heroVideoUrl);
    if (isMobile) {
      return sectionImage || slideImage || videoPoster || drivePoster || "";
    }
    return (
      videoPoster ||
      drivePoster ||
      slideImage ||
      sectionImage ||
      ""
    );
  }, [hero, heroSlides, isMobile, heroVideoUrl, videoPoster]);

  useEffect(() => {
    let alive = true;
    if (!heroVideoUrl) {
      setVideoPoster("");
      return undefined;
    }
    const quick = getDrivePosterUrl(heroVideoUrl);
    if (quick) setVideoPoster(quick);
    captureVideoFrame(heroVideoUrl).then((frame) => {
      if (!alive || !frame) return;
      setVideoPoster(frame);
    });
    return () => {
      alive = false;
    };
  }, [heroVideoUrl]);

  const introTiles = useMemo(
    () =>
      buildHomeIntroTiles({
        categories: categoriesQuery.data || [],
        products: productsQuery.data || [],
        heroImage,
        heroSlides,
        mobile: isMobile,
      }),
    [categoriesQuery.data, productsQuery.data, heroImage, heroSlides, isMobile],
  );

  const catalogReady =
    !categoriesQuery.isPending && !productsQuery.isPending;

  const waitingForIntro =
    wantIntro && !introDone && Boolean(heroImage || heroVideoUrl);

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
          <HomeScrollBg />
          {showIntro ? (
            <HomepageIntro tiles={introTiles} onComplete={onIntroComplete} />
          ) : null}
          {hero ? (
            <HeroSection
              section={hero}
              entranceReady={!waitingForIntro}
              videoPosterUrl={videoPoster || getDrivePosterUrl(heroVideoUrl)}
            />
          ) : null}
          <ValuesTrio />
          {featured ? <FeaturedProductsSection section={featured} /> : null}
          {articles ? <ArticlesSection section={articles} /> : null}
          <CategoryFilm />
          <GrowTogetherBanner />
        </main>
      ) : null}
    </>
  );
}
