<script setup>
import { useRoute } from 'vue-router';
import PublisherForm from '@/components/PublisherForm.vue';
const route = useRoute();
</script>
<template>
    <div>
        <h2 class="mb-4">{{ route.params.id ? 'Sửa NXB' : 'Thêm NXB Mới' }}</h2>
        <PublisherForm :publisherId="route.params.id" />
    </div>
</template>