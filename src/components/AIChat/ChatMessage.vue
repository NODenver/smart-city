<template>
  <div :class="['message', message.role]">
    <div class="message-avatar">
      <div v-if="message.role === 'user'" class="user-avatar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div v-else class="ai-avatar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
        </svg>
      </div>
    </div>

    <div class="message-content">
      <div class="message-text" v-html="formattedContent"></div>
      <div class="message-time">{{ formatTime(messageRef.value?.timestamp || Date.now()) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue';
import type { ChatMessage } from '@/services/chat';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

// 配置markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

const props = defineProps<{
  message: ChatMessage;
}>();

// 使用ref包装props.message来创建响应式引用
const messageRef = ref(props.message);

// 监听props.message的变化，更新messageRef
watch(() => props.message, (newMessage) => {
  messageRef.value = newMessage;
}, { deep: true });

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formattedContent = computed(() => {
  const content = messageRef.value?.content || '';
  // 使用markdown-it渲染
  return md.render(content);
});

// 调试日志
watch(() => messageRef.value?.content, (newContent) => {
  console.log('📝 Message content updated:', newContent?.substring(0, 50));
});
</script>

<style scoped>
.message {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.user-avatar,
.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: var(--primary-color);
}

.ai-avatar {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #a855f7;
}

.message-content {
  flex: 1;
  max-width: 80%;
}

.user .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-text {
  padding: 0.875rem 1.125rem;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.user .message-text {
  background: var(--gradient-primary);
  color: white;
  border-bottom-right-radius: 4px;
}

.ai .message-text {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-bottom-left-radius: 4;
}

.message-text :deep(.inline-code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

/* Markdown内容样式 */
.message-text :deep(h1) {
  font-size: 18px;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  color: var(--text-primary);
}

.message-text :deep(h2) {
  font-size: 16px;
  font-weight: 600;
  margin: 0.875rem 0 0.5rem 0;
  color: var(--text-primary);
}

.message-text :deep(h3) {
  font-size: 14px;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem 0;
  color: var(--text-primary);
}

.message-text :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.message-text :deep(ul),
.message-text :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.message-text :deep(li) {
  margin: 0.25rem 0;
  line-height: 1.6;
}

.message-text :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.message-text :deep(a:hover) {
  border-bottom-color: var(--primary-color);
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #f8f8f2;
}

.message-text :deep(pre) {
  margin: 0.75rem 0;
  border-radius: 8px;
  overflow-x: auto;
}

.message-text :deep(pre code) {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 13px;
}

.message-text :deep(.hljs) {
  background: rgba(0, 0, 0, 0.5);
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 8px;
}

.message-text :deep(blockquote) {
  border-left: 3px solid rgba(6, 182, 212, 0.5);
  margin: 0.75rem 0;
  padding: 0.5rem 1rem;
  background: rgba(6, 182, 212, 0.05);
  border-radius: 4px;
}

.message-text :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 13px;
}

.message-text :deep(th),
.message-text :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  text-align: left;
}

.message-text :deep(th) {
  background: rgba(6, 182, 212, 0.1);
  font-weight: 600;
  color: var(--text-primary);
}

.message-text :deep(td) {
  color: var(--text-secondary);
}

.message-text :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}

.message-text :deep(em) {
  color: var(--text-secondary);
  font-style: italic;
}

.message-time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 0.375rem;
}

.user .message-time {
  text-align: right;
}

.ai .message-time {
  text-align: left;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .ai .message-text {
    background: rgba(30, 41, 59, 0.8);
  }
}
</style>
