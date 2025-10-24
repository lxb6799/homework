<template>
  <div class="todo-header">
    <div class="header-content">
      <div class="input-section">
        <div class="input-group">
          <div class="input-wrapper">
            <input
                v-model="newTodo"
                @keyup.enter="addTodo"
                type="text"
                class="todo-input"
                placeholder="添加新任务..."
                maxlength="100"
                :disabled="loading"
            />
            <span class="char-count">{{ newTodo.length }}/100</span>
          </div>
          <button
              class="add-btn"
              @click="addTodo"
              :disabled="!newTodo.trim() || loading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            添加任务
          </button>
        </div>
      </div>

      <div class="search-section">
        <div class="search-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              class="search-input"
              placeholder="搜索任务..."
              :disabled="loading"
          />
          <button
              v-if="searchQuery"
              @click="clearSearch"
              class="clear-search-btn"
              :disabled="loading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const newTodo = ref('')
const searchQuery = ref('')
const emit = defineEmits(['add-todo', 'search-todo'])

const addTodo = () => {
  if (newTodo.value.trim() && !props.loading) {
    emit('add-todo', newTodo.value)
    newTodo.value = ''
  }
}

const handleSearch = () => {
  emit('search-todo', searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search-todo', '')
}
</script>

<style scoped>
.todo-header {
  padding: 24px;
  border-bottom: 1px solid #eaeaea;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-section {
  width: 100%;
}

.input-group {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.todo-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: white;
  font-family: inherit;
}

.todo-input:focus {
  outline: none;
  border-color: #6a11cb;
  box-shadow: 0 0 0 4px rgba(106, 17, 203, 0.1);
  transform: translateY(-1px);
}

.todo-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.char-count {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #6c757d;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  pointer-events: none;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
  padding: 0 24px;
  font-size: 15px;
  font-weight: 500;
  min-width: 120px;
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4);
}

.add-btn:active {
  transform: translateY(0);
}

.add-btn:disabled {
  background: #adb5bd;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  opacity: 0.7;
}

.search-section {
  width: 100%;
  border-top: 1px solid #dee2e6;
  padding-top: 20px;
}

.search-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
  background-color: white;
}

.search-input:focus {
  outline: none;
  border-color: #6a11cb;
  box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.1);
}

.search-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-search-btn:hover:not(:disabled) {
  background: #f8f9fa;
  color: #495057;
}

.clear-search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .todo-header {
    padding: 20px;
  }

  .input-group {
    flex-direction: column;
    gap: 12px;
  }

  .add-btn {
    width: 100%;
    padding: 16px;
  }

  .search-wrapper {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .todo-header {
    padding: 16px;
  }

  .header-content {
    gap: 16px;
  }

  .search-section {
    padding-top: 16px;
  }
}
</style>