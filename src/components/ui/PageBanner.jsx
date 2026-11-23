import React from "react";

export default function PageBanner({ title, subtitle, imageUrl }) {
  return (
    <section className="relative isolate min-h-[42vh] overflow-hidden bg-brand-forest-deep text-white sm:min-h-[48vh]">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      ) : null}
      <div
        className="absolute inset-0 bg-gradient-to-t from-brand-forest-deep via-brand-forest-deep/75 to-brand-black/45"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-l from-brand-forest-deep/70 via-transparent to-brand-black/35"
        aria-hidden="true"
      />
      <div className="relative container mx-auto flex min-h-[inherit] items-end px-4 pb-12 pt-[calc(var(--navbar-height)+3rem)] lg:px-8 lg:pb-16">
        <div className="max-w-3xl">
          {title ? (
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
