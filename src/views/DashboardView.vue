<template>
  <div class="dashboard-container">
    <!-- 左中右布局 -->
    <el-row :gutter="15" class="main-layout">
      <!-- 左侧：指标和统计 -->
      <el-col :span="6" class="left-panel">
        <div class="panel-header">
          <span class="panel-title">实时监控</span>
        </div>

        <!-- 核心指标 -->
        <div class="metric-section">
          <el-card class="metric-card today-events">
            <div class="metric-content">
              <div class="metric-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ todayEvents }}</div>
                <div class="metric-label">今日事件</div>
              </div>
            </div>
            <div class="metric-trend up">↑ 12%</div>
          </el-card>

          <el-card class="metric-card abnormal-devices">
            <div class="metric-content">
              <div class="metric-icon warning">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ dataStore.abnormalSensors }}</div>
                <div class="metric-label">异常设备</div>
              </div>
            </div>
            <div class="metric-trend down">↓ 5%</div>
          </el-card>

          <el-card class="metric-card high-priority">
            <div class="metric-content">
              <div class="metric-icon danger">
                <el-icon><CircleFilled /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ dataStore.highPriorityEvents }}</div>
                <div class="metric-label">高优先级</div>
              </div>
            </div>
            <div class="metric-trend up">↑ 8%</div>
          </el-card>

          <el-card class="metric-card avg-response">
            <div class="metric-content">
              <div class="metric-icon">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">25<span style="font-size: 14px; margin-left: 2px;">分钟</span></div>
                <div class="metric-label">平均响应</div>
              </div>
            </div>
            <div class="metric-trend down">↓ 3%</div>
          </el-card>
        </div>

        <!-- 设备状态分布 -->
        <el-card class="device-status-card">
          <template #header>
            <span>设备状态分布</span>
          </template>
          <div ref="deviceStatusRef" class="chart-mini"></div>
        </el-card>

        <!-- 操作按钮 -->
        <el-card class="action-card">
          <el-button @click="$router.push('/')" text type="primary" block>
            <el-icon><Back /></el-icon>
            返回首页
          </el-button>
          <el-button @click="$router.push('/analysis')" type="primary" block>
            <el-icon><Cpu /></el-icon>
            AI智能分析
          </el-button>
        </el-card>
      </el-col>

      <!-- 中间：热力图 -->
      <el-col :span="12" class="center-panel">
        <el-card class="heatmap-card">
          <template #header>
            <div class="card-header-center">
              <span>北京市城市问题分布热力图</span>
            </div>
          </template>
          <div ref="heatmapRef" class="heatmap"></div>
        </el-card>
      </el-col>

      <!-- 右侧：图表垂直分布 -->
      <el-col :span="6" class="right-panel">
        <!-- 近7天问题趋势分析 -->
        <el-card class="chart-card full-width">
          <template #header>
            <span>近7天问题趋势分析</span>
          </template>
          <div ref="lineChartRef" class="chart-medium"></div>
        </el-card>

        <!-- 问题类型分布 -->
        <el-card class="chart-card full-width">
          <template #header>
            <span>问题类型分布</span>
          </template>
          <div ref="pieChartRef" class="chart-medium"></div>
        </el-card>

        <!-- 24小时分布 -->
        <el-card class="chart-card full-width">
          <template #header>
            <span>24小时问题分布</span>
          </template>
          <div ref="hourChartRef" class="chart-medium"></div>
        </el-card>

        <!-- 实时事件列表 -->
        <el-card class="event-card">
          <template #header>
            <div class="event-header">
              <span>实时事件流</span>
              <div class="event-stats">
                <el-tag size="small" type="danger">{{ emergencyCount }} 紧急</el-tag>
                <el-icon class="pulse-icon"><RefreshRight /></el-icon>
              </div>
            </div>
          </template>
          <div class="event-list-wrapper">
            <div ref="eventListRef" class="event-list auto-scroll">
              <div
                v-for="(event, index) in allEvents"
                :key="event.id"
                class="event-item"
                :class="{ 'is-new': isNewEvent(event.id) }"
              >
                <div class="event-header-row">
                  <div class="event-badge">
                    <el-tag size="small" :type="event.status === '紧急' ? 'danger' : 'primary'">
                      {{ event.status }}
                    </el-tag>
                    <el-tag v-if="isNewEvent(event.id)" size="small" type="warning" class="new-badge">
                      NEW
                    </el-tag>
                  </div>
                  <span class="event-time">{{ formatTime(event.reportTime) }}</span>
                </div>
                <div class="event-location">
                  <el-icon><Location /></el-icon>
                  <span>{{ event.location.district }} - {{ event.location.street }}</span>
                </div>
                <span class="event-text">{{ event.description }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useDataStore } from '@/stores/data';
import beijingJson from '@/assets/maps/北京.json';

const dataStore = useDataStore();

// 图表引用
const heatmapRef = ref<HTMLElement>();
const pieChartRef = ref<HTMLElement>();
const lineChartRef = ref<HTMLElement>();
const hourChartRef = ref<HTMLElement>();
const deviceStatusRef = ref<HTMLElement>();
const eventListRef = ref<HTMLElement>();

// 计算属性
const todayEvents = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return dataStore.cityEvents.filter(e => (e.reportTime || '').startsWith(today)).length;
});

const recentEvents = computed(() => {
  return dataStore.cityEvents.slice(0, 8);
});

const allEvents = computed(() => {
  // 模拟更多事件数据用于滚动
  const baseEvents = dataStore.cityEvents;
  const duplicated = [...baseEvents, ...baseEvents, ...baseEvents];
  return duplicated.slice(0, 50);
});

const emergencyCount = computed(() => {
  return dataStore.cityEvents.filter(e => e.status === '紧急').length;
});

