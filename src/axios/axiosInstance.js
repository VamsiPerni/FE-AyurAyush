import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 60000,
  withCredentials: true,
});

// Redirect to login on 401 (expired/invalid session)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/auth/me")
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export { axiosInstance };
