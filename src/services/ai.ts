// AI分析服务 - 调用阿里云DashScope API
import { getApiKey } from '../config/ai';

export interface AIAnalysisRequest {
  events: any[];
  sensors: any[];
}

export interface AIAnalysisResponse {
  rootCause: string;
  suggestions: string;
  priority: string;
  priorityColor: string;
}

/**
 * 调用DashScope AI进行分析
 */
export async function performAIAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('请配置DASHSCOPE_API_KEY环境变量');
  }

  // 构建分析提示词
  const prompt = buildAnalysisPrompt(request);

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-max',
        messages: [
          {
            role: 'system',
            content: '你是一个智慧城市运营管理专家，擅长分析城市事件数据和传感器数据，提供问题归因、处置建议和优先级评估。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // 解析AI响应
    return parseAIResponse(aiResponse, request);
  } catch (error) {
    console.error('AI分析失败:', error);
    throw error;
  }
}

/**
 * 构建分析提示词
 */
function buildAnalysisPrompt(request: AIAnalysisRequest): string {
  const { events, sensors } = request;

  // 统计事件类型
  const eventTypeCount = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 统计区域分布
  const districtCount = events.reduce((acc, e) => {
    acc[e.location.district] = (acc[e.location.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 统计传感器异常
  const abnormalSensors = sensors.filter(s => s.status === '异常');
  const sensorTypeCount = abnormalSensors.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
请分析以下城市运营数据，并提供专业的分析报告：

## 市民事件数据（${events.length}条）
事件类型分布：
${Object.entries(eventTypeCount).map(([type, count]) => `- ${type}: ${count}次`).join('\n')}

区域分布：
${Object.entries(districtCount).map(([district, count]) => `- ${district}: ${count}条`).join('\n')}

## 传感器数据（${sensors.length}条，其中${abnormalSensors.length}条异常）
${abnormalSensors.length > 0 ? `异常传感器类型：\n${Object.entries(sensorTypeCount).map(([type, count]) => `- ${type}: ${count}个`).join('\n')}` : ''}

请按照以下格式提供分析结果：

【问题归因】
（分析这些事件和传感器数据反映的主要问题及其根本原因，200字以内）

【处置建议】
（提供具体的处置措施和建议，分为立即处置、短期措施、中期规划等，300字以内）

【优先级评估】
（根据问题的严重程度和影响范围，评估为：高优先级/中优先级/低优先级，并简要说明理由，100字以内）

请确保分析专业、具体、可操作。
`;

  return prompt;
}

/**
 * 解析AI响应
 */
function parseAIResponse(aiResponse: string, request: AIAnalysisRequest): AIAnalysisResponse {
  // 提取问题归因
  const rootCauseMatch = aiResponse.match(/【问题归因】\s*([\s\S]*?)(?=【|$)/);
  const rootCause = rootCauseMatch ? rootCauseMatch[1].trim() : '暂无分析结果';

  // 提取处置建议
  const suggestionsMatch = aiResponse.match(/【处置建议】\s*([\s\S]*?)(?=【|$)/);
  const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : '暂无建议';

  // 提取优先级评估
  const priorityMatch = aiResponse.match(/【优先级评估】\s*([\s\S]*?)(?=【|$)/);
  const priorityText = priorityMatch ? priorityMatch[1].trim() : '';

  // 判断优先级等级
  let priority = '中优先级';
  let priorityColor = 'medium';

  if (priorityText.includes('高优先级')) {
    priority = '高优先级';
    priorityColor = 'high';
  } else if (priorityText.includes('低优先级')) {
    priority = '低优先级';
    priorityColor = 'low';
  }

  return {
    rootCause,
    suggestions,
    priority,
    priorityColor
  };
}
