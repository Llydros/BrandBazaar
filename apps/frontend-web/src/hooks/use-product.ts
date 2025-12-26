import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductWithReviews, CreateReviewRequest } from "@shared/products";

export function useProduct(productId: string | null) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) throw new Error("Product ID is required");
      const response = await api.products.getById(productId);
      return response.product;
    },
    enabled: !!productId,
  });
}

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) =>
      api.products.createReview(productId, data),
    onSuccess: () => {
      // Invalidate and refetch product data to show new review
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({
        queryKey: ["reviews", productId],
      });
    },
  });
}

