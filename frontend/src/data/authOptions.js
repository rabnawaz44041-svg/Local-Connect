export const COUNTRIES = [
  ["PK", "Pakistan"],
  ["IN", "India"],
  ["KR", "South Korea"],
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["AE", "United Arab Emirates"],
  ["CA", "Canada"],
  ["AU", "Australia"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["JP", "Japan"],
  ["CN", "China"],
  ["SG", "Singapore"],
  ["BR", "Brazil"],
];

export const CURRENCY_BY_COUNTRY = {
  PK: "PKR",
  IN: "INR",
  KR: "KRW",
  US: "USD",
  GB: "GBP",
  AE: "AED",
  CA: "CAD",
  AU: "AUD",
  DE: "EUR",
  FR: "EUR",
  JP: "JPY",
  CN: "CNY",
  SG: "SGD",
  BR: "BRL",
};

export const PROVIDER_CATEGORIES = [
  ["plumbing", "Plumbing"],
  ["electrical", "Electrical"],
  ["cleaning", "Cleaning"],
  ["carpentry", "Carpentry"],
  ["painting", "Painting"],
  ["hvac", "HVAC"],
  ["appliance_repair", "Appliance repair"],
  ["moving", "Moving"],
  ["pest_control", "Pest control"],
  ["other", "Other"],
];

export function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}
