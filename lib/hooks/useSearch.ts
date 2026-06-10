import { useCallback } from 'react';
import { useSearchStore } from '@/lib/store';
import type { SearchFilter } from '@/lib/store';
import type { Message } from '@/lib/types';

/**
 * 搜索和过滤 hook
 * 处理对话搜索、过滤和结果管理
 */
export function useSearch() {
  const { filter, results, isSearching, setFilter, setResults, setIsSearching, reset } = useSearchStore();

  const search = useCallback(
    async (searchFilter: SearchFilter) => {
      setFilter(searchFilter);
      setIsSearching(true);

      try {
        const params = new URLSearchParams();
        if (searchFilter.query) params.set('query', searchFilter.query);
        if (searchFilter.dateFrom) params.set('dateFrom', searchFilter.dateFrom);
        if (searchFilter.dateTo) params.set('dateTo', searchFilter.dateTo);
        if (searchFilter.model) params.set('model', searchFilter.model);
        if (searchFilter.hasCode !== undefined) params.set('hasCode', String(searchFilter.hasCode));
        if (searchFilter.tag) params.set('tag', searchFilter.tag);
        if (searchFilter.isUserMessage !== undefined) params.set('isUserMessage', String(searchFilter.isUserMessage));

        const res = await fetch(`/api/search?${params}`);
        if (res.ok) {
          const data = (await res.json()) as { results?: Message[] };
          setResults(data.results || []);
        }
      } finally {
        setIsSearching(false);
      }
    },
    [setFilter, setResults, setIsSearching]
  );

  const clearSearch = useCallback(() => {
    reset();
  }, [reset]);

  const updateFilter = useCallback(
    (newFilter: Partial<SearchFilter>) => {
      setFilter({ ...filter, ...newFilter });
    },
    [filter, setFilter]
  );

  return {
    filter,
    results,
    isSearching,
    search,
    clearSearch,
    updateFilter,
  };
}
