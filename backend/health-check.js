const http = require('http');

const options = {
    host: 'localhost',
    port: process.env.PORT || 3000,
    path: '/health',
    timeout: 5000  // 增加超时时间
};

const request = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.success && result.database === 'connected') {
                console.log('✅ 健康检查通过');
                process.exit(0);
            } else {
                console.log('❌ 健康检查失败:', result.message);
                process.exit(1);
            }
        } catch (e) {
            console.log('❌ 健康检查响应解析失败');
            process.exit(1);
        }
    });
});

request.on('error', (err) => {
    console.log('❌ 健康检查请求错误:', err.message);
    process.exit(1);
});

request.on('timeout', () => {
    console.log('❌ 健康检查超时');
    request.destroy();
    process.exit(1);
});

request.end();