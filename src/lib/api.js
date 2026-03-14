import axios from "axios";

// Determine the base URL dynamically based on how the user accessed the site
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return "http://13.206.27.99:3001";
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Intercept requests to add the Bearer token for cross-origin deployment auth
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vidsage_token");
    console.log("tolen",token);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
