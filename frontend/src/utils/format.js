import { staffPath } from "../config/staffPath";

export function formatPrice(price, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "KRW" || currency === "JPY" ? 0 : 0,
    }).format(price);
  } catch {
    return `${price} ${currency}`;
  }
}

const MILE_COUNTRIES = new Set(["US", "GB", "LR", "MM"]);

export function formatDistance(distanceKm, countryCode) {
  if (MILE_COUNTRIES.has(countryCode)) {
    return `${(distanceKm * 0.621371).toFixed(1)} mi`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function homePathForRole(role) {
  if (role === "ADMIN") return staffPath;
  if (role === "PROVIDER") return "/provider/dashboard";
  return "/customer/dashboard";
}
