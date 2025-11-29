<script setup>
import { ref, onMounted, computed } from 'vue';
import { authApiService } from '@/services/api.service';

const books = ref([]); // Biến lưu danh sách sách gốc
const loading = ref(true);
const error = ref(null);
const searchText = ref('');
const categories = ref([]); 
const selectedCategory = ref('');

// biên phân trang
const currentPage = ref(1);
const itemsPerPage = 5; // Số sách mỗi trang

async function fetchBooks() {
    loading.value = true;
    error.value = null;
    let queryParams = {};
    
    if (searchText.value) {
        queryParams.searchText = searchText.value;
    }
    if (selectedCategory.value) {
        queryParams.TheLoai = selectedCategory.value;
    }

    try {
        const response = await authApiService.get('/sachs', {
            params: queryParams 
        });
        books.value = response.data;
        currentPage.value = 1; // Reset về trang 1 khi lọc/tìm kiếm
    } catch (err) {
        error.value = err.response?.data?.message || "Không thể tải danh sách sách.";
    } finally {
        loading.value = false;
    }
}

// Tính tổng số trang
const totalPages = computed(() => {
    return Math.ceil(books.value.length / itemsPerPage);
});

// Cắt dữ liệu để hiển thị
const paginatedBooks = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return books.value.slice(startIndex, endIndex);
});

// Hàm chuyển trang
function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
}

function clearSearch() {
    searchText.value = '';
    selectedCategory.value = ''; // Reset cả bộ lọc thể loại
    fetchBooks();
}

async function handleDelete(bookId, bookName) {
    if (confirm(`Bạn có thật sự muốn xóa sách "${bookName}" không?`)) {
        try {
            await authApiService.delete(`/sachs/${bookId}`);
            alert(`Đã xóa sách "${bookName}" thành công!`);
            await fetchBooks();
        } catch (err) {
            alert(`Lỗi: Không thể xóa sách. ${err.response?.data?.message || ''}`);
        }
    }
}

async function fetchCategories() {
    try {
        const response = await authApiService.get('/sachs/categories');
        categories.value = response.data;
    } catch (err) {
        console.error("Lỗi khi tải thể loại:", err);
    }
}

onMounted(() => {
    fetchBooks();
    fetchCategories();
});
</script>

<template>
    <div>
        <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Đang tải dữ liệu...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
            <i class="fa-solid fa-triangle-exclamation me-2"></i>
            <strong>Lỗi:</strong> {{ error }}
        </div>

        <div v-else>
            <form @submit.prevent="fetchBooks" class="mb-3">
                <div class="row g-2">
                    <div class="col-md-6">
                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="Tìm theo Tên Sách hoặc Mã Sách..."
                                v-model="searchText" />
                            <button class="btn btn-primary" type="submit">
                                <i class="fa-solid fa-search"></i> Tìm
                            </button>
                            <button class="btn btn-outline-secondary" type="button" @click="clearSearch"
                                title="Xóa tìm kiếm">
                                <i class="fa-solid fa-times"></i> Xóa
                            </button>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="input-group">
                            <label class="input-group-text" for="categoryFilter">
                                <i class="fa-solid fa-filter"></i>
                            </label>
                            <select 
                                class="form-select" 
                                id="categoryFilter"
                                v-model="selectedCategory"
                                @change="fetchBooks" >
                                <option value="">-- Tất cả Thể loại --</option>
                                <option v-for="cat in categories" :key="cat" :value="cat">
                                    {{ cat }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </form>

            <table class="table table-striped table-hover table-bordered shadow-sm">
                <thead class="table-dark">
                    <tr>
                        <th scope="col">Mã Sách</th>
                        <th scope="col">Tên Sách</th>
                        <th scope="col">Thể Loại</th>
                        <th scope="col">Tác Giả</th>
                        <th scope="col">Tổng SL</th>
                        <th scope="col">Hiện Có</th>
                        <th scope="col">Năm XB</th>
                        <th scope="col" class="text-center">Chức năng</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="book in paginatedBooks" :key="book._id">
                        <td>{{ book.MaSach }}</td>
                        <td>{{ book.TenSach }}</td>
                        <td>{{ book.TheLoai }}</td> 
                        <td>{{ book.TacGia }}</td>
                        <td>{{ book.SoQuyen }}</td>
                        <td>
                            <span class="fw-bold"
                                :class="{ 'text-danger': book.soQuyenHienCo <= 0, 'text-success': book.soQuyenHienCo > 0 }">
                                {{ book.soQuyenHienCo }}
                            </span>
                        </td>
                        <td>{{ book.NamXuatBan }}</td>
                        <td class="text-center">
                            <RouterLink :to="{ name: 'admin-books-edit', params: { id: book._id } }"
                                class="btn btn-sm btn-warning me-2">
                                <i class="fa-solid fa-pen-to-square"></i> Sửa
                            </RouterLink>
                            <button class="btn btn-sm btn-danger" @click="handleDelete(book._id, book.TenSach)">
                                <i class="fa-solid fa-trash"></i> Xóa
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <p v-if="books.length === 0" class="text-center text-muted mt-3">
                {{ searchText ? 'Không tìm thấy sách nào khớp với từ khóa.' : 'Không có sách nào trong thư viện.' }}
            </p>

            <nav v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
                <ul class="pagination shadow-sm">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <button class="page-link" @click="goToPage(currentPage - 1)">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                    </li>

                    <li v-for="page in totalPages" :key="page" class="page-item"
                        :class="{ active: currentPage === page }">
                        <button class="page-link" @click="goToPage(page)">
                            {{ page }}
                        </button>
                    </li>

                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <button class="page-link" @click="goToPage(currentPage + 1)">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </li>
                </ul>
            </nav>
            
            <p v-if="books.length > 0" class="text-center text-muted small">
                Trang {{ currentPage }} / {{ totalPages }} (Tổng: {{ books.length }} sách)
            </p>
            </div>
    </div>
</template>

<style scoped>
.btn-sm {
    display: inline-flex;
    align-items: center;
}
.page-link {
    cursor: pointer;
}
</style>