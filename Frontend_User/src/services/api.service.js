import axios from "axios";

const commonConfig = {
    baseURL: "http://localhost:3000/api", 
    headers: {
        "Content-Type": "application/json",
    },
};
const apiService = axios.create(commonConfig);
const authApiService = axios.create(commonConfig);
authApiService.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            // Gắn token vào header theo chuẩn 'Bearer Token'
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export { apiService, authApiService };