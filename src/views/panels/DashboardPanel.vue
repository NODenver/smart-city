<template>
  <div class="dashboard-panel">
    <!-- 关键指标区域 -->
    <div class="metrics-grid">
      <div class="metric-card cyan">
        <div class="metric-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-label">今日事件</div>
          <div class="metric-value">{{ dashboardStats.eventTotal }}</div>
          <div class="metric-trend up">+{{ Math.round(Math.random() * 20) }}%</div>
        </div>
      </div>

      <div class="metric-card green">
        <div class="metric-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-label">已处理</div>
          <div class="metric-value">{{ dashboardStats.resolvedEvents }}</div>
          <div class="metric-trend up">+{{ Math.round(Math.random() * 15) }}%</div>
        </div>
      </div>

      <div class="metric-card red">
        <div class="metric-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" x2="12" y1="9" y2="13"/>
            <line x1="12" x2="12.01" y1="17" y2="17"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-label">异常设备</div>
          <div class="metric-value">{{ dashboardStats.abnormalSensors }}</div>
          <div class="metric-trend down">-{{ Math.round(Math.random() * 10) }}%</div>
        </div>
      </div>

      <div class="metric-card blue">
        <div class="metric-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6H6a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4"/>
            <path d="M13 8V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4"/>
            <line x1="22" x2="22" y1="12" y2="12"/>
          </svg>
        </div>
        <div class="metric-content">
          <div class="metric-label">设备在线率</div>
          <div class="metric-value">{{ dashboardStats.onlineRate }}%</div>
          <div class="metric-trend up">+{{ Math.round(Math.random() * 5) }}%</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="dashboard-grid">
      <!-- 左侧列 -->
      <div class="dashboard-column">
        <div class="chart-card">
          <div class="chart-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              城市问题热力分布
            </h3>
          </div>
          <div class="chart-content">
            <div class="heatmap-list">
              <div v-for="(item, index) in heatmapData" :key="index" class="heatmap-item">
                <div class="heatmap-header">
                  <span class="rank">{{ index + 1 }}</span>
                  <span class="name">{{ item.name }}</span>
                  <span class="value">{{ item.value }}</span>
                </div>
                <div class="heatmap-bar">
                  <div class="heatmap-fill" :style="{ width: item.percentage + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              城市运行健康度
            </h3>
          </div>
          <div class="chart-content">
            <div v-if="healthScoreData.length === 0" class="empty-chart">
              <p>请先上传数据</p>
            </div>
            <div v-else ref="radarChartRef" class="chart-container radar-chart-container"></div>
          </div>
        </div>
      </div>

      <!-- 中间列 -->
      <div class="dashboard-column">
        <div class="chart-card large">
          <div class="chart-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
              近7天问题趋势分析
            </h3>
          </div>
          <div class="chart-content">
            <div v-if="trendChartData.length === 0" class="empty-chart">
              <p>请先上传数据</p>
            </div>
            <div v-else ref="trendChartRef" class="chart-container"></div>
          </div>
        </div>

        <div class="charts-stack">
          <div class="chart-card">
            <div class="chart-header">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                问题类型分布
              </h3>
            </div>
            <div class="chart-content">
              <div v-if="typeChartData.length === 0" class="empty-chart">
                <p>请先上传数据</p>
              </div>
              <div v-else ref="typeChartRef" class="chart-container"></div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                24小时事件分布
              </h3>
            </div>
            <div class="chart-content">
              <div v-if="hourChartData.length === 0" class="empty-chart">
                <p>请先上传数据</p>
              </div>
              <div v-else ref="hourChartRef" class="chart-container"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧列 -->
      <div class="dashboard-column">
        <div class="chart-card full-height" style="height: 400px !important;">
          <div class="chart-header">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h20"/>
                <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/>
                <path d="m7 21 5-5 5 5"/>
              </svg>
              实时事件流
            </h3>
          </div>
          <div class="chart-content">
            <div class="event-stream">
              <div v-if="recentEvents.length === 0" class="empty-event-stream">
                <p>暂无事件数据</p>
              </div>
              <div v-else v-for="(event, index) in recentEvents" :key="event.id || index" class="event-item">
                <div class="event-dot"></div>
                <div class="event-content">
                  <div class="event-title">{{ event.description || event.type || '城市事件' }}</div>
                  <div class="event-meta">
                    <span class="event-location">{{ event.location?.district || '未知区域' }}</span>
                    <span class="event-time">{{ formatTime(event.reportTime || event.timestamp) }}</span>
                    <span v-if="event.dataType" class="event-badge">{{ event.dataType === 'event' ? '市民事件' : '传感器' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useDataStore } from '@/stores/data';
import * as echarts from 'echarts';

const currentTime = ref('');
let timer: number | null = null;
const dataStore = useDataStore();

const trendChartRef = ref<HTMLDivElement>();
const typeChartRef = ref<HTMLDivElement>();
const hourChartRef = ref<HTMLDivElement>();
const radarChartRef = ref<HTMLDivElement>();

// 图表实例
let trendChart: echarts.ECharts | null = null;
let typeChart: echarts.ECharts | null = null;
let hourChart: echarts.ECharts | null = null;
let radarChart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

// 更新当前时间
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 时间格式化
const formatTime = (timeStr: string) => {
  if (!timeStr) return '-';
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 计算统计数据
const dashboardStats = computed(() => {
  const eventTotal = dataStore.cityEvents.length;
  const sensorTotal = dataStore.sensorData.length;
  const resolvedEvents = dataStore.cityEvents.filter(e => e.status === '已派单').length;
  const abnormalSensors = dataStore.sensorData.filter(s => s.status === '异常').length;
  const onlineRate = sensorTotal > 0
    ? (((sensorTotal - abnormalSensors) / sensorTotal) * 100).toFixed(1)
    : '0';

  return {
    eventTotal,
    resolvedEvents,
    abnormalSensors,
    onlineRate
  };
});

// 热力图数据（基于真实数据）
const heatmapData = computed(() => {
  const districts = dataStore.eventsByDistrict
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const max = districts.length > 0 ? districts[0].count : 1;

  return districts.map(item => ({
    name: item.district,
    value: item.count,
    percentage: Math.round((item.count / max) * 100)
  }));
});

// 实时事件流（合并市民事件和传感器数据，取最新的15条）
const recentEvents = computed(() => {
  const merged = [
    ...dataStore.cityEvents.map(e => ({ ...e, dataType: 'event' })),
    ...dataStore.sensorData.map(s => ({ ...s, dataType: 'sensor' }))
  ].sort((a: any, b: any) => {
    const timeA = a.dataType === 'event' ? a.reportTime : a.timestamp;
    const timeB = b.dataType === 'event' ? b.reportTime : b.timestamp;
    return new Date(timeB || '').getTime() - new Date(timeA || '').getTime();
  }).slice(0, 15);

  return merged;
});

// 趋势图数据（近7天）
const trendChartData = computed(() => {
  return dataStore.eventsTrend7Days.map(item => ({
    date: new Date(item.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
    value: item.count
  }));
});

// 问题类型分布数据
const typeChartData = computed(() => {
  return dataStore.eventsByType.map((item, index) => ({
    name: item.type,
    value: item.count,
    itemStyle: {
      color: [
        '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
        '#10b981', '#ef4444', '#14b8a6', '#f97316', '#a855f7'
      ][index % 10]
    }
  }));
});

// 24小时事件分布数据
const hourChartData = computed(() => {
  const hourCount = new Array(24).fill(0);

  dataStore.cityEvents.forEach(event => {
    if (event.reportTime) {
      const hour = new Date(event.reportTime).getHours();
      hourCount[hour]++;
    }
  });

  return {
    hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    values: hourCount
  };
});

// 城市运行健康度数据（基于真实数据计算）
const healthScoreData = computed(() => {
  if (dataStore.cityEvents.length === 0) return [];

  const districts = dataStore.eventsByDistrict.slice(0, 6);
  const totalEvents = dataStore.cityEvents.length;

  return districts.map(item => ({
    name: item.district,
    value: Math.max(0, 100 - (item.count / totalEvents) * 100)
  }));
});

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);

  if (dataStore.cityEvents.length > 0) {
    nextTick(() => initChartsWithResizeObserver());
  }
});

