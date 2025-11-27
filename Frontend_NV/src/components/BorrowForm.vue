<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authApiService } from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const borrow = ref({
    MaDocGia: '',
    MaSach: '',
    NgayMuon: new Date().toISOString().split('T')[0], // Mặc định hôm nay
    MSNV: authStore.user?.MSNV || '' // Lấy MSNV từ người đang đăng nhập
});

const books = ref([]);
const readers = ref([]);
const loading = ref(false);

// Tải dữ liệu cho Dropdown
async function fetchDropdownData() {
    try {
        const [booksRes, readersRes] = await Promise.all([
            authApiService.get('/sachs'),
            authApiService.get('/docgias')
        ]);
        books.value = booksRes.data;
        readers.value = readersRes.data;
    } catch (err) {
        alert("Lỗi tải dữ liệu.");
        console.error(err); 
    }
}

// Lọc sách: Chỉ lấy sách còn hàng (soQuyenHienCo > 0)
const availableBooks = computed(() => {
    return books.value.filter(b => b.soQuyenHienCo > 0);
});

async function handleSubmit() {
    loading.value = true;
    try {
        await authApiService.post('/muonsachs', borrow.value);
        alert("Mượn sách thành công!");
        router.push('/admin/borrows');
    } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || "Không thể tạo phiếu mượn"));
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchDropdownData();
});
</script>

<template>
    <form @submit.prevent="handleSubmit" class="p-4 border rounded bg-white shadow-sm">
        <div class="mb-3">
            <label class="form-label">Chọn Độc Giả</label>
            <select class="form-select" v-model="borrow.MaDocGia" required>
                <option value="" disabled>-- Chọn Độc Giả --</option>
                <option v-for="reader in readers" :key="reader._id" :value="reader.MaDocGia">
                    {{ reader.HoLot }} {{ reader.Ten }} ({{ reader.MaDocGia }})
                </option>
            </select>
        </div>

        <div class="mb-3">
            <label class="form-label">Chọn Sách</label>
            <select class="form-select" v-model="borrow.MaSach" required>
                <option value="" disabled>-- Chọn Sách --</option>
                <option v-for="book in availableBooks" :key="book._id" :value="book.MaSach">
                    {{ book.TenSach }} (Còn: {{ book.soQuyenHienCo }})
                </option>
            </select>
            <div v-if="availableBooks.length === 0" class="form-text text-danger">
                Tất cả sách trong kho đã hết!
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label">Ngày Mượn</label>
            <input type="date" class="form-control" v-model="borrow.NgayMuon" required>
        </div>

        <div class="mb-3">
            <label class="form-label">Nhân Viên Thực Hiện</label>
            <input type="text" class="form-control" :value="borrow.MSNV" disabled>
        </div>

        <div class="d-flex justify-content-between">
            <RouterLink to="/admin/borrows" class="btn btn-secondary">Quay lại</RouterLink>
            <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Xác nhận Mượn
            </button>
        </div>
    </form>
</template>