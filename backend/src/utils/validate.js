const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isEmail = (value) =>
  typeof value === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const parseServiceId = (value) => {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  if (!Number.isSafeInteger(id) || id > 2147483647) {
    return null;
  }

  return id;
};

const parsePrice = (value) => {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && /^[1-9]\d*$/.test(value.trim())) {
    const price = Number(value.trim());
    if (price <= 2147483647) {
      return price;
    }
  }

  return null;
};

module.exports = {
  isNonEmptyString,
  isEmail,
  parseServiceId,
  parsePrice,
};
