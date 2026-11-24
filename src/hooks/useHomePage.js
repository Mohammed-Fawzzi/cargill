import { useQuery, useQueryClient } from "@tanstack/react-query";
import { loadHomePage } from "@/services/cms/homepage";

export function useHomePage() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["cms", "homepage", "assembled"],
    queryFn: async () => {
      const payload = await loadHomePage();
      queryClient.setQueryData(["cms", "products"], payload.products);
      queryClient.setQueryData(["cms", "articles"], payload.articles);
      queryClient.setQueryData(["cms", "events"], payload.events);
      queryClient.setQueryData(["cms", "categories"], payload.categories);
      queryClient.setQueryData(["cms", "contact"], payload.contact);
      Object.entries(payload.sectionData).forEach(([id, data]) => {
        queryClient.setQueryData(["cms", "homepage", id], data);
      });
      return payload.sections;
    },
    staleTime: 1000 * 60 * 5,
  });
}
