<script setup>
import { ref, onMounted, computed } from 'vue';
import { apiService } from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import AppHeader from '@/components/AppHeader.vue';
import BookHero from '@/components/BookHero.vue'; 
import BookCard from '@/components/BookCard.vue';

const authStore = useAuthStore();
const books = ref([]);
const categories = ref([]);
const loading = ref(true);

// Biến filter (sẽ được BookHero cập nhật tự động)
const searchText = ref('');
const selectedCategory = ref('');
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
            ? book.TheLoai === selectedCategory.value
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
onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="library-page">
        <AppHeader />

        <BookHero 
            :categories="categories"
            v-model:searchText="searchText"
            v-model:selectedCategory="selectedCategory"
        />

        <div class="container pb-5">
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary"></div>
            </div>

            <div v-else>
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    <div class="col" v-for="book in filteredBooks" :key="book._id">
                        <BookCard :book="book" @borrow="handleBorrow" />
                    </div>
                </div>
                
                <div v-if="filteredBooks.length === 0" class="text-center py-5 text-muted">
                    <p>Không tìm thấy sách phù hợp.</p>
                </div>
            </div>
        </div>
    </div>
</template>

