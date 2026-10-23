export function paginate(items, page = 1, limit = 20) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const total = items.length;
  const totalPages = Math.ceil(total / limitNum);
  const offset = (pageNum - 1) * limitNum;
  const paginatedItems = items.slice(offset, offset + limitNum);

  return {
    items: paginatedItems,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
  };
}
