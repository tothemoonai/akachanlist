import { useQuery } from '@tanstack/react-query';
import { getReviewBySlug } from '../lib/supabase';
import { Review } from '../types/reviews';

export function useReviewBySlug(slug: string) {
  const reviewQuery = useQuery({
    queryKey: ['review', slug],
    queryFn: () => getReviewBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    review: reviewQuery.data,
    isLoading: reviewQuery.isLoading,
    isError: reviewQuery.isError,
    error: reviewQuery.error,
  };
}
