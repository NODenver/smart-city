# AI分析功能配置说明

## 配置阿里云DashScope API密钥

本项目的AI智能分析功能使用阿里云DashScope（通义千问）API。

### 1. 获取API密钥

1. 访问 [阿里云DashScope控制台](https://dashscope.console.aliyun.com/)
2. 登录/注册阿里云账号
3. 进入 [API密钥管理页面](https://dashscope.console.aliyun.com/apiKey)
4. 创建并复制你的API Key

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# 复制示例文件
cp .env.example .env
```

编辑 `.env` 文件，填入你的API密钥：

```env
VITE_DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx
```

### 3. 重启开发服务器

配置完成后，需要重启开发服务器以加载新的环境变量：

```bash
npm run dev
```

## 功能说明

### AI分析能力

- **问题归因分析**：基于城市事件和传感器数据，分析问题的根本原因
- **处置建议生成**：提供立即处置、短期措施、中期规划等具体建议
- **优先级评估**：根据问题严重程度和影响范围，评估处理优先级

### 使用方式

1. 进入"智能分析"面板
2. 从列表中选择需要分析的事件和传感器数据
3. 点击"开始AI分析"按钮
4. 等待AI分析完成，查看分析报告

### 降级方案

如果未配置API密钥或API调用失败，系统会自动使用本地规则分析作为降级方案，确保功能正常使用。

## 注意事项

- API密钥请妥善保管，不要提交到代码仓库
- `.env` 文件已添加到 `.gitignore`，不会被提交
- 首次使用可能需要在阿里云开通DashScope服务
- API调用会产生费用，请注意用量控制

## 故障排查

### 提示"未配置API密钥"

- 检查 `.env` 文件是否存在
- 检查 `VITE_DASHSCOPE_API_KEY` 是否正确配置
- 重启开发服务器

### 提示"API请求失败"

- 检查API密钥是否有效
- 检查网络连接是否正常
- 查看控制台错误日志获取详细信息
- 访问 [DashScope文档](https://help.aliyun.com/zh/dashscope/) 查看API状态

## API参考

本项目使用的API端点：

```
POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

使用的模型：
- `qwen-max`: 通义千问旗舰模型，提供最强的分析能力

更多信息请参考 [DashScope API文档](https://help.aliyun.com/zh/dashscope/developer-reference/api-details)
