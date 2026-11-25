import { lazyWithRetry } from "@/lib/lazyWithRetry";

export const Home = lazyWithRetry(() => import("@/pages/home/Home"));
export const About = lazyWithRetry(() => import("@/pages/about/About"));
export const Products = lazyWithRetry(() => import("@/pages/products/Products"));
export const ProductDetails = lazyWithRetry(
  () => import("@/pages/products/ProductDetails"),
);
export const Articles = lazyWithRetry(() => import("@/pages/articles/Articles"));
export const ArticleDetails = lazyWithRetry(
  () => import("@/pages/articles/ArticleDetails"),
);
export const Events = lazyWithRetry(() => import("@/pages/events/Events"));
export const EventDetails = lazyWithRetry(
  () => import("@/pages/events/EventDetails"),
);
export const Contact = lazyWithRetry(() => import("@/pages/contact/Contact"));
export const Finder = lazyWithRetry(() => import("@/pages/finder/Finder"));
export const NotFound = lazyWithRetry(() => import("@/pages/not-found/NotFound"));
