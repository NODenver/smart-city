import { useState } from 'react';
import { Brain, CheckSquare, Square, Sparkles, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { CityEvent, SensorData, AIAnalysisResult } from '../App';

interface AIAnalysisProps {
  cityEvents: CityEvent[];
  sensorData: SensorData[];
  aiAnalyses: AIAnalysisResult[];
  onAnalysisComplete: (analysis: AIAnalysisResult) => void;
}

export function AIAnalysis({ cityEvents, sensorData, aiAnalyses, onAnalysisComplete }: AIAnalysisProps) {
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [selectedSensors, setSelectedSensors] = useState<Set<string>>(new Set());
  const [analyzing, setAnalyzing] = useState(false);

  // 问题聚类分析
  const clusterAnalysis = () => {
    const typeCount: Record<string, number> = {};
    const districtCount: Record<string, number> = {};

    cityEvents.forEach(event => {
      typeCount[event.type] = (typeCount[event.type] || 0) + 1;
      districtCount[event.location.district] = (districtCount[event.location.district] || 0) + 1;
    });

    const topTypes = Object.entries(typeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const topDistricts = Object.entries(districtCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { topTypes, topDistricts };
  };

  const { topTypes, topDistricts } = clusterAnalysis();

  // 关联分析
  const findCorrelations = () => {
    const correlations: Array<{ event: CityEvent; sensors: SensorData[] }> = [];

    cityEvents.forEach(event => {
      const nearbySensors = sensorData.filter(sensor => {
        // 简单的距离计算（实际应使用haversine公式）
        const distance = Math.sqrt(
          Math.pow(event.location.lat - sensor.location.lat, 2) +
          Math.pow(event.location.lng - sensor.location.lng, 2)
        );
        return distance < 0.01 && (sensor.status === 'warning' || sensor.status === 'error');
      });

      if (nearbySensors.length > 0) {
        correlations.push({ event, sensors: nearbySensors });
      }
    });

    return correlations;
  };

  const correlations = findCorrelations();

  // 模拟AI分析
  const performAIAnalysis = async () => {
    if (selectedEvents.size === 0 && selectedSensors.size === 0) {
      toast.error('请至少选择一条事件或传感器数据');
      return;
    }

    setAnalyzing(true);
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    const selectedEventData = cityEvents.filter(e => selectedEvents.has(e.id));
    const selectedSensorData = sensorData.filter(s => selectedSensors.has(s.id));

    // 生成模拟AI分析结果
    const eventTypes = [...new Set(selectedEventData.map(e => e.type))];
    const districts = [...new Set([...selectedEventData.map(e => e.location.district), ...selectedSensorData.map(s => s.location.district)])];
    
    let cause = '';
    let suggestion = '';
    let priority: 'high' | 'medium' | 'low' = 'medium';

    // 基于数据生成分析结果
    if (eventTypes.includes('道路积水') || selectedSensorData.some(s => s.type === '积水传感器')) {
      cause = `${districts.join('、')}区域排水管网老化，加之近期降雨量较大，导致道路积水问题频发。传感器数据显示多处积水深度超过30cm。`;
      suggestion = '建议立即调度排水车前往积水点位，同时安排市政部门对该区域排水管网进行全面检修和清淤。中长期需考虑对老旧管网进行改造升级。';
      priority = 'high';
    } else if (eventTypes.includes('路灯故障') || selectedSensorData.some(s => s.type === '路灯监测')) {
      cause = `${districts.join('、')}区域路灯设备已运行超过设计寿命，部分线路老化导致照明故障频发。`;
      suggestion = '建议组织电力维修队伍进行巡检，优先修复主干道路灯。同时建立路灯智能监控系统，实现故障自动预警。';
      priority = 'medium';
    } else if (eventTypes.includes('噪音扰民')) {
      cause = `${districts.join('、')}区域夜间施工或商业活动噪音超标，影响居民正常休息。`;
      suggestion = '建议城管部门加强夜间巡查，对违规施工和超时营业的商户进行处罚。设置噪音监测点，实时监控环境噪音水平。';
      priority = 'medium';
    } else {
      cause = `分析${selectedEvents.size}条事件和${selectedSensors.size}条传感器数据后发现，${districts.join('、')}区域存在多类城市管理问题，可能与基础设施老化、管理力度不足有关。`;
      suggestion = '建议成立专项工作组，对该区域进行全面排查整治。加强日常巡查频次，建立问题快速响应机制。';
      priority = selectedEvents.size + selectedSensors.size > 5 ? 'high' : 'medium';
    }

    const analysis: AIAnalysisResult = {
      id: `analysis-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventIds: [...selectedEvents, ...selectedSensors],
      analysis: {
        cause,
        suggestion,
        priority,
      },
    };

    onAnalysisComplete(analysis);
    setAnalyzing(false);
    setSelectedEvents(new Set());
    setSelectedSensors(new Set());
    
    toast.success('AI分析完成！');
  };

  const toggleEventSelection = (id: string) => {
    const newSet = new Set(selectedEvents);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedEvents(newSet);
  };

  const toggleSensorSelection = (id: string) => {
    const newSet = new Set(selectedSensors);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedSensors(newSet);
  };

  return (
    <div className="space-y-6">
      {/* 问题聚类与热点识别 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            高频问题类型 TOP5
          </h3>
          <div className="space-y-3">
            {topTypes.map(([type, count], index) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 w-6">{index + 1}</span>
                  <span className="text-slate-300">{type}</span>
                </div>
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded">
                  {count} 次
                </span>
              </div>
            ))}
            {topTypes.length === 0 && (
              <div className="text-center text-slate-500 py-8">暂无数据</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            问题高发区 TOP5
          </h3>
          <div className="space-y-3">
            {topDistricts.map(([district, count], index) => (
              <div key={district} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-red-400 w-6">{index + 1}</span>
                  <span className="text-slate-300">{district}</span>
                </div>
                <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded">
                  {count} 条
                </span>
              </div>
            ))}
            {topDistricts.length === 0 && (
              <div className="text-center text-slate-500 py-8">暂无数据</div>
            )}
          </div>
        </div>
      </div>

      {/* 异常关联分析 */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          高置信度关联事件
        </h3>
        <div className="space-y-4">
          {correlations.slice(0, 5).map((corr, index) => (
            <div key={index} className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-slate-300 mb-1">{corr.event.description}</div>
                  <div className="text-slate-500">{corr.event.location.address}</div>
                </div>
              </div>
              <div className="pl-5 space-y-2">
                {corr.sensors.map(sensor => (
                  <div key={sensor.id} className="flex items-center gap-2 text-purple-400">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span>关联传感器: {sensor.type} - {sensor.value}{sensor.unit} (异常)</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {correlations.length === 0 && (
            <div className="text-center text-slate-500 py-8">暂无关联事件</div>
          )}
        </div>
      </div>

      {/* AI辅助决策 */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            AI辅助决策分析
          </h3>
          <button
            onClick={performAIAnalysis}
            disabled={analyzing || (selectedEvents.size === 0 && selectedSensors.size === 0)}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                分析中...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                开始AI分析
              </>
            )}
          </button>
        </div>

        <div className="mb-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <p className="text-slate-400 mb-2">
            已选择: {selectedEvents.size} 条事件 + {selectedSensors.size} 条传感器数据
          </p>
          <p className="text-slate-500">
            请从下方列表中选择需要分析的数据，AI将为您提供问题归因、处置建议和优先级评估
          </p>
        </div>

        {/* 事件选择列表 */}
        <div className="mb-6">
          <h4 className="text-slate-300 mb-3">市民事件</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {cityEvents.slice(0, 20).map(event => (
              <div
                key={event.id}
                onClick={() => toggleEventSelection(event.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedEvents.has(event.id)
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  {selectedEvents.has(event.id) ? (
                    <CheckSquare className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="text-slate-300">{event.description}</div>
                    <div className="text-slate-500 mt-1">
                      {event.location.district} · {event.type}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 传感器选择列表 */}
        <div>
          <h4 className="text-slate-300 mb-3">传感器数据</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {sensorData.filter(s => s.status !== 'normal').slice(0, 20).map(sensor => (
              <div
                key={sensor.id}
                onClick={() => toggleSensorSelection(sensor.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSensors.has(sensor.id)
                    ? 'bg-purple-500/10 border-purple-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  {selectedSensors.has(sensor.id) ? (
                    <CheckSquare className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="text-slate-300">
                      {sensor.type} - {sensor.value}{sensor.unit}
                    </div>
                    <div className="text-slate-500 mt-1">
                      {sensor.location.district} · {sensor.deviceId} · {sensor.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 历史分析记录 */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          历史AI分析记录
        </h3>
        <div className="space-y-4">
          {aiAnalyses.slice().reverse().map(analysis => (
            <div key={analysis.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400">
                  {new Date(analysis.timestamp).toLocaleString('zh-CN')}
                </span>
                <span className={`px-3 py-1 rounded text-xs ${
                  analysis.analysis.priority === 'high'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : analysis.analysis.priority === 'medium'
                    ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/10 border border-green-500/20 text-green-400'
                }`}>
                  {analysis.analysis.priority === 'high' ? '高优先级' : analysis.analysis.priority === 'medium' ? '中优先级' : '低优先级'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-cyan-400 mb-1">问题归因</div>
                  <div className="text-slate-300">{analysis.analysis.cause}</div>
                </div>
                
                <div>
                  <div className="text-green-400 mb-1">处置建议</div>
                  <div className="text-slate-300">{analysis.analysis.suggestion}</div>
                </div>
                
                <div className="text-slate-500">
                  分析数据量: {analysis.eventIds.length} 条
                </div>
              </div>
            </div>
          ))}
          {aiAnalyses.length === 0 && (
            <div className="text-center text-slate-500 py-8">暂无分析记录</div>
          )}
        </div>
      </div>
    </div>
  );
}
