<template>
  <div class="todo-main">
    <!-- 统计信息 -->
    <div class="todo-stats" v-if="list.length">
      <div class="stats-content">
        <div class="stat-item">
          <span class="stat-label">总计</span>
          <span class="stat-value">{{ list.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已完成</span>
          <span class="stat-value completed">{{ completedCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">待完成</span>
          <span class="stat-value active">{{ activeCount }}</span>
        </div>
      </div>
      <div class="progress-section">
        <div class="progress-info">
          <span>完成进度</span>
          <span class="progress-percent">{{ completionRate }}%</span>
        </div>
        <div class="progress-bar">
          <div
              class="progress-fill"
              :style="{ width: completionRate + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!list.length && !loading">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 class="empty-title">暂无任务</h3>
      <p class="empty-text">添加一些任务开始你的计划吧！</p>
    </div>

    <!-- 加载状态 -->
    <div class="loading-state" v-if="loading && !list.length">
      <div class="loading-spinner"></div>
      <p>正在从云端加载任务...</p>
    </div>

    <!-- 任务列表 -->
    <div class="todo-list-container" v-else-if="list.length">
      <div class="list-header">
        <h3 class="list-title">
          任务列表
          <span class="list-count">({{ list.length }})</span>
        </h3>
        <button
            v-if="activeCount > 0"
            @click="toggleAllActive"
            class="toggle-all-btn"
            :disabled="loading"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          标记全部完成
        </button>
      </div>

      <ul class="todo-list">
        <li
            v-for="item in list"
            :key="item.id"
            :class="{
            completed: item.done,
            editing: editingItem === item.id
          }"
            class="todo-item"
        >
          <div class="view" v-if="editingItem !== item.id">
            <!-- 复选框 -->
            <div class="checkbox-container">
              <input
                  class="toggle"
                  type="checkbox"
                  :id="'todo-' + item.id"
                  :checked="item.done"
                  @change="toggleTodo(item.id)"
                  :disabled="loading"
              />
              <label :for="'todo-' + item.id" class="custom-checkbox">
                <transition name="checkmark">
                  <svg v-if="item.done" class="checkmark" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </transition>
              </label>
            </div>

            <!-- 任务内容 -->
            <div class="task-content" @dblclick="startEditing(item)">
              <div class="task-main">
                <label class="todo-label">{{ item.name }}</label>
                <div class="task-meta">
                  <span v-if="item.priority && item.priority !== 'medium'"
                        :class="['priority-tag', item.priority]">
                    {{ getPriorityText(item.priority) }}
                  </span>
                  <span v-if="item.category && item.category !== 'general'"
                        class="category-tag">
                    {{ item.category }}
                  </span>
                </div>
              </div>
              <div class="task-details" v-if="item.description || item.dueDate || item.tags">
                <p class="task-description" v-if="item.description">
                  {{ item.description }}
                </p>
                <div class="task-tags" v-if="item.tags && item.tags.length">
                  <span v-for="tag in item.tags" :key="tag" class="tag">
                    {{ tag }}
                  </span>
                </div>
                <div class="task-footer" v-if="item.dueDate">
                  <span class="task-due">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {{ formatDueDate(item.dueDate) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="task-actions">
              <button
                  class="edit-btn"
                  @click="startEditing(item)"
                  title="编辑任务"
                  :disabled="loading"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button
                  class="destroy"
                  @click="delTodo(item.id)"
                  title="删除任务"
                  :disabled="loading"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- 编辑模式 -->
          <div class="edit-view" v-else>
            <input
                ref="editInput"
                v-model="editText"
                @keyup.enter="saveEdit(item.id)"
                @keyup.esc="cancelEdit"
                @blur="saveEdit(item.id)"
                type="text"
                class="edit-input"
            />
            <div class="edit-actions">
              <button @click="saveEdit(item.id)" class="save-btn" :disabled="loading">保存</button>
              <button @click="cancelEdit" class="cancel-btn" :disabled="loading">取消</button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, defineProps } from 'vue'

const props = defineProps({
  list: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['del-todo', 'toggle-todo', 'edit-todo', 'toggle-all'])

const editingItem = ref(null)
const editText = ref('')
const editInput = ref(null)

// 计算属性
const completedCount = computed(() => {
  return props.list.filter(item => item.done).length
})

const activeCount = computed(() => {
  return props.list.filter(item => !item.done).length
})

const completionRate = computed(() => {
  return props.list.length > 0 ? Math.round((completedCount.value / props.list.length) * 100) : 0
})

// 方法
const delTodo = (id) => {
  if (!props.loading) {
    id && emit('del-todo', id)
  }
}

const toggleTodo = (id) => {
  if (!props.loading) {
    id && emit('toggle-todo', id)
  }
}

const startEditing = (item) => {
  if (!props.loading) {
    editingItem.value = item.id
    editText.value = item.name
    nextTick(() => {
      if (editInput.value) {
        editInput.value.focus()
        editInput.value.select()
      }
    })
  }
}

const saveEdit = (id) => {
  if (editText.value.trim() && !props.loading) {
    emit('edit-todo', id, editText.value.trim())
  }
  editingItem.value = null
  editText.value = ''
}

const cancelEdit = () => {
  editingItem.value = null
  editText.value = ''
}

const toggleAllActive = () => {
  if (!props.loading) {
    emit('toggle-all', true)
  }
}

const formatDueDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays === -1) return '昨天'
  if (diffDays < 0) return `${Math.abs(diffDays)}天前`
  if (diffDays > 0) return `${diffDays}天后`

  return date.toLocaleDateString('zh-CN')
}

const getPriorityText = (priority) => {
  const priorityMap = {
    'low': '低优先级',
    'medium': '中优先级',
    'high': '高优先级'
  }
  return priorityMap[priority] || priority
}
</script>

<style scoped>
.todo-main {
  min-height: 400px;
}

/* 统计信息 */
.todo-stats {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.stats-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #495057;
}

.stat-value.completed {
  color: #28a745;
}

.stat-value.active {
  color: #6a11cb;
}

.progress-section {
  margin-top: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #6c757d;
}

.progress-percent {
  font-weight: 600;
  color: #6a11cb;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* 空状态和加载状态 */
.empty-state {
  padding: 80px 20px;
  text-align: center;
  color: #6c757d;
}

.empty-icon {
  margin-bottom: 24px;
  color: #dee2e6;
}

.empty-title {
  font-size: 1.5rem;
  margin-bottom: 12px;
  color: #495057;
  font-weight: 600;
}

.empty-text {
  font-size: 1rem;
  opacity: 0.8;
}

.loading-state {
  padding: 80px 20px;
  text-align: center;
  color: #6c757d;
}

.loading-state .loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6a11cb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

/* 列表容器 */
.todo-list-container {
  padding: 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eaeaea;
  background: white;
}

.list-title {
  font-size: 1.25rem;
  color: #495057;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-count {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: normal;
}

.toggle-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #6a11cb;
  color: #6a11cb;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.toggle-all-btn:hover:not(:disabled) {
  background: #6a11cb;
  color: white;
}

.toggle-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 任务列表 */
.todo-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.todo-item {
  position: relative;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f8f9fa;
  background: white;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.todo-item.completed {
  opacity: 0.8;
  background: #f8f9fa;
}

.todo-item.completed .todo-label {
  color: #adb5bd;
  text-decoration: line-through;
}

.todo-item.completed .task-description,
.todo-item.completed .priority-tag,
.todo-item.completed .category-tag {
  opacity: 0.6;
}

.todo-item.editing {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

/* 视图模式 */
.view {
  display: flex;
  align-items: flex-start;
  padding: 20px 24px;
  gap: 16px;
}

.checkbox-container {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.toggle {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 2px solid #dee2e6;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: white;
  flex-shrink: 0;
}

.custom-checkbox:hover:not(:has(.toggle:disabled)) {
  border-color: #6a11cb;
  transform: scale(1.1);
}

.toggle:checked + .custom-checkbox {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border-color: transparent;
  animation: bounce 0.4s ease;
}

.toggle:disabled + .custom-checkbox {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.checkmark-enter-active,
.checkmark-leave-active {
  transition: all 0.3s ease;
}

.checkmark-enter-from,
.checkmark-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.task-content {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.task-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.todo-label {
  display: block;
  font-size: 16px;
  color: #495057;
  transition: all 0.3s ease;
  word-break: break-word;
  line-height: 1.5;
  flex: 1;
}

.task-meta {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.priority-tag, .category-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-tag.high {
  background: #f8d7da;
  color: #721c24;
}

.priority-tag.medium {
  background: #fff3cd;
  color: #856404;
}

.priority-tag.low {
  background: #d1ecf1;
  color: #0c5460;
}

.category-tag {
  background: #e2e3e5;
  color: #383d41;
}

.task-details {
  margin-top: 8px;
}

.task-description {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.4;
  margin-bottom: 8px;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.tag {
  background: #e9ecef;
  color: #495057;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.task-footer {
  display: flex;
  align-items: center;
  gap: 6px;
}

.task-due {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.todo-item:hover .task-actions {
  opacity: 1;
}

.edit-btn, .destroy {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover:not(:disabled) {
  color: #6a11cb;
  background: rgba(106, 17, 203, 0.1);
}

.destroy:hover:not(:disabled) {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.edit-btn:disabled, .destroy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 编辑模式 */
.edit-view {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  gap: 12px;
}

.edit-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #6a11cb;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  font-family: inherit;
}

.edit-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.1);
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.save-btn, .cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.save-btn {
  background: #28a745;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #218838;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background: #5a6268;
}

.save-btn:disabled, .cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .todo-stats {
    padding: 16px 20px;
  }

  .stats-content {
    flex-direction: column;
    gap: 16px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-value {
    font-size: 20px;
  }

  .view {
    padding: 16px 20px;
    gap: 12px;
  }

  .edit-view {
    padding: 12px 20px;
  }

  .task-actions {
    opacity: 1;
  }

  .list-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .task-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .task-meta {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .todo-stats {
    padding: 12px 16px;
  }

  .view {
    padding: 14px 16px;
  }

  .edit-view {
    padding: 10px 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .edit-actions {
    justify-content: flex-end;
  }
}
</style>