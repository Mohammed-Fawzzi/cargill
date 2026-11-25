import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
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
          (product) => product.sectionId === category.id && product.imageUrl,
        );
        return {
          id: category.id,
          name: t(category.name, locale),
          imageUrl: cover?.imageUrl || "",
        };
      });
  }, [categoriesQuery.data, productsQuery.data, locale]);

  if (!tiles.length) return null;

  return (
    <motion.section
      className="relative z-20 mx-auto mt-[-50px] max-w-[1320px] px-6 md:mt-[-80px]"
      initial={reducedMotion ? false : { opacity: 0, y: 40 }}
      animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.55, ease: easeOut, delay: reducedMotion ? 0 : 0.15 }}
    >
      <div className="flex flex-col gap-2.5 md:h-[300px] md:flex-row md:gap-2.5">
        {tiles.map((tile, index) => {
          const isActive = active === index;
          return (
            <Link
              key={tile.id}
              to={`/products?section=${encodeURIComponent(tile.id)}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              className={`group relative flex h-[140px] flex-col justify-between overflow-hidden rounded-[14px] border p-6 text-white transition-[flex,border-color] ease-out md:h-full md:p-7 ${
                isActive
                  ? "border-brand-lime/40 md:flex-[2]"
                  : "border-white/10 md:flex-1"
              }`}
              style={{
                background: "#110E33",
                transitionDuration: reducedMotion ? "0ms" : "500ms",
              }}
            >
              {tile.imageUrl ? (
                <SafeImage
                  src={tile.imageUrl}
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
                className="relative font-mono text-[13px] text-brand-lime"
                dir="ltr"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="relative">
                <p
                  className={`font-display font-extrabold leading-tight transition-colors group-hover:text-brand-lime ${
                    isActive ? "text-[28px] sm:text-[40px]" : "text-[22px] sm:text-[26px]"
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
