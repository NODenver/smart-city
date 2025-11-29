<template>
  <div class="alerts-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>智能预警系统</span>
          <el-button @click="$router.push('/')" text type="primary">
            <el-icon><Back /></el-icon>
            返回首页
          </el-button>
        </div>
      </template>

      <!-- 预警规则 -->
      <el-card class="rules-card">
        <template #header>
          <span>预警规则配置</span>
        </template>

        <el-table :data="alertStore.rules" border>
          <el-table-column prop="name" label="规则名称" width="200" />
          <el-table-column prop="condition" label="触发条件" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.enabled ? 'success' : 'info'">
                {{ row.enabled ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-switch
                v-model="row.enabled"
                @change="onRuleToggle(row.id, $event)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 预警统计 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="8">
          <el-statistic title="活跃预警" :value="alertStore.activeAlerts">
            <template #prefix>
              <el-icon><Bell /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="8">
          <el-statistic title="今日预警" :value="todayAlerts">
            <template #prefix>
              <el-icon><Calendar /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="8">
          <el-statistic title="已处理" :value="processedAlerts">
            <template #prefix>
              <el-icon><CircleCheck /></el-icon>
            </template>
          </el-statistic>
        </el-col>
      </el-row>

      <!-- 预警列表 -->
      <el-card class="alerts-card">
        <template #header>
          <div class="alerts-header">
            <span>预警列表</span>
            <el-button @click="checkAlertsNow" type="primary" size="small">
              <el-icon><Refresh /></el-icon>
              立即检查
            </el-button>
          </div>
        </template>

        <el-table
          :data="alertStore.alerts"
          v-loading="loading"
          stripe
        >
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="alert-detail">
                <p><strong>预警时间：</strong>{{ formatTime(row.timestamp) }}</p>
                <p><strong>事件数量：</strong>{{ row.eventCount }}</p>
                <p><strong>处置建议：</strong>{{ row.suggestion }}</p>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="规则" width="150">
            <template #default="{ row }">
              <el-tag type="warning">{{ row.ruleName }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="位置" min-width="150">
            <template #default="{ row }">
              <el-icon><Location /></el-icon>
              {{ row.location }}
            </template>
          </el-table-column>

          <el-table-column label="事件数" width="100">
            <template #default="{ row }">
              <el-badge :value="row.eventCount" :max="99" />
            </template>
          </el-table-column>

          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'pending'"
                size="small"
                type="primary"
                @click="handleAlert(row.id, 'processed')"
              >
                标记已处理
              </el-button>
              <el-button
                v-if="row.status === 'processed'"
                size="small"
                type="success"
                @click="handleAlert(row.id, 'following')"
              >
                跟进中
              </el-button>
              <el-button
                v-if="row.status !== 'pending'"
                size="small"
                @click="handleAlert(row.id, 'pending')"
              >
                重置
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-card>

    <!-- 实时通知 -->
    <el-dialog v-model="showNotification" title="新预警通知" width="400px">
      <div class="notification">
        <el-icon size="40" color="#f56c6c"><Bell /></el-icon>
        <p>{{ notificationMessage }}</p>
      </div>
      <template #footer>
        <el-button @click="showNotification = false">知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useAlertStore } from '@/stores/alert';

const alertStore = useAlertStore();

const loading = ref(false);
const showNotification = ref(false);
const notificationMessage = ref('');
let notificationTimer: number | null = null;

const todayAlerts = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return alertStore.alerts.filter(a => (a.timestamp || '').startsWith(today)).length;
});

const processedAlerts = computed(() => {
  return alertStore.alerts.filter(a => a.status === 'processed' || a.status === 'following').length;
});

function onRuleToggle(ruleId: string, enabled: boolean) {
  ElMessage.success(`规则已${enabled ? '启用' : '禁用'}`);
}

async function checkAlertsNow() {
  loading.value = true;
  try {
    alertStore.checkAlerts();
    ElMessage.success('检查完成');
  } finally {
    loading.value = false;
  }
}

function handleAlert(alertId: string, status: 'pending' | 'processed' | 'following') {
  alertStore.updateAlertStatus(alertId, status);
  ElMessage.success('状态已更新');
}

function getStatusType(status: string) {
  const typeMap: Record<string, any> = {
    pending: 'danger',
    processed: 'primary',
    following: 'warning'
  };
  return typeMap[status] || '';
}

function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    pending: '待处理',
    processed: '已处理',
    following: '跟进中'
  };
  return textMap[status] || '';
}

