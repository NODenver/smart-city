import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { AIAnalysisResult, CityEvent, SensorData } from '@/types/city';

export const useAIStore = defineStore('ai', () => {
  // 分析历史
  const analysisHistory = ref<AIAnalysisResult[]>([]);

  // 当前分析状态
  const isAnalyzing = ref(false);
  const currentStream = ref<string>(''); // 流式输出内容

  // 模拟API Key（实际使用时需要从环境变量获取）
  const API_KEY = ref(''); // 阿里云百炼API Key
  const API_ENDPOINT = ref('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation');

  // 保存分析结果
  function saveAnalysisResult(result: AIAnalysisResult) {
    analysisHistory.value.unshift(result);
  }

  // 获取分析历史
  function getAnalysisHistory() {
    return analysisHistory.value;
  }

  // 流式分析（使用真实API或模拟）
  async function analyzeStreaming(
    events: CityEvent[],
    sensors: SensorData[]
  ): Promise<AIAnalysisResult> {
    isAnalyzing.value = true;
    currentStream.value = '';

    try {
      if (API_KEY.value) {
        // 使用真实API
        return await analyzeWithAPI(events, sensors);
      } else {
        // 使用模拟响应
        return await analyzeWithMock(events, sensors);
      }
    } finally {
      isAnalyzing.value = false;
      currentStream.value = '';
    }
  }

  // 使用阿里云百炼API分析
  async function analyzeWithAPI(
    events: CityEvent[],
    sensors: SensorData[]
  ): Promise<AIAnalysisResult> {
    const prompt = buildPrompt(events, sensors);

    const response = await fetch(API_ENDPOINT.value, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        input: {
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          result_format: 'message',
          incremental_output: true
        }
      })
    });

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let result = '';
    const eventIds = events.map(e => e.id);
    const sensorIds = sensors.map(s => s.sensorId);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      result += chunk;
      currentStream.value = result;

      // 简单解析：如果包含完整信息则结束
      if (result.includes('【优先级') || result.includes('优先级')) {
        break;
      }
    }

    const analysisResult = parseAIResponse(result, eventIds, sensorIds);
    saveAnalysisResult(analysisResult);
    return analysisResult;
  }

  // 模拟分析
  async function analyzeWithMock(
    events: CityEvent[],
    sensors: SensorData[]
  ): Promise<AIAnalysisResult> {
    const eventIds = events.map(e => e.id);
    const sensorIds = sensors.map(s => s.sensorId);

    // 模拟流式输出
    const steps = [
      '正在分析事件数据...',
      '检测到异常关联...',
      '生成问题归因分析...',
      '提供处置建议...',
      '评估优先级...'
    ];

    for (const step of steps) {
      currentStream.value += step + '\n';
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // 生成分析结果
    const cause = generateMockCause(events, sensors);
    const suggestion = generateMockSuggestion(events, sensors);
    const priority = determinePriority(events, sensors);

    const result: AIAnalysisResult = {
      id: `AI${Date.now()}`,
      eventIds,
      sensorIds,
      cause,
      suggestion,
      priority,
      timestamp: new Date().toISOString()
    };

    currentStream.value += `【问题归因】${cause}\n【处置建议】${suggestion}\n【优先级】${priority}`;
    await new Promise(resolve => setTimeout(resolve, 500));

    saveAnalysisResult(result);
    return result;
  }

  // 构建分析提示词
  function buildPrompt(events: CityEvent[], sensors: SensorData[]): string {
    let prompt = '作为城市管理专家，请分析以下城市事件和传感器数据：\n\n';

    if (events.length > 0) {
      prompt += '【城市事件】\n';
      events.forEach(event => {
        prompt += `- 事件ID: ${event.id}\n  类型: ${event.type}\n  位置: ${event.location.district} ${event.location.street}\n  描述: ${event.description}\n  上报时间: ${event.reportTime}\n  状态: ${event.status}\n\n`;
      });
    }

    if (sensors.length > 0) {
      prompt += '【传感器数据】\n';
      sensors.forEach(sensor => {
        prompt += `- 传感器: ${sensor.sensorId}\n  类型: ${sensor.type}\n  位置: ${sensor.location.district} ${sensor.location.street}\n  数值: ${sensor.value}${sensor.unit} (阈值: ${sensor.threshold})\n  状态: ${sensor.status}\n  时间: ${sensor.timestamp}\n\n`;
      });
    }

    prompt += '请从以下角度进行分析：\n';
    prompt += '1. 问题归因：分析可能的原因和关联性\n';
    prompt += '2. 处置建议：提出具体的处理方案\n';
    prompt += '3. 优先级评估：高/中/低\n\n';
    prompt += '请以JSON格式返回结果，包含cause、suggestion、priority字段。';

    return prompt;
  }

  // 解析AI响应
  function parseAIResponse(response: string, eventIds: string[], sensorIds: string[]): AIAnalysisResult {
    // 简化解析逻辑
    const cause = '基于数据分析，该问题可能与城市基础设施老化或极端天气影响有关';
    const suggestion = '建议立即派员现场核查，必要时启动应急预案，并加强该区域的巡检频次';
    const priority = response.includes('高') ? '高' : response.includes('低') ? '低' : '中';

    return {
      id: `AI${Date.now()}`,
      eventIds,
      sensorIds,
      cause,
      suggestion,
      priority,
      timestamp: new Date().toISOString()
    };
  }

  // 生成模拟归因
  function generateMockCause(events: CityEvent[], sensors: SensorData[]): string {
    const types = [...new Set([...events.map(e => e.type), ...sensors.map(s => s.type)])];
    const districts = [...new Set([...events.map(e => e.location.district), ...sensors.map(s => s.location.district)])];

    const causes = [
      `该区域(${districts[0] || '该区域'})连续发生${types.join('、')}类问题，可能与排水系统老化、设施维护不及时有关`,
      `根据传感器数据显示，该区域监测指标异常，结合市民上报事件，建议排查相关基础设施`,
      `综合分析：此类问题在该区域呈多发态势，需要系统性排查和长效治理机制`
    ];

    return causes[Math.floor(Math.random() * causes.length)] || '数据分析中';
  }

  // 生成模拟建议
  function generateMockSuggestion(events: CityEvent[], sensors: SensorData[]): string {
    const suggestions = [
      '1. 立即派员现场核查并采取临时管控措施\n2. 调度相关专业车辆和设备进行处置\n3. 排查周边同类设施，及时发现并消除隐患\n4. 建立长效巡查机制',
      '1. 启动应急预案，成立现场处置小组\n2. 加强与市民沟通，做好解释和安抚工作\n3. 协调相关部门联动处置\n4. 跟踪处理进度直至问题解决',
      '1. 快速响应，30分钟内到场处置\n2. 评估问题严重程度，分级分类处理\n3. 加强该区域后续监管\n4. 举一反三排查类似问题'
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)] || '建议持续关注并及时处置';
  }

  // 确定优先级
  function determinePriority(events: CityEvent[], sensors: SensorData[]): '高' | '中' | '低' {
    const hasEmergency = events.some(e => e.status === '紧急');
    const hasAbnormal = sensors.some(s => s.status === '异常');

    if (hasEmergency || hasAbnormal) return '高';
    if (events.length + sensors.length > 3) return '中';
    return '低';
  }

  // 设置API Key
  function setApiKey(key: string) {
    API_KEY.value = key;
  }

  return {
    analysisHistory,
    isAnalyzing,
    currentStream,
    API_KEY,
    saveAnalysisResult,
    getAnalysisHistory,
    analyzeStreaming,
    setApiKey
  };
});
