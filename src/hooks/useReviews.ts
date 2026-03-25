import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviews, createReview, updateReview, deleteReview } from '../lib/supabase';
import { Review, ReviewFilters } from '../types/reviews';

export function useReviews(filters: ReviewFilters = {}) {
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ['reviews', filters],
    queryFn: () => getReviews(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (review: Partial<Review>) => createReview(review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, review }: { id: string; review: Partial<Review> }) =>
      updateReview(id, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  return {
    reviews: reviewsQuery.data?.reviews || [],
    count: reviewsQuery.data?.count || 0,
    isLoading: reviewsQuery.isLoading,
    isError: reviewsQuery.isError,
    error: reviewsQuery.error,
    createReview: createMutation.mutate,
    updateReview: updateMutation.mutate,
    deleteReview: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
