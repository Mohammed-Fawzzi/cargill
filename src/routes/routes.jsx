import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Loading from "@/components/loading/Loading";
import {
  Home,
  About,
  Products,
  ProductDetails,
  Articles,
  ArticleDetails,
  Events,
  EventDetails,
  Contact,
  Finder,
  NotFound,
} from "@/constants";

function withSuspense(element) {
  return <Suspense fallback={<Loading />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: withSuspense(<Home />) },
      { path: "products", element: withSuspense(<Products />) },
      { path: "products/:id", element: withSuspense(<ProductDetails />) },
      { path: "articles", element: withSuspense(<Articles />) },
      { path: "articles/:id", element: withSuspense(<ArticleDetails />) },
      { path: "events", element: withSuspense(<Events />) },
      { path: "events/:id", element: withSuspense(<EventDetails />) },
      { path: "about", element: withSuspense(<About />) },
      { path: "contact", element: withSuspense(<Contact />) },
      { path: "finder", element: withSuspense(<Finder />) },
      { path: "*", element: withSuspense(<NotFound />) },
    ],
  },
]);
