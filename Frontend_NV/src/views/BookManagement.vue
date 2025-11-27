<script setup>
import BookList from '@/components/BookList.vue'
</script>
<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">
        <i class="fa-solid fa-book me-2"></i>
        Quản lý Sách
      </h1>
      <RouterLink to="/admin/books/new" class="btn btn-primary">
        <i class="fa-solid fa-plus me-1"></i> Thêm Sách Mới
      </RouterLink>
    </div>
    <BookList />
  </div>
</template>
