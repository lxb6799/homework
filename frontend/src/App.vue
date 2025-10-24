<template>
  <div id="app">
    <div class="app-container">
      <header class="app-header">
        <h1 class="app-title">云原生待办事项</h1>
        <p class="app-subtitle">基于 Docker + Kubernetes 的现代化应用</p>
        <div class="environment-badge" v-if="environment">
          {{ environment }}
        </div>
      </header>

      <ToDoHeader
          @add-todo="addTodo"
          @search-todo="handleSearch"
          :loading="loading"
      />

      <ToDoMain
          :list="filteredList"
          :loading="loading"
          @del-todo="deleteTodo"
          @toggle-todo="toggleTodo"
          @edit-todo="editTodo"
          @toggle-all="toggleAllTodos"
      />

      <ToDoFooter
          :list="todoList"
          :filter="currentFilter"
          :loading="loading"
          @clear-completed="clearCompleted"
          @set-filter="setFilter"
      />

      <!-- 加载状态 -->
      <div v-if="loading" class="global-loading">
        <div class="loading-spinner"></div>
        <span>与云端同步中...</span>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        <div class="error-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ error }}</span>
        </div>
        <button @click="dismissError" class="dismiss-btn">×</button>
      </div>

      <!-- 连接状态指示器 -->
      <div class="connection-status" :class="{ online: isOnline, offline: !isOnline }">
        <div class="status-dot"></div>
        <span>{{ isOnline ? '在线' : '离线' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { ref, computed, onMounted, onUnmounted } from 'vue'
// import ToDoHeader from './components/ToDoHeader.vue'
// import ToDoMain from './components/ToDoMain.vue'
// import ToDoFooter from './components/ToDoFooter.vue'
//
// // 根据环境配置 API 地址
// const getApiBaseUrl = () => {
//   if (import.meta.env.VUE_APP_API_URL) {
//     return import.meta.env.VUE_APP_API_URL;
//   }
//
//
//   // 开发环境使用相对路径，生产环境使用服务发现
//   if (process.env.NODE_ENV === 'development') {
//     return 'http://localhost:3000/api';
//   } else {
//     return '/api'; // Kubernetes Ingress 会处理路由
//   }
// };

import { ref, computed, onMounted, onUnmounted } from 'vue'
import ToDoHeader from './components/ToDoHeader.vue'
import ToDoMain from './components/ToDoMain.vue'
import ToDoFooter from './components/ToDoFooter.vue'

// 根据环境配置 API 地址
const getApiBaseUrl = () => {
  // 优先使用环境变量
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 开发环境使用 localhost，生产环境使用相对路径
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:3000/api';
  } else {
    return '/api'; // Kubernetes Ingress 会处理路由
  }
};

const API_BASE_URL = getApiBaseUrl();
const environment = ref(process.env.NODE_ENV || 'development');

// 过滤器类型
const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed'
}

const todoList = ref([])
const currentFilter = ref(FILTERS.ALL)
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const isOnline = ref(navigator.onLine)

// 网络状态监听
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
  if (!isOnline.value) {
    error.value = '网络连接已断开，请检查网络连接';
  } else {
    if (error.value === '网络连接已断开，请检查网络连接') {
      error.value = '';
      loadTodos(); // 重新连接时刷新数据
    }
  }
}

// 过滤后的任务列表（包括搜索过滤）
const filteredList = computed(() => {
  let filtered = todoList.value

  // 首先应用搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  // 然后应用状态过滤
  switch (currentFilter.value) {
    case FILTERS.ACTIVE:
      return filtered.filter(item => !item.done)
    case FILTERS.COMPLETED:
      return filtered.filter(item => item.done)
    default:
      return filtered
  }
})

// API调用函数
const apiCall = async (url, options = {}) => {
  // 离线时拒绝请求
  if (!isOnline.value && !url.includes('/health')) {
    throw new Error('网络连接已断开，请检查网络连接');
  }

  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '请求失败' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json()
    return data
  } catch (err) {
    error.value = err.message
    console.error('API调用错误:', err)
    throw err
  } finally {
    loading.value = false
  }
}

// 健康检查
const healthCheck = async () => {
  try {
    const data = await apiCall('/health')
    console.log('后端服务状态:', data.status)
    return data.status === 'healthy'
  } catch (err) {
    console.warn('健康检查失败:', err.message)
    return false
  }
}

