import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle, Brain, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { CityEvent, SensorData, Alert, AIAnalysisResult } from '../App';

interface AlertSystemProps {
  cityEvents: CityEvent[];
  sensorData: SensorData[];
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  aiAnalyses: AIAnalysisResult[];
}

export function AlertSystem({ cityEvents, sensorData, alerts, setAlerts, aiAnalyses }: AlertSystemProps) {
  const [ruleConfig, setRuleConfig] = useState({
    clusterThreshold: 5, // 同一区域1小时内上报次数阈值
    sensorThreshold: 3,  // 传感器连续超阈值次数
  });

  // 检测聚集性问题
  useEffect(() => {
    if (cityEvents.length === 0) return;

    const checkClusterAlerts = () => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recentEvents = cityEvents.filter(e => new Date(e.timestamp).getTime() > oneHourAgo);

      // 按区域和类型分组
      const groups: Record<string, CityEvent[]> = {};
      recentEvents.forEach(event => {
        const key = `${event.location.district}-${event.type}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(event);
      });

      // 检查是否超过阈值
      Object.entries(groups).forEach(([key, events]) => {
        if (events.length >= ruleConfig.clusterThreshold) {
          const [district, type] = key.split('-');
          const alertId = `cluster-${key}-${Date.now()}`;
          
          // 检查是否已存在相同预警
          const exists = alerts.some(a => 
            a.type === 'cluster' && 
            a.description.includes(district) && 
            a.description.includes(type)
          );

          if (!exists) {
            const newAlert: Alert = {
              id: alertId,
              type: 'cluster',
              title: '聚集性问题预警',
              description: `${district}在过去1小时内上报了${events.length}次"${type}"问题，已触发聚集性预警`,
              timestamp: new Date().toISOString(),
              status: 'pending',
              relatedEvents: events.map(e => e.id),
            };

            setAlerts([...alerts, newAlert]);
            toast.error(`预警：${district}发现聚集性${type}问题`, {
              duration: 5000,
            });
          }
        }
      });
    };

    const interval = setInterval(checkClusterAlerts, 30000); // 每30秒检查一次
    checkClusterAlerts(); // 立即执行一次

    return () => clearInterval(interval);
  }, [cityEvents, ruleConfig.clusterThreshold, alerts, setAlerts]);

  // 检测传感器异常
  useEffect(() => {
    if (sensorData.length === 0) return;

    const checkSensorAlerts = () => {
      // 按设备ID分组
      const deviceGroups: Record<string, SensorData[]> = {};
      sensorData.forEach(sensor => {
        if (!deviceGroups[sensor.deviceId]) deviceGroups[sensor.deviceId] = [];
        deviceGroups[sensor.deviceId].push(sensor);
      });

      // 检查连续超阈值
      Object.entries(deviceGroups).forEach(([deviceId, sensors]) => {
        const sortedSensors = sensors.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const recentSensors = sortedSensors.slice(0, ruleConfig.sensorThreshold);
        const allExceedThreshold = recentSensors.every(s => 
          (s.status === 'warning' || s.status === 'error') && s.value > s.threshold
        );

        if (allExceedThreshold && recentSensors.length >= ruleConfig.sensorThreshold) {
          const alertId = `sensor-${deviceId}-${Date.now()}`;
          
          // 检查是否已存在相同预警
          const exists = alerts.some(a => 
            a.type === 'sensor' && 
            a.description.includes(deviceId)
          );

          if (!exists) {
            const sensor = recentSensors[0];
            const newAlert: Alert = {
              id: alertId,
              type: 'sensor',
              title: '设施异常预警',
              description: `设备 ${deviceId} (${sensor.type}) 连续${ruleConfig.sensorThreshold}次超过阈值，当前值：${sensor.value}${sensor.unit}`,
              timestamp: new Date().toISOString(),
              status: 'pending',
              relatedEvents: recentSensors.map(s => s.id),
            };

            setAlerts([...alerts, newAlert]);
            toast.error(`预警：${sensor.type}设备异常`, {
              duration: 5000,
            });
          }
        }
      });
    };

    const interval = setInterval(checkSensorAlerts, 30000); // 每30秒检查一次
    checkSensorAlerts(); // 立即执行一次

    return () => clearInterval(interval);
  }, [sensorData, ruleConfig.sensorThreshold, alerts, setAlerts]);

  const handleMarkProcessed = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: 'processed' } : alert
    ));
    toast.success('预警已标记为已处理');
  };

  const getAISuggestionForAlert = (alert: Alert): string | undefined => {
    // 尝试找到相关的AI分析建议
    const relatedAnalysis = aiAnalyses.find(analysis => 
      alert.relatedEvents?.some(eventId => analysis.eventIds.includes(eventId))
    );

    return relatedAnalysis?.analysis.suggestion;
  };

  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const processedAlerts = alerts.filter(a => a.status === 'processed');

  return (
    <div className="space-y-6">
      {/* 预警规则配置 */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          预警规则配置
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 mb-2">
              聚集性问题阈值
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="3"
                max="10"
                value={ruleConfig.clusterThreshold}
                onChange={(e) => setRuleConfig({ ...ruleConfig, clusterThreshold: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-white w-20 text-center bg-slate-800 px-3 py-2 rounded border border-slate-700">
                {ruleConfig.clusterThreshold} 次
              </span>
            </div>
            <p className="text-slate-500 mt-2">
              同一区域1小时内上报同类事件超过此数值时触发预警
            </p>
          </div>

          <div>
            <label className="block text-slate-300 mb-2">
              传感器异常阈值
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="5"
                value={ruleConfig.sensorThreshold}
                onChange={(e) => setRuleConfig({ ...ruleConfig, sensorThreshold: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-white w-20 text-center bg-slate-800 px-3 py-2 rounded border border-slate-700">
                {ruleConfig.sensorThreshold} 次
              </span>
            </div>
            <p className="text-slate-500 mt-2">
              传感器数值连续超阈值次数达到此数值时触发预警
            </p>
          </div>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 mb-1">待处理预警</p>
              <p className="text-white text-2xl">{pendingAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 mb-1">已处理预警</p>
              <p className="text-white text-2xl">{processedAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-slate-400 mb-1">预警总数</p>
              <p className="text-white text-2xl">{alerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 待处理预警 */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          待处理预警
        </h3>
        
        {pendingAlerts.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p>暂无待处理预警</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingAlerts.map(alert => {
              const aiSuggestion = getAISuggestionForAlert(alert);
              
              return (
                <div
                  key={alert.id}
                  className="bg-slate-800/50 border-l-4 border-red-500 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded text-xs ${
                          alert.type === 'cluster'
                            ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
                            : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                        }`}>
                          {alert.type === 'cluster' ? '聚集性问题' : '设施异常'}
                        </span>
                        <h4 className="text-white">{alert.title}</h4>
                      </div>
                      <p className="text-slate-300 mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(alert.timestamp).toLocaleString('zh-CN')}
                        </span>
                        {alert.relatedEvents && (
                          <span>关联数据：{alert.relatedEvents.length} 条</span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleMarkProcessed(alert.id)}
                      className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded hover:bg-green-500/20 transition-colors"
                    >
                      标记已处理
                    </button>
                  </div>

                  {aiSuggestion && (
                    <div className="mt-4 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Brain className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-cyan-400 mb-1">AI处置建议</div>
                          <div className="text-slate-300">{aiSuggestion}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 已处理预警 */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          已处理预警
        </h3>
        
        {processedAlerts.length === 0 ? (
          <div className="text-center text-slate-500 py-8">暂无已处理预警</div>
        ) : (
          <div className="space-y-4">
            {processedAlerts.map(alert => {
              const aiSuggestion = getAISuggestionForAlert(alert);
              
              return (
                <div
                  key={alert.id}
                  className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 opacity-75"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded text-xs ${
                          alert.type === 'cluster'
                            ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
                            : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                        }`}>
                          {alert.type === 'cluster' ? '聚集性问题' : '设施异常'}
                        </span>
                        <h4 className="text-slate-300">{alert.title}</h4>
                        <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-xs">
                          ✓ 已处理
                        </span>
                      </div>
                      <p className="text-slate-400 mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(alert.timestamp).toLocaleString('zh-CN')}
                        </span>
                        {alert.relatedEvents && (
                          <span>关联数据：{alert.relatedEvents.length} 条</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {aiSuggestion && (
                    <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Brain className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-slate-400 mb-1">AI处置建议</div>
                          <div className="text-slate-500">{aiSuggestion}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
