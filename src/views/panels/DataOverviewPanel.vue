<template>
  <div class="data-overview-panel">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon cyan">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">事件总数</div>
          <div class="stat-value">{{ stats.eventTotal }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon red">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" x2="12" y1="9" y2="13"/>
            <line x1="12" x2="12.01" y1="17" y2="17"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">传感器异常</div>
          <div class="stat-value">{{ stats.sensorAbnormal }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">设备在线率</div>
          <div class="stat-value">{{ stats.sensorOnlineRate }}%</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M9 21V9"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">传感器总数</div>
          <div class="stat-value">{{ stats.sensorTotal }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            事件类型分布
          </h3>
        </div>
        <div class="chart-content">
          <div v-if="dataStore.cityEvents.length === 0" class="empty-state">
            <p>请先上传数据</p>
          </div>
          <div v-else ref="pieChartRef" class="chart-container"></div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            区域分布
          </h3>
        </div>
        <div class="chart-content">
          <div v-if="dataStore.cityEvents.length === 0" class="empty-state">
            <p>请先上传数据</p>
          </div>
          <div v-else ref="barChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- 视图切换 -->
    <div class="view-switch">
      <button
        v-for="mode in viewModes"
        :key="mode.value"
        :class="['view-btn', { active: dataStore.currentView === mode.value }]"
        @click="dataStore.setCurrentView(mode.value); currentPage = 1;"
      >
        {{ mode.label }}
      </button>
    </div>

    <!-- 筛选器 -->
    <div class="filter-bar">
      <div class="filter-group">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索描述/设备..."
          class="search-input"
        />
        <select v-model="selectedType" class="filter-select">
          <option value="">所有类型</option>
          <option v-for="type in availableTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <select v-model="selectedStatus" class="filter-select">
          <option value="">所有状态</option>
          <option v-for="status in availableStatuses" :key="status" :value="status">{{ status }}</option>
        </select>
        <select v-model="selectedDistrict" class="filter-select">
          <option value="">所有区域</option>
          <option v-for="district in availableDistricts" :key="district" :value="district">{{ district }}</option>
        </select>
        <button v-if="hasActiveFilters" class="filter-clear-btn" @click="clearFilters">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          清除筛选
        </button>
      </div>
      <div class="filter-count">
        显示 {{ filteredData.length }} 条数据
      </div>
    </div>

    <!-- 数据列表 -->
    <div class="data-table">
      <div class="table-wrapper">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>类型</th>
                <th>描述/设备</th>
                <th>位置</th>
                <th>状态</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="displayData.length === 0">
                <td colspan="5" class="empty-data">
                  <div class="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 6H6a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4"/>
                      <path d="M13 8V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4"/>
                      <line x1="22" x2="22" y1="12" y2="12"/>
                    </svg>
                  </div>
                  <p>请先上传数据</p>
                </td>
              </tr>
              <tr v-else v-for="(item, index) in displayData" :key="index">
                <td>
                  <span v-if="item.dataType === 'event'" class="badge event">市民事件</span>
                  <span v-else class="badge sensor">传感器</span>
                </td>
                <td>{{ item.dataType === 'event' ? item.description : (item.type + ' (' + item.sensorId + ')') }}</td>
                <td>{{ item.location.district }}</td>
                <td>
                  <span class="status-badge">{{ item.status }}</span>
                </td>
                <td>{{ formatTime(item.dataType === 'event' ? item.reportTime : item.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="table-pagination">
          <div class="pagination-info">
            共 {{ totalItems }} 条数据，第 {{ currentPage }} / {{ Math.max(totalPages, 1) }} 页
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" :disabled="currentPage <= 1" @click="prevPage">上一页</button>
            <button class="pagination-btn" :disabled="currentPage >= totalPages || totalPages === 0" @click="nextPage">下一页</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { useDataStore } from '@/stores/data';

const dataStore = useDataStore();
const currentView = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(20);

// 筛选相关的响应式数据
const searchKeyword = ref('');
const selectedType = ref('');
const selectedStatus = ref('');
const selectedDistrict = ref('');

const viewModes = [
  { value: 'all', label: '合并视图' },
  { value: 'events', label: '仅事件' },
  { value: 'sensors', label: '仅传感器' }
];

const pieChartRef = ref<HTMLDivElement>();
const barChartRef = ref<HTMLDivElement>();

// 统计数据
const stats = computed(() => {
  const eventTotal = dataStore.cityEvents.length;
  const sensorTotal = dataStore.sensorData.length;
  const sensorAbnormal = dataStore.sensorData.filter(s => s.status === '异常').length;
  const sensorOnlineRate = sensorTotal > 0
    ? ((sensorTotal - sensorAbnormal) / sensorTotal * 100).toFixed(1)
    : '0';

  return {
    eventTotal,
    sensorTotal,
    sensorAbnormal,
    sensorOnlineRate
  };
});

// 可用的筛选选项
const availableTypes = computed(() => {
  const types = new Set<string>();
  dataStore.mergedData.forEach(item => {
    if (item.dataType === 'event') {
      types.add(item.type);
    } else {
      types.add(item.type);
    }
  });
  return Array.from(types).sort();
});

const availableStatuses = computed(() => {
  const statuses = new Set<string>();
  dataStore.mergedData.forEach(item => {
    statuses.add(item.status);
  });
  return Array.from(statuses).sort();
});

const availableDistricts = computed(() => {
  const districts = new Set<string>();
  dataStore.mergedData.forEach(item => {
    if (item.location && item.location.district) {
      districts.add(item.location.district);
    }
  });
  return Array.from(districts).sort();
});

// 筛选后的数据
const filteredData = computed(() => {
  let data = dataStore.mergedData;

  // 搜索关键词筛选
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase();
    data = data.filter(item => {
      const searchText = item.dataType === 'event'
        ? `${item.description} ${item.type}`.toLowerCase()
        : `${item.type} ${item.sensorId}`.toLowerCase();
      return searchText.includes(keyword);
    });
  }

  // 类型筛选
  if (selectedType.value) {
    data = data.filter(item => item.type === selectedType.value);
  }

  // 状态筛选
  if (selectedStatus.value) {
    data = data.filter(item => item.status === selectedStatus.value);
  }

  // 区域筛选
  if (selectedDistrict.value) {
    data = data.filter(item => item.location?.district === selectedDistrict.value);
  }

  return data;
});

// 是否有激活的筛选条件
const hasActiveFilters = computed(() => {
  return !!(searchKeyword.value || selectedType.value || selectedStatus.value || selectedDistrict.value);
});

// 清除所有筛选
const clearFilters = () => {
  searchKeyword.value = '';
  selectedType.value = '';
  selectedStatus.value = '';
  selectedDistrict.value = '';
  currentPage.value = 1;
};

// 分页数据（基于筛选后的数据）
const displayData = computed(() => {
  const allData = filteredData.value;
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return allData.slice(startIndex, endIndex);
});

const totalItems = computed(() => filteredData.value.length);

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

// 页码操作方法
const prevPage = () => {
  if (currentPage.value > 1 && totalItems.value > 0) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value && totalItems.value > 0) {
    currentPage.value++;
  }
};

// 时间格式化
function formatTime(timeStr: string) {
  if (!timeStr) return '-';
  return new Date(timeStr).toLocaleString('zh-CN');
}

// 初始化图表
let pieChart: echarts.ECharts | null = null;
let barChart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

function initCharts() {
  if (!pieChartRef.value || !barChartRef.value) return;

  // 先清理之前的观察器
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  // 先销毁旧图表实例
  if (pieChart) {
    pieChart.dispose();
    pieChart = null;
  }
  if (barChart) {
    barChart.dispose();
    barChart = null;
  }

  // 使用ResizeObserver监听容器尺寸
  resizeObserver = new ResizeObserver(() => {
    const pieEl = pieChartRef.value!;
    const barEl = barChartRef.value!;

    // 只有当容器有实际尺寸时才初始化
    if (pieEl.clientWidth > 0 && pieEl.clientHeight > 0 &&
        barEl.clientWidth > 0 && barEl.clientHeight > 0) {

      resizeObserver?.disconnect();

      // 事件类型饼图
      const eventTypeCount = dataStore.eventsByType.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {} as Record<string, number>);

      pieChart = echarts.init(pieEl);
      pieChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(6, 182, 212, 0.3)',
          borderWidth: 1,
          textStyle: { color: '#fff' }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { color: '#94a3b8' }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#0f172a',
              borderWidth: 2
            },
            label: {
              show: true,
              position: 'outside',
              color: '#cbd5e1',
              formatter: '{b}\n{d}%',
              padding: [0, -20, 0, -20]
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(6, 182, 212, 0.5)'
              }
            },
            data: Object.entries(eventTypeCount).map(([name, value], index) => ({
              name,
              value,
              itemStyle: {
                color: [
                  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
                  '#10b981', '#ef4444', '#14b8a6', '#f97316', '#a855f7'
                ][index % 10]
              }
            }))
          }
        ]
      });

      // 区域分布柱状图
      const districtCount = dataStore.eventsByDistrict.reduce((acc, item) => {
        acc[item.district] = item.count;
        return acc;
      }, {} as Record<string, number>);

      barChart = echarts.init(barEl);
      barChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(6, 182, 212, 0.3)',
          borderWidth: 1,
          textStyle: { color: '#fff' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: Object.keys(districtCount),
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8', rotate: 30 }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8' },
          splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
        },
        series: [
          {
            name: '事件数量',
            type: 'bar',
            data: Object.values(districtCount),
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#06b6d4' },
                { offset: 1, color: '#0891b2' }
              ])
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(6, 182, 212, 0.5)'
              }
            }
          }
        ]
      });
    }
  });

  // 开始监听两个容器的尺寸变化
  resizeObserver.observe(pieChartRef.value);
  resizeObserver.observe(barChartRef.value);
}

