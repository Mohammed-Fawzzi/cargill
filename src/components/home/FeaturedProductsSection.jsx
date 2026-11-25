import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IoLogoWhatsapp } from "react-icons/io5";
import CurtainCard from "@/components/ui/CurtainCard";
import DragRail from "@/components/ui/DragRail";
import SectionIntro from "@/components/ui/SectionIntro";
import SplitArrowButton from "@/components/ui/SplitArrowButton";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories } from "@/services/cms/products";
import { toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const MAX_CARDS = 6;

function formatIngredients(product, locale) {
  const list = Array.isArray(product?.activeIngredients)
    ? product.activeIngredients
    : [];
  return list
    .map((item) => {
      const name = t(item.name, locale);
      if (!name) return "";
      if (!item.percentage) return name;
      return `${name} ${item.percentage}`;
    })
    .filter(Boolean)
    .join(" · ");
}

function ProductStageCard({
  item,
  categoryName,
  locale,
  phone,
  reducedMotion,
  index = 0,
}) {
  const name = t(item.name, locale);
  const overview =
    t(item.overview, locale) || t(item.details, locale) || "";
  const ingredients = formatIngredients(item, locale);
  const waMessage = t(UI.askAboutProductMessage, locale).replace(
    "{name}",
    name || "",
  );
  const waHref = toWhatsAppHref(phone, waMessage);

  return (
    <motion.div
      className="w-[min(82vw,21rem)] shrink-0 snap-start self-start md:w-[22rem]"
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: reducedMotion ? 0 : index * 0.08,
        ease: easeOut,
      }}
    >
      <CurtainCard
        titleTo={`/products/${item.id}`}
        imageUrl={item.imageUrl}
        imageAlt={name}
        label={categoryName}
        title={name}
        description={overview}
        fit="contain"
        className="h-full rounded-3xl"
      >
        {ingredients ? (
          <div className="relative z-[3] mt-4 rounded-xl border border-white/8 bg-[#0A0820]/60 p-3 text-xs text-white/60">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span>{t(UI.activeIngredientLabel, locale)}</span>
              <span className="max-w-[70%] text-end font-mono text-white">
                {ingredients}
              </span>
            </div>
          </div>
        ) : null}

        <div className="relative z-[3] mt-4 flex items-center gap-3">
            <SplitArrowButton
              to={`/products/${item.id}`}
              variant="primary"
              className="min-h-10 flex-1"
            >
              {t(UI.productDetails, locale)}
            </SplitArrowButton>
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="ix-icon-btn inline-flex rounded-full border border-white/8 bg-[#161242] p-2.5 text-brand-lime"
                aria-label={t(UI.askAboutWhatsApp, locale)}
              >
                <IoLogoWhatsapp className="text-lg" aria-hidden="true" />
              </a>
            ) : null}
          </div>
      </CurtainCard>
    </motion.div>
  );
}

export default function FeaturedProductsSection({ section }) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();

  const items = useMemo(
    () => (section?.items || []).filter(Boolean).slice(0, MAX_CARDS),
    [section?.items],
  );

  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const categoryNameById = useMemo(() => {
    const map = new Map();
    for (const category of categoriesQuery.data || []) {
      map.set(category.id, t(category.name, locale));
    }
    return map;
  }, [categoriesQuery.data, locale]);

  const phone = contact?.phones?.[0] || "";

  if (!items.length) return null;

  return (
    <motion.section
      data-home-bg="#110E33"
      className="border-t border-white/8 bg-transparent py-20 md:py-24"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionIntro
          label={t(UI.productsIndexLabel, locale)}
          title={t(UI.featuredLabel, locale)}
          action={
            <Link
              to="/products"
              className="ix-link text-sm font-medium text-brand-lime"
            >
              {t(UI.viewAllProducts, locale)}
            </Link>
          }
        />

        <DragRail dots>
          {items.map((item, index) => (
            <ProductStageCard
              key={item.id}
              item={item}
              categoryName={categoryNameById.get(item.sectionId) || ""}
              locale={locale}
              phone={phone}
              reducedMotion={reducedMotion}
              index={index}
            />
          ))}
        </DragRail>
      </div>
    </motion.section>
  );
}
