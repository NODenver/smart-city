<template>
  <div class="alerts-panel">
    <!-- 预警规则配置 -->
    <div class="config-section">
      <div class="section-header">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m5.196-15.196l-4.242 4.242M1.804 12.196l4.242 4.242M18.196 6.804l-4.242-4.242"/>
          </svg>
          预警规则配置
        </h3>
      </div>

      <div class="config-grid">
        <div class="config-item">
          <label>聚集性问题阈值</label>
          <div class="slider-container">
            <input
              v-model="ruleConfig.clusterThreshold"
              type="range"
              min="3"
              max="10"
              class="slider"
            />
            <span class="slider-value">{{ ruleConfig.clusterThreshold }} 次</span>
          </div>
          <p class="config-hint">同一区域1小时内上报同类事件超过此数值时触发预警</p>
        </div>

        <div class="config-item">
          <label>传感器异常阈值</label>
          <div class="slider-container">
            <input
              v-model="ruleConfig.sensorThreshold"
              type="range"
              min="2"
              max="5"
              class="slider"
            />
            <span class="slider-value">{{ ruleConfig.sensorThreshold }} 次</span>
          </div>
          <p class="config-hint">传感器数值连续超阈值次数达到此数值时触发预警</p>
        </div>
      </div>

      <div class="config-actions">
        <button class="btn-save" @click="updateRules">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          保存预警规则
        </button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon red">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" x2="12" y1="9" y2="13"/>
            <line x1="12" x2="12.01" y1="17" y2="17"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">待处理预警</div>
          <div class="stat-value">{{ dataStore.pendingAlerts.length }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">已处理预警</div>
          <div class="stat-value">{{ dataStore.processedAlerts.length }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon cyan">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">预警总数</div>
          <div class="stat-value">{{ dataStore.totalAlerts }}</div>
        </div>
      </div>
    </div>

    <!-- 待处理预警 -->
    <div class="alerts-section">
      <div class="section-header">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" x2="12" y1="9" y2="13"/>
            <line x1="12" x2="12.01" y1="17" y2="17"/>
          </svg>
          待处理预警
        </h3>
      </div>

      <div class="alerts-list">
        <div v-if="dataStore.pendingAlerts.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p>暂无待处理预警</p>
        </div>

        <div v-else v-for="alert in dataStore.pendingAlerts" :key="alert.id" class="alert-item pending">
          <div class="alert-header">
            <div class="alert-type">{{ alert.ruleId === 'cluster-001' ? '聚集性问题' : '设施异常' }}</div>
            <div class="alert-title">{{ alert.ruleName }}</div>
            <button class="btn-process" @click="handleMarkProcessed(alert.id)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              标记已处理
            </button>
          </div>

          <div class="alert-description">
            {{ alert.ruleId === 'cluster-001'
              ? `${alert.location}在过去${ruleConfig.value.timeframe}小时内同类事件超过阈值（${alert.eventCount}次），已触发聚集性预警`
              : `设备在${alert.location}连续${alert.eventCount}次触发异常，已触发设备异常预警`
            }}
          </div>

          <div class="alert-meta">
            <span class="alert-time">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ formatTime(alert.timestamp) }}
            </span>
            <span class="alert-events">关联数据：{{ alert.eventCount }} 条</span>
          </div>

          <div v-if="alert.suggestion" class="ai-suggestion">
            <div class="suggestion-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
              </svg>
              AI处置建议
            </div>
            <p>{{ alert.suggestion }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 已处理预警 -->
    <div class="alerts-section">
      <div class="section-header">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          已处理预警
        </h3>
      </div>

      <div class="alerts-list">
        <div v-if="dataStore.processedAlerts.length === 0" class="empty-state">
          <p>暂无已处理预警</p>
        </div>

        <div v-else v-for="alert in dataStore.processedAlerts" :key="alert.id" class="alert-item processed">
          <div class="alert-header">
            <div class="alert-type">{{ alert.ruleId === 'cluster-001' ? '聚集性问题' : '设施异常' }}</div>
            <div class="alert-title">{{ alert.ruleName }}</div>
            <div class="processed-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              ✓ 已处理
            </div>
          </div>

          <div class="alert-description">
            {{ alert.ruleId === 'cluster-001'
              ? `${alert.location}在过去${ruleConfig.value.timeframe}小时内同类事件超过阈值（${alert.eventCount}次），已触发聚集性预警`
              : `设备在${alert.location}连续${alert.eventCount}次触发异常，已触发设备异常预警`
            }}
          </div>

          <div class="alert-meta">
            <span class="alert-time">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ formatTime(alert.timestamp) }}
            </span>
            <span class="alert-events">关联数据：{{ alert.eventCount }} 条</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDataStore } from '@/stores/data';

const dataStore = useDataStore();

// 从 store 获取数据
const ruleConfig = ref({
  clusterThreshold: dataStore.alertRules.clusterThreshold,
  sensorThreshold: dataStore.alertRules.sensorThreshold,
  timeframe: dataStore.alertRules.timeframe
});

// 监听预警规则变化
watch(
  () => dataStore.alertRules,
  (newRules) => {
    ruleConfig.value = { ...newRules };
  },
  { deep: true }
);

// 更新预警规则
const updateRules = () => {
  dataStore.updateAlertRules(ruleConfig.value);
};

// 标记预警为已处理
const handleMarkProcessed = (alertId: string) => {
  dataStore.markAlertAsProcessed(alertId);
};

// 格式化时间
const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
</script>

<style scoped>
.alerts-panel {
  width: 100%;
}

/* 配置区域 */
.config-section {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-header {
  margin-bottom: 1.5rem;
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

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.config-item label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider {
  flex: 1;
  height: 6px;
  background: rgba(51, 65, 85, 0.3);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: var(--gradient-primary);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--glow-primary);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--gradient-primary);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: var(--glow-primary);
}

.slider-value {
  min-width: 80px;
  text-align: center;
  padding: 0.5rem 1rem;
  background: var(--background-mute);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.config-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.config-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  padding: 0.625rem 1.5rem;
  background: var(--gradient-primary);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--transition-normal);
  box-shadow: var(--glow-primary);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
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

.stat-icon.cyan {
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  color: var(--primary-color);
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

/* 预警列表 */
.alerts-section {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
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

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.alert-item {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--error-color);
  border-radius: 8px;
  padding: 1.5rem;
}

.alert-item.processed {
  border-left-color: var(--success-color);
  opacity: 0.75;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.alert-type {
  padding: 0.25rem 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--warning-color);
}

.alert-title {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.btn-process {
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
  color: var(--success-color);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--transition-normal);
}

.btn-process:hover {
  background: rgba(16, 185, 129, 0.2);
}

.processed-badge {
  padding: 0.25rem 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--success-color);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.alert-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.alert-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 12px;
  color: var(--text-muted);
}

.alert-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.ai-suggestion {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(6, 182, 212, 0.05);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 6px;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.ai-suggestion p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .alert-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-process {
    width: 100%;
    justify-content: center;
  }

  .slider-container {
    flex-direction: column;
    align-items: stretch;
  }

  .slider-value {
    width: 100%;
  }
}
</style>