function formatTime(timeStr: string) {
  const date = new Date(timeStr);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function startNotificationCheck() {
  notificationTimer = window.setInterval(() => {
    const newAlerts = alertStore.alerts.filter(a => a.status === 'pending');
    if (newAlerts.length > 0 && newAlerts[0]) {
      showNotification.value = true;
      notificationMessage.value = `${newAlerts[0].ruleName || ''}：${newAlerts[0].location || ''}`;
    }
  }, 35000);
}

onMounted(() => {
  alertStore.startAlertCheck();
  startNotificationCheck();
});

onUnmounted(() => {
  alertStore.stopAlertCheck();
  if (notificationTimer) {
    window.clearInterval(notificationTimer);
    notificationTimer = null;
  }
});
</script>

<style scoped>
.alerts-container {
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

.rules-card {
  margin-bottom: 24px;
  background: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 229, 255, 0.2) !important;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.stats-row {
  margin-bottom: 24px;
}

.stats-row .el-col {
  margin-bottom: 0;
}

.alerts-card {
  margin-bottom: 24px;
  background: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 229, 255, 0.2) !important;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.alerts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-detail {
  padding: 20px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
  border-radius: 12px;
  border-left: 3px solid var(--primary-color);
  margin: 8px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.alert-detail p {
  margin: 10px 0;
  line-height: 1.8;
  color: rgba(226, 232, 240, 0.95);
  font-size: 14px;
}

.alert-detail strong {
  color: var(--primary-color);
  font-weight: 600;
  margin-right: 8px;
}

.notification {
  text-align: center;
  padding: 30px 20px;
}

.notification .el-icon {
  animation: ring 1s ease-in-out infinite;
}

@keyframes ring {
  0%, 100% {
    transform: rotate(0deg);
  }
  10%, 30% {
    transform: rotate(-10deg);
  }
  20%, 40% {
    transform: rotate(10deg);
  }
}

.notification p {
  margin-top: 20px;
  font-size: 15px;
  color: rgba(226, 232, 240, 0.95);
  line-height: 1.6;
}

/* 统计卡片样式 */
:deep(.el-statistic) {
  text-align: center;
  padding: 28px 20px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 229, 255, 0.25);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  height: 100%;
  cursor: pointer;
}

:deep(.el-statistic::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity 0.4s ease;
}

:deep(.el-statistic:hover) {
  border-color: rgba(0, 229, 255, 0.6);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 48px rgba(0, 229, 255, 0.25);
}

:deep(.el-statistic:hover::before) {
  opacity: 1;
}

:deep(.el-statistic__head) {
  color: rgba(148, 163, 184, 0.9) !important;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.el-statistic__content) {
  font-size: 36px;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  filter: drop-shadow(0 0 20px rgba(0, 229, 255, 0.3));
}

:deep(.el-statistic .el-icon) {
  color: var(--primary-color);
  font-size: 20px;
  margin-right: 8px;
  filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.4));
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

/* 表格样式 */
:deep(.el-table) {
  background: transparent !important;
  color: var(--text-primary);
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-table thead) {
  background: rgba(30, 41, 59, 0.8) !important;
}

:deep(.el-table th.el-table__cell) {
  background: rgba(30, 41, 59, 0.8) !important;
  color: rgba(226, 232, 240, 0.95) !important;
  font-weight: 600;
  border-bottom: 2px solid rgba(0, 229, 255, 0.3) !important;
  padding: 14px 0;
  border-color: rgba(51, 65, 85, 0.5) !important;
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
  border-color: rgba(51, 65, 85, 0.5) !important;
  padding: 12px 0;
  color: var(--text-primary);
}

:deep(.el-table__expanded-cell) {
  background: rgba(15, 23, 42, 0.4) !important;
  padding: 12px !important;
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

:deep(.el-button--small) {
  padding: 6px 16px;
  font-size: 13px;
}

/* 开关样式 */
:deep(.el-switch.is-checked .el-switch__core) {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

:deep(.el-switch__core) {
  background-color: rgba(51, 65, 85, 0.8);
  border: 1px solid rgba(0, 229, 255, 0.2);
  transition: all 0.3s ease;
}

:deep(.el-switch__core:hover) {
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
}

/* 徽章样式 */
:deep(.el-badge__content) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

/* 对话框样式 */
:deep(.el-dialog) {
  background: rgba(15, 23, 42, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
}

:deep(.el-dialog__header) {
  background: rgba(30, 41, 59, 0.6);
  border-bottom: 1px solid rgba(0, 229, 255, 0.2);
  padding: 20px;
  border-radius: 16px 16px 0 0;
}

:deep(.el-dialog__title) {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 16px;
}

:deep(.el-dialog__body) {
  padding: 24px;
  color: var(--text-primary);
}

:deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid rgba(51, 65, 85, 0.3);
}

/* 加载动画 */
:deep(.el-loading-mask) {
  background-color: rgba(15, 23, 42, 0.8) !important;
  backdrop-filter: blur(4px);
}

:deep(.el-loading-spinner .circular) {
  stroke: var(--primary-color);
  filter: drop-shadow(0 0 8px var(--primary-color));
}

/* 展开行动画 */
:deep(.el-table__expand-icon) {
  color: var(--primary-color);
  transition: all 0.3s ease;
}

:deep(.el-table__expand-icon:hover) {
  transform: scale(1.2);
}

:deep(.el-table__expand-icon--expanded) {
  transform: rotate(90deg);
}

:deep(.el-table__expand-icon--expanded:hover) {
  transform: rotate(90deg) scale(1.2);
}
</style>
