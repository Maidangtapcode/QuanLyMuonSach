<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { apiService } from '@/services/api.service';

const authStore = useAuthStore();
const borrows = ref([]);
const books = ref([]);
const loading = ref(true);
const activeTab = ref('current');
async function fetchData() {
    loading.value = true;
    try {
        const maDocGia = authStore.user.MaDocGia;
        // Gọi song song
        const [borrowsRes, booksRes] = await Promise.all([
            apiService.get(`/muonsachs?maDocGia=${maDocGia}`),
            apiService.get('/sachs')
        ]);

        borrows.value = borrowsRes.data;
        books.value = booksRes.data;
    } catch (err) {
        console.error("Lỗi:", err);
    } finally {
        loading.value = false;
    }
}

// Hàm lấy tên sách từ mã
function getBookName(maSach) {
    const book = books.value.find(b => b.MaSach === maSach);
    return book ? book.TenSach : maSach;
}

// Hàm kiểm tra quá hạn
function isOverdue(item) {
    if (item.NgayTra) return false;
    if (!item.HanTra) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(item.HanTra);
    dueDate.setHours(0, 0, 0, 0);
    return today > dueDate;
}

// Lọc danh sách đang mượn
const currentBorrows = computed(() => {
    return borrows.value.filter(item => !item.NgayTra);
});

// Lọc danh sách lịch sử
const historyBorrows = computed(() => {
    return borrows.value.filter(item => item.NgayTra);
});
function formatCurrency(amount) {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="container py-5">
        <h2 class="mb-4 fw-bold text-primary">
            <i class="fa-solid fa-bookmark me-2"></i>Sách của tôi
        </h2>

        <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'current' }" href="#"
                    @click.prevent="activeTab = 'current'">
                    Đang mượn <span class="badge bg-primary ms-1">{{ currentBorrows.length }}</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'history' }" href="#"
                    @click.prevent="activeTab = 'history'">
                    Lịch sử trả <span class="badge bg-secondary ms-1">{{ historyBorrows.length }}</span>
                </a>
            </li>
        </ul>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
        </div>

        <div v-else>
            <div v-if="activeTab === 'current'">
                <div v-if="currentBorrows.length === 0" class="text-center text-muted py-5">
                    <i class="fa-solid fa-book-open fa-3x mb-3 opacity-25"></i>
                    <p>Bạn không mượn quyển sách nào.</p>
                    <RouterLink to="/" class="btn btn-outline-primary">Đi mượn sách ngay</RouterLink>
                </div>

                <div v-else class="row g-3">
                    <div class="col-md-6 col-lg-4" v-for="item in currentBorrows" :key="item._id">
                        <div class="card h-100 shadow-sm border-0"
                            :class="{ 'border-danger border-2': isOverdue(item) }">
                            <div class="card-body">
                                <h5 class="card-title fw-bold text-primary mb-3">
                                    {{ getBookName(item.MaSach) }}
                                </h5>
                                <div class="mb-3">
                                    <span v-if="item.TrangThai === 0" class="badge bg-warning text-dark">
                                        <i class="fa-solid fa-clock me-1"></i> Chờ duyệt
                                    </span>
                                    <span v-else class="badge bg-success">
                                        <i class="fa-solid fa-check-circle me-1"></i> Đang mượn
                                    </span>
                                </div>
                                <p class="card-text mb-1">
                                    <i class="fa-solid fa-calendar-check me-2 text-muted"></i>
                                    Ngày mượn: <strong>{{ item.NgayMuon }}</strong>
                                </p>
                                <p class="card-text">
                                    <i class="fa-solid fa-hourglass-end me-2 text-muted"></i>
                                    Hạn trả: <strong :class="{ 'text-danger': isOverdue(item) }">{{ item.HanTra}}</strong>
                                </p>

                                <div v-if="isOverdue(item)" class="alert alert-danger mt-3 mb-0 py-2 small">
                                    <i class="fa-solid fa-triangle-exclamation me-1"></i>
                                    Đã quá hạn! Vui lòng trả sách sớm.
                                </div>
                                <div v-else class="alert alert-info mt-3 mb-0 py-2 small">
                                    <i class="fa-solid fa-circle-info me-1"></i>
                                    Đang trong thời hạn mượn.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="activeTab === 'history'">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Tên sách</th>
                            <th>Ngày mượn</th>
                            <th>Ngày trả</th>
                            <th>Phạt quá hạn</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in historyBorrows" :key="item._id">
                            <td>{{ getBookName(item.MaSach) }}</td>
                            <td>{{ item.NgayMuon }}</td>
                            <td>{{ item.NgayTra }}</td>
                            <td>
                                <span v-if="item.TienPhat > 0" class="text-danger fw-bold">
                                    {{ formatCurrency(item.TienPhat) }}
                                </span>
                                <span v-else class="text-success">0 đ</span>
                            </td>

                            <td><span class="badge bg-success">Đã trả</span></td>
                        </tr>
                    </tbody>
                </table>
                <p v-if="historyBorrows.length === 0" class="text-center text-muted mt-3">Chưa có lịch sử mượn sách.</p>
            </div>
        </div>
    </div>
</template>