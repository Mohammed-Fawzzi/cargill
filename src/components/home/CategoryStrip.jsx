import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import SafeMedia from "@/components/ui/SafeMedia";
import { useLocale } from "@/context/LocaleContext";
import { getCategories, getProducts } from "@/services/cms/products";
import { t } from "@/lib/i18n";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

export default function CategoryStrip({ ready = true }) {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const [active, setActive] = useState(0);

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

  const tiles = useMemo(() => {
    const products = productsQuery.data || [];
    return (categoriesQuery.data || [])
      .filter((category) => {
        const ar = String(category?.name?.ar || "").toLowerCase();
        const en = String(category?.name?.en || "").toLowerCase();
        const id = String(category?.id || "").toLowerCase();
        return !ar.includes("بذور") && !en.includes("seed") && !id.includes("seed");
      })
      .slice(0, 3)
      .map((category) => {
        const cover = products.find(
          (product) =>
            product.sectionId === category.id &&
            (product.imageUrl || product.videoUrl),
        );
        return {
          id: category.id,
          name: t(category.name, locale),
          imageUrl: category.imageUrl || cover?.imageUrl || "",
          videoUrl: category.videoUrl || cover?.videoUrl || "",
        };
      });
  }, [categoriesQuery.data, productsQuery.data, locale]);

  if (!tiles.length) return null;

  return (
    <motion.section
      className="relative z-20 mx-auto mt-[-50px] max-w-[1320px] px-4 sm:px-6 md:mt-[-80px]"
      initial={reducedMotion ? false : { opacity: 0, y: 40 }}
      animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.55, ease: easeOut, delay: reducedMotion ? 0 : 0.15 }}
    >
      <div className="flex h-[200px] flex-row gap-2 sm:h-[240px] md:h-[300px] md:gap-2.5">
        {tiles.map((tile, index) => {
          const isActive = active === index;
          return (
            <Link
              key={tile.id}
              to={`/products?section=${encodeURIComponent(tile.id)}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={(event) => {
                if (active !== index) {
                  event.preventDefault();
                  setActive(index);
                }
              }}
              className={`group relative flex h-full min-w-0 flex-col justify-between overflow-hidden rounded-[14px] border p-3 text-white transition-[flex,border-color] ease-out sm:p-6 md:p-7 ${
                isActive
                  ? "flex-[2.2] border-brand-lime/40"
                  : "flex-1 border-white/10"
              }`}
              style={{
                background: "#110E33",
                transitionDuration: reducedMotion ? "0ms" : "500ms",
              }}
            >
              {tile.imageUrl || tile.videoUrl ? (
                <SafeMedia
                  src={tile.imageUrl}
                  videoUrl={tile.videoUrl || ""}
                  alt=""
                  width={isActive ? 900 : 480}
                  className="absolute inset-0 h-full w-full object-cover"
                  aria-hidden="true"
                />
              ) : null}
              <div className="absolute inset-0 bg-[#0A0820]/72" />
              {isActive ? (
                <div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(140,198,63,0.22),transparent_55%)]"
                  aria-hidden="true"
                />
              ) : null}

              <span
                className="relative font-mono text-[10px] text-brand-lime sm:text-[13px]"
                dir="ltr"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="relative min-w-0">
                <p
                  className={`font-display font-extrabold leading-snug transition-colors group-hover:text-brand-lime ${
                    isActive
                      ? "text-[13px] sm:text-[26px] md:text-[40px]"
                      : "text-[11px] sm:text-xl md:text-[26px]"
                  }`}
                >
                  {tile.name}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}
