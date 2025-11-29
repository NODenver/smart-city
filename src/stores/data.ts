import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { CityEvent, SensorData, Alert } from '@/types/city';

export const useDataStore = defineStore('data', () => {
  // 状态
  const cityEvents = ref<CityEvent[]>([]);
  const sensorData = ref<SensorData[]>([]);
  const currentView = ref<'all' | 'events' | 'sensors'>('all');

  // 预警相关状态
  const alerts = ref<Alert[]>([]);
  const alertRules = ref({
    clusterThreshold: 5,
    sensorThreshold: 3,
    timeframe: 1 // 1小时时间窗口
  });

  // 定时器相关
  let dataGeneratorTimer: number | null = null;
  const isAutoGenerating = ref(false);

  // 计算属性
  const totalEvents = computed(() => cityEvents.value.length);
  const totalSensors = computed(() => sensorData.value.length);
  const abnormalSensors = computed(() =>
    sensorData.value.filter(s => s.status === '异常').length
  );
  const highPriorityEvents = computed(() =>
    cityEvents.value.filter(e => e.status === '紧急').length
  );

  // 预警相关计算属性
  const pendingAlerts = computed(() => alerts.value.filter(a => a.status === 'pending'));
  const processedAlerts = computed(() => alerts.value.filter(a => a.status === 'processed'));
  const totalAlerts = computed(() => alerts.value.length);

  // 按类型统计
  const eventsByType = computed(() => {
    const map = new Map<string, number>();
    cityEvents.value.forEach(event => {
      map.set(event.type, (map.get(event.type) || 0) + 1);
    });
    return Array.from(map.entries()).map(([type, count]) => ({ type, count }));
  });

  // 按区域统计
  const eventsByDistrict = computed(() => {
    const map = new Map<string, number>();
    cityEvents.value.forEach(event => {
      map.set(event.location.district, (map.get(event.location.district) || 0) + 1);
    });
    return Array.from(map.entries()).map(([district, count]) => ({ district, count }));
  });

  // 最近7天趋势
  const eventsTrend7Days = computed(() => {
    const days = new Map<string, number>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      days.set(key, 0);
    }

    cityEvents.value.forEach(event => {
      const dateStr = event.reportTime || '';
      const date = dateStr.split('T')[0];
      if (date && days.has(date)) {
        days.set(date, (days.get(date) || 0) + 1);
      }
    });

    return Array.from(days.entries()).map(([date, count]) => ({ date, count }));
  });

  // 方法
  function loadCityEvents(events: CityEvent[]) {
    cityEvents.value = events.sort((a, b) =>
      new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime()
    );
  }

  function loadSensorData(sensors: SensorData[]) {
    sensorData.value = sensors.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  function setCurrentView(view: 'all' | 'events' | 'sensors') {
    currentView.value = view;
  }

  // 获取合并的数据（用于列表展示）
  const mergedData = computed(() => {
    if (currentView.value === 'events') {
      return cityEvents.value.map(e => ({ ...e, dataType: 'event' }));
    }
    if (currentView.value === 'sensors') {
      return sensorData.value.map(s => ({ ...s, dataType: 'sensor' }));
    }
    // all view
    return [
      ...cityEvents.value.map(e => ({ ...e, dataType: 'event' })),
      ...sensorData.value.map(s => ({ ...s, dataType: 'sensor' }))
    ].sort((a: any, b: any) => {
      const timeA = a.dataType === 'event' ? a.reportTime : a.timestamp;
      const timeB = b.dataType === 'event' ? b.reportTime : b.timestamp;
      return new Date(timeB || '').getTime() - new Date(timeA || '').getTime();
    });
  });

  // 生成随机市民事件
  function generateRandomEvent(): CityEvent {
    const districts = ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '石景山区', '通州区', '大兴区'];
    const eventTypes = [
      '道路积水', '路灯故障', '占道经营', '噪音扰民', '违停车辆',
      '垃圾堆积', '井盖破损', '绿化损坏', '消防隐患', '电线裸露'
    ];
    const streets = ['中关村大街', '建国路', '长安街', '北京西路', '朝阳路', '通惠河北路'];
    const statuses = ['未处理', '已派单', '处理中'];
    const reporterTypes = ['市民APP', '热线电话', '网格员', '微信公众号'];

    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const reporterType = reporterTypes[Math.floor(Math.random() * reporterTypes.length)];

    const descriptions = [
      `${district}${street}附近发现${type}问题，影响市民出行`,
      `${street}${type}严重，需要尽快处理`,
      `市民反馈${district}存在${type}现象`,
      `${district}${street}路段${type}问题突出`
    ];

    return {
      id: `EV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      location: {
        district,
        street,
        lat: 39.9 + Math.random() * 0.15,
        lng: 116.3 + Math.random() * 0.25
      },
      reportTime: new Date().toISOString(),
      reporterType,
      status
    };
  }

  // 生成随机传感器数据
  function generateRandomSensor(): SensorData {
    const districts = ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '石景山区', '通州区', '大兴区'];
    const sensorTypes = [
      '积水传感器', '空气质量', '噪音监测', '温度传感器',
      '路灯监控', '井盖监测', '垃圾桶满溢', '停车检测'
    ];
    const streets = ['中关村大街', '建国路', '长安街', '北京西路', '朝阳路', '通惠河北路'];
    const statuses = ['正常', '异常'];

    const type = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const status = Math.random() > 0.7 ? '异常' : '正常'; // 30%概率异常

    // 根据传感器类型生成合适的数值
    let value: number;
    let unit: string;

    switch(type) {
      case '积水传感器':
        value = Math.floor(Math.random() * 50);
        unit = 'cm';
        break;
      case '空气质量':
        value = Math.floor(50 + Math.random() * 150);
        unit = 'AQI';
        break;
      case '噪音监测':
        value = Math.floor(40 + Math.random() * 40);
        unit = 'dB';
        break;
      case '温度传感器':
        value = Math.floor(15 + Math.random() * 20);
        unit = '℃';
        break;
      default:
        value = Math.floor(Math.random() * 100);
        unit = '%';
    }

    return {
      sensorId: `SEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      location: {
        district,
        street,
        lat: 39.9 + Math.random() * 0.15,
        lng: 116.3 + Math.random() * 0.25
      },
      value,
      unit,
      timestamp: new Date().toISOString(),
      status
    };
  }

  // 预警检测：检查聚集性事件
  function checkClusterEvents(newEvent: CityEvent) {
    const oneHourAgo = new Date(Date.now() - alertRules.value.timeframe * 60 * 60 * 1000);
    const recentEvents = cityEvents.value.filter(e => {
      const eventTime = new Date(e.reportTime);
      return e.type === newEvent.type &&
             e.location.district === newEvent.location.district &&
             eventTime > oneHourAgo;
    });

    if (recentEvents.length + 1 >= alertRules.value.clusterThreshold) {
      // 生成预警
      const alertId = `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newAlert: Alert = {
        id: alertId,
        ruleId: 'cluster-001',
        ruleName: '聚集性问题预警',
        eventCount: recentEvents.length + 1,
        location: newEvent.location.district,
        timestamp: new Date().toISOString(),
        status: 'pending',
        suggestion: `建议立即调度相关工作人员前往${newEvent.location.district}处理${newEvent.type}问题，该区域在1小时内已上报${recentEvents.length + 1}次同类事件。`
      };

      alerts.value.unshift(newAlert);
      console.log('⚠️ 触发预警:', newAlert.ruleName, '-', newAlert.location, `(${newAlert.eventCount}次)`);
    }
  }

  // 预警检测：检查传感器异常
  function checkSensorAnomaly(newSensor: SensorData) {
    if (newSensor.status !== '异常') return;

    const recentReadings = sensorData.value.filter(s =>
      s.sensorId === newSensor.sensorId && s.status === '异常'
    );

    if (recentReadings.length + 1 >= alertRules.value.sensorThreshold) {
      // 生成预警
      const alertId = `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newAlert: Alert = {
        id: alertId,
        ruleId: 'sensor-001',
        ruleName: '传感器异常预警',
        eventCount: recentReadings.length + 1,
        location: `${newSensor.location.district}${newSensor.location.street}`,
        timestamp: new Date().toISOString(),
        status: 'pending',
        suggestion: `设备${newSensor.sensorId}(${newSensor.type})连续${recentReadings.length + 1}次超过阈值，当前值：${newSensor.value}${newSensor.unit}。建议检查设备状态并安排维护。`
      };

      alerts.value.unshift(newAlert);
      console.log('⚠️ 触发预警:', newAlert.ruleName, '-', newAlert.location, `(${recentReadings.length + 1}次异常)`);
    }
  }

  // 添加新数据（随机选择添加事件或传感器）
  function generateNewData() {
    const shouldGenerateEvent = Math.random() > 0.5;

    if (shouldGenerateEvent) {
      const newEvent = generateRandomEvent();
      cityEvents.value.unshift(newEvent);
      console.log('🆕 新增市民事件:', newEvent.type, '-', newEvent.location.district);
      // 检测聚集性事件预警
      checkClusterEvents(newEvent);
    } else {
      const newSensor = generateRandomSensor();
      sensorData.value.unshift(newSensor);
      console.log('🆕 新增传感器数据:', newSensor.type, '-', newSensor.location.district);
      // 检测传感器异常预警
      checkSensorAnomaly(newSensor);
    }
  }

  // 启动自动生成数据
  function startAutoGenerate() {
    if (isAutoGenerating.value) {
      console.log('⚠️ 数据自动生成已在运行中');
      return;
    }

    isAutoGenerating.value = true;
    console.log('✅ 启动数据自动生成（每20-30秒生成一条数据）');

    // 立即生成一条数据
    generateNewData();

    // 设置定时器，每20-30秒生成一条数据
    const scheduleNext = () => {
      const delay = 20000 + Math.random() * 10000; // 20-30秒随机延迟
      dataGeneratorTimer = window.setTimeout(() => {
        if (isAutoGenerating.value) {
          generateNewData();
          scheduleNext(); // 递归调用以继续生成
        }
      }, delay);
    };

    scheduleNext();
  }

  // 停止自动生成数据
  function stopAutoGenerate() {
    if (dataGeneratorTimer !== null) {
      clearTimeout(dataGeneratorTimer);
      dataGeneratorTimer = null;
    }
    isAutoGenerating.value = false;
    console.log('🛑 停止数据自动生成');
  }

  // 添加模拟新事件（保留向后兼容）
  function simulateNewEvent() {
    const newEvent = generateRandomEvent();
    cityEvents.value.unshift(newEvent);
    checkClusterEvents(newEvent);
  }

  // 标记预警为已处理
  function markAlertAsProcessed(alertId: string) {
    const alert = alerts.value.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'processed';
      console.log('✅ 预警已处理:', alert.ruleName);
    }
  }

  // 更新预警规则
  function updateAlertRules(rules: { clusterThreshold: number; sensorThreshold: number; timeframe: number }) {
    alertRules.value = rules;
    console.log('🔧 预警规则已更新:', rules);
  }

  return {
    // state
    cityEvents,
    sensorData,
    currentView,
    isAutoGenerating,
    alerts,
    alertRules,
    // computed
    totalEvents,
    totalSensors,
    abnormalSensors,
    highPriorityEvents,
    eventsByType,
    eventsByDistrict,
    eventsTrend7Days,
    mergedData,
    pendingAlerts,
    processedAlerts,
    totalAlerts,
    // methods
    loadCityEvents,
    loadSensorData,
    setCurrentView,
    simulateNewEvent,
    generateNewData,
    startAutoGenerate,
    stopAutoGenerate,
    markAlertAsProcessed,
    updateAlertRules
  };
});
