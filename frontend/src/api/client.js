import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join(" ");
  }
  if (typeof data?.message === "string") {
    return data.message;
  }
  if (!error?.response) {
    return "The app cannot reach the API. In the backend folder, run npm run dev, then refresh this page.";
  }
  return fallback;
}

export default api;
