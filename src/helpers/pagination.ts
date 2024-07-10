// PaginationUtil.ts (or wherever your utility functions are)

export interface PaginateResponse {
  prevPage: number | null;
  currentPage: number | null;
  nextPage: number | null;
  lastPage: number;
  totalCount: number;
  result: any[];
}

export const paginateResponse = (
  data: { data: any[]; total: number },
  page: number,
  limit: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
): PaginateResponse => {
  const { data: result, total } = data;
  const lastPage = Math.ceil(total / limit);
  const nextPage = page < lastPage ? +page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  // Sort the result array if sortBy is provided
  if (sortBy) {
    result.sort((a, b) => {
      const sortOrderFactor = sortOrder === 'asc' ? 1 : -1;
      return sortOrderFactor * (a[sortBy] - b[sortBy]);
    });
  }

  return {
    totalCount: total,
    prevPage,
    currentPage: +page,
    nextPage,
    lastPage,
    result,
  };
};
