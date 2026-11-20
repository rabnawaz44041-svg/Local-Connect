const CURRENCIES = {
  US: "USD",
  KR: "KRW",
  IN: "INR",
  PK: "PKR",
  GB: "GBP",
  JP: "JPY",
  CN: "CNY",
  EU: "EUR",
  DE: "EUR",
  FR: "EUR",
  CA: "CAD",
  AU: "AUD",
  AE: "AED",
  SG: "SGD",
  BR: "BRL",
};

const MILE_COUNTRIES = new Set(["US", "GB", "LR", "MM"]);

function currencyForCountry(countryCode) {
  return CURRENCIES[countryCode] || "USD";
}

function usesMiles(countryCode) {
  return MILE_COUNTRIES.has(countryCode);
}

module.exports = {
  currencyForCountry,
  usesMiles,
};
