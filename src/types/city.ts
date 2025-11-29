export interface CityEvent {
  id: string;
  type: string;
  description: string;
  location: {
    district: string;
    street: string;
    lat: number;
    lng: number;
  };
  reportTime: string;
  reporterType: string;
  status: '未处理' | '处理中' | '已派单' | '紧急' | '核查中';
}

export interface SensorData {
  sensorId: string;
  type: string;
  location: {
    district: string;
    street: string;
    lat: number;
    lng: number;
  };
  value: number;
  unit: string;
  threshold: number;
  timestamp: string;
  status: '正常' | '异常';
}

export interface AIAnalysisResult {
  id: string;
  eventIds: string[];
  sensorIds: string[];
  cause: string; // 问题归因
  suggestion: string; // 处置建议
  priority: '高' | '中' | '低'; // 优先级评估
  timestamp: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  timeframe: number; // 时间窗口（小时）
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  eventCount: number;
  location: string;
  timestamp: string;
  status: 'pending' | 'processed' | 'following';
  suggestion?: string;
}
