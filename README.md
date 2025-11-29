# 智慧城市运行态势感知系统

基于 Vue 3 + TypeScript + ECharts 构建的智慧城市数据可视化与AI分析平台

## 项目简介

本项目是一个面向城市管理人员的运行态势感知与智能辅助决策平台，集成了多源数据接入、实时态势展示、AI智能分析、决策建议生成等功能。

### 核心功能

- **多源数据导入**：支持拖拽上传JSON格式的城市事件和传感器数据
- **实时态势展示**：基于ECharts的可视化大屏，展示城市运行态势
- **AI智能分析**：集成大模型API，生成问题归因与处置建议（支持流式输出）
- **智能预警系统**：自动检测聚集性事件和设施异常，30秒检查间隔
- **数据统计分析**：多维度数据统计与趋势分析

## 技术栈

### 前端框架
- **Vue 3** - 组合式API
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Pinia** - 状态管理
- **Vue Router** - 路由管理

### UI组件库
- **Element Plus** - Vue 3 UI组件库
- **@element-plus/icons-vue** - 图标库

### 数据可视化
- **ECharts 5.x** - 图表库
  - 热力图（城市问题分布）
  - 环形图（问题类型分布）
  - 折线图（7天趋势分析）

### AI能力
- **阿里云百炼** - 通义千问模型（支持流式输出）
- 当前为模拟模式，可配置真实API Key

## 项目结构

```
smart-city/
├── public/                  # 静态资源
│   ├── city_events.json    # 城市事件模拟数据
│   └── sensor_data.json    # 传感器数据模拟数据
├── src/
│   ├── components/         # 公共组件
│   ├── views/              # 页面组件
│   │   ├── HomeView.vue       # 首页（数据导入）
│   │   ├── DataListView.vue   # 数据列表
│   │   ├── DashboardView.vue  # 态势大屏
│   │   ├── AnalysisView.vue   # AI分析页面
│   │   └── AlertsView.vue     # 预警管理
│   ├── stores/             # Pinia状态管理
│   │   ├── data.ts            # 数据管理
│   │   ├── ai.ts              # AI分析
│   │   └── alert.ts           # 预警系统
│   ├── types/              # 类型定义
│   │   └── city.ts
│   ├── router/             # 路由配置
│   └── main.ts             # 入口文件
├── package.json
└── README.md
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

### 代码规范检查

```bash
npm run lint
```

## 使用指南

### 1. 数据导入

在首页点击"加载示例数据"或拖拽上传JSON文件：

- `city_events.json` - 城市事件数据
- `sensor_data.json` - 传感器数据

### 2. 态势大屏

查看城市运行态势的实时数据可视化：
- 顶部4个关键指标卡片
- 城市问题热力图
- 问题类型环形图
- 7天趋势折线图
- 实时事件流

### 3. AI智能分析

选择城市事件或传感器数据，进行AI分析：
- 选择分析对象（可多选）
- 点击"开始AI分析"
- 查看流式输出的分析结果
- 保存分析历史

### 4. 预警管理

管理智能预警系统：
- 查看预警规则配置
- 监控活跃预警数量
- 处理预警通知
- 跟踪预警状态

## AI功能说明

### API配置

当前系统运行在**模拟模式**，不调用真实API。要启用真实AI功能：

1. 获取阿里云百炼API Key
2. 在 `src/stores/ai.ts` 中设置API Key：

```typescript
function setApiKey(key: string) {
  API_KEY.value = key;
}

// 在应用启动时调用
aiStore.setApiKey('your-api-key-here');
```

### Prompt设计

系统使用结构化的提示词模板：

```
作为城市管理专家，请分析以下城市事件和传感器数据：

【城市事件】
- 事件ID、类型、位置、描述、上报时间、状态

【传感器数据】
- 传感器ID、类型、位置、数值、单位、阈值、状态、时间

请从以下角度进行分析：
1. 问题归因：分析可能的原因和关联性
2. 处置建议：提出具体的处理方案
3. 优先级评估：高/中/低

请以JSON格式返回结果，包含cause、suggestion、priority字段。
```

### 流式输出

系统支持流式响应展示：

- 前端使用 `fetch` + `ReadableStream` 处理SSE
- 实时显示AI分析进度
- 完成后合并完整结果

### 模拟响应

当未配置API Key时，系统会模拟AI分析过程：

1. 逐步显示分析步骤
2. 生成合理的问题归因
3. 提供可行的处置建议
4. 智能评估优先级

## 数据结构

### 城市事件 (CityEvent)

```typescript
interface CityEvent {
  id: string;                    // 事件ID
  type: string;                  // 事件类型
  description: string;           // 事件描述
  location: {                    // 位置信息
    district: string;            // 行政区
    street: string;              // 街道
    lat: number;                 // 纬度
    lng: number;                 // 经度
  };
  reportTime: string;            // 上报时间
  reporterType: string;          // 上报类型
  status: '未处理' | '处理中' | '已派单' | '紧急' | '核查中';
}
```

### 传感器数据 (SensorData)

```typescript
interface SensorData {
  sensorId: string;              // 传感器ID
  type: string;                  // 传感器类型
  location: {                    // 位置信息
    district: string;
    street: string;
    lat: number;
    lng: number;
  };
  value: number;                 // 测量值
  unit: string;                  // 单位
  threshold: number;             // 阈值
  timestamp: string;             // 采集时间
  status: '正常' | '异常';
}
```

## Mock数据说明

项目包含两个Mock数据文件：

- `city_events.json` - 100条城市事件（7天时间范围）
- `sensor_data.json` - 100条传感器数据（7天时间范围）

数据涵盖：
- **6个行政区**：朝阳区、海淀区、东城区、西城区、丰台区、石景山
- **8种事件类型**：道路积水、路灯故障、占道经营、井盖缺失、噪音扰民、垃圾堆积、违停车辆、树倒折枝
- **6种传感器**：积水监测、路灯电流、PM2.5监测、井盖位移、环境噪音、空气质量

## 性能优化

- **代码分割**：路由懒加载
- **图表优化**：ECharts按需渲染
- **状态管理**：Pinia轻量级状态管理
- **TypeScript**：完整类型定义，避免运行时错误

## 技术亮点

1. **Vue 3 Composition API**：现代化开发模式
2. **TypeScript全覆盖**：类型安全
3. **模块化架构**：清晰的代码组织
4. **响应式设计**：Element Plus组件库
5. **ECharts可视化**：专业图表展示
6. **流式AI输出**：实时分析展示
7. **智能预警系统**：自动化检测机制

## 开发计划

- [ ] 单元测试添加
- [ ] E2E测试集成
- [ ] WebSocket实时通信
- [ ] 移动端适配优化
- [ ] 性能监控集成
- [ ] 国际化支持

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请通过 GitHub Issues 联系我们。
