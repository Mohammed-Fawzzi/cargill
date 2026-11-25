import React from "react";
import { useLocale } from "@/context/LocaleContext";
import { TRUST_ITEMS } from "@/constants/cinematic";
import { t } from "@/lib/i18n";

export default function TrustStrip() {
  const { locale } = useLocale();

  return (
    <section className="border-b border-line/10 bg-page">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-0 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
        {TRUST_ITEMS.map((item, index) => (
          <React.Fragment key={item.en}>
            {index > 0 ? (
              <span
                className="mx-3 hidden h-3 w-px bg-line/20 sm:mx-5 sm:block"
                aria-hidden="true"
              />
            ) : null}
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink/55 sm:text-[11px]">
              {t(item, locale)}
            </p>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
