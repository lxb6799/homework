# 构建阶段
FROM node:18-alpine as build-stage

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine as production-stage

# 复制构建好的文件
COPY --from=build-stage /app/dist /usr/share/nginx/html
# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]