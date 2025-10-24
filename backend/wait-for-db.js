const { Sequelize } = require('sequelize');

async function waitForDatabase() {
    const sequelize = new Sequelize(
        process.env.DB_NAME || 'todoapp',
        process.env.DB_USER || 'root',
        process.env.DB_PASS || 'password',
        {
            host: process.env.DB_HOST || 'mysql',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false,
            retry: {
                max: 10,
                timeout: 30000
            }
        }
    );

    let connected = false;
    let attempts = 0;
    const maxAttempts = 30; // 最多尝试30次

    while (!connected && attempts < maxAttempts) {
        try {
            await sequelize.authenticate();
            connected = true;
            console.log('✅ 数据库连接成功');
        } catch (error) {
            attempts++;
            console.log(`⏳ 等待数据库连接... (${attempts}/${maxAttempts})`);
            if (attempts >= maxAttempts) {
                console.log('❌ 数据库连接超时，继续启动应用...');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    await sequelize.close();
}

if (require.main === module) {
    waitForDatabase().catch(console.error);
}

module.exports = waitForDatabase;