// 初始化所有图表
const initCharts = () => {
  initTrendChart();
  initTypeChart();
  initHourChart();
  initRadarChart();

  // 响应式
  window.addEventListener('resize', handleResize);
};

const initChartsWithResizeObserver = () => {
  const containers = [
    trendChartRef.value,
    typeChartRef.value,
    hourChartRef.value,
    radarChartRef.value
  ];

  if (containers.some(c => !c)) return;

  // 先清理之前的观察器
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  // 先销毁旧图表实例
  [trendChart, typeChart, hourChart, radarChart].forEach(chart => {
    if (chart) {
      chart.dispose();
    }
  });
  trendChart = typeChart = hourChart = radarChart = null;

  // 使用ResizeObserver监听容器尺寸
  resizeObserver = new ResizeObserver(() => {
    const allReady = containers.every(el => el!.clientWidth > 0 && el!.clientHeight > 0);

    if (allReady) {
      resizeObserver?.disconnect();
      initCharts();
    }
  });

  // 开始监听所有容器的尺寸变化
  containers.forEach(el => resizeObserver!.observe(el!));
};

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value || trendChartData.value.length === 0) return;

  trendChart = echarts.init(trendChartRef.value);
  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
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
      data: trendChartData.value.map(item => item.date),
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
    },
    series: [{
      data: trendChartData.value.map(item => item.value),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#06b6d4', width: 3 },
      itemStyle: { color: '#06b6d4' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(6, 182, 212, 0.5)' },
          { offset: 1, color: 'rgba(6, 182, 212, 0.05)' }
        ])
      }
    }]
  });
};

