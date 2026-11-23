import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { router } from "@/routes/routes";
import { LocaleProvider } from "@/context/LocaleContext";
import { getCompanyContact } from "@/services/cms/contact";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

queryClient.prefetchQuery({
  queryKey: ["cms", "contact"],
  queryFn: getCompanyContact,
  staleTime: 1000 * 60 * 30,
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <MotionConfig reducedMotion="user">
          <RouterProvider router={router} />
        </MotionConfig>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