// NEW事件追踪
const newEventIds = ref<Set<number>>(new Set());
let newEventTimer: number | null = null;

function isNewEvent(id: number): boolean {
  return newEventIds.value.has(id);
}

// 图表初始化
let heatmapChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;
let lineChart: echarts.ECharts | null = null;
let hourChart: echarts.ECharts | null = null;
let deviceStatusChart: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

// 自动滚动定时器
let scrollTimer: number | null = null;

function initCharts() {
  // 使用ResizeObserver等待容器尺寸准备好
  initChartsWithResizeObserver();
}

function initChartsWithResizeObserver() {
  if (!heatmapRef.value || !pieChartRef.value || !lineChartRef.value ||
      !hourChartRef.value || !deviceStatusRef.value) return;

  // 先清理之前的观察器
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  // 先销毁旧图表实例
  [heatmapChart, pieChart, lineChart, hourChart, deviceStatusChart].forEach(chart => {
    if (chart) {
      chart.dispose();
    }
  });
  heatmapChart = pieChart = lineChart = hourChart = deviceStatusChart = null;

  // 使用ResizeObserver监听容器尺寸
  resizeObserver = new ResizeObserver(() => {
    const containers = [
      heatmapRef.value!,
      pieChartRef.value!,
      lineChartRef.value!,
      hourChartRef.value!,
      deviceStatusRef.value!
    ];

    // 检查所有容器是否都有尺寸
    const allReady = containers.every(el => el.clientWidth > 0 && el.clientHeight > 0);

    if (allReady) {
      resizeObserver?.disconnect();

      initHeatmap();
      initPieChart();
      initLineChart();
      initHourChart();
      initDeviceStatusChart();
      initAutoScroll();
      trackNewEvents();
    }
  });

  // 开始监听所有容器的尺寸变化
  containers.forEach(el => resizeObserver!.observe(el));
}

function trackNewEvents() {
  // 初始标记前3个为NEW
  if (allEvents.value.length > 0) {
    allEvents.value.slice(0, 3).forEach(event => {
      newEventIds.value.add(event.id);
    });
  }

  // 每5秒更新NEW标记
  newEventTimer = window.setInterval(() => {
    const currentTime = Date.now();
    // 模拟新事件
    if (Math.random() > 0.7 && allEvents.value.length > 0) {
      const randomEvent = allEvents.value[Math.floor(Math.random() * Math.min(20, allEvents.value.length))];
      newEventIds.value.add(randomEvent.id);

      // 10秒后移除NEW标记
      setTimeout(() => {
        newEventIds.value.delete(randomEvent.id);
      }, 10000);
    }
  }, 5000);
}

function initAutoScroll() {
  if (!eventListRef.value) return;

  console.log('Initializing auto-scroll for event list');

  scrollTimer = window.setInterval(() => {
    const list = eventListRef.value;
    if (!list) return;

    // 向上滚动
    list.scrollTop += 1;

    // 如果滚动到底部，重置到顶部
    if (list.scrollTop >= list.scrollHeight - list.clientHeight) {
      list.scrollTop = 0;
    }
  }, 50); // 调整滚动速度，更平滑
}

