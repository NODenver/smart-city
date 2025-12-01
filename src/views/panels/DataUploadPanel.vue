<template>
  <div class="data-upload-panel">
    <div class="upload-grid">
      <!-- 市民事件上传 -->
      <div class="upload-card">
        <div class="card-header">
          <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div>
            <h3>市民事件上报数据</h3>
            <p>city_events.json - 市民上报的城市问题</p>
          </div>
        </div>

        <el-upload
          class="upload-area"
          drag
          accept=".json"
          :multiple="false"
          :show-file-list="false"
          :on-change="handleCityEventsUpload"
          :before-upload="beforeUpload"
        >
          <div class="upload-content">
            <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
            <p class="upload-text">拖拽文件到此处或点击上传</p>
            <p class="upload-hint">支持 JSON 格式文件</p>
          </div>
        </el-upload>

        <div v-if="cityEventsCount > 0" class="upload-status success">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>上传成功！已加载 {{ cityEventsCount }} 条数据</span>
        </div>
      </div>

      <!-- 传感器数据上传 -->
      <div class="upload-card">
        <div class="card-header">
          <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div>
            <h3>物联网传感器数据</h3>
            <p>sensor_data.json - 物联网设备采集的环境/设施状态</p>
          </div>
        </div>

        <el-upload
          class="upload-area"
          drag
          accept=".json"
          :multiple="false"
          :show-file-list="false"
          :on-change="handleSensorDataUpload"
          :before-upload="beforeUpload"
        >
          <div class="upload-content">
            <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
            <p class="upload-text">拖拽文件到此处或点击上传</p>
            <p class="upload-hint">支持 JSON 格式文件</p>
          </div>
        </el-upload>

        <div v-if="sensorDataCount > 0" class="upload-status success">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>上传成功！已加载 {{ sensorDataCount }} 条数据</span>
        </div>
      </div>
    </div>

    <!-- 快速加载示例数据 -->
    <div class="quick-load-section">
      <el-button type="primary" size="large" @click="loadSampleData">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.29 7 12 12 20.71 7"/>
          <line x1="12" x2="12" y1="22" y2="12"/>
        </svg>
        加载示例数据
      </el-button>
    </div>

    <!-- 数据生成控制面板 -->
    <div class="data-generator-panel">
      <div class="generator-header">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
          </svg>
          自动数据生成
        </h3>
        <div class="generator-stats">
          <span class="stat-item">
            <span class="stat-label">事件:</span>
            <span class="stat-value">{{ dataStore.totalEvents }}</span>
          </span>
          <span class="stat-item">
            <span class="stat-label">传感器:</span>
            <span class="stat-value">{{ dataStore.totalSensors }}</span>
          </span>
        </div>
      </div>
      <div class="generator-controls">
        <button
          v-if="!dataStore.isAutoGenerating"
          class="btn btn-primary"
          @click="startGeneration"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          启动自动生成
        </button>
        <button
          v-else
          class="btn btn-danger"
          @click="stopGeneration"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="6" width="12" height="12"/>
          </svg>
          停止自动生成
        </button>
        <button
          v-if="dataStore.isAutoGenerating"
          class="btn btn-secondary"
          @click="generateOnce"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          立即生成一条
        </button>
      </div>
      <div v-if="dataStore.isAutoGenerating" class="generator-status">
        <svg class="pulse-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" opacity="0.3"/>
          <circle cx="12" cy="12" r="10" class="pulse-dot"/>
        </svg>
        <span>数据自动生成中... 每20-30秒生成一条新数据</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadFile } from 'element-plus';
import { useDataStore } from '@/stores/data';
import type { CityEvent, SensorData } from '@/types/city';

const dataStore = useDataStore();
const cityEventsCount = ref(0);
const sensorDataCount = ref(0);

function beforeUpload(file: File) {
  const isJson = file.type === 'application/json';
  if (!isJson) {
    ElMessage.error('只能上传JSON文件！');
  }
  return isJson;
}

