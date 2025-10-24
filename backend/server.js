const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 限制每个IP每15分钟最多100个请求
});
app.use(limiter);

// 内存存储
let todos = [
    {
        id: 1,
        name: '学习Vue 3',
        done: false,
        description: '深入学习Vue 3的Composition API',
        priority: 'high',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        id: 2,
        name: '完成项目部署',
        done: true,
        description: '将项目部署到生产环境',
        priority: 'medium',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
    },
    {
        id: 3,
        name: '准备演示文稿',
        done: false,
        description: '为项目演示准备PPT',
        priority: 'low',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03')
    }
];
let nextId = 4;

// API 路由
app.get('/api/todos', (req, res) => {
    const { search } = req.query;

    let filteredTodos = todos;

    // 搜索功能
    if (search) {
        const query = search.toLowerCase();
        filteredTodos = todos.filter(todo =>
            todo.name.toLowerCase().includes(query) ||
            (todo.description && todo.description.toLowerCase().includes(query))
        );
    }

    res.json({
        success: true,
        data: filteredTodos,
        count: filteredTodos.length
    });
});

app.post('/api/todos', (req, res) => {
    const { name, description, priority } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Todo名称不能为空'
        });
    }

    const newTodo = {
        id: nextId++,
        name: name.trim(),
        description: description?.trim() || '',
        priority: priority || 'medium',
        done: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    todos.unshift(newTodo);

    res.status(201).json({
        success: true,
        message: 'Todo项创建成功',
        data: newTodo
    });
});

app.put('/api/todos/:id', (req, res) => {
    const { name, done, description, priority } = req.body;
    const id = parseInt(req.params.id);

    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Todo项未找到'
        });
    }

    if (name !== undefined) todos[todoIndex].name = name.trim();
    if (done !== undefined) todos[todoIndex].done = done;
    if (description !== undefined) todos[todoIndex].description = description?.trim() || '';
    if (priority !== undefined) todos[todoIndex].priority = priority;

    todos[todoIndex].updatedAt = new Date();

    res.json({
        success: true,
        message: 'Todo项更新成功',
        data: todos[todoIndex]
    });
});

app.delete('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex(todo => todo.id === id);

    if (todoIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Todo项未找到'
        });
    }

    const deletedTodo = todos.splice(todoIndex, 1)[0];

    res.json({
        success: true,
        message: 'Todo项删除成功',
        data: deletedTodo
    });
});

// 批量删除已完成
app.delete('/api/todos', (req, res) => {
    const initialLength = todos.length;
    todos = todos.filter(todo => !todo.done);
    const deletedCount = initialLength - todos.length;

    res.json({
        success: true,
        message: `成功删除${deletedCount}个已完成项`,
        deletedCount: deletedCount
    });
});

// 切换所有任务状态
app.put('/api/todos/actions/toggle-all', (req, res) => {
    const { completed } = req.body;

    todos.forEach(todo => {
        todo.done = completed;
        todo.updatedAt = new Date();
    });

    res.json({
        success: true,
        message: `已将所有任务标记为${completed ? '已完成' : '待完成'}`,
        data: todos
    });
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Todo API服务运行正常',
        timestamp: new Date().toISOString(),
        environment: 'development',
        storage: 'memory',
        totalTodos: todos.length
    });
});

// 获取统计信息
app.get('/api/todos/stats', (req, res) => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.done).length;
    const pending = total - completed;

    res.json({
        success: true,
        data: {
            total,
            completed,
            pending,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        }
    });
});

// 根路径
app.get('/', (req, res) => {
    res.json({
        message: 'Todo API Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            todos: '/api/todos',
            stats: '/api/todos/stats'
        }
    });
});

app.set('trust proxy', 1); // 信任第一层代理

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
    console.log(`🌍 环境: development`);
    console.log(`💾 存储: 内存存储`);
    console.log(`📊 初始任务: ${todos.length} 个`);
});

console.log('服务器启动中...');