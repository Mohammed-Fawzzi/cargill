import React from "react";

export default function PageBanner({ title, subtitle, imageUrl }) {
  return (
    <section className="relative overflow-hidden bg-brand-black py-16 text-white sm:py-20">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-l from-brand-black/85 to-brand-forest/70" />
      <div className="relative container mx-auto px-4 lg:px-8">
        <span className="mb-4 inline-block h-8 w-1.5 rounded-full bg-brand-lime" />
        {title ? (
          <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        ) : null}
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
