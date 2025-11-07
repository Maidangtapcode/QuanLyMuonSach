<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
// import { authApiService } from '@/services/api.service'; // Sẽ dùng sau để tải sách

// Lấy "kho" auth
const authStore = useAuthStore();

// Lấy thông tin user (để hiển thị tên)
// Dùng computed để đảm bảo tên user được cập nhật
const currentUser = computed(() => authStore.user);

// Hàm đăng xuất
function handleLogout() {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
        authStore.logout();
    }
}

// (Chúng ta sẽ thêm hàm tải sách ở đây sau)
</script>

<template>
    <div>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div class="container">
                <a class="navbar-brand" href="#">
                    <i class="fa-solid fa-book-open-reader me-2"></i>
                    Thư Viện Online
                </a>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link active" href="#">
                                <i class="fa-solid fa-house me-1"></i> Trang chủ (Sách)
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">
                                <i class="fa-solid fa-bookmark me-1"></i> Sách của tôi
                            </a>
                        </li>
                    </ul>

                    <ul class="navbar-nav">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarUserMenu" role="button" data-bs-toggle="dropdown">
                                <i class="fa-solid fa-user-circle me-1"></i>
                                Chào, {{ currentUser?.Ten }}
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="#">Thông tin cá nhân</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                                        <i class="fa-solid fa-right-from-bracket me-2"></i>
                                        Đăng xuất
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div class="container mt-4">
            <div class="p-5 mb-4 bg-light rounded-3 shadow-sm">
                <div class="container-fluid py-5">
                    <h1 class="display-5 fw-bold">Chào mừng, {{ currentUser?.HoLot }} {{ currentUser?.Ten }}!</h1>
                    <p class="col-md-8 fs-4">
                        Bắt đầu tìm kiếm và mượn những quyển sách bạn yêu thích.
                    </p>
                </div>
            </div>
            
            <h2 class="mb-3">Tất cả Sách</h2>
            <div class="row">
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Tên sách...</h5>
                            <p class="card-text">Tác giả...</p>
                            <a href="#" class="btn btn-primary">Mượn sách</a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.dropdown-item.text-danger {
    cursor: pointer;
}
</style>