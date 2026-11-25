import React from "react";
import { Link } from "react-router-dom";
import SafeImage from "@/components/ui/SafeImage";

export default function ContentCard({
  to,
  imageUrl,
  title,
  body,
  category,
  secondary,
  layout = "default",
  imageFit = "cover",
}) {
  const horizontal = layout === "horizontal";
  const contain = imageFit === "contain";

  return (
    <article className="h-full">
      <Link
        to={to}
        className={`group relative flex h-full ${
          horizontal
            ? "flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-10"
            : "flex-col"
        }`}
      >
        <div
          className={`relative overflow-hidden rounded-md bg-surface-muted ${
            horizontal
              ? "aspect-[4/3] w-full sm:aspect-auto sm:w-[46%] sm:min-h-[280px]"
              : contain
                ? "aspect-[4/3] w-full"
                : "aspect-[16/10] w-full"
          }`}
        >
          {imageUrl ? (
            <SafeImage
              src={imageUrl}
              alt={title || ""}
              className={`h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
                contain ? "object-contain p-4" : "object-cover"
              }`}
            />
          ) : (
            <div className="flex h-full min-h-[180px] items-center justify-center px-4 text-center text-sm font-semibold text-brand-ink/50">
              {title}
            </div>
          )}
        </div>

        <div
          className={`flex min-w-0 flex-1 flex-col ${
            horizontal ? "justify-center pb-5 sm:pb-2" : "pt-4 pb-5"
          }`}
        >
          {category || secondary ? (
            <p className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              {category ? (
                <span className="font-semibold text-brand-lime">{category}</span>
              ) : null}
              {category && secondary ? (
                <span className="text-brand-ink/25" aria-hidden="true">
                  ·
                </span>
              ) : null}
              {secondary ? (
                <span className="text-text-muted">{secondary}</span>
              ) : null}
            </p>
          ) : null}

          {title ? (
            <h3 className="mb-2 line-clamp-2 text-[22px] font-extrabold leading-8 text-brand-ink">
              {title}
            </h3>
          ) : null}

          {body ? (
            <p className="mb-4 line-clamp-2 text-sm leading-7 text-text-muted">
              {body}
            </p>
          ) : null}

          <span
            className="mt-auto inline-flex h-8 w-8 items-center justify-center text-brand-ink transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            aria-hidden="true"
          >
            →
          </span>
        </div>

        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-brand-ink/15"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-brand-lime transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}
