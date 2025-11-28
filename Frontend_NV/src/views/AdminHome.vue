<script setup>
import { ref, onMounted } from 'vue';
import { authApiService } from '@/services/api.service';
// Biến lưu số liệu thống kê
const stats = ref({
    totalBooks: 0,
    totalReaders: 0,
    borrowing: 0,
    overdue: 0
});
const loading = ref(true);
// Hàm tải và tính toán số liệu
async function fetchStats() {
    loading.value = true;
    try {
        // Gọi 3 API song song
        const [booksRes, readersRes, borrowsRes] = await Promise.all([
            authApiService.get('/sachs'),
            authApiService.get('/docgias'),
            authApiService.get('/muonsachs')
        ]);

        const books = booksRes.data;
        const readers = readersRes.data;
        const borrows = borrowsRes.data;

        // Tổng số sách
        stats.value.totalBooks = books.length;

        // Tổng số độc giả
        stats.value.totalReaders = readers.length;

        // Đang mượn (những phiếu chưa có NgayTra)
        const activeBorrows = borrows.filter(item => !item.NgayTra);
        stats.value.borrowing = activeBorrows.length;

        // Quá hạn (Đang mượn và Ngày hiện tại > Hạn trả)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset giờ để so sánh ngày chính xác

        stats.value.overdue = activeBorrows.filter(item => {
            if (!item.HanTra) return false;
            const dueDate = new Date(item.HanTra);
            dueDate.setHours(0, 0, 0, 0);
            return today > dueDate;
        }).length;

    } catch (err) {
        console.error("Lỗi tải thống kê:", err);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchStats();
});
</script>

<template>
    <div class="admin-home">
        <h2 class="mb-4 text-primary fw-bold">
            <i class="fa-solid fa-chart-line me-2"></i>Tổng quan Thư viện
        </h2>

        <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Đang tổng hợp số liệu...</p>
        </div>

        <div v-else class="row g-4">
            <div class="col-md-3">
                <div class="card text-white bg-primary h-100 shadow rounded-4 border-0">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title text-uppercase mb-1 opacity-75">Tổng Đầu Sách</h6>
                                <h2 class="mt-2 mb-0 fw-bold">{{ stats.totalBooks }}</h2>
                            </div>
                            <i class="fa-solid fa-book fa-3x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card text-white bg-success h-100 shadow rounded-4 border-0">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title text-uppercase mb-1 opacity-75">Tổng Độc Giả</h6>
                                <h2 class="mt-2 mb-0 fw-bold">{{ stats.totalReaders }}</h2>
                            </div>
                            <i class="fa-solid fa-users fa-3x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card text-dark bg-warning h-100 shadow rounded-4 border-0">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title text-uppercase mb-1 opacity-75">Đang Mượn</h6>
                                <h2 class="mt-2 mb-0 fw-bold">{{ stats.borrowing }}</h2>
                            </div>
                            <i class="fa-solid fa-hand-holding-hand fa-3x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card text-white bg-danger h-100 shadow rounded-4 border-0">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title text-uppercase mb-1 opacity-75">Phiếu Quá Hạn</h6>
                                <h2 class="mt-2 mb-0 fw-bold">{{ stats.overdue }}</h2>
                            </div>
                            <i class="fa-solid fa-bell fa-3x opacity-50"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-5">
            <h4 class="mb-3 text-secondary">Truy cập nhanh</h4>
            <div class="d-flex gap-3 flex-wrap">
                <RouterLink to="/admin/borrows/new" class="btn btn-lg btn-outline-primary shadow-sm">
                    <i class="fa-solid fa-plus me-2"></i>Tạo Phiếu Mượn
                </RouterLink>
                <RouterLink to="/admin/books/new" class="btn btn-lg btn-outline-success shadow-sm">
                    <i class="fa-solid fa-book-medical me-2"></i>Nhập Sách Mới
                </RouterLink>
                <RouterLink to="/admin/users/new" class="btn btn-lg btn-outline-dark shadow-sm">
                    <i class="fa-solid fa-user-plus me-2"></i>Thêm Độc Giả
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease;
}
</style>