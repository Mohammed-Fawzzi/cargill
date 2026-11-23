import { useQuery } from "@tanstack/react-query";
import { loadHomePage } from "@/services/cms/homepage";

export function useHomePage() {
  return useQuery({
    queryKey: ["cms", "homepage", "assembled"],
    queryFn: loadHomePage,
    staleTime: 1000 * 60 * 2,
  });
}