async function handleCityEventsUpload(file: UploadFile) {
  try {
    const content = await readFileContent(file.raw!);
    const data = JSON.parse(content) as CityEvent[];
    dataStore.loadCityEvents(data);
    cityEventsCount.value = data.length;
    ElMessage.success(`成功加载 ${data.length} 条城市事件`);
  } catch (error) {
    ElMessage.error('文件解析失败，请检查JSON格式');
  }
}

async function handleSensorDataUpload(file: UploadFile) {
  try {
    const content = await readFileContent(file.raw!);
    const data = JSON.parse(content) as SensorData[];
    dataStore.loadSensorData(data);
    sensorDataCount.value = data.length;
    ElMessage.success(`成功加载 ${data.length} 条传感器数据`);
  } catch (error) {
    ElMessage.error('文件解析失败，请检查JSON格式');
  }
}

function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function loadSampleData() {
  fetch('./city_events.json')
    .then(res => res.json())
    .then((data: CityEvent[]) => {
      dataStore.loadCityEvents(data);
      cityEventsCount.value = data.length;
      ElMessage.success(`已加载示例数据：${data.length} 条事件`);
    })
    .catch(() => {
      ElMessage.error('加载示例数据失败');
    });

  fetch('./sensor_data.json')
    .then(res => res.json())
    .then((data: SensorData[]) => {
      dataStore.loadSensorData(data);
      sensorDataCount.value = data.length;
      ElMessage.success(`已加载示例数据：${data.length} 条传感器数据`);
    })
    .catch(() => {
      ElMessage.error('加载示例数据失败');
    });
}

// 控制函数
const startGeneration = () => {
  dataStore.startAutoGenerate();
  ElMessage.success('自动数据生成已启动');
};

const stopGeneration = () => {
  dataStore.stopAutoGenerate();
  ElMessage.info('自动数据生成已停止');
};

const generateOnce = () => {
  dataStore.generateNewData();
  ElMessage.success('已生成一条新数据');
};
</script>

<style scoped>
.data-upload-panel {
  width: 100%;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.upload-card {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all var(--transition-normal);
}

.upload-card:hover {
  border-color: var(--border-primary-hover);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.card-header p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.upload-area {
  width: 100%;
}

:deep(.el-upload-dragger) {
  background: rgba(15, 23, 42, 0.4);
  border: 2px dashed var(--border-primary);
  border-radius: 12px;
  padding: 2rem;
  transition: all var(--transition-normal);
}

:deep(.el-upload-dragger:hover) {
  border-color: var(--primary-color);
  background: rgba(6, 182, 212, 0.05);
}

.upload-content {
  text-align: center;
}

.upload-icon {
  color: var(--text-muted);
  margin-bottom: 1rem;
  transition: all var(--transition-normal);
}

:deep(.el-upload-dragger:hover) .upload-icon {
  color: var(--primary-color);
  transform: scale(1.1);
}

.upload-text {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}

.upload-hint {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0;
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 14px;
}

.upload-status.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--success-color);
}

.quick-load-section {
  text-align: center;
  padding: 2rem;
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

:deep(.el-button) {
  border-radius: 10px;
  padding: 12px 32px;
  font-weight: 500;
  transition: all var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.el-button--primary) {
  background: var(--gradient-primary);
  border: none;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: var(--glow-primary);
}

@media (max-width: 1024px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }
}

/* 数据生成控制面板样式 */
.data-generator-panel {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
  transition: all var(--transition-normal);
}

.data-generator-panel:hover {
  border-color: var(--border-primary-hover);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.generator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.generator-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.generator-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 13px;
}

.stat-label {
  color: var(--text-muted);
}

.stat-value {
  font-weight: 600;
  color: var(--primary-color);
  padding: 0.25rem 0.5rem;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 4px;
}

.generator-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.btn svg {
  width: 16px;
  height: 16px;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--glow-primary);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.btn-secondary {
  background: rgba(6, 182, 212, 0.1);
  color: var(--primary-color);
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.btn-secondary:hover {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(6, 182, 212, 0.5);
}

.generator-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 8px;
  font-size: 13px;
  color: var(--primary-color);
}

.pulse-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-dot {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .generator-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .generator-stats {
    width: 100%;
    justify-content: space-between;
  }

  .generator-controls {
    width: 100%;
  }

  .btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
