<script setup>
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();

function handleLogout() {
    if(confirm("Đăng xuất?")) {
        authStore.logout();
    }
}
</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
        <div class="container">
            <RouterLink to="/" class="navbar-brand fw-bold">
                <i class="fa-solid fa-book-open me-2"></i> Thư Viện Online
            </RouterLink>
            
            <div class="d-flex align-items-center text-white">
                <RouterLink to="/my-books" class="btn btn-light text-primary btn-sm me-3 fw-bold">
                    <i class="fa-solid fa-bookmark me-1"></i> Sách của tôi
                </RouterLink>
                <RouterLink to="/profile" class="text-white text-decoration-none">
                    <div class="me-3 d-none d-md-block">
                    Xin chào, <strong>{{ authStore.user?.Ten }}</strong>
                </div>
                </RouterLink>
                <button class="btn btn-outline-light btn-sm" @click="handleLogout">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        </div>
    </nav>
</template>