import { defineStore } from "pinia";
import { ref } from "vue";
import router from "@/router";
import { apiService } from "@/services/api.service";

export const useAuthStore = defineStore("auth", () => {
    const token = ref(localStorage.getItem("token") || null);
    const user = ref(JSON.parse(localStorage.getItem("user")) || null);

    async function login(credentials) {
        try {
            const response = await apiService.post('/docgias/login', credentials);
            const data = response.data;

            token.value = data.token;
            user.value = data.user;

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/"); 
            return true;
        } catch (error) {
            console.error("Lỗi đăng nhập:", error.response?.data?.message || error.message);
            return false;
        }
    }

    function logout() {
        token.value = null;
        user.value = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    }
    return { token, user, login, logout };
});