function initHeatmap() {
  if (!heatmapRef.value) return;
  heatmapChart = echarts.init(heatmapRef.value);

  // 注册北京市地图
  echarts.registerMap('beijing', beijingJson);

  // 按区域聚合数据
  const districtData = dataStore.eventsByDistrict;
  const maxCount = Math.max(...districtData.map(d => d.count), 1);

  // 使用GeoJSON中各区的中心点坐标
  const scatterData = districtData.map(district => {
    // 从北京GeoJSON中获取各区的中心点坐标
    const districtFeature = beijingJson.features.find(
      f => f.properties.name === district.district
    );

    if (districtFeature && districtFeature.properties.center) {
      const [lng, lat] = districtFeature.properties.center;
      return {
        name: district.district,
        value: [lng, lat, district.count]
      };
    }

    // 备用坐标映射（如果GeoJSON中没有中心点）
    const fallbackCoords: Record<string, [number, number]> = {
      '朝阳区': [116.45, 39.90],
      '海淀区': [116.30, 39.95],
      '东城区': [116.42, 39.91],
      '西城区': [116.34, 39.91],
      '丰台区': [116.30, 39.85],
      '石景山区': [116.20, 39.91],
      '通州区': [116.65, 39.88],
      '昌平区': [116.23, 40.20],
      '大兴区': [116.33, 39.70],
      '顺义区': [116.65, 40.10],
      '房山区': [116.13, 39.73],
      '门头沟区': [116.10, 39.95],
      '平谷区': [117.10, 40.18],
      '怀柔区': [116.63, 40.42],
      '密云区': [116.90, 40.40],
      '延庆区': [116.00, 40.50]
    };

    return {
      name: district.district,
      value: [...(fallbackCoords[district.district] || [116.4, 39.9]), district.count]
    };
  });

  const option: echarts.EChartsOption = {
    title: {
      text: '北京市城市问题分布热力图',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        // 获取问题数量
        let count = 0;
        if (params.data && params.data.value && params.data.value[2]) {
          count = params.data.value[2];
        } else if (params.data && params.data.count !== undefined) {
          count = params.data.count;
        }

        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px;">
              ${params.data.name || params.name}
            </div>
            <div style="color: #00e5ff; font-size: 13px;">
              📊 问题数量: <span style="font-weight: bold; color: #7b2ff7;">${count}</span> 件
            </div>
          </div>
        `;
      },
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(0, 229, 255, 0.5)',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      extraCssText: 'box-shadow: 0 0 20px rgba(0, 229, 255, 0.3); border-radius: 8px;'
    },
    visualMap: {
      min: 0,
      max: maxCount,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#00e5ff', '#7b2ff7']
      },
      text: ['高', '低'],
      textStyle: {
        color: '#fff'
      },
      itemWidth: 15,
      itemHeight: 100
    },
    series: [
      {
        name: '北京市',
        type: 'map',
        map: 'beijing',
        roam: true,
        label: {
          show: true,
          color: '#fff',
          fontSize: 10
        },
        itemStyle: {
          borderColor: 'rgba(0, 229, 255, 0.5)',
          borderWidth: 1,
          areaColor: 'rgba(15, 23, 42, 0.6)'
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold'
          },
          itemStyle: {
            borderColor: '#00e5ff',
            borderWidth: 2,
            areaColor: 'rgba(0, 229, 255, 0.3)'
          }
        }
      },
      {
        name: '问题分布',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: scatterData,
        symbolSize: (val: any) => {
          const count = val[2] || 0;
          return Math.max(count * 4, 12);
        },
        label: {
          show: true,
          formatter: (params: any) => {
            const count = params.data?.value?.[2] || 0;
            return `${params.data.name}\n${count}件`;
          },
          position: 'top',
          color: '#00e5ff',
          fontSize: 12,
          fontWeight: 'bold',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          padding: [4, 8],
          borderRadius: 4,
          lineHeight: 16
        },
        itemStyle: {
          color: '#00e5ff',
          shadowBlur: 20,
          shadowColor: 'rgba(0, 229, 255, 0.8)',
          borderWidth: 2,
          borderColor: 'rgba(0, 229, 255, 0.5)'
        },
        emphasis: {
          scale: true,
          itemStyle: {
            color: '#7b2ff7',
            shadowBlur: 40,
            shadowColor: 'rgba(123, 47, 247, 0.9)',
            borderWidth: 2,
            borderColor: 'rgba(123, 47, 247, 0.8)'
          },
          label: {
            backgroundColor: 'rgba(123, 47, 247, 0.9)',
            color: '#fff'
          }
        }
      }
    ]
  };

  heatmapChart.setOption(option);
}

function initPieChart() {
  if (!pieChartRef.value) return;
  pieChart = echarts.init(pieChartRef.value);

  const data = dataStore.eventsByType.map(item => ({
    name: item.type,
    value: item.count
  }));

  console.log('Initializing pie chart with data:', data);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(0, 229, 255, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: {
        color: '#e5e7eb'
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: 'rgba(15, 23, 42, 0.9)',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%',
          color: '#fff'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#00e5ff'
          },
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 229, 255, 0.6)'
          }
        },
        data
      }
    ]
  };

  pieChart.setOption(option);
  console.log('Pie chart initialized successfully');
}

function initLineChart() {
  if (!lineChartRef.value) return;
  lineChart = echarts.init(lineChartRef.value);

  const data = dataStore.eventsTrend7Days;

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(0, 229, 255, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(d => (d.date || '').split('T')[0]),
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 229, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#e5e7eb'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 229, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#e5e7eb'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 229, 255, 0.1)'
        }
      }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: data.map(d => d.count),
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 229, 255, 0.5)' },
            { offset: 1, color: 'rgba(0, 229, 255, 0.1)' }
          ])
        },
        lineStyle: {
          width: 3,
          color: '#00e5ff'
        },
        itemStyle: {
          color: '#00e5ff'
        }
      }
    ]
  };

  lineChart.setOption(option);
}

function initHourChart() {
  if (!hourChartRef.value) return;
  hourChart = echarts.init(hourChartRef.value);

  console.log('Initializing hour chart');

  // 生成24小时数据（基于真实数据的时间分布）
  const hourData = Array.from({ length: 24 }, (_, i) => {
    // 模拟数据：白天事件多，夜间少
    const baseCount = Math.floor(Math.random() * 30) + 5;
    const hourFactor = i >= 6 && i <= 22 ? 1.5 : 0.6; // 白天是夜间的2.5倍
    return Math.floor(baseCount * hourFactor);
  });

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(0, 229, 255, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 229, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#e5e7eb',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 229, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#e5e7eb',
        fontSize: 10
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 229, 255, 0.1)'
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: hourData.map(value => ({
          value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00e5ff' },
              { offset: 1, color: '#0086d9' }
            ])
          }
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          color: '#fff',
          fontSize: 10,
          fontWeight: 'bold'
        },
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  hourChart.setOption(option);
  console.log('Hour chart initialized successfully');
}

function initDeviceStatusChart() {
  if (!deviceStatusRef.value) return;
  deviceStatusChart = echarts.init(deviceStatusRef.value);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(0, 229, 255, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: 'rgba(15, 23, 42, 0.9)',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: '#fff',
          fontSize: 11
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#00e5ff'
          }
        },
        data: [
          { value: 335, name: '正常运行', itemStyle: { color: '#00e676' } },
          { value: 48, name: '异常', itemStyle: { color: '#ff5252' } },
          { value: 25, name: '维护中', itemStyle: { color: '#ffa726' } }
        ]
      }
    ]
  };

  deviceStatusChart.setOption(option);
}

function formatTime(timeStr: string) {
  const date = new Date(timeStr || '');
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function handleResize() {
  heatmapChart?.resize();
  pieChart?.resize();
  lineChart?.resize();
  hourChart?.resize();
  deviceStatusChart?.resize();
}

// 添加响应式更新 - 当数据变化时更新图表
watch(() => dataStore.eventsByType, (newData) => {
  console.log('eventsByType changed:', newData);
  if (pieChart && newData.length > 0) {
    pieChart.setOption({
      series: [{
        data: newData.map(item => ({
          name: item.type,
          value: item.count
        }))
      }]
    });
  }
}, { deep: true });

watch(() => dataStore.eventsByDistrict, (newData) => {
  console.log('eventsByDistrict changed:', newData);
  if (heatmapChart && newData.length > 0) {
    const maxCount = Math.max(...newData.map(d => d.count), 1);

    const scatterData = newData.map(district => {
      const districtFeature = beijingJson.features.find(
        f => f.properties.name === district.district
      );

      if (districtFeature && districtFeature.properties.center) {
        const [lng, lat] = districtFeature.properties.center;
        return {
          name: district.district,
          value: [lng, lat, district.count]
        };
      }

      const fallbackCoords: Record<string, [number, number]> = {
        '朝阳区': [116.45, 39.90],
        '海淀区': [116.30, 39.95],
        '东城区': [116.42, 39.91],
        '西城区': [116.34, 39.91],
        '丰台区': [116.30, 39.85],
        '石景山区': [116.20, 39.91],
        '通州区': [116.65, 39.88],
        '昌平区': [116.23, 40.20],
        '大兴区': [116.33, 39.70],
        '顺义区': [116.65, 40.10],
        '房山区': [116.13, 39.73],
        '门头沟区': [116.10, 39.95],
        '平谷区': [117.10, 40.18],
        '怀柔区': [116.63, 40.42],
        '密云区': [116.90, 40.40],
        '延庆区': [116.00, 40.50]
      };

      return {
        name: district.district,
        value: [...(fallbackCoords[district.district] || [116.4, 39.9]), district.count]
      };
    });

    heatmapChart.setOption({
      visualMap: {
        max: maxCount
      },
      series: [
        {}, // 保持地图系列不变
        {
          data: scatterData
        }
      ]
    });
  }
}, { deep: true });

watch(() => dataStore.eventsTrend7Days, (newData) => {
  console.log('eventsTrend7Days changed:', newData);
  if (lineChart && newData.length > 0) {
    lineChart.setOption({
      xAxis: {
        data: newData.map(d => (d.date || '').split('T')[0])
      },
      series: [{
        data: newData.map(d => d.count)
      }]
    });
  }
}, { deep: true });

onMounted(async () => {
  console.log('=== Component mounted ===');

  // 只在没有数据时才加载模拟数据
  if (dataStore.totalEvents === 0) {
    console.log('No data found, loading mock data...');
    loadMockData();
  } else {
    console.log('Using existing data from store');
  }

  console.log('Total events:', dataStore.totalEvents);
  console.log('Events by type:', dataStore.eventsByType);
  console.log('Events by district:', dataStore.eventsByDistrict);

  // 等待Vue响应式系统更新
  await nextTick();

  // 初始化图表（使用ResizeObserver等待容器尺寸准备好）
  console.log('Initializing charts with data:', {
    eventsByType: dataStore.eventsByType,
    eventsByDistrict: dataStore.eventsByDistrict,
    eventsTrend: dataStore.eventsTrend7Days
  });

  initCharts();
  window.addEventListener('resize', handleResize);
});

function loadMockData() {
  // 创建过去7天的日期
  const today = new Date();
  const getDayDate = (daysAgo: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  // 加载城市事件数据 - 分布在过去7天
  const mockEvents: any[] = [
    {
      id: 'EV001',
      type: '道路积水',
      description: '朝阳区建国路与三环路交叉口出现严重积水，影响车辆通行',
      location: { district: '朝阳区', street: '建国路', lat: 39.91, lng: 116.45 },
      reportTime: `${getDayDate(0)}T10:30:00`,
      reporterType: '市民APP',
      status: '紧急'
    },
    {
      id: 'EV002',
      type: '路灯故障',
      description: '海淀区中关村大街路灯连续3天不亮，影响夜间出行',
      location: { district: '海淀区', street: '中关村大街', lat: 39.95, lng: 116.30 },
      reportTime: `${getDayDate(0)}T09:15:00`,
      reporterType: '12345热线',
      status: '未处理'
    },
    {
      id: 'EV003',
      type: '占道经营',
      description: '东城区王府井步行街有商贩占道经营，影响市容',
      location: { district: '东城区', street: '王府井大街', lat: 39.91, lng: 116.42 },
      reportTime: `${getDayDate(1)}T11:00:00`,
      reporterType: '网格员',
      status: '未处理'
    },
    {
      id: 'EV004',
      type: '噪音扰民',
      description: '西城区金融街夜间施工噪音过大，附近居民无法休息',
      location: { district: '西城区', street: '金融街', lat: 39.91, lng: 116.34 },
      reportTime: `${getDayDate(1)}T08:45:00`,
      reporterType: '市民APP',
      status: '紧急'
    },
    {
      id: 'EV005',
      type: '道路积水',
      description: '丰台区南三环路段因暴雨导致严重积水',
      location: { district: '丰台区', street: '南三环路', lat: 39.85, lng: 116.30 },
      reportTime: `${getDayDate(2)}T10:00:00`,
      reporterType: '市政部门',
      status: '紧急'
    },
    {
      id: 'EV006',
      type: '占道经营',
      description: '石景山区八角游乐园周边流动商贩占道经营',
      location: { district: '石景山区', street: '八角东街', lat: 39.91, lng: 116.20 },
      reportTime: `${getDayDate(2)}T09:30:00`,
      reporterType: '市民APP',
      status: '未处理'
    },
    {
      id: 'EV007',
      type: '路灯故障',
      description: '通州区运河东大街路灯大面积不亮',
      location: { district: '通州区', street: '运河东大街', lat: 39.88, lng: 116.65 },
      reportTime: `${getDayDate(3)}T08:00:00`,
      reporterType: '12345热线',
      status: '未处理'
    },
    {
      id: 'EV008',
      type: '噪音扰民',
      description: '昌平区回龙观小区附近广场舞噪音扰民',
      location: { district: '昌平区', street: '回龙观大街', lat: 40.20, lng: 116.23 },
      reportTime: `${getDayDate(3)}T10:15:00`,
      reporterType: '市民APP',
      status: '未处理'
    },
    {
      id: 'EV009',
      type: '道路积水',
      description: '大兴区黄村西大街因排水管网堵塞导致积水',
      location: { district: '大兴区', street: '黄村西大街', lat: 39.70, lng: 116.33 },
      reportTime: `${getDayDate(4)}T11:20:00`,
      reporterType: '市政部门',
      status: '紧急'
    },
    {
      id: 'EV010',
      type: '占道经营',
      description: '顺义区仁和镇占道摆摊问题严重',
      location: { district: '顺义区', street: '中山北大街', lat: 40.10, lng: 116.65 },
      reportTime: `${getDayDate(4)}T09:45:00`,
      reporterType: '网格员',
      status: '未处理'
    },
    {
      id: 'EV011',
      type: '路灯故障',
      description: '房山区良乡大学城路灯连续多日不亮',
      location: { district: '房山区', street: '良乡大学城路', lat: 39.73, lng: 116.13 },
      reportTime: `${getDayDate(5)}T08:30:00`,
      reporterType: '市民APP',
      status: '未处理'
    },
    {
      id: 'EV012',
      type: '噪音扰民',
      description: '门头沟区滨河路夜间货车噪音大',
      location: { district: '门头沟区', street: '滨河路', lat: 39.95, lng: 116.10 },
      reportTime: `${getDayDate(6)}T10:45:00`,
      reporterType: '12345热线',
      status: '未处理'
    },
    // 今天的额外事件，让数据更丰富
    {
      id: 'EV013',
      type: '道路积水',
      description: '朝阳区朝外大街路段积水严重',
      location: { district: '朝阳区', street: '朝外大街', lat: 39.92, lng: 116.46 },
      reportTime: `${getDayDate(0)}T14:20:00`,
      reporterType: '市民APP',
      status: '紧急'
    },
    {
      id: 'EV014',
      type: '占道经营',
      description: '海淀区五道口夜市占道严重',
      location: { district: '海淀区', street: '成府路', lat: 39.99, lng: 116.33 },
      reportTime: `${getDayDate(0)}T19:10:00`,
      reporterType: '网格员',
      status: '未处理'
    },
    {
      id: 'EV015',
      type: '路灯故障',
      description: '东城区东直门桥附近路灯不亮',
      location: { district: '东城区', street: '东直门外大街', lat: 39.94, lng: 116.43 },
      reportTime: `${getDayDate(1)}T20:30:00`,
      reporterType: '12345热线',
      status: '未处理'
    }
  ];

  // 加载传感器数据
  const mockSensors: any[] = [
    {
      sensorId: 'SNS001',
      type: '水质监测',
      location: { district: '朝阳区', street: '坝河', lat: 39.93, lng: 116.48 },
      value: 12.5,
      unit: 'mg/L',
      threshold: 15.0,
      status: '正常',
      timestamp: '2025-11-29T10:30:00'
    },
    {
      sensorId: 'SNS002',
      type: '空气质量',
      location: { district: '海淀区', street: '中关村', lat: 39.97, lng: 116.32 },
      value: 85,
      unit: 'AQI',
      threshold: 100,
      status: '正常',
      timestamp: '2025-11-29T10:30:00'
    },
    {
      sensorId: 'SNS003',
      type: '噪音监测',
      location: { district: '西城区', street: '金融街', lat: 39.92, lng: 116.37 },
      value: 75,
      unit: 'dB',
      threshold: 60,
      status: '异常',
      timestamp: '2025-11-29T10:30:00'
    },
    {
      sensorId: 'SNS004',
      type: '水位监测',
      location: { district: '丰台区', street: '凉水河', lat: 39.87, lng: 116.28 },
      value: 3.2,
      unit: 'm',
      threshold: 3.0,
      status: '异常',
      timestamp: '2025-11-29T10:30:00'
    },
    {
      sensorId: 'SNS005',
      type: '温度监测',
      location: { district: '石景山区', street: '八角', lat: 39.89, lng: 116.22 },
      value: 5,
      unit: '°C',
      threshold: 10,
      status: '异常',
      timestamp: '2025-11-29T10:30:00'
    }
  ];

  // 加载数据到store
  dataStore.loadCityEvents(mockEvents);
  dataStore.loadSensorData(mockSensors);
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);

  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (scrollTimer) {
    clearInterval(scrollTimer);
  }
  if (newEventTimer) {
    clearInterval(newEventTimer);
  }
  heatmapChart?.dispose();
  pieChart?.dispose();
  lineChart?.dispose();
  hourChart?.dispose();
  deviceStatusChart?.dispose();
});
</script>

<style scoped>
/* ==================== 全局容器 ==================== */
.dashboard-container {
  min-height: 100vh;
  padding: 15px;
  background:
    radial-gradient(ellipse at top left, rgba(0, 229, 255, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at top right, rgba(123, 47, 247, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at bottom, rgba(0, 229, 255, 0.1) 0%, transparent 50%),
    linear-gradient(180deg, #0a0e27 0%, #0f1729 50%, #0a0e27 100%);
  position: relative;
  overflow: hidden;
}

/* 动态网格背景 */
.dashboard-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(40px, 40px);
  }
}

/* 扫描线效果 */
.dashboard-container::after {
  content: '';
  position: fixed;
  top: -100%;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 229, 255, 0.1) 50%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 2;
  animation: scanline 8s linear infinite;
}

@keyframes scanline {
  0% {
    top: -100%;
  }
  100% {
    top: 200%;
  }
}

.dashboard-container > * {
  position: relative;
  z-index: 1;
}

.main-layout {
  height: calc(100vh - 80px);
  gap: 15px;
  display: flex;
  flex-wrap: nowrap;
}

/* ==================== 左侧面板 ==================== */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  padding-right: 5px;
}

.panel-header {
  padding: 15px 10px;
  text-align: center;
  position: relative;
}

.panel-title {
  font-size: 20px;
  font-weight: 900;
  background: linear-gradient(135deg, #00e5ff 0%, #00a8ff 50%, #7b2ff7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 3px;
  text-transform: uppercase;
  position: relative;
  padding-bottom: 12px;
  filter: drop-shadow(0 0 10px rgba(0, 229, 255, 0.5));
  animation: titleGlow 3s ease-in-out infinite;
}

@keyframes titleGlow {
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(0, 229, 255, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(0, 229, 255, 0.8));
  }
}

.panel-title::before,
.panel-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00e5ff, transparent);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.8);
}

.panel-title::before {
  left: 0;
  animation: lineMove 2s ease-in-out infinite;
}

.panel-title::after {
  right: 0;
  animation: lineMove 2s ease-in-out infinite reverse;
}

@keyframes lineMove {
  0%, 100% {
    opacity: 0.3;
    transform: scaleX(1);
  }
  50% {
    opacity: 1;
    transform: scaleX(1.5);
  }
}

/* ==================== 指标卡片 ==================== */
.metric-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-card {
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(15, 23, 41, 0.9) 100%) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 229, 255, 0.3) !important;
  border-radius: 12px !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  padding: 18px;
  box-shadow:
    0 0 20px rgba(0, 229, 255, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 四个角的装饰 */
.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-top: 2px solid #00e5ff;
  border-left: 2px solid #00e5ff;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.metric-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-bottom: 2px solid #7b2ff7;
  border-right: 2px solid #7b2ff7;
  opacity: 0.6;
  transition: all 0.3s ease;
}

/* 动态边框光效 */
.metric-card {
  animation: borderGlow 3s ease-in-out infinite;
}

@keyframes borderGlow {
  0%, 100% {
    border-color: rgba(0, 229, 255, 0.3);
    box-shadow:
      0 0 20px rgba(0, 229, 255, 0.2),
      0 8px 32px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  50% {
    border-color: rgba(123, 47, 247, 0.5);
    box-shadow:
      0 0 30px rgba(123, 47, 247, 0.3),
      0 8px 32px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
}

.metric-card:hover {
  border-color: rgba(0, 229, 255, 0.8) !important;
  transform: translateY(-6px) scale(1.03);
  box-shadow:
    0 0 40px rgba(0, 229, 255, 0.5),
    0 12px 48px rgba(0, 0, 0, 0.6),
    0 0 100px rgba(0, 229, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: none;
}

.metric-card:hover::before,
.metric-card:hover::after {
  opacity: 1;
  width: 30px;
  height: 30px;
}

.metric-card:hover::before {
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.8);
}

.metric-card:hover::after {
  box-shadow: 0 0 15px rgba(123, 47, 247, 0.8);
}

.metric-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(0, 229, 255, 0.3) 0%, transparent 70%),
    linear-gradient(135deg, rgba(0, 229, 255, 0.2) 0%, rgba(0, 229, 255, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #00e5ff;
  box-shadow:
    0 0 20px rgba(0, 229, 255, 0.4),
    0 0 40px rgba(0, 229, 255, 0.2),
    inset 0 0 20px rgba(0, 229, 255, 0.1);
  transition: all 0.4s ease;
  position: relative;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(0, 229, 255, 0.4),
      0 0 40px rgba(0, 229, 255, 0.2),
      inset 0 0 20px rgba(0, 229, 255, 0.1);
  }
  50% {
    box-shadow:
      0 0 30px rgba(0, 229, 255, 0.6),
      0 0 60px rgba(0, 229, 255, 0.3),
      inset 0 0 30px rgba(0, 229, 255, 0.2);
  }
}

.metric-icon.warning {
  background:
    radial-gradient(circle, rgba(255, 165, 2, 0.3) 0%, transparent 70%),
    linear-gradient(135deg, rgba(255, 165, 2, 0.2) 0%, rgba(255, 165, 2, 0.05) 100%);
  color: #ffa502;
  box-shadow:
    0 0 20px rgba(255, 165, 2, 0.4),
    0 0 40px rgba(255, 165, 2, 0.2),
    inset 0 0 20px rgba(255, 165, 2, 0.1);
  animation: iconPulseWarning 2s ease-in-out infinite;
}

@keyframes iconPulseWarning {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(255, 165, 2, 0.4),
      0 0 40px rgba(255, 165, 2, 0.2),
      inset 0 0 20px rgba(255, 165, 2, 0.1);
  }
  50% {
    box-shadow:
      0 0 30px rgba(255, 165, 2, 0.6),
      0 0 60px rgba(255, 165, 2, 0.3),
      inset 0 0 30px rgba(255, 165, 2, 0.2);
  }
}

.metric-icon.danger {
  background:
    radial-gradient(circle, rgba(255, 71, 87, 0.3) 0%, transparent 70%),
    linear-gradient(135deg, rgba(255, 71, 87, 0.2) 0%, rgba(255, 71, 87, 0.05) 100%);
  color: #ff4757;
  box-shadow:
    0 0 20px rgba(255, 71, 87, 0.4),
    0 0 40px rgba(255, 71, 87, 0.2),
    inset 0 0 20px rgba(255, 71, 87, 0.1);
  animation: iconPulseDanger 2s ease-in-out infinite;
}

@keyframes iconPulseDanger {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(255, 71, 87, 0.4),
      0 0 40px rgba(255, 71, 87, 0.2),
      inset 0 0 20px rgba(255, 71, 87, 0.1);
  }
  50% {
    box-shadow:
      0 0 30px rgba(255, 71, 87, 0.6),
      0 0 60px rgba(255, 71, 87, 0.3),
      inset 0 0 30px rgba(255, 71, 87, 0.2);
  }
}

.metric-card:hover .metric-icon {
  transform: scale(1.15) rotate(10deg);
  animation: none;
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 36px;
  font-weight: 900;
  background: linear-gradient(135deg, #00e5ff 0%, #00a8ff 50%, #0086d9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  letter-spacing: -2px;
  position: relative;
  filter: drop-shadow(0 0 20px rgba(0, 229, 255, 0.6));
  animation: numberGlow 2s ease-in-out infinite;
}

@keyframes numberGlow {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(0, 229, 255, 0.6));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(0, 229, 255, 0.9));
    transform: scale(1.02);
  }
}

.metric-label {
  font-size: 12px;
  color: rgba(229, 231, 235, 0.7);
  margin-top: 6px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
}

.metric-trend {
  font-size: 13px;
  font-weight: 700;
  margin-top: 8px;
  text-align: right;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-trend.up {
  color: #00e676;
  text-shadow: 0 0 10px rgba(0, 230, 118, 0.6);
  border-color: rgba(0, 230, 118, 0.3);
  box-shadow: 0 0 15px rgba(0, 230, 118, 0.2);
}

.metric-trend.down {
  color: #ff5252;
  text-shadow: 0 0 10px rgba(255, 82, 82, 0.6);
  border-color: rgba(255, 82, 82, 0.3);
  box-shadow: 0 0 15px rgba(255, 82, 82, 0.2);
}

/* ==================== 中间面板 ==================== */
.center-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.heatmap-card {
  flex: 1.5;
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.98) 0%, rgba(15, 23, 41, 0.95) 100%) !important;
  backdrop-filter: blur(30px);
  border: 2px solid rgba(0, 229, 255, 0.4) !important;
  border-radius: 16px !important;
  box-shadow:
    0 0 30px rgba(0, 229, 255, 0.3),
    0 12px 48px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.heatmap-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #00e5ff, #7b2ff7, #00e5ff);
  background-size: 400% 400%;
  border-radius: 16px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: borderRotate 6s linear infinite;
}

@keyframes borderRotate {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.heatmap-card:hover::before {
  opacity: 0.6;
}

.heatmap-card:hover {
  border-color: rgba(0, 229, 255, 0.7) !important;
  box-shadow:
    0 0 50px rgba(0, 229, 255, 0.5),
    0 16px 64px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.heatmap-card :deep(.el-card__body) {
  height: calc(100% - 50px);
  padding: 12px;
}

.trend-analysis-card {
  flex: 1;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%) !important;
  backdrop-filter: blur(30px);
  border: 1px solid rgba(123, 47, 247, 0.3) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(123, 47, 247, 0.1);
  transition: all 0.3s ease;
}

.trend-analysis-card:hover {
  border-color: rgba(123, 47, 247, 0.5) !important;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5), 0 0 80px rgba(123, 47, 247, 0.2);
}

.trend-analysis-card :deep(.el-card__body) {
  padding: 12px;
}

.card-header-center {
  text-align: center;
  font-size: 20px;
  font-weight: 900;
  background: linear-gradient(135deg, #00e5ff 0%, #00a8ff 50%, #7b2ff7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding: 15px 0;
  letter-spacing: 3px;
  text-transform: uppercase;
  position: relative;
  filter: drop-shadow(0 0 15px rgba(0, 229, 255, 0.6));
  animation: titlePulse 3s ease-in-out infinite;
}

@keyframes titlePulse {
  0%, 100% {
    filter: drop-shadow(0 0 15px rgba(0, 229, 255, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(0, 229, 255, 0.9));
  }
}

.card-header-center::before {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00e5ff, #7b2ff7, transparent);
  border-radius: 2px;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.8);
  animation: lineExpand 2s ease-in-out infinite;
}

@keyframes lineExpand {
  0%, 100% {
    width: 120px;
    opacity: 0.6;
  }
  50% {
    width: 160px;
    opacity: 1;
  }
}

.trend-header {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #00e5ff 0%, #7b2ff7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.heatmap {
  width: 100%;
  height: 100%;
}

.trend-chart {
  width: 100%;
  height: 200px;
}

/* ==================== 右侧面板 ==================== */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  padding-right: 5px;
}

.chart-card {
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(15, 23, 41, 0.9) 100%) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 229, 255, 0.3) !important;
  border-radius: 12px !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  margin-bottom: 12px;
  box-shadow:
    0 0 20px rgba(0, 229, 255, 0.15),
    0 6px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

/* 顶部光带 */
.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00e5ff, #7b2ff7, transparent);
  animation: lightMove 3s ease-in-out infinite;
}

@keyframes lightMove {
  0% {
    left: -100%;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

.chart-card:hover {
  border-color: rgba(0, 229, 255, 0.6);
  box-shadow:
    0 0 35px rgba(0, 229, 255, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(0, 229, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateX(-4px);
}

.chart-small {
  width: 100%;
  height: 160px;
  min-height: 160px;
}

.chart-medium {
  width: 100%;
  height: 180px;
  min-height: 180px;
}

.full-width {
  width: 100%;
}

/* 设备状态卡片 */
.device-status-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 229, 255, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.device-status-card:hover {
  border-color: rgba(0, 229, 255, 0.5) !important;
  box-shadow: 0 8px 30px rgba(0, 229, 255, 0.2);
}

.chart-mini {
  width: 100%;
  height: 150px;
}

/* 事件列表 */
.event-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px;
  background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(15, 23, 41, 0.9) 100%) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(123, 47, 247, 0.4) !important;
  border-radius: 12px !important;
  box-shadow:
    0 0 25px rgba(123, 47, 247, 0.2),
    0 6px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.event-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at top right, rgba(123, 47, 247, 0.1) 0%, transparent 50%),
    radial-gradient(circle at bottom left, rgba(0, 229, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.event-card:hover {
  border-color: rgba(123, 47, 247, 0.6) !important;
  box-shadow:
    0 0 40px rgba(123, 47, 247, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 70px rgba(123, 47, 247, 0.2);
}

.event-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.event-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pulse-icon {
  animation: rotate 2s linear infinite;
  color: #00e5ff;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.event-list-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.event-list {
  height: 100%;
  overflow-y: auto;
  padding: 4px;
  scroll-behavior: smooth;
}

.event-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  margin-bottom: 10px;
  border-radius: 10px;
  border: 1px solid rgba(0, 229, 255, 0.2);
  background:
    linear-gradient(135deg, rgba(10, 14, 39, 0.8) 0%, rgba(15, 23, 41, 0.6) 100%),
    radial-gradient(circle at top left, rgba(0, 229, 255, 0.05) 0%, transparent 50%);
  animation: slideIn 0.5s ease-out;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* 左侧光条 */
.event-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #00e5ff, #7b2ff7);
  opacity: 0;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px currentColor;
}

/* 右上角装饰 */
.event-item::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle at top right, rgba(0, 229, 255, 0.2), transparent);
  border-top-right-radius: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.event-item.is-new {
  background:
    linear-gradient(135deg, rgba(255, 193, 7, 0.25) 0%, rgba(255, 152, 0, 0.15) 100%),
    radial-gradient(circle at center, rgba(255, 193, 7, 0.1) 0%, transparent 70%);
  border-color: rgba(255, 193, 7, 0.5);
  animation: pulseNew 1.8s ease-in-out infinite, slideIn 0.5s ease-out;
  box-shadow:
    0 0 25px rgba(255, 193, 7, 0.3),
    0 4px 15px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.event-item.is-new::before {
  opacity: 1;
  background: linear-gradient(180deg, #ffc107, #ff9800);
  box-shadow: 0 0 15px #ffc107;
}

@keyframes pulseNew {
  0%, 100% {
    background:
      linear-gradient(135deg, rgba(255, 193, 7, 0.25) 0%, rgba(255, 152, 0, 0.15) 100%),
      radial-gradient(circle at center, rgba(255, 193, 7, 0.1) 0%, transparent 70%);
    box-shadow:
      0 0 25px rgba(255, 193, 7, 0.3),
      0 4px 15px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  50% {
    background:
      linear-gradient(135deg, rgba(255, 193, 7, 0.35) 0%, rgba(255, 152, 0, 0.25) 100%),
      radial-gradient(circle at center, rgba(255, 193, 7, 0.2) 0%, transparent 70%);
    box-shadow:
      0 0 35px rgba(255, 193, 7, 0.5),
      0 6px 20px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
}

.event-item:hover {
  background:
    linear-gradient(135deg, rgba(0, 229, 255, 0.2) 0%, rgba(123, 47, 247, 0.15) 100%),
    radial-gradient(circle at center, rgba(0, 229, 255, 0.1) 0%, transparent 70%);
  border-color: rgba(0, 229, 255, 0.5);
  transform: translateX(6px);
  box-shadow:
    0 4px 20px rgba(0, 229, 255, 0.3),
    0 0 30px rgba(0, 229, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.event-item:hover::before {
  opacity: 1;
  box-shadow: 0 0 15px #00e5ff;
}

.event-item:hover::after {
  opacity: 1;
}

.event-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.event-badge {
  display: flex;
  align-items: center;
  gap: 6px;
}

.new-badge {
  font-size: 9px !important;
  font-weight: bold;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.event-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}

.event-text {
  font-size: 12px;
  color: var(--text-primary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.event-time {
  color: var(--text-tertiary);
  font-size: 10px;
  white-space: nowrap;
}

.chart-card :deep(.el-card__header),
.device-status-card :deep(.el-card__header),
.event-card :deep(.el-card__header) {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(123, 47, 247, 0.05) 100%) !important;
  border-bottom: 1px solid rgba(0, 229, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1px;
  position: relative;
}

.chart-card :deep(.el-card__header)::after,
.device-status-card :deep(.el-card__header)::after,
.event-card :deep(.el-card__header)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  width: 40px;
  height: 2px;
  background: var(--gradient-primary);
  border-radius: 2px;
}

.action-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 229, 255, 0.2) !important;
  border-radius: 12px !important;
  padding: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

:deep(.action-card .el-button) {
  width: 100%;
  margin: 6px 0;
  font-size: 14px;
  font-weight: 700;
  padding: 12px 20px;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
}

:deep(.action-card .el-button::before) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

:deep(.action-card .el-button:hover::before) {
  width: 300px;
  height: 300px;
}

:deep(.action-card .el-button:hover) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 229, 255, 0.4);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.event-list::-webkit-scrollbar {
  width: 8px;
}

.event-list::-webkit-scrollbar-track {
  background: rgba(10, 14, 39, 0.8);
  border-radius: 4px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
}

.event-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #00e5ff 0%, #00a8ff 50%, #7b2ff7 100%);
  border-radius: 4px;
  box-shadow:
    0 0 10px rgba(0, 229, 255, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(0, 229, 255, 0.3);
}

.event-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #7b2ff7 0%, #a855f7 50%, #00e5ff 100%);
  box-shadow:
    0 0 15px rgba(123, 47, 247, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border-color: rgba(123, 47, 247, 0.5);
}

@keyframes dataUpdate {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.metric-card {
  animation: dataUpdate 3s ease-in-out infinite;
}

.metric-card:nth-child(2) {
  animation-delay: 0.3s;
}

.metric-card:nth-child(3) {
  animation-delay: 0.6s;
}

.metric-card:nth-child(4) {
  animation-delay: 0.9s;
}
</style>
