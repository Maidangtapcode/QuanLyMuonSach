<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authApiService } from '@/services/api.service';
const props = defineProps({
    publisherId: { type: String, default: null }
});

const router = useRouter();
const isEditMode = computed(() => !!props.publisherId);
const publisher = ref({
    MaNXB: '',
    TenNXB: '',
    DiaChi: ''
});

async function fetchPublisher() {
    if (!isEditMode.value) return;
    try {
        const response = await authApiService.get(`/nhaxuatbans/${props.publisherId}`);
        publisher.value = response.data;
    } catch (err) {
        alert("Không thể tải thông tin NXB: " + (err.response?.data?.message || err.message));
    }
}

async function handleSubmit() {
    try {
        if (isEditMode.value) {
            await authApiService.put(`/nhaxuatbans/${props.publisherId}`, publisher.value);
        } else {
            await authApiService.post('/nhaxuatbans', publisher.value);
        }
        alert("Lưu thành công!");
        router.push('/admin/publishers');
    } catch (err) {
        alert("Lưu thất bại: " + (err.response?.data?.message || "Lỗi không xác định"));
    }
}

onMounted(() => {
    fetchPublisher();
});
</script>

<template>
    <form @submit.prevent="handleSubmit">
        <div class="mb-3">
            <label class="form-label">Mã NXB</label>
            <input type="text" class="form-control" v-model="publisher.MaNXB" required :disabled="isEditMode">
        </div>
        <div class="mb-3">
            <label class="form-label">Tên NXB</label>
            <input type="text" class="form-control" v-model="publisher.TenNXB" required>
        </div>
        <div class="mb-3">
            <label class="form-label">Địa Chỉ</label>
            <input type="text" class="form-control" v-model="publisher.DiaChi" required>
        </div>
        
        <div class="d-flex justify-content-between">
            <RouterLink to="/admin/publishers" class="btn btn-secondary">Quay lại</RouterLink>
            <button type="submit" class="btn btn-primary">
                {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
            </button>
        </div>
    </form>
</template>