<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiService } from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const book = ref(null);
const loading = ref(true);
const error = ref(null);
const publisherName = ref('');
// Tải chi tiết sách dựa vào ID trên URL
async function fetchBookDetail() {
    try {
        const id = route.params.id;
        
        // 2. GỌI SONG SONG 2 API: Lấy Sách VÀ Lấy DS Nhà Xuất Bản
        const [bookRes, pubRes] = await Promise.all([
            apiService.get(`/sachs/${id}`),
            apiService.get('/nhaxuatbans')
        ]);

        book.value = bookRes.data;
        
        // 3. TÌM TÊN NXB TƯƠNG ỨNG
        const publishers = pubRes.data;
        const foundPub = publishers.find(p => p.MaNXB === book.value.MaNXB);
        
        // Nếu tìm thấy thì lấy tên, không thì hiện lại cái Mã cũ
        publisherName.value = foundPub ? foundPub.TenNXB : book.value.MaNXB;

    } catch (err) {
        error.value = "Không tìm thấy thông tin sách.";
        console.error(err);
    } finally {
        loading.value = false;
    }
}

// Xử lý mượn sách (Logic giống trang chủ)
async function handleBorrow() {
    if (!authStore.token) {
        alert("Vui lòng đăng nhập để mượn sách!");
        router.push('/login');
        return;
    }
    
    if (book.value.soQuyenHienCo <= 0) {
        alert("Sách này tạm thời đã hết!");
        return;
    }

    if (confirm(`Đăng ký mượn sách: "${book.value.TenSach}"?`)) {
        try {
            const today = new Date().toISOString().split('T')[0];
            await apiService.post('/muonsachs', {
                MaDocGia: authStore.user.MaDocGia,
                MaSach: book.value.MaSach,
                NgayMuon: today
            });
            alert("Đăng ký thành công! Vui lòng chờ duyệt.");
            // Tải lại để cập nhật tồn kho
            fetchBookDetail(); 
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || err.message));
        }
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

onMounted(() => {
    fetchBookDetail();
});
</script>

<template>
    <div class="container py-5">
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
        </div>
        <div v-else-if="error" class="alert alert-danger text-center">
            {{ error }} <br>
            <RouterLink to="/" class="btn btn-outline-danger mt-3">Quay lại trang chủ</RouterLink>
        </div>

        <div v-else class="row g-5">
            <div class="col-md-4">
                <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
                    <img 
                        :src="book.HinhAnh || 'https://placehold.co/400x600?text=No+Image'" 
                        class="img-fluid w-100 object-fit-cover"
                        alt="Book Cover"
                    >
                </div>
            </div>

            <div class="col-md-8">
                <span class="badge bg-primary bg-opacity-10 text-primary mb-2 px-3 py-2 rounded-pill">
                    {{ book.TheLoai || 'Sách tham khảo' }}
                </span>

                <h1 class="fw-bold mb-3">{{ book.TenSach }}</h1>
                
                <div class="d-flex align-items-center mb-4 text-muted">
                    <span class="me-3"><i class="fa-solid fa-user-pen me-1"></i> Tác giả: <strong>{{ book.TacGia }}</strong></span>
                    <span class="me-3">|</span>
                    <span><i class="fa-solid fa-barcode me-1"></i> Mã: {{ book.MaSach }}</span>
                </div>

                <div class="p-4 bg-light rounded-4 mb-4">
                    <div class="row text-center">
                        <div class="col-6 border-end">
                            <div class="text-muted small mb-1">Đơn giá</div>
                            <div class="h4 fw-bold text-success mb-0">{{ formatCurrency(book.DonGia) }}</div>
                        </div>
                        <div class="col-6">
                            <div class="text-muted small mb-1">Tình trạng</div>
                            <div class="h4 fw-bold mb-0" :class="book.soQuyenHienCo > 0 ? 'text-primary' : 'text-danger'">
                                {{ book.soQuyenHienCo > 0 ? `Còn ${book.soQuyenHienCo} quyển` : 'Hết hàng' }}
                            </div>
                        </div>
                    </div>
                </div>

                <h5 class="fw-bold"><i class="fa-solid fa-align-left me-2"></i>Giới thiệu nội dung</h5>
                <p class="text-secondary" style="line-height: 1.8;">
                    {{ book.MoTa || 'Đang cập nhật nội dung cho cuốn sách này...' }}
                </p>

                <hr class="my-4">

                <ul class="list-unstyled text-muted mb-4">
                    <li class="mb-2"><i class="fa-solid fa-building me-2"></i> Nhà xuất bản: {{ publisherName }}</li> <li><i class="fa-solid fa-calendar me-2"></i> Năm xuất bản: {{ book.NamXuatBan }}</li>
                </ul>

                <div class="d-flex gap-3">
                    <button 
                        class="btn btn-primary btn-lg px-5 rounded-pill" 
                        :disabled="book.soQuyenHienCo <= 0"
                        @click="handleBorrow"
                    >
                        <i class="fa-solid fa-cart-plus me-2"></i> 
                        {{ book.soQuyenHienCo > 0 ? 'Đăng ký Mượn' : 'Tạm hết hàng' }}
                    </button>
                    
                    <RouterLink to="/" class="btn btn-outline-secondary btn-lg rounded-pill px-4">
                        Quay lại
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>