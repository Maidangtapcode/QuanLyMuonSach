<script setup>
import PublisherList from '@/components/PublisherList.vue';
</script>
<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1><i class="fa-solid fa-building me-2"></i>Quản lý Nhà Xuất Bản</h1>
            <RouterLink to="/admin/publishers/new" class="btn btn-primary">
                <i class="fa-solid fa-plus me-1"></i> Thêm NXB
            </RouterLink>
        </div>
        <PublisherList />
    </div>
</template>