import { defineStore } from "pinia";
import { ref } from "vue";
import router from "@/router";
import { apiService } from "@/services/api.service"; 

export const useAuthStore = defineStore("auth", () => {
    const token = ref(localStorage.getItem("token") || null);
    const user = ref(JSON.parse(localStorage.getItem("user")) || null);

    async function login(credentials, userType = "docgia") {
        try {
            const endpoint = userType === "nhanvien" 
                ? "/nhanviens/login" 
                : "/docgias/login";
            
            const response = await apiService.post(endpoint, credentials);
            const data = response.data;
            
            // Lưu vào "state" của Pinia
            token.value = data.token;
            user.value = data.user;

            // Lưu vào localStorage để giữ đăng nhập
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Điều hướng người dùng
            if (userType === "nhanvien") {
                router.push("/admin");
            } else {
                router.push("/home"); 
            }

            return true;
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            return false;
        }
    }

    function logout() {
        // Xóa khỏi Pinia state
        token.value = null;
        user.value = null;

        // Xóa khỏi localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Đẩy về trang Login
        router.push("/login");
    }

    // Hàm kiểm tra
    function isAdmin() {
        return user.value && user.value.ChucVu; 
    }
    return {
        token,
        user,
        login,
        logout,
        isAdmin
    };
});