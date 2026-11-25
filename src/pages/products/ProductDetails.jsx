import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import SafeImage from "@/components/ui/SafeImage";
import LtrText from "@/components/ui/LtrText";
import RevealHeading from "@/components/ui/RevealHeading";
import ProductCard from "@/components/products/ProductCard";
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getCategories, getProduct, getProducts } from "@/services/cms/products";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { toWhatsAppHref } from "@/lib/phone";
import { easeOut } from "@/lib/motion";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function looksLtrValue(value) {
  return /[\d%]/.test(String(value || "")) || /سم3|لتر|ml|L\b/i.test(String(value || ""));
}

function ValueText({ value }) {
  if (!value) return null;
  if (looksLtrValue(value)) return <LtrText>{value}</LtrText>;
  return value;
}

function columnLabel(column, locale) {
  if (column?.id === "phi") return t(UI.phiLabel, locale);
  return t(column?.name, locale);
}

function FactRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-6 border-b border-white/12 py-4 text-[16px]">
      <span className="text-white/60">{label}</span>
      <span className="text-end font-semibold text-white">
        <ValueText value={value} />
      </span>
    </div>
  );
}

function UsageTable({ columns, rows, locale, reducedMotion }) {
  if (!columns?.length || !rows?.length) return null;

  return (
    <>
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-[17px]">
          <thead>
            <tr className="text-[13px] font-medium text-white/60">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="border-b-2 border-white py-3 text-start font-medium"
                >
                  {columnLabel(col, locale)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(index * 0.04, 0.2),
                  ease: easeOut,
                }}
              >
                {columns.map((col) => {
                  const value = t(row.cells?.[col.id], locale);
                  const isDose = col.id === "dose";
                  return (
                    <td
                      key={col.id}
                      className={`border-b border-white/12 py-5 align-top ${
                        isDose ? "font-bold text-brand-lime" : "text-white"
                      }`}
                    >
                      <ValueText value={value} />
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-4 md:hidden">
        {rows.map((row) => {
          const cropCol = columns.find((col) => col.id === "crop") || columns[0];
          const title = t(row.cells?.[cropCol?.id], locale);
          const rest = columns.filter((col) => col.id !== cropCol?.id);
          return (
            <article
              key={row.id}
              className="border-b border-white/12 pb-4"
            >
              {title ? (
                <h3 className="mb-3 text-base font-extrabold text-white">
                  {title}
                </h3>
              ) : null}
              <dl className="space-y-2">
                {rest.map((col) => {
                  const value = t(row.cells?.[col.id], locale);
                  if (!value) return null;
                  return (
                    <div
                      key={col.id}
                      className="flex items-baseline justify-between gap-4"
                    >
                      <dt className="text-[13px] text-white/60">
                        {columnLabel(col, locale)}
                      </dt>
                      <dd
                        className={`text-sm ${
                          col.id === "dose"
                            ? "font-bold text-brand-lime"
                            : "text-white"
                        }`}
                      >
                        <ValueText value={value} />
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </article>
          );
        })}
      </div>
    </>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const mainCtaRef = useRef(null);
  const [showStickyWa, setShowStickyWa] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const productQuery = useQuery({
    queryKey: ["cms", "product", id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  });
  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
  });
  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 2,
  });

  const product = productQuery.data;
  const categories = categoriesQuery.data || [];
  const section = categories.find((item) => item.id === product?.sectionId);
  const subcategory = section?.subcategories?.find(
    (item) => item.id === product?.subcategoryId,
  );
  const name = t(product?.name, locale);
  const origin = t(product?.originCountry, locale);
  const categoryName = t(section?.name, locale);
  const subcategoryName = t(subcategory?.name, locale);
  const overview = t(product?.overview, locale);
  const details = t(product?.details, locale);
  const packaging =
    t(product?.packaging, locale) ||
    t(product?.packageSize, locale) ||
    "";
  const datasheetUrl =
    product?.datasheetUrl || product?.pdfUrl || product?.technicalSheetUrl || "";

  const images = useMemo(() => {
    const gallery = Array.isArray(product?.images)
      ? product.images.filter(Boolean)
      : [];
    if (gallery.length) return gallery;
    return product?.imageUrl ? [product.imageUrl] : [];
  }, [product]);

  useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  const composition = product?.activeIngredients || [];
  const compositionSummary = composition
    .map((item) => {
      const label = t(item.name, locale);
      if (!label) return "";
      if (!item.percentage) return label;
      return (
        <>
          {label} — <LtrText>{item.percentage}</LtrText>
        </>
      );
    })
    .filter(Boolean);

  const related = useMemo(() => {
    const list = productsQuery.data || [];
    return list
      .filter(
        (item) =>
          item.id !== id &&
          product?.sectionId &&
          item.sectionId === product.sectionId,
      )
      .slice(0, 3);
  }, [productsQuery.data, id, product?.sectionId]);

  const phone = contact?.phones?.[0] || "";
  const waMessage = t(UI.askAboutProductMessage, locale).replace(
    "{name}",
    name || "",
  );
  const waHref = toWhatsAppHref(phone, waMessage);
  const currentImage = images[Math.min(activeImage, Math.max(images.length - 1, 0))];

  useEffect(() => {
    const node = mainCtaRef.current;
    if (!node || !waHref) {
      setShowStickyWa(false);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyWa(!entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [waHref, product?.id]);

  const crumbParts = [
    { label: t(UI.nav.products, locale), to: "/products" },
    categoryName
      ? {
          label: categoryName,
          to: product?.sectionId
            ? `/products?section=${encodeURIComponent(product.sectionId)}`
            : "/products",
        }
      : null,
    subcategoryName ? { label: subcategoryName } : null,
  ].filter(Boolean);

  const hasFeatures = Boolean(product?.features?.length);
  const hasUsage = Boolean(product?.agriculturalUses?.length);
  const hasDetailsBand = hasFeatures || Boolean(details) || hasUsage;

  return (
    <>
      <Seo title={name || t(UI.nav.products, locale)} path={`/products/${id}`} />
      {productQuery.isPending ? <Loading /> : null}
      {!productQuery.isPending && productQuery.isError ? (
        <ErrorState onRetry={productQuery.refetch} />
      ) : null}
      {!productQuery.isPending && !productQuery.isError && !product ? (
        <main className="pt-navbar min-h-screen bg-[#0A0820]">
          <EmptyState message={t(UI.missingProduct, locale)} />
        </main>
      ) : null}
      {!productQuery.isPending && product ? (
        <main className="min-h-screen bg-[#0A0820] pb-28 text-white md:pb-0">
          <section className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-10 px-6 pb-[90px] pt-[calc(var(--navbar-height)+var(--ticker-height)+3.5rem)] md:grid-cols-2 md:gap-14">
            <motion.div
              className="order-2 md:order-1"
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              {crumbParts.length ? (
                <div className="text-[14px] text-white/60">
                  {crumbParts.map((item, index) => (
                    <span key={`${item.label}-${index}`}>
                      {index > 0 ? " / " : null}
                      {item.to ? (
                        <Link
                          to={item.to}
                          className="transition-colors hover:text-brand-lime"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        item.label
                      )}
                    </span>
                  ))}
                </div>
              ) : null}

              <Link
                to="/products"
                className="mt-3.5 inline-block text-[14px] text-brand-lime transition-colors hover:text-[#B5E06E]"
              >
                ← {t(UI.backToAllProducts, locale)}
              </Link>

              {name ? (
                <RevealHeading
                  as="h1"
                  text={name}
                  className="mt-[26px] max-w-full break-words font-display text-[clamp(2.5rem,7vw,6rem)] font-black leading-[1.1] text-white"
                />
              ) : null}

              {overview ? (
                <p className="mt-5 max-w-xl text-[18px] leading-[1.7] text-white/75 md:text-[20px]">
                  {overview}
                </p>
              ) : null}

              <div className="mt-[30px] border-t border-white/12">
                <FactRow label={t(UI.categoryFact, locale)} value={categoryName} />
                {compositionSummary.length ? (
                  <div className="flex justify-between gap-6 border-b border-white/12 py-4 text-[16px]">
                    <span className="shrink-0 text-white/60">
                      {t(UI.ingredients, locale)}
                    </span>
                    <span className="text-end font-semibold text-white">
                      {compositionSummary.map((part, index) => (
                        <span key={index}>
                          {index > 0 ? " · " : null}
                          {part}
                        </span>
                      ))}
                    </span>
                  </div>
                ) : null}
                <FactRow label={t(UI.originShort, locale)} value={origin} />
                <FactRow label={t(UI.packaging, locale)} value={packaging} />
              </div>

              <div
                ref={mainCtaRef}
                className="mt-8 flex flex-wrap items-center gap-5"
              >
                {waHref ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-brand-lime px-7 py-4 text-[16px] font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
                  >
                    {t(UI.askAboutProductWa, locale)}
                  </a>
                ) : null}
                {datasheetUrl ? (
                  <a
                    href={datasheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-brand-lime pb-0.5 text-[14px] text-white transition-colors hover:text-brand-lime"
                  >
                    {t(UI.downloadDatasheet, locale)}
                  </a>
                ) : null}
              </div>
            </motion.div>

            <motion.div
              className="relative order-1 md:order-2"
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reducedMotion ? 0 : 0.08, ease: easeOut }}
            >
              {name ? (
                <p
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-10 z-0 truncate text-center font-display text-[clamp(3rem,10vw,6.875rem)] font-black leading-none text-transparent"
                  style={{ WebkitTextStroke: "1px rgba(255,255,255,0.14)" }}
                >
                  {name}
                </p>
              ) : null}

              <div className="relative z-10 h-[420px] overflow-hidden rounded-[20px] border border-white/8 bg-[#110E33] sm:h-[600px]">
                <div
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_15%,rgba(140,198,63,0.2),transparent_55%)]"
                  aria-hidden="true"
                />
                <AnimatePresence mode="wait" initial={false}>
                  {currentImage ? (
                    <motion.div
                      key={currentImage}
                      className="absolute inset-0 flex items-center justify-center p-10 sm:p-14"
                      initial={reducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reducedMotion ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SafeImage
                        src={currentImage}
                        alt={name}
                        width={900}
                        className="max-h-full max-w-full object-contain transition-transform duration-500"
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {images.length > 1 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {images.map((src, index) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`h-14 w-14 overflow-hidden rounded-lg border ${
                        index === activeImage
                          ? "border-brand-lime"
                          : "border-white/12"
                      }`}
                      aria-label={`${index + 1}`}
                    >
                      <SafeImage
                        src={src}
                        alt=""
                        width={112}
                        className="h-full w-full object-contain bg-[#110E33] p-1"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </motion.div>
          </section>

          {hasDetailsBand ? (
            <section className="rounded-t-[28px] border-t border-white/8 bg-[#110E33] py-[90px]">
              <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 px-6 md:grid-cols-[5fr_7fr] md:gap-16">
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  {hasFeatures ? (
                    <>
                      <div className="flex items-center gap-4 text-[14px] text-white/70">
                        <span>{t(UI.productHighlights, locale)}</span>
                        <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
                        <span className="font-mono text-brand-lime" dir="ltr">
                          § 01
                        </span>
                      </div>
                      <div className="mt-[18px]">
                        {product.features.map((item, index) => {
                          const text = t(item.text, locale);
                          if (!text) return null;
                          return (
                            <div
                              key={item.id}
                              className="flex items-baseline gap-5 border-b border-white/12 py-[22px]"
                            >
                              <span
                                className="font-mono text-[14px] text-brand-lime"
                                dir="ltr"
                              >
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <span className="font-display text-[22px] font-bold leading-snug md:text-[24px]">
                                {text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : null}

                  {details ? (
                    <>
                      <h3 className="mt-14 font-display text-[28px] font-extrabold">
                        {t(UI.details, locale)}
                      </h3>
                      <p className="mt-3.5 whitespace-pre-wrap text-[18px] leading-[1.8] text-white/75">
                        {details}
                      </p>
                    </>
                  ) : null}
                </motion.div>

                {hasUsage ? (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{ duration: 0.5, ease: easeOut }}
                  >
                    <div className="flex items-center gap-4 text-[14px] text-white/70">
                      <span>{t(UI.usage, locale)}</span>
                      <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
                      <span className="font-mono text-brand-lime" dir="ltr">
                        § 02 — USAGE
                      </span>
                    </div>
                    <UsageTable
                      columns={product.agriculturalColumns}
                      rows={product.agriculturalUses}
                      locale={locale}
                      reducedMotion={reducedMotion}
                    />
                    <p className="mt-4 text-[13px] text-white/55">
                      {t(UI.usageNote, locale)}
                    </p>
                  </motion.div>
                ) : null}
              </div>
            </section>
          ) : null}

          {related.length > 0 ? (
            <section className="mx-auto max-w-[1320px] px-6 pb-10 pt-[90px]">
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, ease: easeOut }}
              >
                <div className="flex items-center gap-4 text-[14px] text-white/70">
                  <span>{t(UI.relatedSameCategory, locale)}</span>
                  <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
                  <span className="font-mono text-brand-lime" dir="ltr">
                    § 03
                  </span>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((item) => {
                    const category = categories.find(
                      (entry) => entry.id === item.sectionId,
                    );
                    const sub = category?.subcategories?.find(
                      (entry) => entry.id === item.subcategoryId,
                    );
                    return (
                      <ProductCard
                        key={item.id}
                        to={`/products/${item.id}`}
                        imageUrl={item.imageUrl}
                        title={t(item.name, locale)}
                        subcategory={t(sub?.name, locale)}
                        origin={t(item.originCountry, locale)}
                      />
                    );
                  })}
                </div>
              </motion.div>
            </section>
          ) : null}

          <GrowTogetherBanner />

          <AnimatePresence>
            {waHref && showStickyWa ? (
              <motion.div
                key="sticky-wa"
                initial={reducedMotion ? false : { y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0A0820] p-3 md:hidden"
              >
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-lg bg-brand-lime px-6 py-3.5 text-[16px] font-semibold text-[#0A0820]"
                >
                  {t(UI.askAboutProductWa, locale)}
                </a>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
      ) : null}
    </>
  );
}
