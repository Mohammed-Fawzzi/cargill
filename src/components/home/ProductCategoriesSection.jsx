import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { easeOut } from "@/lib/motion";

export default function ProductCategoriesSection({ section }) {
  const { locale } = useLocale();
  const title = t(section?.data?.title, locale);
  const body = t(section?.data?.body, locale);
  const items = section?.items || [];

  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-24">
      {title ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-6 select-none text-center text-[4.5rem] font-black uppercase leading-none tracking-[0.08em] text-brand-ink/[0.045] sm:top-8 sm:text-[7rem] lg:text-[9.5rem]"
          aria-hidden="true"
        >
          {title}
        </div>
      ) : null}

      <div className="relative container mx-auto px-4 lg:px-8">
        <Reveal className="mb-10 text-center lg:mb-14">
          {title ? (
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h2>
          ) : null}
          {body ? (
            <p className="mx-auto max-w-2xl text-sm leading-8 text-text-muted sm:text-base">
              {body}
            </p>
          ) : null}
        </Reveal>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {items.map((item, itemIndex) => {
              const name = t(item.name, locale);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 36, clipPath: "inset(18% 0 18% 0)" }}
                  whileInView={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0% 0)" }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.7, ease: easeOut, delay: itemIndex * 0.07 }}
                >
                  <Link
                    to={`/products?section=${encodeURIComponent(item.id)}`}
                    className="group relative block aspect-[3/4] overflow-hidden bg-brand-forest shadow-[0_14px_40px_rgba(24,16,96,0.12)]"
                  >
                    {item.imageUrl ? (
                      <SafeImage
                        src={item.imageUrl}
                        alt={name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-moss to-brand-forest-deep" />
                    )}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-brand-black/88 via-brand-black/25 to-brand-black/35 transition-opacity duration-500 group-hover:from-brand-black/92"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute inset-x-0 top-0 h-1 origin-start scale-x-0 bg-brand-lime transition-transform duration-500 group-hover:scale-x-100"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-x-0 top-0 p-5 sm:p-6">
                      <h3 className="text-lg font-extrabold uppercase tracking-[0.1em] text-white transition-colors duration-300 group-hover:text-brand-lime sm:text-xl">
                        {name}
                      </h3>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:p-6">
                      <span className="text-sm font-bold text-brand-lime">→</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
