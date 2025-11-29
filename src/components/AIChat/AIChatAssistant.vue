<template>
  <div class="ai-chat-assistant">
    <!-- 悬浮按钮 -->
    <button
      v-if="!isOpen"
      class="chat-fab"
      @click="toggleChat"
    >
      <svg v-if="!isTyping" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <div v-else class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>

    <!-- 聊天窗口 -->
    <div v-if="isOpen" class="chat-window">
      <!-- 窗口头部 -->
      <div class="chat-header">
        <div class="header-info">
          <div class="ai-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
          </div>
          <div class="header-text">
            <h3>AI 智能助手</h3>
            <p>{{ isTyping ? '正在输入...' : '随时为您提供帮助' }}</p>
          </div>
        </div>
        <button class="btn-close" @click="toggleChat">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- 消息列表 -->
      <div class="chat-messages" ref="messagesContainer">
        <ChatMessage
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
        />
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="welcome-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
          </div>
          <h4>您好！我是智慧城市AI助手</h4>
          <p>我可以帮您分析数据和预警信息</p>
          <div class="quick-actions">
            <button class="quick-btn" @click="sendQuickMessage('分析当前事件数据')">
              📊 分析事件数据
            </button>
            <button class="quick-btn" @click="sendQuickMessage('分析当前传感器状态')">
              📡 查看传感器状态
            </button>
            <button class="quick-btn" @click="sendQuickMessage('分析当前预警情况')">
              ⚠️ 分析预警信息
            </button>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input-area">
        <div class="input-container">
          <input
            v-model="inputText"
            type="text"
            placeholder="输入您的问题..."
            class="chat-input"
            @keyup.enter="handleSend"
            :disabled="isTyping"
          />
          <button
            class="btn-send"
            @click="handleSend"
            :disabled="!inputText.trim() || isTyping"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, reactive } from 'vue';
import ChatMessage from './ChatMessage.vue';
import { chatAI, type ChatMessage as ChatMessageType } from '@/services/chat';
import { useDataStore } from '@/stores/data';
import { ElMessage } from 'element-plus';

const dataStore = useDataStore();

const isOpen = ref(false);
const messages = ref<ChatMessageType[]>([]);
const inputText = ref('');
const isTyping = ref(false);
const messagesContainer = ref<HTMLElement>();

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 监听消息长度变化
watch(() => messages.value.length, () => {
  scrollToBottom();
});

// 监听是否在输入
watch(() => isTyping.value, () => {
  scrollToBottom();
});

// 添加一个定时器，在流式更新时定期滚动
let scrollTimer: number | null = null;
const startScrollTimer = () => {
  if (scrollTimer) return;
  scrollTimer = window.setInterval(() => {
    scrollToBottom();
  }, 100);
};
const stopScrollTimer = () => {
  if (scrollTimer) {
    clearInterval(scrollTimer);
    scrollTimer = null;
  }
};

