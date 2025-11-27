<script setup>
import { useRoute } from 'vue-router';
import BookForm from '@/components/BookForm.vue'; 

const route = useRoute();

const bookId = route.params.id;
</script>

<template>
    <div>
        <h1 class="mb-4">
            <i v-if="bookId" class="fa-solid fa-pen-to-square me-2"></i>
            <i v-else class="fa-solid fa-plus me-2"></i>
            {{ bookId ? 'Chỉnh sửa Sách' : 'Thêm Sách Mới' }}
        </h1>
        
        <BookForm :bookId="bookId" />
    </div>
</template>