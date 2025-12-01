# Netlify部署MIME类型问题修复指南

## 问题描述
错误：`Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/vnd.trolltech.linguist"`

## 已实施的修复

### 1. MIME类型配置文件
- 更新了 `netlify.toml` - 完整的MIME类型配置
- 更新了 `_headers` - 额外的MIME类型保障
- 在 `dist` 目录中放置了 `_headers` 文件作为最终保障

### 2. Vite配置优化
- 移除了 `format: 'es'` 设置
- 添加了 ES2020 目标版本
- 确保模块兼容性

### 3. 数据文件修复
- 将 `city_events.json` 和 `sensor_data.json` 复制到 `public` 目录
- 修改fetch路径从 `/` 改为 `./`

## 如果问题仍然存在，请尝试：

### 方案1：强制清除Netlify缓存
1. 登录 Netlify 控制台
2. 进入您的站点设置
3. 在 "Build & deploy" > "Deploy log" 中点击 "Clear cache and force deploy"

### 方案2：手动强制MIME类型
在 Netlify 站点设置 > "Domain management" > "Headers" 中添加：
```
/assets/js/*
  Content-Type: application/javascript; charset=utf-8

/*.*
  Content-Type: application/octet-stream
```

### 方案3：检查浏览器缓存
1. 打开开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

### 方案4：临时禁用ES模块
将 `index.html` 中的脚本标签改为：
```html
<script crossorigin src="./assets/js/index-DXtis9QS.js"></script>
```

## 验证修复
1. 部署完成后，打开开发者工具的 Network 标签
2. 刷新页面，检查 JavaScript 文件的 Response Headers
3. 确认 `Content-Type` 为 `application/javascript; charset=utf-8`

如果仍然有问题，请提供 Netlify 部署日志。