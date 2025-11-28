import { defineStore } from "pinia";
import { ref } from "vue";
import router from "@/router";
import { apiService } from "@/services/api.service";

export const useAuthStore = defineStore("auth", () => {
    const token = ref(localStorage.getItem("token") || null);
    const user = ref(JSON.parse(localStorage.getItem("user")) || null);

    async function login(credentials) {
        try {
            // Gọi API đăng nhập của Nhân viên
            const response = await apiService.post('/nhanviens/login', credentials);
            const data = response.data;

            // Cập nhật state
            token.value = data.token;
            user.value = data.user;

            // Lưu vào localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Chuyển hướng ngay đến Dashboard
            router.push("/admin");

            return true;
        } catch (error) {
            console.error("Lỗi đăng nhập:", error.response?.data?.message || error.message);
            return false;
        }
    }

    function logout() {
        // Xóa state
        token.value = null;
        user.value = null;

        // Xóa localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Quay về trang login
        router.push("/login");
    }
    
    function hasRole(roleName) {
        return user.value && user.value.ChucVu === roleName;
    }

    return {
        token,
        user,
        login,
        logout,
        hasRole
    };
});