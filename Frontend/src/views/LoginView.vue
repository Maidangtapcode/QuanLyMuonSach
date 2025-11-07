<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();

const msnvOrMaDocGia = ref('');
const password = ref('');
const userType = ref('docgia'); 
const loginError = ref(false);
const loading = ref(false); 

async function handleLogin() {
    loginError.value = false;
    loading.value = true; 

    let credentials;
    if (userType.value === 'nhanvien') {
        credentials = {
            MSNV: msnvOrMaDocGia.value,
            Password: password.value,
        };
    } else {
        credentials = {
            MaDocGia: msnvOrMaDocGia.value,
            Password: password.value,
        };
    }

    const success = await authStore.login(credentials, userType.value);

    if (!success) {
        loginError.value = true;
    }
    
    loading.value = false;
}
</script>

<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">
                <div class="card mt-5 shadow-sm">
                    <div class="card-body p-4">
                        <h2 class="card-title text-center mb-4">
                            Đăng nhập Hệ thống
                        </h2>
                        <form @submit.prevent="handleLogin">
                            <ul class="nav nav-pills nav-fill mb-3">
                                <li class="nav-item">
                                    <a 
                                        class="nav-link"
                                        :class="{ 'active': userType === 'docgia' }"
                                        href="#"
                                        @click="userType = 'docgia'"
                                    >
                                        <i class="fa-solid fa-user-graduate me-1"></i> Độc giả
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a 
                                        class="nav-link"
                                        :class="{ 'active': userType === 'nhanvien' }"
                                        href="#"
                                        @click="userType = 'nhanvien'"
                                    >
                                        <i class="fa-solid fa-user-tie me-1"></i> Nhân viên
                                    </a>
                                </li>
                            </ul>

                            <div class="mb-3">
                                <label for="ma" class="form-label">
                                    {{ userType === 'docgia' ? 'Mã Độc Giả' : 'Mã Số Nhân Viên' }}
                                </label>
                                <div class="input-group">
                                    <span class="input-group-text">
                                        <i class="fa-solid fa-user"></i>
                                    </span>
                                    <input
                                        type="text"
                                        class="form-control"
                                        id="ma"
                                        v-model="msnvOrMaDocGia"
                                        required
                                    />
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="password" class="form-label">Mật khẩu</label>
                                <div class="input-group">
                                     <span class="input-group-text">
                                        <i class="fa-solid fa-lock"></i>
                                    </span>
                                    <input
                                        type="password"
                                        class="form-control"
                                        id="password"
                                        v-model="password"
                                        required
                                    />
                                </div>
                            </div>

                            <div v-if="loginError" class="alert alert-danger">
                                <i class="fa-solid fa-triangle-exclamation me-2"></i>
                                Mã hoặc mật khẩu không chính xác.
                            </div>

                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

.container {
    padding-top: 5rem;
}
</style>