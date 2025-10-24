Write-Host "=== 最终修复 ===" -ForegroundColor Green

Write-Host "停止服务..." -ForegroundColor Yellow
docker-compose down

Write-Host "删除旧镜像..." -ForegroundColor Yellow
docker rmi todocloud-backend todocloud-frontend -f 2>$null

Write-Host "重建服务..." -ForegroundColor Yellow
docker-compose build --no-cache

Write-Host "启动服务..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "等待启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "检查服务状态:" -ForegroundColor Yellow
docker-compose ps

Write-Host "测试后端API:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 5
    Write-Host "✅ 后端服务正常: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ 后端服务异常: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "测试前端:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5
    Write-Host "✅ 前端服务正常 (状态码: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ 前端服务异常: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "修复完成！" -ForegroundColor Green