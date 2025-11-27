<script setup>
import { ref, onMounted } from 'vue';
import { authApiService } from '@/services/api.service';

const publishers = ref([]);
const loading = ref(true);
const error = ref(null);

async function fetchPublishers() {
    loading.value = true;
    try {
        const response = await authApiService.get('/nhaxuatbans');
        publishers.value = response.data;
    } catch (err) {
        alert("Không thể tải thông tin NXB: " + (err.response?.data?.message || err.message));
    } finally {
        loading.value = false;
    }
}

async function handleDelete(id, name) {
    if (confirm(`Bạn có chắc muốn xóa NXB "${name}"?`)) {
        try {
            await authApiService.delete(`/nhaxuatbans/${id}`);
            alert("Đã xóa thành công!");
            await fetchPublishers(); // Tải lại danh sách
        } catch (err) {
            alert("Không thể xóa thông tin NXB: " + (err.response?.data?.message || err.message));
        }
    }
}

onMounted(() => {
    fetchPublishers();
});
</script>

<template>
    <div>
        <div v-if="loading" class="text-center">Đang tải...</div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        
        <div v-else>
            <table class="table table-bordered table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Mã NXB</th>
                        <th>Tên NXB</th>
                        <th>Địa Chỉ</th>
                        <th class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="pub in publishers" :key="pub._id">
                        <td>{{ pub.MaNXB }}</td>
                        <td>{{ pub.TenNXB }}</td>
                        <td>{{ pub.DiaChi }}</td>
                        <td class="text-center">
                            <RouterLink 
                                :to="{ name: 'admin-publishers-edit', params: { id: pub._id } }"
                                class="btn btn-sm btn-warning me-2"
                            >
                                <i class="fa-solid fa-pen-to-square"></i>
                            </RouterLink>
                            <button class="btn btn-sm btn-danger" @click="handleDelete(pub._id, pub.TenNXB)">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>