// 初始化类型分布饼图
const initTypeChart = () => {
  if (!typeChartRef.value || typeChartData.value.length === 0) return;

  typeChart = echarts.init(typeChartRef.value);
  typeChart.setOption({
    tooltip: {
      trigger: 'item',
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
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      data: typeChartData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(6, 182, 212, 0.5)'
        }
      }
    }]
  });
};

// 初始化24小时分布柱状图
const initHourChart = () => {
  if (!hourChartRef.value || hourChartData.value.values.length === 0) return;

  hourChart = echarts.init(hourChartRef.value);
  hourChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '5%',
      containLabel: true
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        start: 0,
        end: 50,
        height: 20,
        bottom: 5,
        borderColor: 'rgba(6, 182, 212, 0.3)',
        fillerColor: 'rgba(6, 182, 212, 0.2)',
        handleStyle: {
          color: '#06b6d4',
          borderColor: '#06b6d4'
        },
        textStyle: {
          color: '#94a3b8'
        },
        backgroundColor: 'rgba(15, 23, 42, 0.5)'
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        start: 0,
        end: 50
      }
    ],
    xAxis: {
      type: 'category',
      data: hourChartData.value.hours,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: {
        color: '#94a3b8',
        interval: 0,
        rotate: 45,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
    },
    series: [{
      data: hourChartData.value.values,
      type: 'bar',
      barMaxWidth: 30,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#06b6d4' },
          { offset: 1, color: '#0891b2' }
        ])
      }
    }]
  });
};

// 初始化雷达图
const initRadarChart = () => {
  if (!radarChartRef.value || healthScoreData.value.length === 0) return;

  radarChart = echarts.init(radarChartRef.value);
  radarChart.setOption({
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    radar: {
      indicator: healthScoreData.value.map(item => ({
        name: item.name,
        max: 100
      })),
      shape: 'polygon',
      splitNumber: 5,
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#334155' } },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(6, 182, 212, 0.05)', 'rgba(6, 182, 212, 0.1)']
        }
      },
      axisLabel: { color: '#94a3b8' }
    },
    series: [{
      type: 'radar',
      data: [{
        value: healthScoreData.value.map(item => item.value),
        name: '健康度',
        itemStyle: { color: '#06b6d4' },
        areaStyle: {
          color: 'rgba(6, 182, 212, 0.3)'
        }
      }]
    }]
  });
};

