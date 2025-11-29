<script setup>
defineProps({
    book: {
        type: Object,
        required: true
    }
});

const PLACEHOLDER_IMG = 'https://placehold.co/400x600?text=No+Image';
</script>

<template>
    <div class="card h-100 book-card border-0 shadow-sm">
        <div class="position-relative book-cover-wrapper">
            <RouterLink :to="{ name: 'book-detail', params: { id: book._id } }">
                <img 
                    :src="book.HinhAnh || PLACEHOLDER_IMG" 
                    class="card-img-top book-cover" 
                    alt="Book Cover"
                    @error="$event.target.src = PLACEHOLDER_IMG" 
                >
            </RouterLink>
            
            <span 
                class="position-absolute top-0 end-0 badge m-2"
                :class="book.soQuyenHienCo > 0 ? 'bg-success' : 'bg-secondary'"
            >
                {{ book.soQuyenHienCo > 0 ? 'Còn hàng' : 'Hết hàng' }}
            </span>
        </div>

        <div class="card-body d-flex flex-column">
            <div class="mb-2">
                <span class="badge bg-light text-primary border border-primary-subtle">
                    {{ book.TheLoai || 'Tổng hợp' }}
                </span>
            </div>
            
            <h5 class="card-title fw-bold text-truncate">
                <RouterLink 
                    :to="{ name: 'book-detail', params: { id: book._id } }" 
                    class="text-decoration-none text-dark"
                >
                    {{ book.TenSach }}
                </RouterLink>
            </h5>

            <p class="card-text text-muted small mb-1">
                <i class="fa-solid fa-pen-nib me-1"></i> {{ book.TacGia }}
            </p>
            <p class="card-text text-muted small">
                <i class="fa-solid fa-calendar-days me-1"></i> Năm XB: {{ book.NamXuatBan }}
            </p>
            
            <div class="mt-auto pt-3">
                <button 
                    class="btn w-100" 
                    :class="book.soQuyenHienCo > 0 ? 'btn-outline-primary' : 'btn-secondary disabled'"
                    @click="$emit('borrow', book)" 
                >
                    <i class="fa-solid fa-cart-plus me-1"></i> 
                    {{ book.soQuyenHienCo > 0 ? 'Đăng ký mượn' : 'Tạm hết' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.book-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;
}
.book-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
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
}
</style>