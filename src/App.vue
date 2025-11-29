<template>
  <div class="smart-city-app">
    <!-- 科技风背景装饰 -->
    <div class="background-effects">
      <div class="bg-gradient bg-gradient-1"></div>
      <div class="bg-gradient bg-gradient-2"></div>
      <div class="bg-gradient bg-gradient-3"></div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo">
            <div class="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
              </svg>
            </div>
            <div class="logo-text">
              <h1>智慧城市运营管理系统</h1>
              <p>Smart City Operations Management Platform</p>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="system-status">
            <span class="status-dot"></span>
            <span>系统运行正常</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="app-main">
      <div class="container">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.smart-city-app {
  min-height: 100vh;
  position: relative;
  background: var(--background);
}

/* 背景装饰效果 */
.background-effects {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}

.bg-gradient-1 {
  top: -10%;
  left: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%);
}

.bg-gradient-2 {
  bottom: -10%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
}

.bg-gradient-3 {
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
}

/* 顶部导航栏 */
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-primary);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.header-content {
  max-width: 1920px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--glow-primary);
}

.logo-text h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  margin-bottom: 2px;
  letter-spacing: 0.5px;
}

.logo-text p {
  font-size: 12px;
  color: var(--primary-color);
  margin: 0;
  letter-spacing: 0.3px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  font-size: 14px;
  color: #10b981;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 主要内容区 */
.app-main {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 100px);
}

.dashboard-view .app-main {
  min-height: auto;
  height: calc(100vh - 100px);
}

.dashboard-view .container {
  padding: 0;
  max-width: 100%;
}

.container {
  max-width: 1920px;
  margin: 0 auto;
  padding: 2rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
  }

  .logo-text h1 {
    font-size: 16px;
  }

  .logo-text p {
    font-size: 10px;
  }

  .system-status {
    font-size: 12px;
    padding: 0.25rem 0.75rem;
  }

  .container {
    padding: 1rem;
  }
}
</style>
