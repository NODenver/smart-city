<template>
  <div class="filter-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46"/>
        </svg>
        多维筛选与对比分析
      </h1>
      <p class="page-subtitle">按时间、区域、问题类型、数据源组合筛选和对比分析</p>
    </div>

    <!-- 筛选与对比内容 -->
    <FilterSection />
  </div>
</template>

<script setup lang="ts">
import FilterSection from './panels/FilterSection.vue'
</script>

<style scoped>
.filter-view {
  padding: 2rem;
  min-height: 100vh;
  background: var(--background-primary);
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.page-title svg {
  color: var(--primary-color);
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .filter-view {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
