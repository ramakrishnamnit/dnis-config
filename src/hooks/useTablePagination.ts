/**
 * Hook to manage table pagination state
 */

import { useState, useCallback, useEffect } from "react";

export interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function useTablePagination(initialPageSize: number = 50) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    totalCount: 0,
    totalPages: 0,
  });

  /**
   * Update total count and recalculate total pages
   */
  const setTotalCount = useCallback((count: number) => {
    setPagination((prev) => ({
      ...prev,
      totalCount: count,
      totalPages: Math.ceil(count / prev.pageSize),
    }));
  }, []);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, prev.totalPages),
    }));
  }, []);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  }, []);

  /**
   * Go to first page
   */
  const firstPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  /**
   * Go to last page
   */
  const lastPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: prev.totalPages,
    }));
  }, []);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages)),
    }));
  }, []);

  /**
   * Change page size
   */
  const setPageSize = useCallback((size: number) => {
    setPagination((prev) => {
      const newTotalPages = Math.ceil(prev.totalCount / size);
      return {
        ...prev,
        pageSize: size,
        totalPages: newTotalPages,
        page: Math.min(prev.page, newTotalPages || 1), // Adjust current page if needed
      };
    });
  }, []);

  /**
   * Reset to first page (useful when filters change)
   */
  const resetToFirstPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  /**
   * Reset pagination completely
   */
  const reset = useCallback(() => {
    setPagination({
      page: 1,
      pageSize: initialPageSize,
      totalCount: 0,
      totalPages: 0,
    });
  }, [initialPageSize]);

  return {
    pagination,
    setTotalCount,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    goToPage,
    setPageSize,
    resetToFirstPage,
    reset,
  };
}

