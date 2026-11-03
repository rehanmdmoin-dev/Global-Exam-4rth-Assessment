const getPagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});


const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const roundPrice = (value) => Math.round(value * 100) / 100;

module.exports = { getPagination, paginationMeta, escapeRegex, roundPrice };
