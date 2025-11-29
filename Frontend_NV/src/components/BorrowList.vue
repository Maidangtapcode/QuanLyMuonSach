<script setup>
import { ref, onMounted, computed } from 'vue';
import { authApiService } from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
const authStore = useAuthStore();
const borrows = ref([])
const books = ref([])
const readers = ref([])
const loading = ref(true)
const filterStatus = ref('ALL');
// Tải tất cả dữ liệu
async function fetchData() {
    loading.value = true
    try {
        // Gọi 3 API song song
        const [borrowsRes, booksRes, readersRes] = await Promise.all([
            authApiService.get('/muonsachs'),
            authApiService.get('/sachs'),
            authApiService.get('/docgias'),
        ])

        borrows.value = borrowsRes.data
        books.value = booksRes.data
        readers.value = readersRes.data
    } catch (err) {
        alert('Lỗi: Không thể tải dữ liệu mượn trả.')
        console.error(err)
    } finally {
        loading.value = false
    }
}

// Tìm Tên Sách từ MaSach
function getBookName(maSach) {
    const book = books.value.find((b) => b.MaSach === maSach)
    return book ? book.TenSach : maSach
}
function formatCurrency(amount) {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
// Tìm Tên Độc Giả từ MaDocGia
function getReaderName(maDocGia) {
    const reader = readers.value.find((r) => r.MaDocGia === maDocGia)
    return reader ? `${reader.HoLot} ${reader.Ten}` : maDocGia
}
// Lọc phiếu mượn theo trạng thái
const filteredBorrows = computed(() => {
    return borrows.value.filter(item => {
        if (filterStatus.value === 'ALL') return true;
        
        // BORROWING = Đang mượn (1) hoặc Chờ duyệt (0)
        if (filterStatus.value === 'BORROWING') 
            return item.TrangThai === 0 || item.TrangThai === 1;

        // RETURNED = Đã trả (2)
        if (filterStatus.value === 'RETURNED') 
            return item.TrangThai === 2;

        if (filterStatus.value === 'OVERDUE') return isOverdue(item);

        return true;
    });
});
// Xử lý trả sách
async function handleReturn(borrowId) {
    if (confirm("Xác nhận độc giả đã trả sách?")) {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Gọi API (Backend sẽ tự cập nhật TrangThai = 2 vào DB)
            const response = await authApiService.put(`/muonsachs/${borrowId}`, {
                NgayTra: today
            });

            const tienPhat = response.data.tienPhat;

            // === SỬA ĐOẠN NÀY: Cập nhật giao diện ngay lập tức ===
            const item = borrows.value.find(b => b._id === borrowId);
            if (item) {
                item.NgayTra = today;
                item.TienPhat = tienPhat;
                
                // QUAN TRỌNG: Phải gán TrangThai = 2 để giao diện đổi màu ngay
                item.TrangThai = 2; 
            }
            // ====================================================

            if (tienPhat > 0) {
                alert(`Đã trả sách. KHÁCH BỊ PHẠT: ${formatCurrency(tienPhat)}`);
            } else {
                alert("Đã trả sách thành công.");
            }

        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || err.message));
        }
    }
}
// Xử lý duyệt phiếu mượn
async function handleApprove(borrowId) {
    if (confirm("Duyệt yêu cầu mượn sách này?")) {
        try {
            await authApiService.put(`/muonsachs/${borrowId}`, {
                TrangThai: 1,
                MSNV: authStore.user.MSNV
            });
            // Tìm phiếu mượn trong danh sách hiện tại
            const item = borrows.value.find(b => b._id === borrowId);
            // Tìm thấy đổi trạng thái của nó sang 1
            if (item) {
                item.TrangThai = 1;
                // Cập nhật luôn người duyệt để hiển thị nếu cần
                item.MSNV = authStore.user.MSNV;
            }
            alert("Đã duyệt thành công!");
        } catch (err) {
            alert("Lỗi khi duyệt.");
            console.error(err);
        }
    }
}
// Xóa bản ghi (chỉ dùng khi nhập sai)
async function handleDelete(id) {
    if (confirm('Bạn có chắc muốn xóa phiếu mượn này? (Hành động này không hoàn trả sách vào kho)')) {
        try {
            await authApiService.delete(`/muonsachs/${id}`)
            await fetchData()
        } catch (err) {
            alert('Lỗi xóa.')
            console.error(err)
        }
    }
}
function isOverdue(item) {
    // Nếu đã trả thì không tính là quá hạn
    if (item.NgayTra) return false
    if (item.TrangThai === 2) return false;
    // Nếu không có hạn trả thì bỏ qua - dữ liệu cũ
    if (!item.HanTra) return false

    // So sánh ngày
    const today = new Date()
    const dueDate = new Date(item.HanTra)

    // Reset giờ phút giây về 0 để so sánh
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    // Nếu hôm nay lớn hơn hạn trả -> quá hạn
    return today > dueDate
}
onMounted(() => {
    fetchData()
})
</script>

