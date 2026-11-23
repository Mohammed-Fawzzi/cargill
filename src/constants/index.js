import React from "react";

export const Home = React.lazy(() => import("@/pages/home/Home"));
export const About = React.lazy(() => import("@/pages/about/About"));
export const Products = React.lazy(() => import("@/pages/products/Products"));
export const ProductDetails = React.lazy(
  () => import("@/pages/products/ProductDetails"),
);
export const Articles = React.lazy(() => import("@/pages/articles/Articles"));
export const ArticleDetails = React.lazy(
  () => import("@/pages/articles/ArticleDetails"),
);
export const Events = React.lazy(() => import("@/pages/events/Events"));
export const EventDetails = React.lazy(
  () => import("@/pages/events/EventDetails"),
);
export const Contact = React.lazy(() => import("@/pages/contact/Contact"));
export const NotFound = React.lazy(() => import("@/pages/not-found/NotFound"));
