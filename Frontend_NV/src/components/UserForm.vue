<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authApiService } from '@/services/api.service';

const props = defineProps({
    userId: { type: String, default: null }
});

const router = useRouter();
const isEditMode = computed(() => !!props.userId);

const user = ref({
    MaDocGia: '',
    HoLot: '',
    Ten: '',
    NgaySinh: '',
    Phai: 'Nam', // Mặc định
    DiaChi: '',
    DienThoai: '',
    Password: '' // Trường mật khẩu
});

const loading = ref(false);

// Tải thông tin độc giả khi ở chế độ Sửa
async function fetchUser() {
    if (!isEditMode.value) return;
    loading.value = true;
    try {
        const response = await authApiService.get(`/docgias/${props.userId}`);
        const data = response.data;
        
        // Gán dữ liệu vào form
        user.value = { ...data, Password: '' }; // Không hiển thị mật khẩu cũ
    } catch (err) {
        console.error(err);
        alert("Không thể tải thông tin độc giả.");
    } finally {
        loading.value = false;
    }
}

// Lưu dữ liệu
async function handleSubmit() {
    loading.value = true;
    try {
        const userDataToSend = { ...user.value };
        if (isEditMode.value && !userDataToSend.Password) {
            delete userDataToSend.Password;
        }

        if (isEditMode.value) {
            await authApiService.put(`/docgias/${props.userId}`, userDataToSend);
        } else {
            await authApiService.post('/docgias', userDataToSend);
        }
        
        alert("Lưu thành công!");
        router.push('/admin/users');
    } catch (err) {
        alert("Lưu thất bại: " + (err.response?.data?.message || "Lỗi không xác định"));
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchUser();
});
</script>

<template>
    <form @submit.prevent="handleSubmit" class="p-3 border rounded shadow-sm bg-white">
        <div class="row">
            <div class="col-md-4 mb-3">
                <label class="form-label">Mã Độc Giả</label>
                <input type="text" class="form-control" v-model="user.MaDocGia" required :disabled="isEditMode">
            </div>
            <div class="col-md-4 mb-3">
                <label class="form-label">Họ Lót</label>
                <input type="text" class="form-control" v-model="user.HoLot" required>
            </div>
            <div class="col-md-4 mb-3">
                <label class="form-label">Tên</label>
                <input type="text" class="form-control" v-model="user.Ten" required>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4 mb-3">
                <label class="form-label">Ngày Sinh</label>
                <input type="date" class="form-control" v-model="user.NgaySinh" required>
            </div>
            <div class="col-md-4 mb-3">
                <label class="form-label">Phái</label>
                <select class="form-select" v-model="user.Phai">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                </select>
            </div>
            <div class="col-md-4 mb-3">
                <label class="form-label">Điện Thoại</label>
                <input type="tel" class="form-control" v-model="user.DienThoai" required>
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label">Địa Chỉ</label>
            <input type="text" class="form-control" v-model="user.DiaChi" required>
        </div>

        <div class="mb-3">
            <label class="form-label">Mật khẩu {{ isEditMode ? '(Bỏ trống nếu không đổi)' : '' }}</label>
            <input 
                type="password" 
                class="form-control" 
                v-model="user.Password" 
                :required="!isEditMode" 
            >
        </div>
        
        <hr>

        <div class="d-flex justify-content-between">
            <RouterLink to="/admin/users" class="btn btn-secondary">
                <i class="fa-solid fa-arrow-left me-1"></i> Quay lại
            </RouterLink>
            <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
            </button>
        </div>
    </form>
</template>