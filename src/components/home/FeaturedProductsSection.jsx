import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { IoLogoWhatsapp } from "react-icons/io5";
import SafeImage from "@/components/ui/SafeImage";
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
  canTilt,
  index = 0,
}) {
  const cardRef = useRef(null);
  const [hot, setHot] = useState(false);
  const name = t(item.name, locale);
  const overview =
    t(item.overview, locale) || t(item.details, locale) || "";
  const ingredients = formatIngredients(item, locale);
  const waMessage = t(UI.askAboutProductMessage, locale).replace(
    "{name}",
    name || "",
  );
  const waHref = toWhatsAppHref(phone, waMessage);
  const number = `${String(index + 1).padStart(2, "0")}.`;
  const mediaH = "12.5625rem";
  const mediaHover = "15rem";

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 220, damping: 22, mass: 0.4 });
  const springY = useSpring(rotateY, { stiffness: 220, damping: 22, mass: 0.4 });
  const lift = useMotionValue(0);
  const springLift = useSpring(lift, { stiffness: 260, damping: 24 });
  const liftY = useTransform(springLift, (value) => -value);

  const onMove = (event) => {
    if (!canTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(Math.max(-4, Math.min(4, py * -8)));
    rotateY.set(Math.max(-4, Math.min(4, px * 8)));
  };

  const onEnter = () => {
    setHot(true);
    if (!reducedMotion) lift.set(6);
  };

  const onLeave = () => {
    setHot(false);
    lift.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };

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
      <motion.article
        ref={cardRef}
        className={`product-stage ix-card group flex flex-col justify-between rounded-3xl border border-white/8 p-6 transition-colors duration-300 hover:border-brand-lime/60 ${
          hot ? "is-hot" : ""
        }`}
        style={{
          "--ix-media-h": mediaH,
          "--ix-media-h-hover": mediaHover,
          rotateX: canTilt ? springX : 0,
          rotateY: canTilt ? springY : 0,
          y: reducedMotion ? 0 : liftY,
          transformPerspective: 900,
        }}
        onMouseMove={onMove}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div className="ix-card__media relative mb-5 overflow-hidden border border-white/8 bg-[#0A0820]/50">
          <div className="ix-card__zoom">
            {item.imageUrl ? (
              <SafeImage
                src={item.imageUrl}
                alt={name}
                width={420}
                className="max-h-[85%] max-w-[70%] object-contain"
              />
            ) : null}
          </div>
          {categoryName ? (
            <span className="absolute end-3 top-3 z-20 rounded-full border border-white/8 bg-[#110E33] px-2.5 py-0.5 font-mono text-[10px] text-brand-lime">
              {categoryName}
            </span>
          ) : null}
        </div>

        <div className="space-y-3">
          <div>
            <div className="ix-card__title-row mt-0">
              <span className="ix-card__num" dir="ltr">
                {number}
              </span>
              <h3 className="ix-card__title font-display text-xl font-bold text-white">
                {name}
              </h3>
            </div>
            {overview ? (
              <p className="ix-card__desc line-clamp-2 text-xs leading-relaxed text-white/60">
                {overview}
              </p>
            ) : null}
          </div>

          {ingredients ? (
            <div className="rounded-xl border border-white/8 bg-[#0A0820]/60 p-3 text-xs text-white/60">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span>{t(UI.activeIngredientLabel, locale)}</span>
                <span className="max-w-[70%] text-end font-mono text-white">
                  {ingredients}
                </span>
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-3 pt-1">
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
        </div>
      </motion.article>
    </motion.div>
  );
}

export default function FeaturedProductsSection({ section }) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion, canTilt } = useMotionPrefs();

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
              canTilt={canTilt}
              index={index}
            />
          ))}
        </DragRail>
      </div>
    </motion.section>
  );
}
