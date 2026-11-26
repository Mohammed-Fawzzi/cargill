import React, { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import SafeMedia from "@/components/ui/SafeMedia";
import MonoLabel from "@/components/ui/MonoLabel";
import Loading from "@/components/loading/Loading";
import { ErrorState } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getProducts } from "@/services/cms/products";
import {
  collectUsageIndex,
  diseasesForCrop,
  matchProducts,
} from "@/lib/fieldIndex";
import { toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const stepEase = { duration: 0.3, ease: easeOut };

export default function Finder() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const [params, setParams] = useSearchParams();
  const cropKey = params.get("crop") || "";
  const issueKey = params.get("issue") || "";

  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });

  const index = useMemo(
    () => collectUsageIndex(productsQuery.data || [], locale),
    [productsQuery.data, locale],
  );

  const step = !cropKey && !issueKey ? 1 : cropKey && !issueKey ? 2 : 3;
  const crop = index.crops.find((item) => item.key === cropKey);
  const issues = diseasesForCrop(index, cropKey);
  const matches = matchProducts(index, cropKey, issueKey);
  const phone = contact?.phones?.[0] || "";

  useEffect(() => {
    if (cropKey && !crop && index.crops.length) {
      const next = new URLSearchParams(params);
      next.delete("crop");
      next.delete("issue");
      setParams(next, { replace: true });
    }
  }, [cropKey, crop, index.crops.length, params, setParams]);

  const setCrop = (key) => {
    const next = new URLSearchParams();
    next.set("crop", key);
    setParams(next);
  };

  const setIssue = (key) => {
    const next = new URLSearchParams(params);
    next.set("issue", key);
    setParams(next);
  };

  const goBack = () => {
    const next = new URLSearchParams(params);
    if (cropKey && issueKey) next.delete("issue");
    else if (cropKey) next.delete("crop");
    else next.delete("issue");
    setParams(next);
  };

  if (productsQuery.isPending) return <Loading />;
  if (productsQuery.isError) {
    return (
      <main className="pt-navbar">
        <ErrorState onRetry={productsQuery.refetch} />
      </main>
    );
  }

  return (
    <>
      <Seo title={t(UI.findSolution, locale)} path="/finder" />
      <main className="min-h-screen bg-page pb-20 pt-[calc(var(--navbar-height)+var(--ticker-height)+2rem)]">
        <div className="container mx-auto max-w-5xl px-4 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <MonoLabel className="mb-3 text-brand-lime/80">
                0{step} / 03
              </MonoLabel>
              <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                {t(UI.findSolution, locale)}
              </h1>
            </div>
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="border border-line/20 px-4 py-2 text-sm font-bold text-ink transition-colors hover:border-brand-lime hover:text-brand-lime"
              >
                {t(UI.finderBack, locale)}
              </button>
            ) : null}
          </div>

          <div className="mb-8 h-px overflow-hidden bg-line/15">
            <div
              className="h-full bg-brand-lime transition-[width] duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.section
                key="step-1"
                initial={reducedMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -12 }}
                transition={stepEase}
              >
                <h2 className="mb-5 text-xl font-extrabold text-ink">
                  {t(UI.finderStepCrop, locale)}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {index.crops.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setCrop(item.key)}
                      className="group overflow-hidden border border-line/12 bg-surface text-start transition-colors hover:border-brand-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
                    >
                      <div className="relative aspect-[4/3] bg-brand-navy">
                        {item.imageUrl || item.videoUrl ? (
                          <SafeMedia
                            src={item.imageUrl}
                            videoUrl={item.videoUrl || ""}
                            alt=""
                            className="cinema-grade h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : null}
                      </div>
                      <p className="px-3 py-2.5 text-sm font-bold text-ink">
                        {item.label}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.section>
            ) : null}

            {step === 2 ? (
              <motion.section
                key="step-2"
                initial={reducedMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -12 }}
                transition={stepEase}
              >
                <h2 className="mb-2 text-xl font-extrabold text-ink">
                  {t(UI.finderStepIssue, locale)}
                </h2>
                <p className="mb-5 font-mono text-[11px] tracking-[0.16em] text-ink/45">
                  {crop?.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {issues.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setIssue(item.key)}
                      className="border border-line/15 px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-brand-lime hover:text-brand-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {!issues.length ? (
                  <p className="mt-6 text-sm text-ink/60">
                    {t(UI.finderNoMatch, locale)}
                  </p>
                ) : null}
              </motion.section>
            ) : null}

            {step === 3 ? (
              <motion.section
                key="step-3"
                initial={reducedMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: -12 }}
                transition={stepEase}
              >
                <h2 className="mb-5 text-xl font-extrabold text-ink">
                  {t(UI.finderStepResults, locale)}
                </h2>
                {matches.length ? (
                  <div className="space-y-4">
                    {matches.map((match) => {
                      const name = t(match.product.name, locale);
                      const message = t(UI.finderAskMessage, locale)
                        .replace("[المحصول]", match.crop || "")
                        .replace("[المشكلة]", match.disease || "")
                        .replace("[المنتج]", name || "");
                      const wa = toWhatsAppHref(phone, message);
                      return (
                        <article
                          key={`${match.productId}-${match.diseaseKey}-${match.dose}`}
                          className="grid grid-cols-1 gap-4 border border-line/12 bg-surface p-4 sm:grid-cols-[7rem_1fr] sm:p-5"
                        >
                          <div className="relative aspect-square overflow-hidden bg-page">
                            {match.product.imageUrl || match.product.videoUrl ? (
                              <SafeMedia
                                src={match.product.imageUrl}
                                videoUrl={match.product.videoUrl || ""}
                                alt={name}
                                className="h-full w-full object-contain p-2"
                              />
                            ) : null}
                          </div>
                          <div>
                            <Link
                              to={`/products/${match.productId}`}
                              className="text-lg font-extrabold text-ink transition-colors hover:text-brand-lime"
                            >
                              {name}
                            </Link>
                            <p className="mt-2 font-mono text-[11px] leading-6 tracking-[0.08em] text-ink/60">
                              {[match.crop, match.disease, match.dose, match.phi]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                            {wa ? (
                              <a
                                href={wa}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex border border-brand-lime bg-brand-lime px-4 py-2 text-sm font-extrabold text-brand-navy transition-colors hover:bg-brand-lime-hover"
                              >
                                {t(UI.finderAskWa, locale)}
                              </a>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border border-line/12 bg-surface p-6">
                    <p className="mb-4 text-base leading-8 text-ink/75">
                      {t(UI.finderNoMatch, locale)}
                    </p>
                    {phone ? (
                      <a
                        href={toWhatsAppHref(
                          phone,
                          t(UI.finderNoMatchMessage, locale),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex bg-brand-lime px-4 py-2.5 text-sm font-extrabold text-brand-navy"
                      >
                        {t(UI.finderAskWa, locale)}
                      </a>
                    ) : null}
                  </div>
                )}
              </motion.section>
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