// 加载所有任务
const loadTodos = async () => {
  try {
    const data = await apiCall('/todos')
    todoList.value = data.data
  } catch (err) {
    // 错误已在apiCall中处理
  }
}

// 添加新任务
const addTodo = async (name) => {
  if (!name.trim()) return

  try {
    const data = await apiCall('/todos', {
      method: 'POST',
      body: JSON.stringify({ name })
    })

    todoList.value.unshift(data.data)
  } catch (err) {
    // 错误已在apiCall中处理
  }
}

// 删除任务
const deleteTodo = async (id) => {
  try {
    await apiCall(`/todos/${id}`, {
      method: 'DELETE'
    })

    todoList.value = todoList.value.filter(item => item.id !== id)
  } catch (err) {
    // 错误已在apiCall中处理
  }
}

// 切换任务状态
const toggleTodo = async (id) => {
  const todo = todoList.value.find(item => item.id === id)
  if (!todo) return

  try {
    const data = await apiCall(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ done: !todo.done })
    })

    // 更新本地状态
    const index = todoList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      todoList.value[index] = data.data
    }
  } catch (err) {
    // 错误已在apiCall中处理
  }
}

// 编辑任务
const editTodo = async (id, newName) => {
  if (!newName.trim()) return

  try {
    const data = await apiCall(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: newName })
    })

    // 更新本地状态
    const index = todoList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      todoList.value[index] = data.data
    }
  } catch (err) {
    // 错误已在apiCall中处理
  }
}

// 切换所有任务状态
const toggleAllTodos = async (completed) => {
  const updatePromises = todoList.value
      .filter(item => item.done !== completed)
      .map(item =>
          apiCall(`/todos/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({ done: completed })
          })
      )

  try {
    await Promise.all(updatePromises)
    await loadTodos() // 重新加载确保状态一致
  } catch (err) {
    // 错误已在apiCall中处理
  }
}

// 清除已完成任务
const clearCompleted = async () => {
  try {
    await apiCall('/todos', {
      method: 'DELETE'
    })

    // 从列表中移除已完成的任务
    todoList.value = todoList.value.filter(item => !item.done)
  } catch (err) {
    // 错误已在apiCall中处理
  }
}

// 设置过滤器
const setFilter = (filter) => {
  currentFilter.value = filter
}

// 处理搜索
const handleSearch = (query) => {
  searchQuery.value = query
}

// 清除错误信息
const dismissError = () => {
  error.value = ''
}

// 组件挂载时加载数据
onMounted(async () => {
  // 添加网络状态监听
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // 初始健康检查
  const isHealthy = await healthCheck();
  if (!isHealthy) {
    error.value = '后端服务暂时不可用，请稍后重试';
  }

  // 加载任务数据
  await loadTodos();

  // 定期健康检查（每30秒）
  const healthCheckInterval = setInterval(healthCheck, 30000);

  // 组件卸载时清理
  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
    clearInterval(healthCheckInterval);
  });
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
  color: #333;
}

#app {
  max-width: 800px;
  margin: 0 auto;
}

.app-container {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  position: relative;
}

.app-header {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 40px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.app-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: float 20s linear infinite;
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(-20px, -20px) rotate(360deg); }
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
}

.app-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
  position: relative;
  margin-bottom: 12px;
}

.environment-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.global-loading {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 18px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #f8d7da;
  color: #721c24;
  padding: 14px 20px;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  z-index: 1000;
  max-width: 450px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dismiss-btn {
  background: none;
  border: none;
  color: #721c24;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.dismiss-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.connection-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  transition: all 0.3s ease;
}

.connection-status.online {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.connection-status.offline {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.connection-status.online .status-dot {
  background: #28a745;
  animation: pulse 2s infinite;
}

.connection-status.offline .status-dot {
  background: #dc3545;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  body {
    padding: 10px;
  }

  .app-title {
    font-size: 2rem;
  }

  .app-header {
    padding: 30px 20px;
  }

  .error-message {
    max-width: 90%;
    left: 5%;
    transform: none;
  }

  .connection-status {
    bottom: 10px;
    right: 10px;
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 1.8rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }
}
</style>