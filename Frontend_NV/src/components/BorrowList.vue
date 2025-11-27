<script setup>
import { ref, onMounted, computed } from 'vue'; 
import { authApiService } from '@/services/api.service';

const borrows = ref([])
const books = ref([])
const readers = ref([])
const loading = ref(true)
const filterStatus = ref('ALL');
// Tải tất cả dữ liệu cần thiết
async function fetchData() {
    loading.value = true
    try {
        // Gọi 3 API song song để tiết kiệm thời gian
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

// Hàm Helper: Tìm Tên Sách từ MaSach
function getBookName(maSach) {
    const book = books.value.find((b) => b.MaSach === maSach)
    return book ? book.TenSach : maSach
}

// Hàm Helper: Tìm Tên Độc Giả từ MaDocGia
function getReaderName(maDocGia) {
    const reader = readers.value.find((r) => r.MaDocGia === maDocGia)
    return reader ? `${reader.HoLot} ${reader.Ten}` : maDocGia
}
// Lọc phiếu mượn theo trạng thái
const filteredBorrows = computed(() => {
    return borrows.value.filter(item => {
        // Nếu chọn "Tất cả" -> Lấy hết
        if (filterStatus.value === 'ALL') return true;

        // Nếu chọn "Đang mượn" -> Chỉ lấy cái chưa có NgayTra
        if (filterStatus.value === 'BORROWING') return !item.NgayTra;

        // Nếu chọn "Đã trả" -> Chỉ lấy cái có NgayTra
        if (filterStatus.value === 'RETURNED') return item.NgayTra;

        // Nếu chọn "Quá hạn" -> Gọi hàm isOverdue
        if (filterStatus.value === 'OVERDUE') return isOverdue(item);

        return true;
    });
});
// Xử lý TRẢ SÁCH
async function handleReturn(borrowId) {
    if (confirm('Xác nhận độc giả đã trả sách?')) {
        try {
            // Lấy ngày hiện tại YYYY-MM-DD
            const today = new Date().toISOString().split('T')[0]

            await authApiService.put(`/muonsachs/${borrowId}`, {
                NgayTra: today,
            })

            alert('Đã trả sách thành công!')
            await fetchData() // Tải lại dữ liệu (kho sách sẽ tự tăng)
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || err.message))
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
    // 1. Nếu đã trả rồi thì KHÔNG tính là quá hạn
    if (item.NgayTra) return false

    // 2. Nếu không có Hạn trả (dữ liệu cũ) thì bỏ qua
    if (!item.HanTra) return false

    // 3. So sánh ngày
    const today = new Date()
    const dueDate = new Date(item.HanTra)

    // Reset giờ phút giây về 0 để so sánh chính xác theo ngày
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    // Nếu hôm nay lớn hơn hạn trả -> QUÁ HẠN
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
                    <input type="radio" class="btn-check" name="btnradio" id="filterAll" value="ALL" v-model="filterStatus">
                    <label class="btn btn-outline-primary" for="filterAll">Tất cả</label>

                    <input type="radio" class="btn-check" name="btnradio" id="filterBorrowing" value="BORROWING" v-model="filterStatus">
                    <label class="btn btn-outline-warning text-dark" for="filterBorrowing">Đang mượn</label>

                    <input type="radio" class="btn-check" name="btnradio" id="filterReturned" value="RETURNED" v-model="filterStatus">
                    <label class="btn btn-outline-success" for="filterReturned">Đã trả</label>

                    <input type="radio" class="btn-check" name="btnradio" id="filterOverdue" value="OVERDUE" v-model="filterStatus">
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
                        <th>Thời Gian</th> <th>Ngày Trả</th>
                        <th>Trạng Thái</th>
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
                            <span v-if="item.NgayTra" class="badge bg-success">Đã trả</span>
                            <span v-else-if="isOverdue(item)" class="badge bg-danger">QUÁ HẠN</span>
                            <span v-else class="badge bg-warning text-dark">Đang mượn</span>
                        </td>
                        <td class="text-center">
                            <button v-if="!item.NgayTra" class="btn btn-sm btn-success me-2"
                                @click="handleReturn(item._id)" title="Xác nhận trả sách">
                                <i class="fa-solid fa-check"></i> Trả sách
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