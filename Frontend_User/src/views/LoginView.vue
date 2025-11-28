<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const maDocGia = ref('');
const password = ref('');
const loginError = ref(false);
const loading = ref(false);

async function handleLogin() {
    loginError.value = false;
    loading.value = true;
    const credentials = {
        MaDocGia: maDocGia.value,
        Password: password.value,
    };

    const success = await authStore.login(credentials);
    if (!success) loginError.value = true;
    loading.value = false;
}
</script>

<template>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-5">
                <div class="card mt-5 shadow-sm border-0 rounded-4">
                    <div class="card-body p-5">
                        <div class="text-center mb-4">
                            <i class="fa-solid fa-book-open-reader fa-3x text-primary mb-3"></i>
                            <h2 class="card-title fw-bold">Thư Viện Online</h2>
                            <p class="text-muted">Đăng nhập để mượn sách</p>
                        </div>
                        
                        <form @submit.prevent="handleLogin">
                            <div class="mb-3">
                                <label class="form-label">Mã Độc Giả</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light"><i class="fa-solid fa-id-card"></i></span>
                                    <input type="text" class="form-control" v-model="maDocGia" placeholder="Ví dụ: DG001" required />
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="form-label">Mật khẩu</label>
                                <div class="input-group">
                                     <span class="input-group-text bg-light"><i class="fa-solid fa-lock"></i></span>
                                    <input type="password" class="form-control" v-model="password" required />
                                </div>
                            </div>

                            <div v-if="loginError" class="alert alert-danger text-center">
                                Sai Mã Độc Giả hoặc Mật khẩu.
                            </div>

                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary btn-lg rounded-pill" :disabled="loading">
                                    {{ loading ? 'Đang xử lý...' : 'Đăng nhập ngay' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>