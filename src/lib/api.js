import axios from "axios";

// Determine the base URL dynamically based on how the user accessed the site
// If accessed via localhost, hit localhost:3001. If accessed via network IP, hit networkIP:3001
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

export default api;
