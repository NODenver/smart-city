<template>
  <div class="analysis-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AI智能分析</span>
          <el-button @click="$router.push('/')" text type="primary">
            <el-icon><Back /></el-icon>
            返回首页
          </el-button>
        </div>
      </template>

      <el-row :gutter="20" class="analysis-content">
        <!-- 数据选择 -->
        <el-col :span="12">
          <el-card class="full-height-card">
            <template #header>
              <span>选择分析对象</span>
            </template>

            <el-tabs v-model="activeTab" class="full-tabs">
              <el-tab-pane label="城市事件" name="events">
                <el-table
                  :data="dataStore.cityEvents"
                  @selection-change="handleEventSelection"
                  height="350"
                  stripe
                >
                  <el-table-column type="selection" width="60" align="center" />
                  <el-table-column prop="id" label="ID" width="120" show-overflow-tooltip />
                  <el-table-column prop="type" label="类型" min-width="120" />
                  <el-table-column label="位置" min-width="120">
                    <template #default="{ row }">
                      {{ row.location.district }}
                    </template>
                  </el-table-column>
                  <el-table-column label="街道" min-width="150" show-overflow-tooltip>
                    <template #default="{ row }">
                      {{ row.location.street }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="reporterType" label="上报方式" width="120" />
                  <el-table-column prop="reportTime" label="上报时间" min-width="180" show-overflow-tooltip />
                  <el-table-column prop="status" label="状态" width="120" align="center">
                    <template #default="{ row }">
                      <el-tag :type="row.status === '紧急' ? 'danger' : 'primary'" size="small">
                        {{ row.status }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="描述" min-width="200" show-overflow-tooltip>
                    <template #default="{ row }">
                      {{ row.description }}
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <el-tab-pane label="传感器数据" name="sensors">
                <el-table
                  :data="dataStore.sensorData"
                  @selection-change="handleSensorSelection"
                  height="350"
                  stripe
                >
                  <el-table-column type="selection" width="60" align="center" />
                  <el-table-column prop="sensorId" label="传感器ID" width="140" show-overflow-tooltip />
                  <el-table-column prop="type" label="类型" min-width="120" />
                  <el-table-column label="位置" min-width="120">
                    <template #default="{ row }">
                      {{ row.location.district }}
                    </template>
                  </el-table-column>
                  <el-table-column label="街道" min-width="150" show-overflow-tooltip>
                    <template #default="{ row }">
                      {{ row.location.street }}
                    </template>
                  </el-table-column>
                  <el-table-column label="数值" width="120" align="right">
                    <template #default="{ row }">
                      <span :style="{ color: row.status === '异常' ? '#f56c6c' : '#67c23a' }">
                        {{ row.value }}{{ row.unit }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="threshold" label="阈值" width="100" align="right">
                    <template #default="{ row }">
                      {{ row.threshold }}{{ row.unit }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="timestamp" label="采集时间" min-width="180" show-overflow-tooltip />
                  <el-table-column prop="status" label="状态" width="120" align="center">
                    <template #default="{ row }">
                      <el-tag :type="row.status === '异常' ? 'danger' : 'success'" size="small">
                        {{ row.status }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>

            <div class="selection-info">
              已选择 {{ selectedEvents.length }} 个事件，{{ selectedSensors.length }} 个传感器
            </div>

            <el-button
              type="primary"
              @click="startAnalysis"
              :loading="aiStore.isAnalyzing"
              :disabled="selectedEvents.length === 0 && selectedSensors.length === 0"
            >
              <el-icon><Cpu /></el-icon>
              开始AI分析
            </el-button>
          </el-card>
        </el-col>

        <!-- 分析结果 -->
        <el-col :span="12">
          <el-card class="full-height-card">
            <template #header>
              <span>分析结果</span>
            </template>

            <div v-if="aiStore.isAnalyzing" class="analyzing">
              <el-icon class="is-loading"><Loading /></el-icon>
              <div class="analysis-stream">
                <pre>{{ aiStore.currentStream }}</pre>
              </div>
            </div>

            <div v-else-if="currentResult" class="result">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="问题归因">
                  <div class="result-text">{{ currentResult.cause }}</div>
                </el-descriptions-item>
                <el-descriptions-item label="处置建议">
                  <div class="result-text">{{ currentResult.suggestion }}</div>
                </el-descriptions-item>
                <el-descriptions-item label="优先级">
                  <el-tag :type="getPriorityType(currentResult.priority)" size="large">
                    {{ currentResult.priority }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>

              <div class="result-actions">
                <el-button type="success" @click="saveAnalysis" plain>
                  <el-icon><Document /></el-icon>
                  保存分析
                </el-button>
                <el-button @click="currentResult = null" plain>
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
              </div>
            </div>

            <div v-else class="empty">
              <el-empty description="请选择数据后点击分析" />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 分析历史 -->
      <el-card v-if="aiStore.analysisHistory.length > 0" style="margin-top: 20px">
        <template #header>
          <span>分析历史</span>
        </template>

        <el-timeline>
          <el-timeline-item
            v-for="analysis in aiStore.analysisHistory"
            :key="analysis.id"
            :timestamp="formatTime(analysis.timestamp)"
            placement="top"
          >
            <el-card>
              <div class="history-item">
                <div class="history-header">
                  <el-tag>{{ analysis.priority }}</el-tag>
                  <span class="history-count">
                    分析了 {{ analysis.eventIds.length }} 个事件，{{ analysis.sensorIds.length }} 个传感器
                  </span>
                </div>
                <p class="history-text">{{ analysis.cause }}</p>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useDataStore } from '@/stores/data';
import { useAIStore } from '@/stores/ai';
import type { CityEvent, SensorData, AIAnalysisResult } from '@/types/city';

const dataStore = useDataStore();
const aiStore = useAIStore();

const activeTab = ref('events');
const selectedEvents = ref<CityEvent[]>([]);
const selectedSensors = ref<SensorData[]>([]);
const currentResult = ref<AIAnalysisResult | null>(null);

function handleEventSelection(selection: CityEvent[]) {
  selectedEvents.value = selection;
}

function handleSensorSelection(selection: SensorData[]) {
  selectedSensors.value = selection;
}

async function startAnalysis() {
  if (selectedEvents.value.length === 0 && selectedSensors.value.length === 0) {
    ElMessage.warning('请至少选择一个分析对象');
    return;
  }

  try {
    const result = await aiStore.analyzeStreaming(selectedEvents.value, selectedSensors.value);
    currentResult.value = result;
    ElMessage.success('分析完成');
  } catch (error) {
    ElMessage.error('分析失败，请稍后重试');
  }
}

function saveAnalysis() {
  if (currentResult.value) {
    aiStore.saveAnalysisResult(currentResult.value);
    ElMessage.success('分析结果已保存');
  }
}

function getPriorityType(priority: string) {
  const typeMap: Record<string, any> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  };
  return typeMap[priority] || '';
}

function formatTime(timeStr: string) {
  const date = new Date(timeStr);
  return date.toLocaleString();
}
</script>

<style scoped>
.analysis-container {
  width: 100%;
  padding: 24px;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: 1px;
}

.analysis-content {
  display: flex;
  align-items: stretch;
}

.full-height-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 229, 255, 0.2) !important;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.full-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.full-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

.full-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.full-tabs :deep(.el-table) {
  height: 100%;
}

.selection-info {
  margin: 15px 0;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(0, 180, 216, 0.05) 100%);
  border-left: 3px solid var(--primary-color);
  border-radius: 8px;
  color: rgba(226, 232, 240, 0.9);
  font-weight: 500;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 229, 255, 0.1);
}

.analyzing {
  text-align: center;
  padding: 60px 20px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.analyzing .el-icon {
  font-size: 48px;
  color: var(--primary-color);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.analysis-stream {
  margin-top: 24px;
  background: rgba(30, 41, 59, 0.8);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(0, 229, 255, 0.2);
  text-align: left;
  max-width: 600px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.analysis-stream pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  color: rgba(226, 232, 240, 0.95);
  font-size: 14px;
  line-height: 1.6;
}

.result {
  padding: 20px 0;
  min-height: 400px;
}

.result-text {
  line-height: 1.8;
  color: rgba(226, 232, 240, 0.95);
  font-size: 14px;
  padding: 8px 0;
}

.result-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.empty {
  padding: 60px 0;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-item {
  padding: 12px 0;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.history-count {
  color: rgba(148, 163, 184, 0.9);
  font-size: 13px;
  font-weight: 500;
}

.history-text {
  color: rgba(226, 232, 240, 0.9);
  line-height: 1.8;
  font-size: 14px;
}

/* 卡片样式统一 */
:deep(.el-card) {
  background: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 229, 255, 0.2) !important;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

:deep(.el-card__header) {
  background: rgba(30, 41, 59, 0.4) !important;
  border-bottom: 1px solid rgba(0, 229, 255, 0.2) !important;
  padding: 18px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

/* 标签页样式 */
:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(51, 65, 85, 0.5);
}

:deep(.el-tabs__item) {
  color: rgba(148, 163, 184, 0.9) !important;
  font-weight: 500;
  padding: 0 24px;
  height: 44px;
  line-height: 44px;
  transition: all 0.3s ease;
}

:deep(.el-tabs__item:hover) {
  color: var(--primary-color) !important;
}

:deep(.el-tabs__item.is-active) {
  color: var(--primary-color) !important;
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background-color: var(--primary-color);
  height: 3px;
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
}

/* 表格样式 */
:deep(.el-table) {
  background: transparent !important;
  color: var(--text-primary);
}

:deep(.el-table thead) {
  background: rgba(30, 41, 59, 0.8) !important;
}

:deep(.el-table th.el-table__cell) {
  background: rgba(30, 41, 59, 0.8) !important;
  color: rgba(226, 232, 240, 0.95) !important;
  font-weight: 600;
  border-bottom: 2px solid rgba(0, 229, 255, 0.3) !important;
  padding: 12px 0;
}

:deep(.el-table__body tr) {
  background: rgba(15, 23, 42, 0.6) !important;
  transition: all 0.3s ease;
}

:deep(.el-table__body tr:hover) {
  background: rgba(30, 41, 59, 0.8) !important;
}

:deep(.el-table__body tr.el-table__row--striped) {
  background: rgba(20, 28, 46, 0.7) !important;
}

:deep(.el-table__body tr.el-table__row--striped:hover) {
  background: rgba(30, 41, 59, 0.8) !important;
}

:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(51, 65, 85, 0.5) !important;
  padding: 10px 0;
  color: var(--text-primary);
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
  padding: 4px 12px;
}

:deep(.el-tag--success) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  border: none;
  color: #fff !important;
}

:deep(.el-tag--primary) {
  background: var(--gradient-primary) !important;
  border: none;
  color: #fff !important;
}

:deep(.el-tag--danger) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  border: none;
  color: #fff !important;
}

:deep(.el-tag--warning) {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  border: none;
  color: #fff !important;
}

:deep(.el-tag--info) {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
  border: none;
  color: #fff !important;
}

/* 按钮样式 */
:deep(.el-button) {
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 10px 24px;
}

:deep(.el-button--primary) {
  background: var(--gradient-primary);
  border-color: transparent;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 229, 255, 0.3);
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: transparent;
}

:deep(.el-button--success:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

:deep(.el-button.is-text) {
  color: var(--primary-color);
}

/* 描述列表样式 */
:deep(.el-descriptions) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-descriptions__header) {
  margin-bottom: 16px;
}

:deep(.el-descriptions__label) {
  background: rgba(30, 41, 59, 0.6) !important;
  color: rgba(226, 232, 240, 0.95) !important;
  font-weight: 600;
  width: 120px;
}

:deep(.el-descriptions__content) {
  background: rgba(15, 23, 42, 0.4) !important;
  color: var(--text-primary) !important;
}

:deep(.el-descriptions__cell) {
  border-color: rgba(51, 65, 85, 0.5) !important;
}

/* 时间轴样式 */
:deep(.el-timeline-item__timestamp) {
  color: rgba(148, 163, 184, 0.9) !important;
  font-weight: 500;
  font-size: 13px;
}

:deep(.el-timeline-item__node) {
  background-color: var(--primary-color) !important;
  border: 2px solid rgba(0, 229, 255, 0.3);
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.4);
}

:deep(.el-timeline-item__tail) {
  border-left: 2px solid rgba(0, 229, 255, 0.3);
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 32px;
}

:deep(.el-timeline-item__content .el-card) {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

:deep(.el-timeline-item__content .el-card:hover) {
  transform: translateX(8px);
  border-color: rgba(0, 229, 255, 0.4) !important;
  box-shadow: 0 8px 32px rgba(0, 229, 255, 0.15);
}

/* 空状态样式 */
:deep(.el-empty) {
  padding: 40px 0;
}

:deep(.el-empty__image svg) {
  fill: rgba(148, 163, 184, 0.3);
}

:deep(.el-empty__description) {
  color: rgba(148, 163, 184, 0.9);
  font-size: 14px;
}

/* 加载动画增强 */
:deep(.el-button.is-loading) {
  position: relative;
  overflow: hidden;
}

:deep(.el-button.is-loading::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>
