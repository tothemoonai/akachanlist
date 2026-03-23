import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchProjectData, fetchLocalData } from '../utils/data';

export function useProjectData(projectSlug: string) {
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
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 30 * 60 * 1000, // 30分钟
    retry: (failureCount, error) => {
      // Supabase 错误不重试，直接降级到本地数据
      if (error instanceof Error && error.message.includes('Supabase')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