// 窗口大小变化时重新调整图表
const handleResize = () => {
  if (pieChart) pieChart.resize();
  if (barChart) barChart.resize();
};

onMounted(() => {
  // 每次挂载时都重新初始化图表
  nextTick(() => {
    if (dataStore.cityEvents.length > 0) {
      initCharts();
    }
  });

  // 注册窗口大小变化监听器
  window.addEventListener('resize', handleResize);
});

watch(() => [dataStore.cityEvents.length, dataStore.sensorData.length], () => {
  // 数据变化时重新初始化图表
  nextTick(() => initCharts());
});

// 组件卸载时清理图表实例
onUnmounted(() => {
  // 移除窗口大小变化监听器
  window.removeEventListener('resize', handleResize);

  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (pieChart) {
    pieChart.dispose();
    pieChart = null;
  }
  if (barChart) {
    barChart.dispose();
    barChart = null;
  }
});

watch(() => dataStore.currentView, () => {
  currentPage.value = 1;
});

watch(totalItems, (newTotal) => {
  if (newTotal === 0) {
    currentPage.value = 1;
  } else if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});
</script>

<style scoped>
.data-overview-panel {
  width: 100%;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all var(--transition-normal);
}

.stat-card:hover {
  border-color: var(--border-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.cyan {
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  color: var(--primary-color);
}

.stat-icon.red {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--error-color);
}

.stat-icon.green {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: var(--success-color);
}

.stat-icon.blue {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: var(--info-color);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

/* 图表区域 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.chart-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.chart-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chart-content {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
}

/* 表格样式 */
.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.badge.event {
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: var(--primary-color);
}

.badge.sensor {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #a855f7;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

/* 分页 */
.table-pagination {
  padding: 1rem;
  background: var(--background-mute);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.pagination-info {
  font-size: 14px;
  color: var(--text-muted);
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--border-primary);
  color: var(--text-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 视图切换 */
.view-switch {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.view-btn:hover {
  border-color: var(--border-primary-hover);
  color: var(--text-secondary);
}

.view-btn.active {
  background: var(--gradient-primary);
  border-color: transparent;
  color: white;
  box-shadow: var(--glow-primary);
}

/* 筛选器 */
.filter-bar {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  flex-wrap: wrap;
}

.search-input {
  padding: 0.5rem 1rem;
  background: var(--background-mute);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  outline: none;
  transition: all var(--transition-normal);
  min-width: 200px;
}

.search-input:focus {
  border-color: var(--border-primary);
  background: var(--background-soft);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.filter-select {
  padding: 0.5rem 1rem;
  background: var(--background-mute);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  outline: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 120px;
}

.filter-select:hover {
  border-color: var(--border-primary-hover);
}

.filter-select:focus {
  border-color: var(--border-primary);
  background: var(--background-soft);
}

.filter-clear-btn {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: var(--error-color);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--transition-normal);
}

.filter-clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.filter-count {
  font-size: 14px;
  color: var(--text-muted);
  white-space: nowrap;
  padding: 0.5rem 1rem;
  background: var(--background-mute);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

/* 数据表格 */
.data-table {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.table-wrapper {
  display: flex;
  flex-direction: column;
  max-height: 500px;
}

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  flex: 1;
  max-height: 400px;
  min-height: 200px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--background-mute);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

thead th {
  padding: 1rem;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: background var(--transition-normal);
}

tbody tr:hover {
  background: var(--background-mute);
}

tbody td {
  padding: 1rem;
  font-size: 14px;
  color: var(--text-secondary);
}

.empty-data {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-data p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .view-switch {
    flex-wrap: wrap;
  }

  .view-btn {
    flex: 1;
    min-width: 100px;
  }
}
</style>
