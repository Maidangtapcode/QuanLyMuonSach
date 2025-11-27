<script setup>
import UserList from '@/components/UserList.vue';
</script>
<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1><i class="fa-solid fa-users me-2"></i>Quản lý Độc Giả</h1>
            <RouterLink to="/admin/users/new" class="btn btn-primary">
                <i class="fa-solid fa-plus me-1"></i> Thêm Độc Giả
            </RouterLink>
        </div>
        <UserList />
    </div>
</template>