<template>
  <div class="filter-section">
    <div class="section-header">
      <h3>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46"/>
        </svg>
        多维筛选与对比分析
      </h3>
      <div style="display: flex; gap: 12px;">
        <el-button type="primary" @click="applyFilter">
          应用筛选
        </el-button>
        <el-button @click="resetFilter">
          重置
        </el-button>
      </div>
    </div>

    <div class="filter-content">
      <div class="filter-tabs">
        <div class="tab-header">
          <div
            :class="['tab-item', activeFilterTab === 'single' ? 'active' : '']"
            @click="activeFilterTab = 'single'"
          >
            单期筛选
          </div>
          <div
            :class="['tab-item', activeFilterTab === 'compare' ? 'active' : '']"
            @click="activeFilterTab = 'compare'"
          >
            对比分析
          </div>
        </div>

        <!-- 单期筛选 -->
        <div v-if="activeFilterTab === 'single'" class="tab-content">
          <div class="filter-form">
            <div class="form-row">
              <!-- 数据源 -->
              <div class="form-group">
                <label>数据源</label>
                <el-select v-model="singleFilters.dataSource" placeholder="选择数据源" style="width: 100%;">
                  <el-option label="全部" value="all" />
                  <el-option label="市民事件" value="event" />
                  <el-option label="传感器数据" value="sensor" />
                </el-select>
              </div>

              <!-- 区域 -->
              <div class="form-group">
                <label>区域</label>
                <el-select v-model="singleFilters.district" placeholder="选择区域" style="width: 100%;" filterable>
                  <el-option label="全部区域" value="all" />
                  <el-option
                    v-for="district in districts"
                    :key="district"
                    :label="district"
                    :value="district"
                  />
                </el-select>
              </div>
            </div>

            <div class="form-row">
              <!-- 问题类型 -->
              <div class="form-group">
                <label>问题类型</label>
                <el-select v-model="singleFilters.type" placeholder="选择类型" style="width: 100%;" filterable>
                  <el-option label="全部类型" value="all" />
                  <el-option
                    v-for="type in problemTypes"
                    :key="type"
                    :label="type"
                    :value="type"
                  />
                </el-select>
              </div>

              <!-- 时间范围 -->
              <div class="form-group">
                <label>时间范围</label>
                <el-date-picker
                  v-model="singleFilters.dateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  style="width: 100%;"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </div>
            </div>
          </div>

          <!-- 筛选结果 -->
          <div class="filter-results" v-if="filteredData.length > 0">
            <div class="results-header">
              <h4>筛选结果 ({{ filteredData.length }})</h4>
            </div>
            <div class="results-stats">
              <div class="stat-card">
                <div class="stat-label">事件数量</div>
                <div class="stat-value">{{ eventCount }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">传感器数据</div>
                <div class="stat-value">{{ sensorCount }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">异常数量</div>
                <div class="stat-value">{{ abnormalCount }}</div>
              </div>
            </div>
            <div class="results-list">
              <el-table :data="filteredData.slice(0, 10)" style="width: 100%">
                <el-table-column prop="dataType" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.dataType === 'event' ? 'primary' : 'success'">
                      {{ row.dataType === 'event' ? '事件' : '传感器' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="问题类型" width="150" />
                <el-table-column prop="location.district" label="区域" width="120" />
                <el-table-column prop="location.street" label="街道" width="150" />
                <el-table-column prop="reportTime" label="时间" width="180">
                  <template #default="{ row }">
                    {{ formatTime(row.dataType === 'event' ? row.reportTime : row.timestamp) }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态">
                  <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <div v-if="filteredData.length > 10" class="more-indicator">
                显示前 10 条，共 {{ filteredData.length }} 条数据
              </div>
            </div>
          </div>

          <div v-else class="no-results">
            <el-empty description="暂无符合条件的数据" />
          </div>
        </div>

        <!-- 对比分析 -->
        <div v-if="activeFilterTab === 'compare'" class="tab-content">
          <div class="compare-form">
            <div class="compare-row">
              <div class="compare-section">
                <h4>时间段 A</h4>
                <div class="form-group">
                  <label>时间范围</label>
                  <el-date-picker
                    v-model="compareFilters.periodA.dateRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    style="width: 100%;"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  />
                </div>
                <div class="form-group">
                  <label>区域</label>
                  <el-select v-model="compareFilters.periodA.district" placeholder="选择区域" style="width: 100%;" filterable>
                    <el-option label="全部区域" value="all" />
                    <el-option
                      v-for="district in districts"
                      :key="district"
                      :label="district"
                      :value="district"
                    />
                  </el-select>
                </div>
                <div class="form-group">
                  <label>问题类型</label>
                  <el-select v-model="compareFilters.periodA.type" placeholder="选择类型" style="width: 100%;" filterable>
                    <el-option label="全部类型" value="all" />
                    <el-option
                      v-for="type in problemTypes"
                      :key="type"
                      :label="type"
                      :value="type"
                    />
                  </el-select>
                </div>
              </div>

              <div class="vs-divider">VS</div>

              <div class="compare-section">
                <h4>时间段 B</h4>
                <div class="form-group">
                  <label>时间范围</label>
                  <el-date-picker
                    v-model="compareFilters.periodB.dateRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    style="width: 100%;"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  />
                </div>
                <div class="form-group">
                  <label>区域</label>
                  <el-select v-model="compareFilters.periodB.district" placeholder="选择区域" style="width: 100%;" filterable>
                    <el-option label="全部区域" value="all" />
                    <el-option
                      v-for="district in districts"
                      :key="district"
                      :label="district"
                      :value="district"
                    />
                  </el-select>
                </div>
                <div class="form-group">
                  <label>问题类型</label>
                  <el-select v-model="compareFilters.periodB.type" placeholder="选择类型" style="width: 100%;" filterable>
                    <el-option label="全部类型" value="all" />
                    <el-option
                      v-for="type in problemTypes"
                      :key="type"
                      :label="type"
                      :value="type"
                    />
                  </el-select>
                </div>
              </div>
            </div>
          </div>

          <!-- 对比结果 -->
          <div class="compare-results" v-if="compareData.periodA.length > 0 || compareData.periodB.length > 0">
            <div class="results-header">
              <h4>对比分析结果</h4>
            </div>
            <div class="compare-stats">
              <div class="compare-card period-a">
                <div class="period-label">时间段 A</div>
                <div class="compare-numbers">
                  <div class="number-item">
                    <div class="number-label">事件数量</div>
                    <div class="number-value">{{ compareStats.periodAEvents }}</div>
                  </div>
                  <div class="number-item">
                    <div class="number-label">异常数量</div>
                    <div class="number-value">{{ compareStats.periodAAbnormal }}</div>
                  </div>
                </div>
              </div>

              <div class="vs-divider-large">对比</div>

              <div class="compare-card period-b">
                <div class="period-label">时间段 B</div>
                <div class="compare-numbers">
                  <div class="number-item">
                    <div class="number-label">事件数量</div>
                    <div class="number-value">{{ compareStats.periodBEvents }}</div>
                  </div>
                  <div class="number-item">
                    <div class="number-label">异常数量</div>
                    <div class="number-value">{{ compareStats.periodBAbnormal }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="change-analysis">
              <h5>变化趋势</h5>
              <div class="trend-item">
                <span>事件数量变化：</span>
                <span :class="getTrendClass(compareStats.periodBEvents - compareStats.periodAEvents)">
                  {{ getTrendText(compareStats.periodBEvents - compareStats.periodAEvents) }}
                </span>
              </div>
              <div class="trend-item">
                <span>异常数量变化：</span>
                <span :class="getTrendClass(compareStats.periodBAbnormal - compareStats.periodAAbnormal)">
                  {{ getTrendText(compareStats.periodBAbnormal - compareStats.periodAAbnormal) }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="no-results">
            <el-empty description="请设置对比的时间段和条件" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useDataStore } from '@/stores/data';
import type { CityEvent, SensorData } from '@/types/city';

const dataStore = useDataStore();

const activeFilterTab = ref('single');

// 单期筛选条件
const singleFilters = ref({
  dataSource: 'all',
  district: 'all',
  type: 'all',
  dateRange: null as any
});

// 对比分析条件
const compareFilters = ref({
  periodA: {
    dateRange: null as any,
    district: 'all',
    type: 'all'
  },
  periodB: {
    dateRange: null as any,
    district: 'all',
    type: 'all'
  }
});

// 预设的区域和问题类型
const districts = computed(() => {
  const eventDistricts = [...new Set(dataStore.cityEvents.map(e => e.location.district))];
  const sensorDistricts = [...new Set(dataStore.sensorData.map(s => s.location.district))];
  return [...new Set([...eventDistricts, ...sensorDistricts])].sort();
});

const problemTypes = computed(() => {
  const eventTypes = [...new Set(dataStore.cityEvents.map(e => e.type))];
  const sensorTypes = [...new Set(dataStore.sensorData.map(s => s.type))];
  return [...new Set([...eventTypes, ...sensorTypes])].sort();
});

// 筛选逻辑
const filteredData = computed(() => {
  let data: any[] = [];

  // 根据数据源选择数据
  if (singleFilters.value.dataSource === 'all' || singleFilters.value.dataSource === 'event') {
    data = [...data, ...dataStore.cityEvents.map(e => ({ ...e, dataType: 'event' }))];
  }
  if (singleFilters.value.dataSource === 'all' || singleFilters.value.dataSource === 'sensor') {
    data = [...data, ...dataStore.sensorData.map(s => ({ ...s, dataType: 'sensor' }))];
  }

  // 区域筛选
  if (singleFilters.value.district !== 'all') {
    data = data.filter(item => item.location.district === singleFilters.value.district);
  }

  // 类型筛选
  if (singleFilters.value.type !== 'all') {
    data = data.filter(item => item.type === singleFilters.value.type);
  }

  // 时间范围筛选
  if (singleFilters.value.dateRange && singleFilters.value.dateRange.length === 2) {
    const start = new Date(singleFilters.value.dateRange[0]);
    const end = new Date(singleFilters.value.dateRange[1]);
    data = data.filter(item => {
      const timeStr = item.dataType === 'event' ? item.reportTime : item.timestamp;
      const time = new Date(timeStr);
      return time >= start && time <= end;
    });
  }

  return data.sort((a: any, b: any) => {
    const timeA = a.dataType === 'event' ? a.reportTime : a.timestamp;
    const timeB = b.dataType === 'event' ? b.reportTime : b.timestamp;
    return new Date(timeB).getTime() - new Date(timeA).getTime();
  });
});

// 统计数据
const eventCount = computed(() => filteredData.value.filter((item: any) => item.dataType === 'event').length);
const sensorCount = computed(() => filteredData.value.filter((item: any) => item.dataType === 'sensor').length);
const abnormalCount = computed(() => filteredData.value.filter((item: any) => item.status === '异常' || item.status === '紧急').length);

// 对比分析数据
const compareData = computed(() => {
  const filterPeriod = (period: any) => {
    let data: any[] = [];

    // 合并事件和传感器数据
    data = [
      ...dataStore.cityEvents.map(e => ({ ...e, dataType: 'event' })),
      ...dataStore.sensorData.map(s => ({ ...s, dataType: 'sensor' }))
    ];

    // 区域筛选
    if (period.district !== 'all') {
      data = data.filter(item => item.location.district === period.district);
    }

    // 类型筛选
    if (period.type !== 'all') {
      data = data.filter(item => item.type === period.type);
    }

    // 时间范围筛选
    if (period.dateRange && period.dateRange.length === 2) {
      const start = new Date(period.dateRange[0]);
      const end = new Date(period.dateRange[1]);
      data = data.filter(item => {
        const timeStr = item.dataType === 'event' ? item.reportTime : item.timestamp;
        const time = new Date(timeStr);
        return time >= start && time <= end;
      });
    }

    return data;
  };

  return {
    periodA: filterPeriod(compareFilters.value.periodA),
    periodB: filterPeriod(compareFilters.value.periodB)
  };
});

// 对比统计数据
const compareStats = computed(() => {
  const periodAEvents = compareData.value.periodA.filter((item: any) => item.dataType === 'event').length;
  const periodBEvents = compareData.value.periodB.filter((item: any) => item.dataType === 'event').length;

  const periodAAbnormal = compareData.value.periodA.filter((item: any) =>
    item.status === '异常' || item.status === '紧急'
  ).length;
  const periodBAbnormal = compareData.value.periodB.filter((item: any) =>
    item.status === '异常' || item.status === '紧急'
  ).length;

  return {
    periodAEvents,
    periodBEvents,
    periodAAbnormal,
    periodBAbnormal
  };
});

// 方法
const applyFilter = () => {
  ElMessage.success('筛选已应用');
};

const resetFilter = () => {
  singleFilters.value = {
    dataSource: 'all',
    district: 'all',
    type: 'all',
    dateRange: null
  };
  compareFilters.value = {
    periodA: {
      dateRange: null,
      district: 'all',
      type: 'all'
    },
    periodB: {
      dateRange: null,
      district: 'all',
      type: 'all'
    }
  };
  ElMessage.info('筛选条件已重置');
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '-';
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    '紧急': 'danger',
    '异常': 'warning',
    '正常': 'success',
    '处理中': 'primary',
    '已派单': 'info',
    '未处理': 'info',
    '核查中': 'warning'
  };
  return typeMap[status] || 'info';
};

const getTrendClass = (change: number) => {
  if (change > 0) return 'trend-up';
  if (change < 0) return 'trend-down';
  return 'trend-same';
};

const getTrendText = (change: number) => {
  if (change > 0) return `↑ 上升 ${change}`;
  if (change < 0) return `↓ 下降 ${Math.abs(change)}`;
  return '→ 无变化';
};
</script>

<style scoped>
.filter-section {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 229, 255, 0.2);
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-content {
  margin-top: 1rem;
}

.filter-tabs {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.tab-header {
  display: flex;
  background: rgba(30, 41, 59, 0.8);
  border-bottom: 1px solid var(--border-color);
}

.tab-item {
  flex: 1;
  padding: 1rem;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: rgba(148, 163, 184, 0.9);
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.tab-item:hover {
  background: rgba(0, 229, 255, 0.1);
  color: var(--primary-color);
}

.tab-item.active {
  background: rgba(0, 229, 255, 0.15);
  color: var(--primary-color);
  font-weight: 600;
  border-bottom: 2px solid var(--primary-color);
}

.tab-content {
  padding: 2rem;
  background: rgba(15, 23, 42, 0.4);
}

/* 表单样式 */
.filter-form {
  margin-bottom: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 结果展示 */
.filter-results {
  margin-top: 2rem;
}

.results-header {
  margin-bottom: 1rem;
}

.results-header h4 {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0;
}

.results-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
}

.results-list {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.more-indicator {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
  font-size: 12px;
}

/* 对比分析样式 */
.compare-form {
  margin-bottom: 2rem;
}

.compare-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
  align-items: start;
}

.compare-section {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
}

.compare-section h4 {
  font-size: 14px;
  color: var(--primary-color);
  margin: 0 0 1rem 0;
}

.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 100%;
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.compare-results {
  margin-top: 2rem;
}

.compare-stats {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  align-items: stretch;
}

.compare-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
}

.compare-card.period-a {
  border-color: rgba(59, 130, 246, 0.5);
}

.compare-card.period-b {
  border-color: rgba(16, 185, 129, 0.5);
}

.period-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  text-align: center;
}

.compare-numbers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.number-item {
  text-align: center;
}

.number-label {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.number-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
}

.vs-divider-large {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

.change-analysis {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.change-analysis h5 {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 14px;
}

.trend-up {
  color: #f56c6c;
  font-weight: 600;
}

.trend-down {
  color: #67c23a;
  font-weight: 600;
}

.trend-same {
  color: var(--text-secondary);
  font-weight: 600;
}

.no-results {
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
}

/* 响应式 */
@media (max-width: 1024px) {
  .form-row,
  .compare-row,
  .compare-stats {
    grid-template-columns: 1fr;
  }

  .vs-divider,
  .vs-divider-large {
    display: none;
  }
}

/* 样式覆盖 */
.filter-section :deep(.el-table th.el-table__cell) {
  background: var(--background-mute) !important;
  border-bottom: 2px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.filter-section :deep(.el-table td.el-table__cell) {
  background: var(--background-soft) !important;
  border-bottom: 1px solid var(--border-color) !important;
  color: var(--text-secondary) !important;
}

.filter-section :deep(.el-table__body tr:hover > td.el-table__cell) {
  background: rgba(6, 182, 212, 0.1) !important;
}

.filter-section :deep(.el-table) {
  background: transparent !important;
  border: 1px solid var(--border-color) !important;
}

.filter-section :deep(.el-select .el-input__wrapper),
.filter-section :deep(.el-date-picker .el-input__wrapper),
.filter-section :deep(.el-date-editor.el-input__wrapper) {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: none;
  outline: none;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.filter-section :deep(.el-select .el-input__wrapper:hover),
.filter-section :deep(.el-date-picker .el-input__wrapper:hover),
.filter-section :deep(.el-date-editor.el-input__wrapper:hover) {
  border-color: var(--border-primary-hover);
}

.filter-section :deep(.el-select .el-input__wrapper.is-focus),
.filter-section :deep(.el-date-picker .el-input__wrapper.is-focus),
.filter-section :deep(.el-date-editor.el-input__wrapper.is-focus) {
  border-color: var(--primary-color);
  background: var(--background-soft);
}

.filter-section :deep(.el-select .el-input__inner),
.filter-section :deep(.el-date-picker .el-input__inner),
.filter-section :deep(.el-range-input) {
  color: var(--text-secondary);
  font-size: 14px;
  background: transparent;
}

.filter-section :deep(.el-select .el-input__inner::placeholder),
.filter-section :deep(.el-date-picker .el-input__inner::placeholder),
.filter-section :deep(.el-range-input::placeholder) {
  color: var(--text-tertiary);
}

.filter-section :deep(.el-range-separator) {
  color: var(--text-secondary);
  font-size: 14px;
}

.filter-section :deep(.el-select .el-select-dropdown),
.filter-section :deep(.el-date-picker .el-picker-panel) {
  background: var(--background-mute);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.filter-section :deep(.el-select .el-select-dropdown__item),
.filter-section :deep(.el-date-picker .el-year-grid td .cell),
.filter-section :deep(.el-date-picker .el-month-grid td .cell) {
  color: var(--text-secondary);
}

.filter-section :deep(.el-select .el-select-dropdown__item:hover),
.filter-section :deep(.el-date-picker .el-year-grid td .cell:hover),
.filter-section :deep(.el-date-picker .el-month-grid td .cell:hover),
.filter-section :deep(.el-date-picker .el-date-table td .cell:hover) {
  color: var(--primary-color);
  background: rgba(0, 229, 255, 0.1);
}

.filter-section :deep(.el-select .el-select-dropdown__item.is-selected) {
  background: rgba(0, 229, 255, 0.25);
  color: var(--primary-color);
  font-weight: 600;
}

.filter-section :deep(.el-date-picker .el-date-table td.today .cell) {
  color: var(--primary-color);
  background: rgba(0, 229, 255, 0.2);
}

.filter-section :deep(.el-date-picker .el-date-table td.available.in-range) {
  background: rgba(0, 229, 255, 0.15);
}

.filter-section :deep(.el-date-picker .el-date-table td.in-range .cell) {
  color: var(--text-primary);
  background: rgba(0, 229, 255, 0.2);
}

.filter-section :deep(.el-date-picker .el-date-table td.selected .cell) {
  background: var(--primary-color);
  color: white;
}

/* 日期选择器面板额外样式 */
.filter-section :deep(.el-picker-panel__body-wrapper) {
  background: transparent;
}

.filter-section :deep(.el-date-picker__header) {
  color: var(--text-primary);
}

.filter-section :deep(.el-date-table td) {
  color: var(--text-secondary);
}

.filter-section :deep(.el-date-table td .el-date-table-cell) {
  color: var(--text-secondary);
}

.filter-section :deep(.el-date-table td.available .el-date-table-cell__text) {
  color: var(--text-secondary) !important;
}

.filter-section :deep(.el-date-table td.current:not(.disabled) .el-date-table-cell__text) {
  color: var(--primary-color) !important;
}

.filter-section :deep(.el-picker-panel__icon-btn) {
  color: var(--text-secondary) !important;
}

.filter-section :deep(.el-date-picker__header-label) {
  color: var(--text-primary) !important;
}

.filter-section :deep(.el-date-table th) {
  color: var(--text-muted) !important;
}

/* 日期选择器底部按钮 */
.filter-section :deep(.el-picker-panel__footer) {
  background: var(--background-mute) !important;
  border-top: 1px solid var(--border-color) !important;
  padding: 8px !important;
}

.filter-section :deep(.el-picker-panel__link-btn) {
  color: var(--primary-color) !important;
  font-weight: 500 !important;
}

.filter-section :deep(.el-picker-panel__link-btn:hover) {
  color: var(--primary-light) !important;
}

.filter-section :deep(.el-picker-panel__footer .el-button) {
  background: var(--background-elevated) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-secondary) !important;
}

.filter-section :deep(.el-picker-panel__footer .el-button:hover) {
  border-color: var(--primary-color) !important;
  color: var(--primary-color) !important;
}

.filter-section :deep(.el-picker-panel__footer .el-button--primary) {
  background: var(--gradient-primary) !important;
  border: none !important;
  color: white !important;
}

.filter-section :deep(.el-picker-panel__footer .el-button--primary:hover) {
  opacity: 0.9;
}

</style>
