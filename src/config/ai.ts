// AI服务配置
export const AI_CONFIG = {
  // 请替换为你的实际阿里云 DashScope API 密钥
  // 获取地址: https://dashscope.console.aliyun.com/apiKey
  apiKey: 'sk-your-actual-api-key-here',
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  model: 'qwen-max'
};

// 获取API密钥的函数
export function getApiKey(): string {
  // 优先使用环境变量
  if (import.meta.env.VITE_DASHSCOPE_API_KEY) {
    return import.meta.env.VITE_DASHSCOPE_API_KEY;
  }
  
  // 备选方案：使用静态配置
  return AI_CONFIG.apiKey !== 'your_api_key_here' ? AI_CONFIG.apiKey : '';
}