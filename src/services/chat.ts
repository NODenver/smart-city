import axios from 'axios';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  dataContext?: any; // 携带的数据上下文
}

export class ChatAIService {
  private apiKey: string;
  private baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_DASHSCOPE_API_KEY || '';
  }

  async sendMessage(
    message: string,
    context?: { currentPage?: string; data?: any; alerts?: any },
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('请配置VITE_DASHSCOPE_API_KEY环境变量');
      }

      // 构建系统提示词
      const systemPrompt = this.buildSystemPrompt(context);

      // 尝试流式调用
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify({
            model: 'qwen-max',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: message
              }
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (!response.ok || !response.body) {
          throw new Error('流式响应失败');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const data = line.slice(6).trim();
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                if (onChunk) {
                  onChunk(content);
                }
              }
            } catch (e) {
              // 忽略解析错误的行
            }
          }
        }

        return fullContent || '抱歉，我现在无法回答这个问题。';
      } catch (streamError) {
        console.warn('流式调用失败，使用非流式备用方案:', streamError);

        // 流式调用失败，回退到普通调用
        const response = await axios.post(
          this.baseUrl,
          {
            model: 'qwen-max',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: message
              }
            ],
            stream: false,
            temperature: 0.7,
            max_tokens: 1000
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.data.choices || !response.data.choices[0]) {
          throw new Error('API响应格式错误');
        }

        const content = response.data.choices[0].message.content || '抱歉，我现在无法回答这个问题。';

        // 如果有流式回调，分块发送
        if (onChunk) {
          const chunks = this.splitIntoChunks(content, 10);
          for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, 50));
            onChunk(chunk);
          }
        }

        return content;
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      // 返回智能降级响应
      if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
          return '❌ AI服务未配置API密钥。请在.env文件中设置VITE_DASHSCOPE_API_KEY。';
        }
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          return '❌ 网络连接失败，请检查网络连接。';
        }
      }
      return '⚠️ AI服务暂时不可用，请稍后再试。';
    }
  }

  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private buildSystemPrompt(context?: any): string {
    let prompt = `你是一个专业的智慧城市AI助手，名字叫"小智"，专门帮助用户分析城市数据和预警信息。

**你的身份和能力：**
- 智慧城市运营管理专家
- 数据分析专家
- 城市问题诊断专家

**你的能力包括：**
1. 分析城市数据（事件统计、传感器数据、趋势分析）
2. 解释预警信息（预警原因、影响范围、处置建议）
3. 回答智慧城市相关问题
4. 提供专业的城市管理建议

**回答要求：**
- 始终保持友好、专业、耐心的态度
- 用简洁清晰的语言回答，避免过于技术化的表达
- 如果不确定或数据不足，请诚实说明
- 适当使用emoji和格式来让回答更生动
- 给出具体、可操作的建议
- 用第一人称"我"来回答

**示例回答格式：**
- 开头可以用"我来帮您分析..."或"根据当前数据..."
- 使用有序或无序列表组织信息
- 结尾可以提供建议或下一步操作

`;

    if (context) {
      prompt += `\n**当前系统数据：**\n`;
      if (context.currentPage) {
        prompt += `- 当前页面：${context.currentPage}\n`;
      }
      if (context.data) {
        prompt += `- 统计数据：${JSON.stringify(context.data, null, 2)}\n`;
      }
      if (context.alerts) {
        prompt += `- 预警数据：${JSON.stringify(context.alerts, null, 2)}\n`;
      }
    }

    prompt += `\n**请根据以上信息，用友好、专业的方式回答用户的问题。记住你是"小智"，一个智慧、友好的AI助手。**`;

    return prompt;
  }

  // 智能数据查询
  async queryDataInfo(query: string, dataStore: any): Promise<string> {
    const lowerQuery = query.toLowerCase();

    // 提取关键信息并构建上下文
    let dataContext = '';
    let analysisPrompt = '';

    if (lowerQuery.includes('事件') || lowerQuery.includes('市民')) {
      const events = dataStore.cityEvents;
      const total = events.length;
      const pending = events.filter((e: any) => e.status === '未处理').length;
      const urgent = events.filter((e: any) => e.status === '紧急').length;
      const typeStats = this.groupByType(events);
      const districtStats = this.groupByDistrict(events);

      dataContext = `
**事件统计数据：**
- 总事件数：${total} 条
- 待处理：${pending} 条
- 紧急事件：${urgent} 条

**按类型分布：**
${typeStats.map((item: any) => `- ${item.type}：${item.count} 条`).join('\n')}

**按区域分布：**
${districtStats.map((item: any) => `- ${item.district}：${item.count} 条`).join('\n')}
`;

      analysisPrompt = `请基于这些事件数据，提供深入的分析和见解，包括：
1. 当前事件的主要特点和模式
2. 哪些类型或区域需要重点关注
3. 紧急事件的严重程度评估
4. 给城市管理者的具体建议`;
    }

    else if (lowerQuery.includes('传感器')) {
      const sensors = dataStore.sensorData;
      const total = sensors.length;
      const abnormal = sensors.filter((s: any) => s.status === '异常').length;
      const typeStats = this.groupByType(sensors);

      dataContext = `
**传感器统计数据：**
- 总传感器数：${total} 个
- 异常设备：${abnormal} 个
- 正常率：${((total - abnormal) / total * 100).toFixed(1)}%

**按类型分布：**
${typeStats.map((item: any) => `- ${item.type}：${item.count} 个`).join('\n')}
`;

      analysisPrompt = `请基于这些传感器数据，分析：
1. 设备运行状态整体评估
2. 异常设备可能的原因和风险
3. 哪些区域需要优先检查和维护
4. 预防性维护建议`;
    }

    else if (lowerQuery.includes('趋势') || lowerQuery.includes('走势')) {
      const trend = dataStore.eventsTrend7Days;
      dataContext = `
**最近7天事件趋势：**
${trend.map((item: any) => `- ${item.date}：${item.count} 条`).join('\n')}

**趋势分析：**
${this.analyzeTrend(trend)}
`;

      analysisPrompt = `请分析这个7天趋势数据：
1. 识别趋势模式和异常变化
2. 分析可能的原因（如天气、事件等）
3. 预测未来几天的可能变化
4. 提出应对策略`;
    }

    else {
      // 默认查询全部数据
      const events = dataStore.cityEvents;
      const sensors = dataStore.sensorData;
      dataContext = `
**当前系统数据概览：**
- 市民事件：${events.length} 条（待处理：${events.filter((e: any) => e.status === '未处理').length} 条）
- 传感器数据：${sensors.length} 条（异常：${sensors.filter((s: any) => s.status === '异常').length} 条）
- 待处理预警：${dataStore.pendingAlerts.length} 条
`;

      analysisPrompt = `请提供一个综合性的城市运营状态分析，包括：
1. 整体运行健康度评估
2. 主要问题和风险点
3. 优先处理事项
4. 改进建议`;
    }

    try {
      // 调用AI进行深入分析
      const context = {
        currentPage: 'AI助手',
        data: dataContext
      };

      const prompt = `${analysisPrompt}\n\n${dataContext}\n\n请提供专业、详细的分析和建议。`;
      return await this.sendMessage(prompt, context);
    } catch (error) {
      console.error('Data query error:', error);
      return `⚠️ 抱歉，数据查询时出现错误。请稍后再试。\n\n${dataContext}`;
    }
  }

  // 分析预警信息
  async analyzeAlerts(alertId: string | null, dataStore: any): Promise<string> {
    let dataContext = '';
    let analysisPrompt = '';

    if (alertId) {
      const alert = dataStore.alerts.find((a: any) => a.id === alertId);
      if (alert) {
        dataContext = `
**具体预警详情：**
- 预警类型：${alert.ruleName}
- 发生位置：${alert.location}
- 触发时间：${new Date(alert.timestamp).toLocaleString()}
- 关联数据：${alert.eventCount} 条
- 当前状态：${alert.status}
- AI建议：${alert.suggestion || '暂无'}
`;

        analysisPrompt = `请深入分析这个预警事件：
1. 预警的严重程度和潜在影响
2. 问题产生的可能原因
3. 推荐的应急处置方案
4. 预防类似事件的措施
5. 跟进和监控建议`;
      }
    } else {
      const alerts = dataStore.alerts;
      const pending = dataStore.pendingAlerts;
      const processed = dataStore.processedAlerts;

      dataContext = `
**预警统计概览：**
- 总预警数：${alerts.length} 条
- 待处理：${pending.length} 条
- 已处理：${processed.length} 条

**待处理预警列表：**
${pending.length > 0 ? pending.map((a: any) => `- ${a.ruleName} (${a.location}) - ${a.eventCount}条数据`).join('\n') : '暂无待处理预警'}
`;

      analysisPrompt = `请基于这些预警信息进行全面分析：
1. 整体预警态势评估
2. 待处理预警的优先级排序
3. 预警模式的识别和分析
4. 应对策略和资源调配建议
5. 长期预防机制建议`;
    }

    try {
      // 调用AI进行深入分析
      const context = {
        currentPage: 'AI助手',
        alerts: dataContext
      };

      const prompt = `${analysisPrompt}\n\n${dataContext}\n\n请提供专业、详细的预警分析和处置建议。`;
      return await this.sendMessage(prompt, context);
    } catch (error) {
      console.error('Alert analysis error:', error);
      return `⚠️ 抱歉，预警分析时出现错误。请稍后再试。\n\n${dataContext}`;
    }
  }

  private groupByType(items: any[]) {
    const groups: Record<string, number> = {};
    items.forEach(item => {
      const type = item.type;
      groups[type] = (groups[type] || 0) + 1;
    });
    return Object.entries(groups).map(([type, count]) => ({ type, count }));
  }

  private groupByDistrict(items: any[]) {
    const groups: Record<string, number> = {};
    items.forEach(item => {
      const district = item.location?.district || '未知';
      groups[district] = (groups[district] || 0) + 1;
    });
    return Object.entries(groups).map(([district, count]) => ({ district, count }));
  }

  private analyzeTrend(trend: any[]) {
    const counts = trend.map((t: any) => t.count);
    const avg = counts.reduce((a: number, b: number) => a + b, 0) / counts.length;
    const latest = counts[counts.length - 1];

    if (latest > avg * 1.2) return '呈上升趋势，需要关注';
    if (latest < avg * 0.8) return '呈下降趋势，情况好转';
    return '保持平稳';
  }
}

export const chatAI = new ChatAIService();
