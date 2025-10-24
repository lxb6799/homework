Write-Host "=== 后端服务诊断 ===" -ForegroundColor Green

Write-Host "1. 容器状态:" -ForegroundColor Yellow
docker-compose ps -a

Write-Host "2. 后端日志:" -ForegroundColor Yellow
docker-compose logs backend --tail=20

Write-Host "3. 容器内网络测试:" -ForegroundColor Yellow
docker-compose exec backend curl http://localhost:3000/health

Write-Host "4. 端口映射检查:" -ForegroundColor Yellow
docker port todocloud-backend-1

Write-Host "5. 主机端口检查:" -ForegroundColor Yellow
netstat -ano | findstr ":3000"

Write-Host "6. 重建建议:" -ForegroundColor Yellow
Write-Host "运行以下命令重建服务:"
Write-Host "docker-compose down"
Write-Host "docker-compose build --no-cache"
Write-Host "docker-compose up"