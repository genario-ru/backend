export const getNextPage = (currentPage: number, totalPages: number) => {
  return currentPage < totalPages ? currentPage + 1 : null;
};

export const getPreviousPage = (currentPage: number) => {
  return currentPage > 1 ? currentPage - 1 : null;
};

export const getTotalPages = (totalItems: number, perPage: number) => {
  return Math.ceil(totalItems / perPage);
};