// 响应式处理
const handleResize = () => {
  if (trendChartRef.value) {
    const chart = echarts.getInstanceByDom(trendChartRef.value);
    chart && chart.resize();
  }
  if (typeChartRef.value) {
    const chart = echarts.getInstanceByDom(typeChartRef.value);
    chart && chart.resize();
  }
  if (hourChartRef.value) {
    const chart = echarts.getInstanceByDom(hourChartRef.value);
    chart && chart.resize();
  }
  if (radarChartRef.value) {
    const chart = echarts.getInstanceByDom(radarChartRef.value);
    chart && chart.resize();
  }
};

onUnmounted(() => {
  if (timer) clearInterval(timer);
  window.removeEventListener('resize', handleResize);

  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  // 清理图表实例
  trendChart?.dispose();
  typeChart?.dispose();
  hourChart?.dispose();
  radarChart?.dispose();
});

// 监听数据变化，自动更新图表
watch(() => [dataStore.cityEvents.length, dataStore.sensorData.length], () => {
  nextTick(() => initChartsWithResizeObserver());
});
</script>

<style scoped>
.dashboard-panel {
  width: 100%;
}

/* 关键指标 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, transparent 50%, rgba(255,255,255,0.03) 100%);
  border-radius: 0 0 0 100%;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.metric-card.cyan {
  border-color: rgba(6, 182, 212, 0.3);
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%);
}

.metric-card.green {
  border-color: rgba(16, 185, 129, 0.3);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%);
}

.metric-card.red {
  border-color: rgba(239, 68, 68, 0.3);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%);
}

.metric-card.blue {
  border-color: rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%);
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.metric-content {
  position: relative;
  z-index: 1;
}

.metric-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.metric-trend {
  font-size: 12px;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.metric-trend.up {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.metric-trend.down {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

/* 大屏内容区 */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  min-height: 600px;
}

.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-column:nth-child(2) {
  grid-column: span 1;
}

/* 图表卡片 */
.chart-card {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  flex: 1;
}

/* 雷达图 - 更大图表容器 */
.radar-chart-container {
  height: 350px !important;
  min-height: 350px !important;
}

.chart-card:hover {
  border-color: var(--border-primary-hover);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.chart-card.large {
  flex: 1.5;
  min-height: 400px;
}

.chart-card.full-height {
  flex: 1;
  min-height: 400px;
  max-height: 100%;
}

.chart-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.chart-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chart-content {
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

/* 全高度卡片的content应该拉伸 */
.chart-card.full-height .chart-content {
  flex: 1;
  min-height: 300px;
  overflow: hidden;
}

/* 雷达图卡片高度调整 */
.chart-card:nth-child(2) {
  min-height: 380px;
}

/* 热力图 */
.heatmap-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 100%;
  overflow-y: auto;
}

.heatmap-item {
  width: 100%;
}

.heatmap-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.rank {
  width: 24px;
  height: 24px;
  background: rgba(6, 182, 212, 0.2);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
}

.name {
  flex: 1;
  font-size: 14px;
  color: var(--text-secondary);
}

.value {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

.heatmap-bar {
  height: 8px;
  background: rgba(51, 65, 85, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.heatmap-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), #3b82f6);
  border-radius: 4px;
  transition: width 1s ease-out;
}

/* 图表行 */
.charts-row {
  display: flex;
  gap: 1.5rem;
  flex: 1;
}

.charts-row .chart-card {
  flex: 1;
  min-height: 300px;
}

/* 垂直堆叠的图表 */
.charts-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.charts-stack .chart-card {
  flex: 1;
  min-height: 250px;
}

/* 其他图表 */
.radar-chart,
.trend-chart,
.pie-chart,
.bar-chart {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

/* 实时事件流 */
.event-stream {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
}

.event-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 6px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.event-dot {
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.4rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.event-content {
  flex: 1;
}

.event-title {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.event-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 11px;
  color: var(--text-muted);
}

.event-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.event-time {
  opacity: 0.7;
}

.event-badge {
  padding: 0.125rem 0.375rem;
  background: rgba(6, 182, 212, 0.2);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: var(--primary-color);
}

.empty-event-stream {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.empty-chart {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

/* 响应式 */
@media (max-width: 1400px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    height: auto;
  }

  .dashboard-column {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .metric-value {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
