<script setup>
import { useRoute } from 'vue-router';
import UserForm from '@/components/UserForm.vue';
const route = useRoute();
</script>
<template>
    <div>
        <h2 class="mb-4">
            <i class="fa-solid fa-user-pen me-2"></i>
            {{ route.params.id ? 'Sửa thông tin Độc Giả' : 'Thêm Độc Giả Mới' }}
        </h2>
        <UserForm :userId="route.params.id" />
    </div>
</template>