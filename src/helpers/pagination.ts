// PaginationUtil.ts (or wherever your utility functions are)

import { PaginationDto } from './pagination.dto';

export interface PaginateResponse {
  prevPage: number | null;
  currentPage: number | null;
  nextPage: number | null;
  lastPage: number;
  totalCount: number;
  result: any[];
}

export const paginateResponse = (
  dataAndTotal: any,
  paginationDto: PaginationDto,
): PaginateResponse => {
  const [result, total] = dataAndTotal;
  const lastPage = Math.ceil(total / paginationDto.limit);
  const nextPage =
    paginationDto.page < lastPage ? +paginationDto.page + 1 : null;
  const prevPage = paginationDto.page > 1 ? paginationDto.page - 1 : null;

  // Sort the result array if sortBy is provided
  if (paginationDto.sortBy) {
    result.sort((a, b) => {
      const sortOrderFactor = paginationDto.sortOrder === 'asc' ? 1 : -1;
      return (
        sortOrderFactor * (a[paginationDto.sortBy] - b[paginationDto.sortBy])
      );
    });
  }

  return {
    totalCount: total,
    prevPage,
    currentPage: +paginationDto.page,
    nextPage,
    lastPage,
    result,
  };
};
