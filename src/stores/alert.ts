import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { Alert, AlertRule, CityEvent, SensorData } from '@/types/city';
import { useDataStore } from './data';

export const useAlertStore = defineStore('alert', () => {
  const dataStore = useDataStore();

  // 预警规则
  const rules = ref<AlertRule[]>([
    {
      id: 'rule1',
      name: '聚集性问题预警',
      condition: '同一区域1小时内同类事件≥5次',
      threshold: 5,
      timeframe: 1,
      enabled: true
    },
    {
      id: 'rule2',
      name: '设施异常预警',
      condition: '传感器连续3次超阈值',
      threshold: 3,
      timeframe: 1,
      enabled: true
    }
  ]);

  // 预警列表
  const alerts = ref<Alert[]>([]);

  // 活跃预警数
  const activeAlerts = computed(() =>
    alerts.value.filter(a => a.status === 'pending').length
  );

  // 检查预警规则
  function checkAlerts() {
    checkConcentrationRule();
    checkSensorAbnormalRule();
  }

  // 检查聚集性事件规则
  function checkConcentrationRule() {
    const events = dataStore.cityEvents;
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 按区域和时间分组
    const grouped = new Map<string, CityEvent[]>();

    events.forEach(event => {
      const eventTime = new Date(event.reportTime);

      if (eventTime >= hourAgo) {
        const key = `${event.location.district}-${event.type}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(event);
      }
    });

    // 检查是否符合阈值
    grouped.forEach((eventList, key) => {
      if (eventList.length >= 5) {
        const [district, type] = key.split('-');
        const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // 检查是否已存在相同预警
        const exists = alerts.value.some(
          a =>
            a.ruleId === 'rule1' &&
            a.location === district &&
            new Date(a.timestamp).getTime() > hourAgo.getTime()
        );

        if (!exists) {
          alerts.value.unshift({
            id: alertId,
            ruleId: 'rule1',
            ruleName: '聚集性问题预警',
            eventCount: eventList.length,
            location: `${district} - ${type}`,
            timestamp: now.toISOString(),
            status: 'pending',
            suggestion: `建议立即派员前往${district}处理该类事件，并排查根本原因`
          });
        }
      }
    });
  }

  // 检查传感器异常规则
  function checkSensorAbnormalRule() {
    const sensors = dataStore.sensorData;
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 按传感器ID分组
    const grouped = new Map<string, SensorData[]>();

    sensors.forEach(sensor => {
      const sensorTime = new Date(sensor.timestamp);
      if (sensorTime >= hourAgo) {
        if (!grouped.has(sensor.sensorId)) {
          grouped.set(sensor.sensorId, []);
        }
        grouped.get(sensor.sensorId)!.push(sensor);
      }
    });

    // 检查连续异常
    grouped.forEach((sensorList, sensorId) => {
      const abnormalCount = sensorList.filter(s => s.status === '异常').length;
      if (abnormalCount >= 3 && sensorList.length > 0) {
        const latestSensor = sensorList[0];
        if (!latestSensor) return;
        const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // 检查是否已存在
        const exists = alerts.value.some(
          a =>
            a.ruleId === 'rule2' &&
            a.location.includes(latestSensor.location.district)
        );

        if (!exists) {
          alerts.value.unshift({
            id: alertId,
            ruleId: 'rule2',
            ruleName: '设施异常预警',
            eventCount: abnormalCount,
            location: `${latestSensor.location.district} - ${latestSensor.type}`,
            timestamp: now.toISOString(),
            status: 'pending',
            suggestion: `建议检查${latestSensor.location.district}${latestSensor.type}设备，可能存在设备故障`
          });
        }
      }
    });
  }

  // 更新预警状态
  function updateAlertStatus(alertId: string, status: 'pending' | 'processed' | 'following') {
    const alert = alerts.value.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
    }
  }

  // 启动预警检查定时器
  let alertTimer: number | null = null;
  function startAlertCheck() {
    if (alertTimer) {
      clearInterval(alertTimer);
    }
    alertTimer = setInterval(() => {
      checkAlerts();
    }, 30000) as unknown as number; // 30秒检查一次
  }

  function stopAlertCheck() {
    if (alertTimer) {
      clearInterval(alertTimer);
      alertTimer = null;
    }
  }

  return {
    rules,
    alerts,
    activeAlerts,
    checkAlerts,
    updateAlertStatus,
    startAlertCheck,
    stopAlertCheck
  };
});
