<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { apiService } from '@/services/api.service'; 
const authStore = useAuthStore();
const books = ref([]);
const categories = ref([]);
const loading = ref(true);

// Biến cho bộ lọc
const searchText = ref('');
const selectedCategory = ref('');

// URL ảnh mặc định nếu sách không có ảnh
const PLACEHOLDER_IMG = 'https://placehold.co/400x600?text=No+Image';

// Tải danh sách sách và thể loại
async function fetchData() {
    loading.value = true;
    try {
        // Gọi song song 2 API
        const [booksRes, catsRes] = await Promise.all([
            apiService.get('/sachs'),
            apiService.get('/sachs/categories')
        ]);

        books.value = booksRes.data;
        categories.value = catsRes.data;
    } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
    } finally {
        loading.value = false;
    }
}

// Logic lọc sách
const filteredBooks = computed(() => {
    return books.value.filter(book => {
        // Lọc theo tên hoặc mã
        const matchSearch =
            book.TenSach.toLowerCase().includes(searchText.value.toLowerCase()) ||
            book.MaSach.toLowerCase().includes(searchText.value.toLowerCase());

        // Lọc theo thể loại
        const matchCategory = selectedCategory.value
            ? book.theLoai === selectedCategory.value
            : true;

        return matchSearch && matchCategory;
    });
});

// Hàm xử lý khi bấm mượn sách
async function handleBorrow(book) {
    if (book.soQuyenHienCo <= 0) {
        alert("Sách này tạm thời đã hết!");
        return;
    }
    // Xác nhận
    if (!confirm(`Bạn muốn đăng ký mượn sách: "${book.TenSach}"?`)) return;
    try {
        // Lấy ngày hiện tại
        const today = new Date().toISOString().split('T')[0];
        const maDocGia = authStore.user.MaDocGia;
        // Gọi API tạo phiếu mượn
        await apiService.post('/muonsachs', {
            MaDocGia: maDocGia,
            MaSach: book.MaSach,
            NgayMuon: today
        });

        alert("Đăng ký thành công! Vui lòng chờ thủ thư duyệt.");
        await fetchData();

    } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
}

// Hàm đăng xuất
function handleLogout() {
    if (confirm("Đăng xuất?")) authStore.logout();
}

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="library-page">
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
            <div class="container">
                <a class="navbar-brand fw-bold" href="#">
                    <i class="fa-solid fa-book-open me-2"></i> Thư Viện Online
                </a>
                <div class="d-flex align-items-center text-white">
                    <RouterLink to="/my-books" class="btn btn-light text-primary btn-sm me-3 fw-bold">
                        <i class="fa-solid fa-bookmark me-1"></i> Sách của tôi
                    </RouterLink>
                    <div class="me-3 d-none d-md-block">
                        Xin chào, <strong>{{ authStore.user?.Ten }}</strong>
                    </div>
                    <button class="btn btn-outline-light btn-sm" @click="handleLogout">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            </div>
        </nav>

        <div class="hero-section text-center text-white py-5 mb-4">
            <div class="container">
                <h1 class="display-4 fw-bold mb-3">Khám phá tri thức</h1>
                <p class="lead mb-4">Tìm kiếm hàng ngàn đầu sách hấp dẫn ngay tại đây</p>

                <div class="search-box bg-white p-3 rounded-4 shadow mx-auto">
                    <div class="row g-2">
                        <div class="col-md-6">
                            <div class="input-group">
                                <span class="input-group-text bg-white border-end-0"><i
                                        class="fa-solid fa-search text-muted"></i></span>
                                <input type="text" class="form-control border-start-0"
                                    placeholder="Nhập tên sách, tác giả..." v-model="searchText">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <select class="form-select" v-model="selectedCategory">
                                <option value="">-- Tất cả thể loại --</option>
                                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-primary w-100 fw-bold">Tìm kiếm</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container pb-5">
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
            </div>

            <div v-else>
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    <div class="col" v-for="book in filteredBooks" :key="book._id">
                        <div class="card h-100 book-card border-0 shadow-sm">
                            <div class="position-relative book-cover-wrapper">
                                <img :src="book.HinhAnh || PLACEHOLDER_IMG" class="card-img-top book-cover"
                                    alt="Book Cover" @error="$event.target.src = PLACEHOLDER_IMG">
                                <span class="position-absolute top-0 end-0 badge m-2"
                                    :class="book.soQuyenHienCo > 0 ? 'bg-success' : 'bg-secondary'">
                                    {{ book.soQuyenHienCo > 0 ? 'Còn hàng' : 'Hết hàng' }}
                                </span>
                            </div>

                            <div class="card-body d-flex flex-column">
                                <div class="mb-2">
                                    <span class="badge bg-light text-primary border border-primary-subtle">
                                        {{ book.TheLoai || 'Tổng hợp' }}
                                    </span>
                                </div>

                                <h5 class="card-title fw-bold text-truncate" :title="book.TenSach">
                                    {{ book.TenSach }}
                                </h5>
                                <p class="card-text text-muted small mb-1">
                                    <i class="fa-solid fa-pen-nib me-1"></i> {{ book.TacGia }}
                                </p>
                                <p class="card-text text-muted small">
                                    <i class="fa-solid fa-calendar-days me-1"></i> Năm XB: {{ book.NamXuatBan }}
                                </p>

                                <div class="mt-auto pt-3">
                                    <button class="btn w-100"
                                        :class="book.soQuyenHienCo > 0 ? 'btn-outline-primary' : 'btn-secondary disabled'"
                                        @click="handleBorrow(book)">
                                        <i class="fa-solid fa-cart-plus me-1"></i>
                                        {{ book.soQuyenHienCo > 0 ? 'Đăng ký mượn' : 'Tạm hết' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="filteredBooks.length === 0" class="text-center py-5 text-muted">
                    <i class="fa-solid fa-box-open fa-3x mb-3 opacity-50"></i>
                    <p>Không tìm thấy quyển sách nào phù hợp.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.hero-section {
    background: linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%);
    border-bottom-left-radius: 2rem;
    border-bottom-right-radius: 2rem;
    padding-bottom: 4rem !important;
}

.search-box {
    max-width: 800px;
    margin-top: 1rem;
    position: relative;
    top: 20px;
}

.book-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;
}

.book-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.book-cover-wrapper {
    height: 250px;
    overflow: hidden;
    background-color: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
}

.book-cover {
    height: 100%;
    width: 100%;
    object-fit: contain;
    padding: 10px;
}

.card-title {
    font-size: 1.1rem;
    color: #333;
}
</style>