<template>
  <div class="todo-footer" v-if="list.length">
    <div class="footer-content">
      <div class="footer-section">
        <div class="status-info">
          <span class="items-left">
            {{ activeCount }} 项待完成
          </span>
          <div class="completion-info" v-if="completedCount > 0">
            <span class="completion-text">
              已完成 {{ completedCount }} 项 ({{ completionRate }}%)
            </span>
          </div>
        </div>
      </div>

      <div class="footer-section">
        <div class="filter-buttons">
          <button
              v-for="filter in filters"
              :key="filter.key"
              :class="{ active: currentFilter === filter.key }"
              @click="setFilter(filter.key)"
              class="filter-btn"
              :disabled="loading"
          >
            <span class="filter-icon" v-html="filter.icon"></span>
            {{ filter.label }}
            <span class="filter-count" v-if="filter.count > 0">
              {{ filter.count }}
            </span>
          </button>
        </div>
      </div>

      <div class="footer-section">
        <button
            class="clear-completed"
            @click="clearCompleted"
            :disabled="completedCount === 0 || loading"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          清除已完成
        </button>
      </div>
    </div>

    <!-- 云原生特性展示 -->
    <div class="cloud-features" v-if="showCloudFeatures">
      <div class="features-title">云原生特性</div>
      <div class="features-grid">
        <div class="feature-item">
          <span class="feature-icon">🐳</span>
          <span class="feature-text">Docker 容器化</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">⚓</span>
          <span class="feature-text">Kubernetes 编排</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📊</span>
          <span class="feature-text">自动扩缩容</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🔒</span>
          <span class="feature-text">服务发现</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { computed, defineProps } from 'vue'
//
// const props = defineProps({
//   list: {
//     type: Array,
//     required: true,
//   },
//   filter: {
//     type: String,
//     default: 'all'
//   },
//   loading: {
//     type: Boolean,
//     default: false
//   }
// })
//
// const emit = defineEmits(['clear-completed', 'set-filter'])
//
// // 云原生特性展示（生产环境显示）
// const showCloudFeatures = computed(() => {
//   return process.env.NODE_ENV === 'production';
// })

import { computed, defineProps } from 'vue'

const props = defineProps({
  list: {
    type: Array,
    required: true,
  },
  filter: {
    type: String,
    default: 'all'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['clear-completed', 'set-filter'])

// 云原生特性展示（生产环境显示）
const showCloudFeatures = computed(() => {
  return import.meta.env.MODE === 'production';
})

// 过滤器选项
const filters = computed(() => [
  {
    key: 'all',
    label: '全部',
    icon: '📋',
    count: props.list.length
  },
  {
    key: 'active',
    label: '待完成',
    icon: '⏳',
    count: props.list.filter(item => !item.done).length
  },
  {
    key: 'completed',
    label: '已完成',
    icon: '✅',
    count: props.list.filter(item => item.done).length
  }
])

const currentFilter = computed(() => props.filter)

// 计算活动任务数量
const activeCount = computed(() => {
  return props.list.filter(item => !item.done).length
})

// 计算已完成任务数量
const completedCount = computed(() => {
  return props.list.filter(item => item.done).length
})

// 计算完成率
const completionRate = computed(() => {
  return props.list.length > 0 ? Math.round((completedCount.value / props.list.length) * 100) : 0
})

const clearCompleted = () => {
  if (!props.loading) {
    emit('clear-completed')
  }
}

const setFilter = (filter) => {
  if (!props.loading) {
    emit('set-filter', filter)
  }
}
</script>

<style scoped>
.todo-footer {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-top: 1px solid #dee2e6;
  color: #6c757d;
  font-size: 14px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.items-left {
  font-weight: 600;
  color: #495057;
  font-size: 15px;
}

.completion-info {
  font-size: 13px;
}

.completion-text {
  color: #28a745;
  background: rgba(40, 167, 69, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  background: white;
  padding: 4px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #6c757d;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
}

.filter-btn:hover:not(:disabled) {
  color: #6a11cb;
  background: rgba(106, 17, 203, 0.05);
}

.filter-btn.active {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(106, 17, 203, 0.3);
}

.filter-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-icon {
  font-size: 16px;
}

.filter-count {
  background: rgba(0, 0, 0, 0.1);
  color: inherit;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.2);
}

.clear-completed {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;
}

.clear-completed:hover:not(:disabled) {
  background-color: #dc3545;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.clear-completed:disabled {
  border-color: #adb5bd;
  color: #adb5bd;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 云原生特性展示 */
.cloud-features {
  border-top: 1px solid #dee2e6;
  padding-top: 16px;
  margin-top: 16px;
}

.features-title {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: white;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 20px;
}

.feature-text {
  font-size: 11px;
  color: #495057;
  text-align: center;
  line-height: 1.2;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .footer-content {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .todo-footer {
    padding: 16px 20px;
  }

  .footer-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .footer-section {
    align-items: center;
  }

  .filter-buttons {
    width: 100%;
    justify-content: center;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .todo-footer {
    padding: 12px 16px;
  }

  .filter-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .filter-btn {
    justify-content: center;
  }

  .clear-completed {
    width: 100%;
    justify-content: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>