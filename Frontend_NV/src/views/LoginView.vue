<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const msnv = ref(''); 
const password = ref('');
const loginError = ref(false);
const loading = ref(false);

async function handleLogin() {
    loginError.value = false;
    loading.value = true;

    const credentials = {
        MSNV: msnv.value,
        Password: password.value,
    };

    // Gọi hàm login từ authStore
    const success = await authStore.login(credentials);

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
                            Đăng nhập Quản trị
                        </h2>
                        <form @submit.prevent="handleLogin">
                            <div class="mb-3">
                                <label class="form-label">Mã Số Nhân Viên</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fa-solid fa-user-tie"></i></span>
                                    <input type="text" class="form-control" v-model="msnv" required />
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Mật khẩu</label>
                                <div class="input-group">
                                     <span class="input-group-text"><i class="fa-solid fa-lock"></i></span>
                                    <input type="password" class="form-control" v-model="password" required />
                                </div>
                            </div>

                            <div v-if="loginError" class="alert alert-danger">
                                Mã nhân viên hoặc mật khẩu không đúng.
                            </div>

                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
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