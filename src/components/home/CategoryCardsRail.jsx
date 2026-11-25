import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import SectionIntro from "@/components/ui/SectionIntro";
import { useLocale } from "@/context/LocaleContext";
import { getCategories, getProducts } from "@/services/cms/products";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";


function isSeedsCategory(category) {
  const ar = String(category?.name?.ar || "").toLowerCase();
  const en = String(category?.name?.en || "").toLowerCase();
  const id = String(category?.id || "").toLowerCase();
  return ar.includes("بذور") || en.includes("seed") || id.includes("seed");
}

export default function CategoryCardsRail() {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();

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

  const categories = useMemo(() => {
    const list = (categoriesQuery.data || []).filter(
      (category) => !isSeedsCategory(category),
    );
    const products = productsQuery.data || [];
    return list.map((category) => {
      const cover = products.find(
        (product) => product.sectionId === category.id && product.imageUrl,
      );
      return {
        ...category,
        imageUrl: cover?.imageUrl || "",
      };
    });
  }, [categoriesQuery.data, productsQuery.data]);

  if (!categories.length) return null;

  return (
    <motion.section
      className="border-y border-white/8 bg-transparent py-12 md:py-16"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionIntro
          className="mb-8 md:mb-8"
          label={t(UI.nav.products, locale)}
          title={t(UI.categoryRailTitle, locale)}
          titleClassName="font-display text-2xl font-bold text-white md:text-3xl"
          body={t(UI.productsIntro, locale)}
          bodyClassName="hidden max-w-xs text-left text-xs text-white/55 sm:block"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => {
            const name = t(category.name, locale);
            const number = String(index + 1).padStart(2, "0");

            return (
              <motion.div
                key={category.id}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: reducedMotion ? 0 : index * 0.08,
                  ease: easeOut,
                }}
              >
                <Link
                  to={`/products?section=${encodeURIComponent(category.id)}`}
                  className="group relative flex h-96 flex-col justify-between overflow-hidden rounded-2xl border border-white/8 bg-[#110E33] p-6 transition-colors duration-300 hover:border-brand-lime/50"
                >
                  <div className="absolute inset-0 z-0">
                    {category.imageUrl ? (
                      <SafeImage
                        src={category.imageUrl}
                        alt={name}
                        width={640}
                        className="h-full w-full object-cover opacity-35 transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0820] via-[#110E33]/80 to-transparent" />
                  </div>

                  <div className="relative z-10">
                    <span
                      className="rounded-full border border-brand-lime/30 bg-[#0A0820]/80 px-2 py-0.5 font-mono text-xs text-brand-lime"
                      dir="ltr"
                    >
                      {number}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-2">
                    <h3 className="font-display text-xl font-bold text-white transition-colors group-hover:text-brand-lime">
                      {name}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-lime">
                      <span>{t(UI.exploreSolutions, locale)}</span>
                      <span
                        className="transition-transform duration-300 group-hover:-translate-x-0.5"
                        aria-hidden="true"
                      >
                        ←
                      </span>
                    </span>
                    <span className="block h-px w-0 bg-brand-lime transition-[width] duration-500 group-hover:w-full" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
