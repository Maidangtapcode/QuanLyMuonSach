<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
const authStore = useAuthStore();
function handleLogout() {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
        authStore.logout();
    }
}
</script>

<template>
    <div class="admin-layout d-flex">
        <aside class="sidebar bg-dark text-white p-3">
            <h4 class="text-center mb-4">
                <i class="fa-solid fa-shield-halved me-2"></i>
                Admin Panel
            </h4>

            <ul class="nav nav-pills flex-column mb-auto">
                <li class="nav-item mb-2">
                    <RouterLink to="/admin" class="nav-link text-white" exact-active-class="active">
                        <i class="fa-solid fa-chart-line me-2"></i> Tổng quan Thư viện
                    </RouterLink>
                </li>

                <li class="nav-item mb-2">
                    <RouterLink to="/admin/books" class="nav-link text-white" active-class="active">
                        <i class="fa-solid fa-book me-2"></i> Quản lý Sách
                    </RouterLink>
                </li>

                <li class="nav-item mb-2">
                    <RouterLink to="/admin/users" class="nav-link text-white" active-class="active">
                        <i class="fa-solid fa-users me-2"></i> Quản lý Độc Giả
                    </RouterLink>
                </li>

                <li class="nav-item mb-2">
                    <RouterLink to="/admin/borrows" class="nav-link text-white" active-class="active">
                        <i class="fa-solid fa-right-left me-2"></i> Quản lý Mượn Sách
                    </RouterLink>
                </li>

                <li class="nav-item mb-2">
                    <RouterLink to="/admin/publishers" class="nav-link text-white" active-class="active">
                        <i class="fa-solid fa-building me-2"></i> Quản lý NXB
                    </RouterLink>
                </li>
            </ul>
            <hr>
            <div class="d-grid">
                <button class="btn btn-danger" @click="handleLogout">
                    <i class="fa-solid fa-right-from-bracket me-2"></i>
                    Đăng xuất
                </button>
            </div>
        </aside>

        <main class="main-content flex-grow-1 p-4">
            <nav class="navbar navbar-light bg-light rounded mb-4 p-3 shadow-sm">
                <div class="ms-auto">
                    <span class="navbar-text">
                        <i class="fa-solid fa-user-tie me-2"></i>
                        Chào, <strong>{{ authStore.user?.HoTenNV }}</strong>
                    </span>
                </div>
            </nav>

            <div class="bg-white p-4 rounded shadow-sm">
                <RouterView />
            </div>
        </main>
    </div>
</template>

<style scoped>
.admin-layout {
    min-height: 100vh;
}

.sidebar {
    width: 280px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.main-content {

    min-height: 100vh;
    overflow-y: auto;
}

.nav-pills .nav-link.active {
    background-color: #0d6efd;
}
</style>