<script setup>
import BorrowList from '@/components/BorrowList.vue';
</script>
<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1><i class="fa-solid fa-right-left me-2"></i>Quản lý Mượn Trả</h1>
            <RouterLink to="/admin/borrows/new" class="btn btn-primary">
                <i class="fa-solid fa-plus me-1"></i> Tạo Phiếu Mượn
            </RouterLink>
        </div>
        <BorrowList />
    </div>
</template>