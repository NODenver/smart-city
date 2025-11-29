<template>
  <div class="home-view">
    <!-- Tab导航 -->
    <div class="tabs-container">
      <div class="tabs-list">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-button', { active: currentTab === tab.value }]"
          @click="handleTabChange(tab)"
        >
          <component :is="tab.icon" class="tab-icon" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab内容 -->
    <div class="tab-content">
      <!-- 数据上传 -->
      <div v-show="currentTab === 'upload'" class="tab-panel">
        <DataUploadPanel />
      </div>

      <!-- 数据概览 -->
      <div v-show="currentTab === 'overview'" class="tab-panel">
        <DataOverviewPanel />
      </div>

      <!-- 态势大屏 -->
      <div v-show="currentTab === 'dashboard'" class="tab-panel">
        <DashboardPanel />
      </div>

      <!-- AI分析 -->
      <div v-show="currentTab === 'analysis'" class="tab-panel">
        <AnalysisPanel />
      </div>

      <!-- 智能预警 -->
      <div v-show="currentTab === 'alerts'" class="tab-panel">
        <AlertsPanel />
      </div>

      <!-- 多维筛选与对比分析 -->
      <div v-show="currentTab === 'filter'" class="tab-panel">
        <FilterSection />
      </div>
    </div>

    <!-- AI助手悬浮窗口 -->
    <AIChatAssistant />
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import { useRouter } from 'vue-router';
import DataUploadPanel from './panels/DataUploadPanel.vue';
import DataOverviewPanel from './panels/DataOverviewPanel.vue';
import DashboardPanel from './panels/DashboardPanel.vue';
import AnalysisPanel from './panels/AnalysisPanel.vue';
import AlertsPanel from './panels/AlertsPanel.vue';
import FilterSection from './panels/FilterSection.vue';
import AIChatAssistant from '@/components/AIChat/AIChatAssistant.vue';

const router = useRouter();

// SVG图标组件
const UploadIcon = () => h('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
  h('polyline', { points: '17 8 12 3 7 8' }),
  h('line', { x1: '12', x2: '12', y1: '3', y2: '15' })
]);

const BarChartIcon = () => h('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('line', { x1: '12', x2: '12', y1: '20', y2: '10' }),
  h('line', { x1: '18', x2: '18', y1: '20', y2: '4' }),
  h('line', { x1: '6', x2: '6', y1: '20', y2: '16' })
]);

const BrainIcon = () => h('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z' }),
  h('path', { d: 'M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z' })
]);

const LayoutIcon = () => h('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }),
  h('path', { d: 'M3 9h18' }),
  h('path', { d: 'M9 21V9' })
]);

const BellIcon = () => h('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' }),
  h('path', { d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0' })
]);

const FilterIcon = () => h('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('polygon', { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46' })
]);

const tabs = [
  { value: 'upload', label: '数据上传', icon: UploadIcon },
  { value: 'overview', label: '数据概览', icon: BarChartIcon },
  { value: 'dashboard', label: '态势大屏', icon: LayoutIcon },
  { value: 'analysis', label: 'AI分析', icon: BrainIcon },
  { value: 'filter', label: '多维筛选', icon: FilterIcon },
  { value: 'alerts', label: '智能预警', icon: BellIcon }
];

const currentTab = ref('upload');

// 处理tab切换
const handleTabChange = (tab: any) => {
  if (tab.route) {
    router.push(tab.route);
  } else {
    currentTab.value = tab.value;
  }
};
</script>

<style scoped>
.home-view {
  width: 100%;
}

/* Tab导航样式 */
.tabs-container {
  margin-bottom: 1.5rem;
}

.tabs-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.5rem;
}

@media (max-width: 1200px) {
  .tabs-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .tabs-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.tab-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.tab-button:hover {
  background: var(--background-mute);
  color: var(--text-secondary);
}

.tab-button.active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--glow-primary);
}

.tab-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.tab-content {
  animation: fadeIn 0.3s ease-out;
}

.tab-panel {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 1024px) {
  .tabs-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .tabs-list {
    grid-template-columns: 1fr;
  }

  .tab-button {
    justify-content: flex-start;
    padding: 0.875rem 1rem;
  }
}
</style>
