import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompanyContact } from "@/services/cms/contact";
import { getFooterSection } from "@/services/cms/homepage";

const SiteDataContext = createContext({
  contact: null,
  footer: null,
  isPending: true,
  isError: false,
});

export function SiteDataProvider({ children }) {
  const contactQuery = useQuery({
    queryKey: ["cms", "contact"],
    queryFn: getCompanyContact,
    staleTime: 1000 * 60 * 5,
  });

  const footerQuery = useQuery({
    queryKey: ["cms", "homepage", "footer"],
    queryFn: getFooterSection,
    staleTime: 1000 * 60 * 5,
  });

  const value = useMemo(
    () => ({
      contact: contactQuery.data ?? null,
      footer: footerQuery.data ?? null,
      isPending: contactQuery.isPending || footerQuery.isPending,
      isError: contactQuery.isError || footerQuery.isError,
    }),
    [contactQuery.data, contactQuery.isPending, contactQuery.isError, footerQuery.data, footerQuery.isPending, footerQuery.isError],
  );

  return (
    <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
  );
}

export function useSiteData() {
  return useContext(SiteDataContext);
}
