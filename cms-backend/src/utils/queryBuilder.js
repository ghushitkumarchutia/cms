const queryBuilder = (querySource, filterableFields = []) => {
  const reqQuery = { ...querySource };

  const removeFields = ["select", "sort", "page", "limit", "search"];
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`,
  );

  const filter = JSON.parse(queryStr);

  if (querySource.search) {
    filter.$text = { $search: querySource.search };
  }

  let select = "";
  if (querySource.select) {
    select = querySource.select.split(",").join(" ");
  }

  let sort = "-createdAt";
  if (querySource.sort) {
    sort = querySource.sort.split(",").join(" ");
  }

  const page = parseInt(querySource.page, 10) || 1;
  const limit = parseInt(querySource.limit, 10) || 10;
  const skip = (page - 1) * limit;

  return {
    filter,
    select,
    sort,
    page,
    limit,
    skip,
  };
};

module.exports = queryBuilder;
