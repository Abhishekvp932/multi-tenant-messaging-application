import axios from "axios";

const api = axios.create({
  baseURL:import.meta.env.VITE_API_URL,
  withCredentials: true,
});

import { toast } from "react-toastify";

api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.log('API Error:', error.response?.status, error.response?.data);
    
    if (error.code === "ERR_NETWORK") {
      toast.error("Network error! Check server or internet.");
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      console.log('401 Unauthorized - checking auth flow');
      toast.error("Please login again");
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      toast.error("You do not have permission to access this.");
      return Promise.reject(error);
    }

    if (error.response?.status >= 500) {
      toast.error("Server error, please try again later.");
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

export default api;
