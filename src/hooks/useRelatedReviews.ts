import { useQuery } from '@tanstack/react-query';
import { getReviewsByItemId } from '../lib/supabase';

export function useRelatedReviews(itemId: string) {
  const relatedQuery = useQuery({
    queryKey: ['reviews', 'item', itemId],
    queryFn: () => getReviewsByItemId(itemId),
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    relatedReviews: relatedQuery.data || [],
    isLoading: relatedQuery.isLoading,
    isError: relatedQuery.isError,
    error: relatedQuery.error,
  };
}
