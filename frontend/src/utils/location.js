import api, { getErrorMessage } from "../api/client";

export function detectCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This browser cannot detect your location."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => reject(new Error("Allow location access so matches stay in your region.")),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  });
}

export async function detectRegion() {
  const coordinates = await detectCoordinates();
  try {
    const { data } = await api.get("/geo/reverse", { params: coordinates });
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not turn your location into a city."));
  }
}