<template>
    <div>
        <div v-if="loading" class="text-center">
            <div class="spinner-border text-primary"></div>
        </div>

        <div v-else>
            <div class="mb-3 d-flex justify-content-end">
                <div class="btn-group shadow-sm" role="group">
                    <input type="radio" class="btn-check" name="btnradio" id="filterAll" value="ALL"
                        v-model="filterStatus">
                    <label class="btn btn-outline-primary" for="filterAll">Tất cả</label>

                    <input type="radio" class="btn-check" name="btnradio" id="filterBorrowing" value="BORROWING"
                        v-model="filterStatus">
                    <label class="btn btn-outline-warning text-dark" for="filterBorrowing">Đang mượn</label>

                    <input type="radio" class="btn-check" name="btnradio" id="filterReturned" value="RETURNED"
                        v-model="filterStatus">
                    <label class="btn btn-outline-success" for="filterReturned">Đã trả</label>

                    <input type="radio" class="btn-check" name="btnradio" id="filterOverdue" value="OVERDUE"
                        v-model="filterStatus">
                    <label class="btn btn-outline-danger" for="filterOverdue">
                        <i class="fa-solid fa-triangle-exclamation"></i> Quá hạn
                    </label>
                </div>
            </div>
            <table class="table table-bordered table-hover shadow-sm">
                <thead class="table-dark">
                    <tr>
                        <th>Độc Giả</th>
                        <th>Sách Mượn</th>
                        <th>Thời Gian</th>
                        <th>Ngày Trả</th>
                        <th>Trạng Thái</th>
                        <th>Tiền Phạt</th>
                        <th class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in filteredBorrows" :key="item._id" :class="{ 'table-danger': isOverdue(item) }">
                        <td>
                            <strong>{{ getReaderName(item.MaDocGia) }}</strong><br />
                            <small class="text-muted">{{ item.MaDocGia }}</small>
                        </td>
                        <td>
                            <strong>{{ getBookName(item.MaSach) }}</strong><br />
                            <small class="text-muted">{{ item.MaSach }}</small>
                        </td>
                        <td>
                            <div><i class="fa-regular fa-calendar me-1"></i> Mượn: {{ item.NgayMuon }}</div>
                            <div class="small text-muted">
                                <i class="fa-solid fa-hourglass-end me-1"></i> Hạn: {{ item.HanTra || 'N/A' }}
                            </div>
                        </td>
                        <td>{{ item.NgayTra || '---' }}</td>
                        <td>
                            <span v-if="item.TrangThai === 0" class="badge bg-warning text-dark">Chờ duyệt</span>
                            <span v-else-if="item.TrangThai === 1" class="badge bg-primary">Đang mượn</span>
                            <span v-else-if="item.TrangThai === 2" class="badge bg-success">Đã trả</span>

                            <div v-if="item.TrangThai === 1 && isOverdue(item)" class="badge bg-danger mt-1">QUÁ HẠN
                            </div>
                        </td>
                        <td>
                            <span v-if="item.TienPhat > 0" class="text-danger fw-bold">
                                {{ formatCurrency(item.TienPhat) }}
                            </span>
                            <span v-else class="text-muted">-</span>
                        </td>
                        <td class="text-center">
                            <button v-if="item.TrangThai === 0" class="btn btn-sm btn-primary me-2"
                                @click="handleApprove(item._id)" title="Duyệt phiếu mượn">
                                <i class="fa-solid fa-check-double"></i> Duyệt
                            </button>

                            <button v-if="item.TrangThai === 1" class="btn btn-sm btn-success me-2"
                                @click="handleReturn(item._id)" title="Xác nhận trả sách">
                                <i class="fa-solid fa-rotate-left"></i> Trả
                            </button>

                            <button class="btn btn-sm btn-danger" @click="handleDelete(item._id)">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-if="filteredBorrows.length === 0" class="text-center mt-3 text-muted">
                Không tìm thấy phiếu mượn nào theo bộ lọc này.
            </p>
        </div>
    </div>
</template>