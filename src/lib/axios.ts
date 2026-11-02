import axios from "axios";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/errorHandler";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    // Optionally grab token from storage or context and inject it here
    // const token = localStorage.getItem('token');
    // if (token) { config.headers.Authorization = `Bearer ${token}`; }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "An unexpected error occurred";
    
    // Check specific HTTP status codes
    if (err.response?.status === 429) {
      toast.error(getErrorMessage(err));
    } else if (err.response?.status === 401) {
      // Handle unauthorized (e.g., clear tokens, redirect to login path, etc.)
      toast.error("Session expired. Please log in again.");
    } else if (err.response?.status === 403) {
      toast.error("You do not have permission to perform this action.");
    } else {
      toast.error(message);
    }

    console.error("API Error:", message);
    return Promise.reject(err);
  }
);