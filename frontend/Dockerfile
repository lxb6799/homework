FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# 复制构建脚本并设置权限
COPY build.sh ./
RUN chmod +x build.sh

COPY . .

# 使用脚本构建
RUN ./build.sh

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]