const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const handleSend = async () => {
  if (!inputText.value.trim() || isTyping.value) return;

  const userMessage: ChatMessageType = {
    id: generateId(),
    role: 'user',
    content: inputText.value,
    timestamp: Date.now()
  };

  messages.value.push(userMessage);
  const query = inputText.value;
  inputText.value = '';
  isTyping.value = true;

  // 启动滚动定时器
  startScrollTimer();

  try {
    // 创建响应式AI消息对象，初始为空
    const aiMessage = reactive<ChatMessageType>({
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    });
    messages.value.push(aiMessage as any);

    // 智能路由：根据问题类型选择处理方式
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('数据') || lowerQuery.includes('统计') || lowerQuery.includes('事件') || lowerQuery.includes('传感')) {
      // 对于数据查询，也使用流式
      await handleStreamingQuery(aiMessage, query, 'data');
    } else if (lowerQuery.includes('预警') || lowerQuery.includes('警告')) {
      await handleStreamingQuery(aiMessage, query, 'alert');
    } else {
      // 通用对话
      const context = {
        currentPage: 'AI助手',
        data: {
          totalEvents: dataStore.totalEvents,
          totalSensors: dataStore.totalSensors,
          pendingAlerts: dataStore.pendingAlerts.length
        }
      };

      await chatAI.sendMessage(query, context, (chunk: string) => {
        aiMessage.content += chunk;
        // 强制视图更新
        nextTick(() => {
          scrollToBottom();
        });
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    ElMessage.error('AI助手暂时无法回答，请稍后再试');
    stopScrollTimer();
  } finally {
    isTyping.value = false;
    // 停止滚动定时器
    stopScrollTimer();
  }
};

const handleStreamingQuery = async (aiMessage: ChatMessageType, query: string, type: 'data' | 'alert') => {
  try {
    let finalResponse = '';

    if (type === 'data') {
      // 获取基础数据
      const lowerQuery = query.toLowerCase();
      let dataContext = '';
      let analysisPrompt = '';

      if (lowerQuery.includes('事件') || lowerQuery.includes('市民')) {
        const events = dataStore.cityEvents;
        const total = events.length;
        const pending = events.filter((e: any) => e.status === '未处理').length;
        const urgent = events.filter((e: any) => e.status === '紧急').length;
        const typeStats = groupByType(events);
        const districtStats = groupByDistrict(events);

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
      } else if (lowerQuery.includes('传感器')) {
        const sensors = dataStore.sensorData;
        const total = sensors.length;
        const abnormal = sensors.filter((s: any) => s.status === '异常').length;
        const typeStats = groupByType(sensors);

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

      const prompt = `${analysisPrompt}\n\n${dataContext}\n\n请提供专业、详细的分析和建议。`;

      await chatAI.sendMessage(prompt, {
        currentPage: 'AI助手',
        data: dataContext
      }, (chunk: string) => {
        aiMessage.content += chunk;
        finalResponse += chunk;
        // 强制视图更新
        nextTick(() => {
          scrollToBottom();
        });
      });
    } else if (type === 'alert') {
      const alerts = dataStore.alerts;
      const pending = dataStore.pendingAlerts;
      const processed = dataStore.processedAlerts;

      const dataContext = `
**预警统计概览：**
- 总预警数：${alerts.length} 条
- 待处理：${pending.length} 条
- 已处理：${processed.length} 条

**待处理预警列表：**
${pending.length > 0 ? pending.map((a: any) => `- ${a.ruleName} (${a.location}) - ${a.eventCount}条数据`).join('\n') : '暂无待处理预警'}
`;

      const analysisPrompt = `请基于这些预警信息进行全面分析：
1. 整体预警态势评估
2. 待处理预警的优先级排序
3. 预警模式的识别和分析
4. 应对策略和资源调配建议
5. 长期预防机制建议`;

      const prompt = `${analysisPrompt}\n\n${dataContext}\n\n请提供专业、详细的预警分析和处置建议。`;

      await chatAI.sendMessage(prompt, {
        currentPage: 'AI助手',
        alerts: dataContext
      }, (chunk: string) => {
        aiMessage.content += chunk;
        finalResponse += chunk;
        // 强制视图更新
        nextTick(() => {
          scrollToBottom();
        });
      });
    }
  } catch (error) {
    console.error('Streaming query error:', error);
    aiMessage.content = '抱歉，查询时出现错误。请稍后再试。';
    stopScrollTimer();
  }
};

const groupByType = (items: any[]) => {
  const groups: Record<string, number> = {};
  items.forEach(item => {
    const type = item.type;
    groups[type] = (groups[type] || 0) + 1;
  });
  return Object.entries(groups).map(([type, count]) => ({ type, count }));
};

const groupByDistrict = (items: any[]) => {
  const groups: Record<string, number> = {};
  items.forEach(item => {
    const district = item.location?.district || '未知';
    groups[district] = (groups[district] || 0) + 1;
  });
  return Object.entries(groups).map(([district, count]) => ({ district, count }));
};

const sendQuickMessage = (message: string) => {
  inputText.value = message;
  handleSend();
};
</script>

<style scoped>
.ai-chat-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: inherit;
}

/* 悬浮按钮 */
.chat-fab {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--gradient-primary);
  border: none;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  position: relative;
}

.chat-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(6, 182, 212, 0.6);
}

.chat-fab:active {
  transform: translateY(0);
}

/* 聊天窗口 */
.chat-window {
  width: 480px;
  height: 700px;
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 头部 */
.chat-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(6, 182, 212, 0.05);
  border-radius: 16px 16px 0 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ai-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #a855f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-text p {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0.125rem 0 0 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

/* 消息列表 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  scroll-behavior: smooth;
}

/* 欢迎消息 */
.welcome-message {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-muted);
}

.welcome-icon {
  margin-bottom: 1rem;
  color: rgba(168, 85, 247, 0.5);
}

.welcome-message h4 {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.welcome-message p {
  font-size: 13px;
  margin: 0 0 1.5rem 0;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-btn {
  padding: 0.625rem 1rem;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 8px;
  color: var(--primary-color);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.quick-btn:hover {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(6, 182, 212, 0.5);
}

/* 输入区域 */
.chat-input-area {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color);
  background: var(--background-soft);
  border-radius: 0 0 16px 16px;
}

.input-container {
  display: flex;
  gap: 0.5rem;
}

.chat-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.chat-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
}

.chat-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-send {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--gradient-primary);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* 响应式 */
@media (max-width: 640px) {
  .ai-chat-assistant {
    bottom: 10px;
    right: 10px;
  }

  .chat-window {
    width: calc(100vw - 20px);
    height: calc(100vh - 120px);
    max-width: 480px;
  }
}
</style>
