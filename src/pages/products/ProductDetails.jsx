import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import SafeImage from "@/components/ui/SafeImage";
import LtrText from "@/components/ui/LtrText";
import RevealHeading from "@/components/ui/RevealHeading";
import GrowTogetherBanner from "@/components/shared/GrowTogetherBanner";
import RegistrationBadge from "@/components/products/RegistrationBadge";
import ProductCard from "@/components/products/ProductCard";
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
  return (
    /[\d%]/.test(String(value || "")) ||
    /سم3|سم³|لتر|كجم|ml|L\b|PHI/i.test(String(value || ""))
  );
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

function FactRow({ label, value, accent = false, last = false }) {
  if (!value) return null;
  return (
    <div
      className={`flex items-center justify-between gap-6 py-3 ${last ? "" : "border-b border-white/8"
        }`}
    >
      <span className="text-[15px] text-white/55">{label}</span>
      <span
        className={`max-w-[65%] text-end text-[15px] font-semibold ${accent ? "text-brand-lime" : "text-white"
          }`}
      >
        <ValueText value={value} />
      </span>
    </div>
  );
}

function UsageTable({ columns, rows, locale, reducedMotion }) {
  if (!columns?.length || !rows?.length) return null;

  return (
    <>
      <div className="hidden w-full overflow-x-auto rounded-lg bg-[#1B1931] md:block">
        <table className="w-full min-w-[640px] text-right text-[15px]">
          <thead className="bg-[#1F1D35] text-[13px] text-white/55">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="px-4 py-4 text-start font-semibold"
                  scope="col"
                >
                  {columnLabel(col, locale)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-white">
            {rows.map((row, index) => (
              <motion.tr
                key={row.id}
                className="transition-colors hover:bg-[#1F1D35]/60"
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.4,
                  delay: reducedMotion
                    ? 0
                    : Math.min(index * 0.08, 0.32),
                  ease: easeOut,
                }}
              >
                {columns.map((col, colIndex) => {
                  const value = t(row.cells?.[col.id], locale);
                  const isDose = col.id === "dose";
                  const isFirst = colIndex === 0;
                  return (
                    <td
                      key={col.id}
                      className={`px-4 py-4 align-middle ${isDose
                          ? "font-bold text-brand-lime"
                          : isFirst
                            ? "font-medium text-white"
                            : "text-white/70"
                        }`}
                    >
                      {isFirst && value ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full bg-brand-lime"
                            aria-hidden="true"
                          />
                          <ValueText value={value} />
                        </span>
                      ) : col.id === "phi" && value ? (
                        <span className="inline-block rounded bg-[#1F1D35] px-2 py-1 text-[11px] font-semibold tracking-wide text-white">
                          <ValueText value={value} />
                        </span>
                      ) : (
                        <ValueText value={value} />
                      )}
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {rows.map((row) => {
          const cropCol = columns.find((col) => col.id === "crop") || columns[0];
          const title = t(row.cells?.[cropCol?.id], locale);
          const rest = columns.filter((col) => col.id !== cropCol?.id);
          return (
            <article
              key={row.id}
              className="rounded-lg bg-[#1B1931] p-4"
            >
              {title ? (
                <h3 className="mb-3 inline-flex items-center gap-2 text-base font-extrabold text-white">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-brand-lime"
                    aria-hidden="true"
                  />
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
                        className={`text-sm ${col.id === "dose"
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

function SectionLabel({ index, title }) {
  return (
    <div className="flex items-center gap-2 pb-3">
      <span className="text-[11px] font-semibold tracking-widest text-brand-lime">
        {String(index).padStart(2, "0")}
      </span>
      <h2 className="font-display text-[22px] font-semibold text-white md:text-[30px] md:leading-[38px]">
        {title}
      </h2>
    </div>
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
  const [stageHot, setStageHot] = useState(false);

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
  const registrationNumber = product?.registrationNumber || "";
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
      return `${label} ${item.percentage}`;
    })
    .filter(Boolean)
    .join(" · ");

  const featureItems = useMemo(() => {
    if (!product?.features?.length) return [];
    return product.features
      .map((item) => ({ id: item.id, text: t(item.text, locale) }))
      .filter((item) => item.text);
  }, [product?.features, locale]);

  const related = useMemo(() => {
    const list = productsQuery.data || [];
    return list
      .filter(
        (item) =>
          item.id !== id &&
          product?.sectionId &&
          item.sectionId === product.sectionId,
      )
      .slice(0, 2);
  }, [productsQuery.data, id, product?.sectionId]);

  const phone = contact?.phones?.[0] || "";
  const waMessage = t(UI.askAboutProductMessage, locale).replace(
    "{name}",
    name || "",
  );
  const waHref = toWhatsAppHref(phone, waMessage);
  const visitHref = toWhatsAppHref(
    phone,
    t(UI.askAgronomistMessage, locale),
  );
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
    subcategoryName ? { label: subcategoryName, current: true } : null,
  ].filter(Boolean);

  const hasFeatures = featureItems.length > 0;
  const hasUsage = Boolean(product?.agriculturalUses?.length);
  const hasDetails = Boolean(details);
  const hasUsageSection = hasDetails || hasUsage;
  const sectionIndex = {
    features: hasFeatures ? 1 : 0,
    usage: hasFeatures ? 2 : 1,
    related: (hasFeatures ? 1 : 0) + (hasUsageSection ? 1 : 0) + 1,
  };

  return (
    <>
      <Seo title={name || t(UI.nav.products, locale)} path={`/products/${id}`} />
      {productQuery.isPending ? <Loading /> : null}
      {!productQuery.isPending && productQuery.isError ? (
        <ErrorState onRetry={productQuery.refetch} />
      ) : null}
      {!productQuery.isPending && !productQuery.isError && !product ? (
        <main className="pt-navbar min-h-screen bg-transparent">
          <EmptyState message={t(UI.missingProduct, locale)} />
        </main>
      ) : null}
      {!productQuery.isPending && product ? (
        <main className="min-h-screen bg-transparent pb-28 text-white md:pb-0">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 py-6 sm:px-8 lg:px-14">
            <div className="flex items-center justify-between gap-4 pt-[calc(var(--navbar-height)+0.5rem)]">
              {crumbParts.length ? (
                <nav
                  aria-label="Breadcrumb"
                  className="flex flex-wrap items-center gap-1 text-[13px] text-white/60"
                >
                  {crumbParts.map((item, index) => (
                    <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
                      {index > 0 ? (
                        <span className="text-white/30" aria-hidden="true">
                          /
                        </span>
                      ) : null}
                      {item.to && !item.current ? (
                        <Link
                          to={item.to}
                          className="transition-colors hover:text-brand-lime"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span
                          className={
                            item.current
                              ? "font-medium text-brand-lime"
                              : "text-white/60"
                          }
                        >
                          {item.label}
                        </span>
                      )}
                    </span>
                  ))}
                </nav>
              ) : (
                <span />
              )}
              <Link
                to="/products"
                className="inline-flex shrink-0 items-center gap-1 text-[13px] text-brand-lime transition-colors hover:text-brand-lime-hover"
              >
                <span aria-hidden="true">←</span>
                <span>{t(UI.backToAllProducts, locale)}</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-7 lg:grid-cols-12">
              <motion.div
                className={`product-stage group relative order-2 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-[#1B1931] p-7 lg:order-1 lg:col-span-6 ${stageHot ? "is-hot" : ""
                  }`}
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: easeOut }}
                onMouseEnter={() => setStageHot(true)}
                onMouseLeave={() => setStageHot(false)}
              >
                {subcategoryName || categoryName ? (
                  <div className="relative z-10 mb-4 flex w-full items-center justify-between">
                    <span className="rounded bg-[#292740]/90 px-2 py-1 text-[11px] font-semibold tracking-wide text-brand-lime">
                      {subcategoryName || categoryName}
                    </span>
                  </div>
                ) : null}

                <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-[#0D0B23]">
                  <AnimatePresence mode="wait" initial={false}>
                    {currentImage ? (
                      <motion.div
                        key={currentImage}
                        className="absolute inset-0 flex items-center justify-center p-6 sm:p-10"
                        initial={reducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reducedMotion ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SafeImage
                          src={currentImage}
                          alt={name}
                          width={900}
                          className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                {packaging ? (
                  <div className="mt-4 grid w-full grid-cols-1 gap-1 pt-2">
                    <div className="rounded bg-[#1F1D35] p-3 text-center">
                      <span className="block text-[11px] font-medium tracking-wide text-white/55">
                        {t(UI.packaging, locale)}
                      </span>
                      <span className="mt-1 block text-[15px] font-semibold text-white">
                        <ValueText value={packaging} />
                      </span>
                    </div>
                  </div>
                ) : null}

                {images.length > 1 ? (
                  <div className="mt-4 flex w-full flex-wrap gap-2">
                    {images.map((src, index) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        className={`h-14 w-14 overflow-hidden rounded-lg border ${index === activeImage
                            ? "border-brand-lime"
                            : "border-white/12"
                          }`}
                        aria-label={`${index + 1}`}
                      >
                        <SafeImage
                          src={src}
                          alt=""
                          width={112}
                          className="h-full w-full bg-[#0D0B23] object-contain p-1"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </motion.div>

              <motion.div
                className="order-1 flex flex-col justify-between py-1 lg:order-2 lg:col-span-6"
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: reducedMotion ? 0 : 0.08,
                  ease: easeOut,
                }}
              >
                <div className="flex flex-col gap-4">
                  {categoryName || subcategoryName ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {categoryName ? (
                        <span className="rounded bg-[#292740] px-2 py-1 text-[11px] font-semibold tracking-wide text-brand-lime">
                          {categoryName}
                        </span>
                      ) : null}
                      {subcategoryName && subcategoryName !== categoryName ? (
                        <>
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-white/25"
                            aria-hidden="true"
                          />
                          <span className="text-[13px] text-white/55">
                            {subcategoryName}
                          </span>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  <div>
                    {name ? (
                      <RevealHeading
                        as="h1"
                        text={name}
                        className="font-display text-[clamp(2.25rem,6vw,3.5rem)] font-bold leading-none tracking-tight text-white"
                      />
                    ) : null}
                    {overview ? (
                      <p className="mt-3 text-[18px] leading-[1.7] text-white/55">
                        {overview}
                      </p>
                    ) : null}
                  </div>

                  {categoryName || compositionSummary || origin ? (
                    <div className="mt-2 rounded-lg bg-[#1B1931] px-4 py-1">
                      <FactRow
                        label={t(UI.categoryFact, locale)}
                        value={
                          [categoryName, subcategoryName]
                            .filter(Boolean)
                            .filter(
                              (item, index, list) => list.indexOf(item) === index,
                            )
                            .join(" · ") || categoryName
                        }
                      />
                      <FactRow
                        label={t(UI.ingredients, locale)}
                        value={compositionSummary}
                        accent
                      />
                      <FactRow
                        label={t(UI.origin, locale)}
                        value={origin}
                        last
                      />
                    </div>
                  ) : null}

                  {registrationNumber ? (
                    <RegistrationBadge number={registrationNumber} />
                  ) : null}
                </div>

                <div
                  ref={mainCtaRef}
                  className="flex flex-col items-stretch gap-3 pt-7 sm:flex-row sm:items-center"
                >
                  {waHref ? (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full flex-1 items-center justify-center gap-2 rounded bg-brand-lime px-4 py-3 text-[15px] font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
                    >
                      {t(UI.askAboutProductWa, locale)}
                    </a>
                  ) : null}
                  {visitHref ? (
                    <a
                      href={visitHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded bg-[#1F1D35] px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#292740] sm:w-auto"
                    >
                      {t(UI.requestFieldVisit, locale)}
                    </a>
                  ) : null}
                  {datasheetUrl ? (
                    <a
                      href={datasheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-b border-brand-lime pb-0.5 text-center text-[13px] text-white transition-colors hover:text-brand-lime sm:ms-2"
                    >
                      {t(UI.downloadDatasheet, locale)}
                    </a>
                  ) : null}
                </div>
              </motion.div>
            </div>

            {hasFeatures ? (
              <motion.section
                className="flex flex-col gap-4 pt-4"
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, ease: easeOut }}
              >
                <SectionLabel
                  index={sectionIndex.features}
                  title={t(UI.productHighlights, locale)}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {featureItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-lg bg-[#1B1931] p-7 transition-colors hover:bg-[#1F1D35]"
                      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{
                        duration: 0.45,
                        delay: reducedMotion
                          ? 0
                          : Math.min(index * 0.08, 0.32),
                        ease: easeOut,
                      }}
                    >
                      <span className="font-display text-[40px] font-bold leading-none text-brand-lime">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-[15px] leading-relaxed text-white/70 md:text-base">
                        {item.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ) : null}

            {hasUsageSection ? (
              <motion.section
                className="flex flex-col gap-4 pt-4"
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.5, ease: easeOut }}
              >
                <SectionLabel
                  index={sectionIndex.usage}
                  title={t(UI.detailsAndUsage, locale)}
                />

                {hasDetails ? (
                  <div className="rounded-lg bg-[#1B1931] p-4 md:p-5">
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/55">
                      {details}
                    </p>
                  </div>
                ) : null}

                {hasUsage ? (
                  <>
                    <UsageTable
                      columns={product.agriculturalColumns}
                      rows={product.agriculturalUses}
                      locale={locale}
                      reducedMotion={reducedMotion}
                    />
                    <p className="px-1 text-[13px] text-brand-lime">
                      {t(UI.usageNote, locale)}
                    </p>
                  </>
                ) : null}
              </motion.section>
            ) : null}

            {related.length > 0 ? (
              <motion.section
                className="flex flex-col gap-4 pt-4"
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, ease: easeOut }}
              >
                <div className="flex items-end justify-between gap-4 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold tracking-widest text-brand-lime">
                      {String(sectionIndex.related).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-[22px] font-semibold text-white md:text-[30px] md:leading-[38px]">
                      {t(UI.relatedSameCategory, locale)}
                    </h2>
                  </div>
                  <Link
                    to="/products"
                    className="hidden shrink-0 items-center gap-1 pb-1 text-[13px] text-brand-lime transition-colors hover:text-brand-lime-hover sm:inline-flex"
                  >
                    <span>{t(UI.viewProductsCatalog, locale)}</span>
                    <span aria-hidden="true">←</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                  {related.map((item, index) => {
                    const relatedCategory = categories.find(
                      (entry) => entry.id === item.sectionId,
                    );
                    return (
                      <motion.div
                        key={item.id}
                        className="self-start"
                        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                          duration: 0.45,
                          delay: reducedMotion
                            ? 0
                            : Math.min(index * 0.08, 0.16),
                          ease: easeOut,
                        }}
                      >
                        <ProductCard
                          to={`/products/${item.id}`}
                          imageUrl={item.imageUrl}
                          title={t(item.name, locale)}
                          category={t(relatedCategory?.name, locale)}
                          origin={t(item.originCountry, locale)}
                          overview={
                            t(item.overview, locale) || t(item.details, locale)
                          }
                          index={index}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            ) : null}
          </div>

          <div className="mt-8">
            <GrowTogetherBanner />
          </div>

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
