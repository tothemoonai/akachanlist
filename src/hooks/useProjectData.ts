import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchProjectData, fetchLocalData } from '../utils/data';

// Query cache configuration constants
const STALE_TIME = 5 * 60 * 1000; // 5 minutes - data remains fresh for this duration
const GC_TIME = 30 * 60 * 1000; // 30 minutes - garbage collection time for unused cache entries
const MAX_RETRY_COUNT = 2; // Maximum number of retry attempts for failed queries

/**
 * Custom hook to fetch and manage project data with React Query.
 *
 * This hook fetches project data from Supabase, with automatic fallback to local JSON
 * data if Supabase fails. It handles language-aware data fetching and implements
 * intelligent caching and retry logic.
 *
 * @param projectSlug - The unique identifier for the project to fetch
 * @returns A UseQueryResult containing the project data, loading state, and error information
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useProjectData('my-project');
 * ```
 */
export function useProjectData(projectSlug: string): UseQueryResult<Awaited<ReturnType<typeof fetchProjectData>>, Error> {
  const { language, isLanguageReady } = useLanguage();

  return useQuery({
    queryKey: ['project', projectSlug, language],
    queryFn: async () => {
      try {
        return await fetchProjectData(projectSlug, language);
      } catch (error) {
        // 降级到本地 JSON
        console.warn('Supabase failed, falling back to local JSON:', error);
        return await fetchLocalData(language);
      }
    },
    enabled: isLanguageReady,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: (failureCount, error) => {
      // Supabase 错误不重试，直接降级到本地数据
      if (error?.message?.includes('Supabase')) {
        return false;
      }
      return failureCount < MAX_RETRY_COUNT;
    },
  });
}
