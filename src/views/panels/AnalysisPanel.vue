<template>
  <div class="analysis-panel">
    <!-- 问题聚类与热点识别 -->
    <div class="analysis-grid">
      <div class="analysis-card">
        <div class="card-header">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"/>
              <path d="m19 9-5 5-4-4-3 3"/>
            </svg>
            高频问题类型 TOP5
          </h3>
        </div>
        <div class="card-content">
          <div class="rank-list">
            <div v-for="(item, index) in topTypes" :key="index" class="rank-item">
              <div class="rank-header">
                <span class="rank-number">{{ index + 1 }}</span>
                <span class="rank-name">{{ item.type }}</span>
                <span class="rank-value">{{ item.count }} 次</span>
              </div>
            </div>
            <div v-if="topTypes.length === 0" class="empty-state">
              <p>暂无数据</p>
            </div>
          </div>
        </div>
      </div>

      <div class="analysis-card">
        <div class="card-header">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" x2="12" y1="9" y2="13"/>
              <line x1="12" x2="12.01" y1="17" y2="17"/>
            </svg>
            问题高发区 TOP5
          </h3>
        </div>
        <div class="card-content">
          <div class="rank-list">
            <div v-for="(item, index) in topDistricts" :key="index" class="rank-item">
              <div class="rank-header">
                <span class="rank-number">{{ index + 1 }}</span>
                <span class="rank-name">{{ item.district }}</span>
                <span class="rank-value">{{ item.count }} 条</span>
              </div>
            </div>
            <div v-if="topDistricts.length === 0" class="empty-state">
              <p>暂无数据</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI辅助决策 -->
    <div class="ai-section">
      <div class="section-header">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
          AI辅助决策分析
        </h3>
        <div style="display: flex; gap: 12px;">
          <el-button type="primary" :loading="generatingReport" @click="generateDailyReport">
            <svg v-if="!generatingReport" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
            {{ generatingReport ? '分析中...' : '生成当日简报' }}
          </el-button>
          <el-button type="primary" :loading="analyzing" @click="performAIAnalysis">
            <svg v-if="!analyzing" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
            {{ analyzing ? '分析中...' : '开始AI分析' }}
          </el-button>
        </div>
      </div>

      <div class="analysis-info">
        <p>已选择: {{ selectedEvents.length }} 条事件 + {{ selectedSensors.length }} 条传感器数据</p>
        <p>请从下方列表中选择需要分析的数据，AI将为您提供问题归因、处置建议和优先级评估</p>
      </div>

      <!-- 数据选择列表 -->
      <div class="selection-grid">
        <div class="selection-card">
          <h4>市民事件 ({{ sampleEvents.length }})</h4>
          <div class="selection-list">
            <div v-if="dataStore.cityEvents.length === 0" class="empty-selection">
              <p>请先上传数据</p>
            </div>
            <div v-else v-for="event in sampleEvents" :key="event.id" class="selection-item" @click="toggleEventSelection(event.id)">
              <div class="checkbox">
                <input type="checkbox" :id="event.id" :checked="selectedEvents.includes(event.id)" @change="toggleEventSelection(event.id)" />
                <label :for="event.id">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </label>
              </div>
              <div class="item-content">
                <div class="item-title">{{ event.description || '城市事件描述' }}</div>
                <div class="item-meta">{{ event.location?.district || '朝阳区' }} · {{ event.type || '道路积水' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="selection-card">
          <h4>传感器数据 ({{ sampleSensors.length }})</h4>
          <div class="selection-list">
            <div v-if="dataStore.sensorData.length === 0" class="empty-selection">
              <p>请先上传数据</p>
            </div>
            <div v-else v-for="sensor in sampleSensors" :key="sensor.sensorId" class="selection-item" @click="toggleSensorSelection(sensor.sensorId)">
              <div class="checkbox">
                <input type="checkbox" :id="sensor.sensorId" :checked="selectedSensors.includes(sensor.sensorId)" @change="toggleSensorSelection(sensor.sensorId)" />
                <label :for="sensor.sensorId">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </label>
              </div>
              <div class="item-content">
                <div class="item-title">{{ sensor.type || '积水传感器' }} - {{ sensor.value || 45 }}{{ sensor.unit || 'cm' }}</div>
                <div class="item-meta">{{ sensor.location?.district || '朝阳区' }} · {{ sensor.sensorId || 'DEV-1001' }} · {{ sensor.status || '异常' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- 当日城市运行简报 -->
    <div v-if="dailyReport" class="report-section" id="daily-report">
      <div class="section-header">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          当日城市运行简报
        </h3>
        <el-button type="primary" @click="exportToPDF">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" x2="12" y1="15" y2="3"/>
          </svg>
          导出PDF
        </el-button>
      </div>

      <div class="report-content">
        <div class="report-header">
          <h2>城市运行简报</h2>
          <p class="report-date">{{ dailyReport.date }}</p>
          <div class="report-meta">
            <span>报告编号: {{ dailyReport.reportId }}</span>
            <span>数据来源: 城市运行管理系统</span>
          </div>
        </div>

        <div class="report-section-block">
          <div class="report-section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" x2="12" y1="9" y2="13"/>
              <line x1="12" x2="12.01" y1="17" y2="17"/>
            </svg>
            问题汇总
          </div>
          <div class="report-section-content">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-label">事件总数</div>
                <div class="stat-value">{{ dailyReport.summary.totalEvents }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">待处理</div>
                <div class="stat-value pending">{{ dailyReport.summary.pending }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">处理中</div>
                <div class="stat-value processing">{{ dailyReport.summary.processing }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">已解决</div>
                <div class="stat-value resolved">{{ dailyReport.summary.resolved }}</div>
              </div>
            </div>

            <div class="issue-types">
              <h4>主要问题类型分布</h4>
              <div class="type-list">
                <div v-for="(item, index) in dailyReport.summary.topTypes" :key="index" class="type-item">
                  <div class="type-info">
                    <span class="type-name">{{ item.type }}</span>
                    <span class="type-bar">
                      <span class="type-bar-fill" :style="{ width: item.percentage + '%' }"></span>
                    </span>
                    <span class="type-count">{{ item.count }}次</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="report-section-block">
          <div class="report-section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            热点区域
          </div>
          <div class="report-section-content">
            <div class="hotspot-list">
              <div v-for="(area, index) in dailyReport.hotspotAreas" :key="index" class="hotspot-item">
                <div class="hotspot-rank">{{ index + 1 }}</div>
                <div class="hotspot-info">
                  <div class="hotspot-name">{{ area.name }}</div>
                  <div class="hotspot-meta">
                    <span>{{ area.district }}</span>
                    <span>事件数: {{ area.count }}</span>
                    <span>类型: {{ area.types }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="report-section-block">
          <div class="report-section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            处置建议
          </div>
          <div class="report-section-content">
            <div class="suggestions-list">
              <div v-for="(suggestion, index) in dailyReport.suggestions" :key="index" class="suggestion-item">
                <div class="suggestion-priority">{{ suggestion.priority }}</div>
                <div class="suggestion-content">
                  <div class="suggestion-title">{{ suggestion.title }}</div>
                  <div class="suggestion-text">{{ suggestion.content }}</div>
                  <div class="suggestion-meta">
                    <span>负责人: {{ suggestion.owner }}</span>
                    <span>预计完成: {{ suggestion.deadline }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="report-section-block">
          <div class="report-section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" x2="12" y1="9" y2="13"/>
              <line x1="12" x2="12.01" y1="17" y2="17"/>
            </svg>
            预警回顾
          </div>
          <div class="report-section-content">
            <div class="warnings-list">
              <div v-for="(warning, index) in dailyReport.warnings" :key="index" class="warning-item" :class="warning.level">
                <div class="warning-header">
                  <div class="warning-level-badge">{{ warning.levelText }}</div>
                  <div class="warning-time">{{ warning.time }}</div>
                </div>
                <div class="warning-content">
                  <div class="warning-title">{{ warning.title }}</div>
                  <div class="warning-text">{{ warning.content }}</div>
                  <div class="warning-meta">
                    <span>影响区域: {{ warning.area }}</span>
                    <span>状态: {{ warning.status }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="report-footer">
          <div class="report-signature">
            <div class="signature-item">
              <span>生成时间:</span>
              <span>{{ dailyReport.generateTime }}</span>
            </div>
            <div class="signature-item">
              <span>生成方式:</span>
              <span>AI自动生成</span>
            </div>
            <div class="signature-item">
              <span>系统版本:</span>
              <span>Smart City v1.0</span>
            </div>
          </div>
          <p class="report-disclaimer">
            * 本简报由系统自动生成，数据仅供参考，请以官方发布为准
          </p>
        </div>
      </div>
    </div>

    <!-- 历史分析记录 -->
    <div class="history-section">
      <div class="section-header">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          历史AI分析记录
        </h3>
      </div>

      <div class="history-list">
        <div v-if="analysisHistory.length === 0" class="empty-history">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>暂无分析记录</p>
        </div>
        <div v-else v-for="analysis in analysisHistory" :key="analysis.id" class="history-item">
          <div class="history-header">
            <span class="history-time">{{ analysis.timestamp }}</span>
            <span :class="['priority-badge', analysis.priorityColor]">{{ analysis.priority }}</span>
          </div>
          <div class="history-content">
            <div class="analysis-section">
              <div class="section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 3h20"/>
                  <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/>
                  <path d="m7 21 5-5 5 5"/>
                </svg>
                问题归因
              </div>
              <div class="section-text">{{ analysis.rootCause }}</div>
            </div>
            <div class="analysis-section">
              <div class="section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                处置建议
              </div>
              <div class="section-text">{{ analysis.suggestions }}</div>
            </div>
            <div class="history-meta">
              <span>分析数据量: {{ analysis.eventCount }} 条市民事件 + {{ analysis.sensorCount }} 条传感器数据</span>
              <span style="margin-left: 1rem;">涉及区域: {{ analysis.districts }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDataStore } from '@/stores/data';
import { ElMessage } from 'element-plus';
import { performAIAnalysis as callAI } from '@/services/ai';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const dataStore = useDataStore();
const analyzing = ref(false);
const generatingReport = ref(false);
const selectedEvents = ref<string[]>([]);
const selectedSensors = ref<string[]>([]);
const analysisHistory = ref<any[]>([]);
const dailyReport = ref<any>(null);

// 基于真实数据的问题聚类分析
const topTypes = computed(() => {
  return dataStore.eventsByType
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(item => ({ type: item.type, count: item.count }));
});

const topDistricts = computed(() => {
  return dataStore.eventsByDistrict
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(item => ({ district: item.district, count: item.count }));
});

// 事件类型和区域选项
const eventTypes = computed(() => {
  const types = new Set<string>();
  dataStore.cityEvents.forEach(event => {
    types.add(event.type);
  });
  return Array.from(types).sort();
});

const eventDistricts = computed(() => {
  const districts = new Set<string>();
  dataStore.cityEvents.forEach(event => {
    if (event.location && event.location.district) {
      districts.add(event.location.district);
    }
  });
  return Array.from(districts).sort();
});

// 传感器类型和状态选项
const sensorTypes = computed(() => {
  const types = new Set<string>();
  dataStore.sensorData.forEach(sensor => {
    types.add(sensor.type);
  });
  return Array.from(types).sort();
});

const sensorStatuses = computed(() => {
  const statuses = new Set<string>();
  dataStore.sensorData.forEach(sensor => {
    statuses.add(sensor.status);
  });
  return Array.from(statuses).sort();
});

// 样例数据（用于展示）
const sampleEvents = computed(() => dataStore.cityEvents.slice(0, 50));
const sampleSensors = computed(() => dataStore.sensorData.slice(0, 50));

// 关联分析
const correlations = computed(() => {
  const correlationsList: Array<{ event: any; sensors: any[] }> = [];

  dataStore.cityEvents.slice(0, 5).forEach(event => {
    const nearbySensors = dataStore.sensorData.filter(sensor => {
      const distance = Math.sqrt(
        Math.pow(event.location.lat - sensor.location.lat, 2) +
        Math.pow(event.location.lng - sensor.location.lng, 2)
      );
      return distance < 0.01 && sensor.status === '异常';
    });

    if (nearbySensors.length > 0) {
      correlationsList.push({ event, sensors: nearbySensors });
    }
  });

  return correlationsList;
});

// 生成AI分析结果
const generateAnalysisResult = () => {
  const selectedEventData = dataStore.cityEvents.filter(e => selectedEvents.value.includes(e.id));
  const selectedSensorData = dataStore.sensorData.filter(s => selectedSensors.value.includes(s.sensorId));

  // 如果没有选中数据，使用前5条作为示例
  const eventsToAnalyze = selectedEventData.length > 0 ? selectedEventData : dataStore.cityEvents.slice(0, 5);
  const sensorsToAnalyze = selectedSensorData.length > 0 ? selectedSensorData : dataStore.sensorData.slice(0, 3);

  // 分析问题类型
  const eventTypes = eventsToAnalyze.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topType = Object.entries(eventTypes).sort((a, b) => b[1] - a[1])[0];

  // 分析区域分布
  const districtCount = eventsToAnalyze.reduce((acc, e) => {
    acc[e.location.district] = (acc[e.location.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDistrict = Object.entries(districtCount).sort((a, b) => b[1] - a[1])[0];

  // 生成问题归因
  const getRootCause = () => {
    if (!topType) return '暂无足够数据进行归因分析';

    const type = topType[0];
    const typeCount = topType[1];

    if (type === '道路积水') {
      return `${topDistrict[0]}区域在过去一周内上报了${typeCount}次"道路积水"问题。经分析，该区域排水管网老化严重，加之近期降雨量较大，导致道路积水问题频发。传感器数据显示多处积水深度超过30cm，严重影响市民出行。`;
    } else if (type === '路灯故障') {
      return `${topDistrict[0]}区域内"路灯故障"问题集中爆发，共${typeCount}次上报。主要原因可能是供电线路老化、设备维护不及时，以及极端天气对设施造成损害。建议重点检查该区域路灯设施。`;
    } else if (type === '占道经营') {
      return `${topDistrict[0]}区域"占道经营"问题突出，${typeCount}次上报反映该区域流动摊贩聚集，严重影响交通秩序和市容环境。建议加强巡查力度，实施定点监管。`;
    } else {
      return `${topDistrict[0]}区域${type}问题频发，统计期内共${typeCount}次上报，占该类型问题总量的${((typeCount / dataStore.cityEvents.length) * 100).toFixed(1)}%。`;
    }
  };

  // 生成处置建议
  const getSuggestions = () => {
    if (!topType) return '暂无足够数据提供处置建议';

    const type = topType[0];

    if (type === '道路积水') {
      return '【立即处置】建议立即调度排水车前往积水点位进行紧急排水。【短期措施】安排市政部门对该区域排水管网进行全面检修和清淤。【中期规划】考虑对老旧管网进行改造升级，提升排水能力。【预防措施】建立降雨预警机制，提前部署应急资源。';
    } else if (type === '路灯故障') {
      return '【立即处置】组织维修队伍对故障路灯进行抢修，确保夜间照明。【设备检修】对区域内所有路灯设施进行全面检查。【备件储备】建立常用配件储备库，缩短维修响应时间。【预防维护】制定定期巡检计划，预防性更换老化部件。';
    } else if (type === '占道经营') {
      return '【执法整治】联合城管、公安等部门开展专项整治行动。【长效监管】建立网格化巡查机制，实施定点值守。【疏导措施】引导流动摊贩进入规范市场经营。【宣传教育】加强法律法规宣传，提高商户守法意识。';
    } else {
      return `针对${type}问题，建议：\n1. 立即组织专业力量进行处置\n2. 深入调研问题成因，制定针对性解决方案\n3. 建立长效管理机制，防止问题反弹\n4. 加强部门协同，形成工作合力`;
    }
  };

  // 计算优先级
  const getPriority = () => {
    const totalCount = eventsToAnalyze.length;
    const abnormalSensors = sensorsToAnalyze.filter(s => s.status === '异常').length;
    const criticalDistricts = Object.keys(districtCount).length;

    let score = 0;
    if (totalCount >= 10) score += 30;
    else if (totalCount >= 5) score += 20;
    else score += 10;

    if (abnormalSensors >= 3) score += 30;
    else if (abnormalSensors >= 1) score += 20;
    else score += 5;

    if (criticalDistricts >= 5) score += 20;
    else if (criticalDistricts >= 3) score += 15;
    else score += 10;

    if (score >= 60) return { level: '高优先级', color: 'high' };
    if (score >= 40) return { level: '中优先级', color: 'medium' };
    return { level: '低优先级', color: 'low' };
  };

  const priority = getPriority();

  return {
    id: `AI-${Date.now()}`,
    timestamp: new Date().toLocaleString('zh-CN'),
    priority: priority.level,
    priorityColor: priority.color,
    rootCause: getRootCause(),
    suggestions: getSuggestions(),
    eventCount: eventsToAnalyze.length,
    sensorCount: sensorsToAnalyze.length,
    districts: Object.keys(districtCount).join('、')
  };
};

const performAIAnalysis = async () => {
  if (dataStore.cityEvents.length === 0) {
    ElMessage.warning('请先上传数据');
    return;
  }

  analyzing.value = true;

  try {
    // 获取选中的数据
    const selectedEventData = dataStore.cityEvents.filter(e => selectedEvents.value.includes(e.id));
    const selectedSensorData = dataStore.sensorData.filter(s => selectedSensors.value.includes(s.sensorId));

    // 如果没有选中数据，使用前5条作为示例
    const eventsToAnalyze = selectedEventData.length > 0 ? selectedEventData : dataStore.cityEvents.slice(0, 5);
    const sensorsToAnalyze = selectedSensorData.length > 0 ? selectedSensorData : dataStore.sensorData.slice(0, 3);

    // 调用真实AI分析
    const aiResult = await callAI({
      events: eventsToAnalyze,
      sensors: sensorsToAnalyze
    });

    // 计算区域分布（用于显示涉及区域）
    const districtCount = eventsToAnalyze.reduce((acc, e) => {
      acc[e.location.district] = (acc[e.location.district] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 生成分析结果
    const result = {
      id: `AI-${Date.now()}`,
      timestamp: new Date().toLocaleString('zh-CN'),
      priority: aiResult.priority,
      priorityColor: aiResult.priorityColor,
      rootCause: aiResult.rootCause,
      suggestions: aiResult.suggestions,
      eventCount: eventsToAnalyze.length,
      sensorCount: sensorsToAnalyze.length,
      districts: Object.keys(districtCount).join('、')
    };

    analysisHistory.value.unshift(result);
    ElMessage.success('AI分析完成！');
  } catch (error: any) {
    console.error('AI分析失败:', error);

    // 如果API调用失败，使用本地分析作为降级方案
    if (error.message?.includes('请配置DASHSCOPE_API_KEY')) {
      ElMessage.warning('未配置API密钥，使用本地分析');
    } else {
      ElMessage.error('AI分析失败，使用本地分析');
    }

    // 使用本地分析结果
    const result = generateAnalysisResult();
    analysisHistory.value.unshift(result);
  } finally {
    analyzing.value = false;
  }
};

// 切换事件选择
const toggleEventSelection = (eventId: string) => {
  const index = selectedEvents.value.indexOf(eventId);
  if (index > -1) {
    selectedEvents.value.splice(index, 1);
  } else {
    selectedEvents.value.push(eventId);
  }
};

// 切换传感器选择
const toggleSensorSelection = (sensorId: string) => {
  const index = selectedSensors.value.indexOf(sensorId);
  if (index > -1) {
    selectedSensors.value.splice(index, 1);
  } else {
    selectedSensors.value.push(sensorId);
  }
};


// 生成当日城市运行简报
const generateDailyReport = async () => {
  generatingReport.value = true;

  try {
    // 获取当日数据
    const events = dataStore.cityEvents;
    const sensors = dataStore.sensorData;

    if (events.length === 0) {
      ElMessage.warning('暂无数据，请先上传数据');
      generatingReport.value = false;
      return;
    }

    // 生成简报数据
    const reportData = {
      reportId: `RPT-${new Date().getTime()}`,
      date: new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }),
      generateTime: new Date().toLocaleString('zh-CN'),
      summary: generateSummary(events, sensors),
      hotspotAreas: generateHotspotAreas(events),
      suggestions: generateSuggestions(events, sensors),
      warnings: generateWarnings(events, sensors)
    };

    dailyReport.value = reportData;
    ElMessage.success('简报生成成功！');

    // 滚动到简报位置
    setTimeout(() => {
      document.getElementById('daily-report')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  } catch (error) {
    console.error('生成简报失败:', error);
    ElMessage.error('生成简报失败，请稍后重试');
  } finally {
    generatingReport.value = false;
  }
};

// 生成问题汇总
const generateSummary = (events: any[], sensors: any[]) => {
  const totalEvents = events.length;
  const pending = events.filter(e => e.status === '待处理').length;
  const processing = events.filter(e => e.status === '处理中').length;
  const resolved = events.filter(e => e.status === '已解决').length;

  // 问题类型统计
  const typeCount = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTypes = Object.entries(typeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalEvents) * 100)
    }));

  return {
    totalEvents,
    pending,
    processing,
    resolved,
    topTypes
  };
};

// 生成热点区域
const generateHotspotAreas = (events: any[]) => {
  const districtCount = events.reduce((acc, e) => {
    acc[e.location.district] = (acc[e.location.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const districtTypes = events.reduce((acc, e) => {
    if (!acc[e.location.district]) {
      acc[e.location.district] = new Set();
    }
    acc[e.location.district].add(e.type);
    return acc;
  }, {} as Record<string, Set<string>>);

  return Object.entries(districtCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([district, count], index) => ({
      name: `${district}区域`,
      district,
      count,
      types: Array.from(districtTypes[district]).join('、')
    }));
};

// 生成处置建议
const generateSuggestions = (events: any[], sensors: any[]) => {
  const abnormalSensors = sensors.filter(s => s.status === '异常');
  const criticalEvents = events.filter(e => e.status === '紧急');

  const suggestions = [];

  if (criticalEvents.length > 0) {
    suggestions.push({
      priority: '紧急',
      title: '紧急事件快速响应',
      content: `当前有 ${criticalEvents.length} 条紧急事件需要立即处理，建议启动应急预案，调配应急资源，优先处理涉及公共安全的重大事件。`,
      owner: '应急指挥中心',
      deadline: '2小时内'
    });
  }

  const topType = dataStore.eventsByType[0]?.type || '道路积水';
  if (topType === '道路积水') {
    suggestions.push({
      priority: '高',
      title: '排水设施检修',
      content: `近期"${topType}"问题频发，建议对相关区域的排水管网进行全面检查，清理排水沟渠，确保排水畅通。`,
      owner: '市政部门',
      deadline: '3天内'
    });
  } else {
    suggestions.push({
      priority: '高',
      title: `${topType}问题专项整治`,
      content: `针对${topType}问题，建议开展专项治理行动，加强巡查力度，建立长效管理机制。`,
      owner: '相关部门',
      deadline: '1周内'
    });
  }

  if (abnormalSensors.length > 0) {
    suggestions.push({
      priority: '中',
      title: '传感器异常排查',
      content: `发现 ${abnormalSensors.length} 个传感器数据异常，建议技术人员及时检查设备状态，确保数据采集准确。`,
      owner: '技术支持部',
      deadline: '2天内'
    });
  }

  suggestions.push({
    priority: '中',
    title: '数据分析与研判',
    content: '建议定期分析城市运行数据，及时发现潜在问题，优化城市管理策略，提升治理效能。',
    owner: '城市运营中心',
    deadline: '持续进行'
  });

  return suggestions;
};

// 生成预警回顾
const generateWarnings = (events: any[], sensors: any[]) => {
  const warnings = [];

  // 基于实际数据生成预警
  const urgentEvents = events.filter(e => e.status === '紧急');
  if (urgentEvents.length > 0) {
    warnings.push({
      level: 'danger',
      levelText: '红色预警',
      time: new Date().toLocaleString('zh-CN'),
      title: '突发事件预警',
      content: `今日共发生 ${urgentEvents.length} 起紧急事件，主要集中在道路积水、设施故障等问题。已启动应急响应机制，相关部门正在全力处置。`,
      area: '全市',
      status: '已响应'
    });
  }

  const abnormalSensors = sensors.filter(s => s.status === '异常');
  if (abnormalSensors.length > 0) {
    warnings.push({
      level: 'warning',
      levelText: '橙色预警',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString('zh-CN'),
      title: '数据异常预警',
      content: `监测到 ${abnormalSensors.length} 个传感器数据异常，可能存在设备故障或环境异常。建议立即排查原因。`,
      area: '多个区域',
      status: '处理中'
    });
  }

  const topType = dataStore.eventsByType[0];
  if (topType && topType.count >= 5) {
    warnings.push({
      level: 'info',
      levelText: '蓝色预警',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString('zh-CN'),
      title: '问题集中爆发预警',
      content: `${topType.type}问题今日已发生 ${topType.count} 起，超过预警阈值。请相关部门关注并采取预防措施。`,
      area: '重点区域',
      status: '监控中'
    });
  }

  // 如果没有实际预警，生成一条示例预警
  if (warnings.length === 0) {
    warnings.push({
      level: 'info',
      levelText: '蓝色预警',
      time: new Date().toLocaleString('zh-CN'),
      title: '常规监测预警',
      content: '城市运行整体平稳，各项指标正常。建议持续关注重点区域，确保城市安全有序运行。',
      area: '全市',
      status: '正常'
    });
  }

  return warnings;
};

// 导出PDF
const exportToPDF = async () => {
  if (!dailyReport.value) {
    ElMessage.warning('请先生成简报');
    return;
  }

  try {
    const reportElement = document.getElementById('daily-report');
    if (!reportElement) {
      ElMessage.error('未找到简报内容');
      return;
    }

    // 创建canvas - 使用更安全的配置
    const canvas = await html2canvas(reportElement, {
      scale: 1.5, // 降低清晰度以避免渐变问题
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      foreignObjectRendering: false,
      ignoreElements: () => false,
      onclone: (clonedDoc) => {
        // 移除可能导致问题的CSS
        const clonedReport = clonedDoc.getElementById('daily-report');
        if (clonedReport) {
          // 移除复杂渐变
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              animation: none !important;
              transition: none !important;
            }
            .type-bar-fill {
              background: #06b6d4 !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4宽度 (mm)
    const pageHeight = 297; // A4高度 (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // 添加第一页
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 如果内容超过一页，添加更多页面
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 下载PDF
    const today = new Date().toLocaleDateString('zh-CN').replace(/\//g, '');
    pdf.save(`城市运行简报_${today}.pdf`);

    ElMessage.success('PDF导出成功！');
  } catch (error) {
    console.error('导出PDF失败:', error);
    ElMessage.error(`导出PDF失败: ${error.message || '请稍后重试'}`);
  }
};
</script>

<style scoped>
.analysis-panel {
  width: 100%;
}

/* 分析网格 */
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.analysis-card {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all var(--transition-normal);
}

.analysis-card:hover {
  border-color: var(--border-primary-hover);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-content {
  padding: 1.5rem;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rank-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rank-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.rank-number {
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

.rank-name {
  flex: 1;
  font-size: 14px;
  color: var(--text-secondary);
}

.rank-value {
  padding: 0.25rem 0.75rem;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

/* AI辅助决策 */
.ai-section {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.analysis-info {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.analysis-info p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0.25rem 0;
}

/* 数据选择 */
.selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.selection-card {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.selection-card h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
  padding: 1rem;
  background: var(--background-mute);
  border-bottom: 1px solid var(--border-color);
}

.selection-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--background-mute);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.filter-input {
  flex: 1;
  min-width: 150px;
  padding: 0.5rem 0.75rem;
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  outline: none;
  transition: all var(--transition-normal);
}

.filter-input:focus {
  border-color: var(--border-primary);
}

.filter-input::placeholder {
  color: var(--text-muted);
}

.filter-select {
  padding: 0.5rem 0.75rem;
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  outline: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 100px;
}

.filter-select:hover {
  border-color: var(--border-primary-hover);
}

.filter-select:focus {
  border-color: var(--border-primary);
}

.selection-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.selection-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.selection-item:hover {
  border-color: var(--border-primary-hover);
  background: rgba(15, 23, 42, 0.6);
}

.checkbox {
  position: relative;
}

.checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.checkbox label svg {
  display: none;
  color: white;
}

.checkbox input[type="checkbox"]:checked + label {
  background: var(--gradient-primary);
  border-color: transparent;
}

.checkbox input[type="checkbox"]:checked + label svg {
  display: block;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.item-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.empty-selection {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

/* 历史记录 */
.history-section {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-history {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.empty-history svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.history-item {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.history-time {
  font-size: 13px;
  color: var(--text-muted);
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.priority-badge.high {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--error-color);
}

.priority-badge.medium {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--warning-color);
}

.priority-badge.low {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--success-color);
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.analysis-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-color);
}

.section-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  padding-left: 1.75rem;
}

.history-meta {
  font-size: 12px;
  color: var(--text-muted);
  padding-left: 1.75rem;
}

/* 响应式 */
@media (max-width: 1024px) {
  .analysis-grid,
  .selection-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .rank-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* 当日城市运行简报样式 */
.report-section {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.report-content {
  background: white;
  color: #333;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.report-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
}

.report-header h2 {
  font-size: 28px;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.report-date {
  font-size: 16px;
  color: #666;
  margin: 0.5rem 0;
}

.report-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 13px;
  color: #999;
  margin-top: 1rem;
}

.report-section-block {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.report-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-value.pending {
  color: #f59e0b;
}

.stat-value.processing {
  color: #3b82f6;
}

.stat-value.resolved {
  color: #10b981;
}

.issue-types h4 {
  font-size: 15px;
  color: #333;
  margin: 0 0 1rem 0;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.type-item {
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
}

.type-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.type-name {
  min-width: 100px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.type-bar {
  flex: 1;
  height: 24px;
  background: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.type-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), #06b6d4);
  border-radius: 12px;
  transition: width 0.3s ease;
}

.type-count {
  min-width: 60px;
  font-size: 13px;
  color: #666;
  text-align: right;
}

.hotspot-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hotspot-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.hotspot-rank {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.hotspot-info {
  flex: 1;
}

.hotspot-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.hotspot-meta {
  display: flex;
  gap: 1rem;
  font-size: 13px;
  color: #666;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestion-item {
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.suggestion-priority {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  height: fit-content;
}

.suggestion-item:nth-child(1) .suggestion-priority {
  background: #fee2e2;
  color: #dc2626;
}

.suggestion-item:nth-child(2) .suggestion-priority,
.suggestion-item:nth-child(3) .suggestion-priority {
  background: #fef3c7;
  color: #d97706;
}

.suggestion-item:nth-child(4) .suggestion-priority {
  background: #dbeafe;
  color: #2563eb;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.suggestion-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.suggestion-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 13px;
  color: #999;
}

.warnings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.warning-item {
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.warning-item.danger {
  border-left: 4px solid #ef4444;
}

.warning-item.warning {
  border-left: 4px solid #f59e0b;
}

.warning-item.info {
  border-left: 4px solid #3b82f6;
}

.warning-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.warning-level-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.warning-item.danger .warning-level-badge {
  background: #fee2e2;
  color: #dc2626;
}

.warning-item.warning .warning-level-badge {
  background: #fef3c7;
  color: #d97706;
}

.warning-item.info .warning-level-badge {
  background: #dbeafe;
  color: #2563eb;
}

.warning-time {
  font-size: 13px;
  color: #999;
}

.warning-content {
  margin-bottom: 0.75rem;
}

.warning-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.warning-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.warning-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 13px;
  color: #999;
}

.report-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e0e0e0;
}

.report-signature {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.signature-item {
  font-size: 13px;
  color: #666;
  display: flex;
  gap: 0.5rem;
}

.signature-item span:last-child {
  color: #333;
  font-weight: 500;
}

.report-disclaimer {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin: 0;
  font-style: italic;
}

/* 打印样式 */
@media print {
  .report-section {
    border: none;
    padding: 0;
    box-shadow: none;
  }

  .report-content {
    box-shadow: none;
    padding: 1rem;
  }

  .section-header {
    display: none;
  }
}

</style>
