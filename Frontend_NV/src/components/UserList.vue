<script setup>
import { ref, onMounted } from 'vue';
import { authApiService } from '@/services/api.service';

const users = ref([]);
const loading = ref(true);
const error = ref(null);

// Tải danh sách độc giả
async function fetchUsers() {
    loading.value = true;
    try {
        const response = await authApiService.get('/docgias');
        users.value = response.data;
    } catch (err) {
        error.value = "Không thể tải danh sách Độc giả.";
        console.error(err);
    } finally {
        loading.value = false;
    }
}

// Xóa độc giả
async function handleDelete(id, name) {
    if (confirm(`Bạn có chắc muốn xóa độc giả "${name}"?`)) {
        try {
            await authApiService.delete(`/docgias/${id}`);
            alert("Đã xóa thành công!");
            await fetchUsers(); //tải lại
        } catch (err) {
            alert("Lỗi: Không thể xóa độc giả này (có thể họ đang mượn sách).");
            console.error(err);
        }
    }
}

onMounted(() => {
    fetchUsers();
});
</script>

<template>
    <div>
        <div v-if="loading" class="text-center">
            <div class="spinner-border text-primary" role="status"></div>
        </div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        
        <div v-else>
            <table class="table table-bordered table-hover shadow-sm">
                <thead class="table-dark">
                    <tr>
                        <th>Mã ĐG</th>
                        <th>Họ và Tên</th>
                        <th>Giới tính</th>
                        <th>Năm Sinh</th>
                        <th>Điện thoại</th>
                        <th>Địa chỉ</th>
                        <th class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user._id">
                        <td>{{ user.MaDocGia }}</td>
                        <td>{{ user.HoLot }} {{ user.Ten }}</td>
                        <td>{{ user.Phai }}</td>
                        <td>{{ user.NgaySinh }}</td>
                        <td>{{ user.DienThoai }}</td>
                        <td>{{ user.DiaChi }}</td>
                        <td class="text-center" style="width: 150px;">
                            <RouterLink 
                                :to="{ name: 'admin-users-edit', params: { id: user._id } }"
                                class="btn btn-sm btn-warning me-2"
                                title="Sửa"
                            >
                                <i class="fa-solid fa-pen-to-square"></i>
                            </RouterLink>
                            <button 
                                class="btn btn-sm btn-danger" 
                                @click="handleDelete(user._id, user.Ten)"
                                title="Xóa"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>