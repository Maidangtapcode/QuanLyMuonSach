<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { authApiService } from '@/services/api.service';// Dùng apiService thường, nhưng cần auth (chúng ta đã cấu hình interceptor rồi)

const authStore = useAuthStore();
const activeTab = ref('info'); // 'info' hoặc 'password'
const loading = ref(false);

// Dữ liệu form thông tin
const userInfo = ref({
    HoLot: '', Ten: '', NgaySinh: '', Phai: 'Nam', DiaChi: '', DienThoai: ''
});

// Dữ liệu form đổi mật khẩu
const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// Lấy thông tin user mới nhất từ Server
async function fetchProfile() {
    // Vì ta chưa có API get /profile, ta có thể dùng lại thông tin trong authStore
    // Hoặc gọi API get user by ID. Ở đây tạm dùng authStore cho nhanh
    const user = authStore.user;
    userInfo.value = { ...user };
}

// Cập nhật thông tin
async function handleUpdateProfile() {
    loading.value = true;
    try {
        const response = await authApiService.put('/docgias/profile', userInfo.value);
        alert("Cập nhật thành công!");
        // Cập nhật lại kho Pinia và LocalStorage
        authStore.user = { ...authStore.user, ...response.data.user };
        localStorage.setItem("user", JSON.stringify(authStore.user));
    } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
        loading.value = false;
    }
}

// Đổi mật khẩu
async function handleChangePassword() {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }
    
    loading.value = true;
    try {
        await authApiService.post('/docgias/change-password', {
            oldPassword: passwordForm.value.oldPassword,
            newPassword: passwordForm.value.newPassword
        });
        alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        authStore.logout();
    } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchProfile();
});
</script>

<template>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow-sm border-0">
                    <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
                        <ul class="nav nav-tabs card-header-tabs">
                            <li class="nav-item">
                                <a class="nav-link fw-bold" :class="{ active: activeTab === 'info' }" href="#" @click.prevent="activeTab = 'info'">
                                    <i class="fa-solid fa-user me-2"></i> Thông tin cá nhân
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link fw-bold" :class="{ active: activeTab === 'password' }" href="#" @click.prevent="activeTab = 'password'">
                                    <i class="fa-solid fa-key me-2"></i> Đổi mật khẩu
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="card-body p-4">
                        <form v-if="activeTab === 'info'" @submit.prevent="handleUpdateProfile">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Họ Lót</label>
                                    <input type="text" class="form-control" v-model="userInfo.HoLot" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Tên</label>
                                    <input type="text" class="form-control" v-model="userInfo.Ten" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Ngày sinh</label>
                                <input type="date" class="form-control" v-model="userInfo.NgaySinh">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Điện thoại</label>
                                <input type="tel" class="form-control" v-model="userInfo.DienThoai">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Địa chỉ</label>
                                <input type="text" class="form-control" v-model="userInfo.DiaChi">
                            </div>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <i class="fa-solid fa-save me-1"></i> Lưu thay đổi
                            </button>
                        </form>

                        <form v-if="activeTab === 'password'" @submit.prevent="handleChangePassword">
                            <div class="mb-3">
                                <label class="form-label">Mật khẩu cũ</label>
                                <input type="password" class="form-control" v-model="passwordForm.oldPassword" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Mật khẩu mới</label>
                                <input type="password" class="form-control" v-model="passwordForm.newPassword" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Xác nhận mật khẩu mới</label>
                                <input type="password" class="form-control" v-model="passwordForm.confirmPassword" required>
                            </div>
                            <button type="submit" class="btn btn-danger" :disabled="loading">
                                Xác nhận đổi mật khẩu
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>