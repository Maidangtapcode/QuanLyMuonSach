<script setup>
defineProps({
    categories: { type: Array, default: () => [] }
});

// modelValue là searchText, category là selectedCategory
const searchText = defineModel('searchText');
const selectedCategory = defineModel('selectedCategory');
</script>

<template>
    <div class="hero-section text-center text-white py-5 mb-4">
        <div class="container">
            <h1 class="display-4 fw-bold mb-3">Khám phá tri thức</h1>
            <p class="lead mb-4">Tìm kiếm hàng ngàn đầu sách hấp dẫn ngay tại đây</p>
            
            <div class="search-box bg-white p-3 rounded-4 shadow mx-auto">
                <div class="row g-2">
                    <div class="col-md-6">
                        <div class="input-group">
                            <span class="input-group-text bg-white border-end-0">
                                <i class="fa-solid fa-search text-muted"></i>
                            </span>
                            <input 
                                type="text" 
                                class="form-control border-start-0" 
                                placeholder="Nhập tên sách..." 
                                v-model="searchText"
                            >
                        </div>
                    </div>
                    <div class="col-md-4">
                        <select class="form-select" v-model="selectedCategory">
                            <option value="">Tất cả thể loại</option>
                            <option v-for="cat in categories" :key="cat" :value="cat">
                                {{ cat }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-primary w-100 fw-bold">Tìm ngay</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.hero-section {
    background: linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%);
    border-bottom-left-radius: 2rem;
    border-bottom-right-radius: 2rem;
    padding-bottom: 4rem !important;
}
.search-box {
    max-width: 800px;
    margin-top: 1rem;
    position: relative;
    top: 20px; 
}
</style>