import axios from "axios";
import { toast } from "sonner";
import { navigate } from "./navigation";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // baseURL: "http://localhost:5022/hisense-ts-api",
    withCredentials: true,
    timeout: 30000,
});
/**
 * RESPONSE INTERCEPTOR
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        // 🔐 Token expired / not authenticated
        if (status === 401) {
            toast.error("Session expired. Please login again.");
            localStorage.clear()
            navigate("/");
            return Promise.reject(error);
        }

        // 🚫 Rate limit
        if (status === 429) {
            toast.error("Too many requests. Please try again later.");
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;
