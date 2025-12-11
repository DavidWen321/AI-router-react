# AIClaude Frontend - 一键部署指南

## 🚀 MobaXterm 部署步骤（推荐）

### 第一步：准备文件

将以下文件打包上传到服务器：
- `Dockerfile`
- `docker-compose.yml`
- `nginx.conf`
- `deploy.sh`
- `.dockerignore`
- 整个项目源代码

### 第二步：使用 MobaXterm 上传

1. 打开 MobaXterm
2. 连接到您的服务器（SSH）
3. 在左侧文件浏览器中，导航到 `/root/`
4. 拖拽整个 `aiclaude-react` 文件夹到 MobaXterm 窗口
5. 等待上传完成

### 第三步：执行部署脚本

在 MobaXterm 的终端中输入：

```bash
cd /root/aiclaude-react
chmod +x deploy.sh
./deploy.sh
```

### 第四步：配置DNS

脚本运行后会显示您的服务器 IP，在域名注册商处添加 DNS 记录：

**A 记录：**
```
主机记录: @
记录类型: A
记录值: [您的服务器IP]
```

**CNAME 记录：**
```
主机记录: www
记录类型: CNAME
记录值: aiclaude.online
```

### 第五步：访问网站

等待 5-10 分钟后，访问：
- http://aiclaude.online

## 📋 快速命令参考

### 查看状态
```bash
docker-compose ps
```

### 查看日志
```bash
docker-compose logs -f
```

### 重启服务
```bash
docker-compose restart
```

### 停止服务
```bash
docker-compose stop
```

### 更新部署
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔒 启用 HTTPS（推荐）

### 快速获取 SSL 证书

```bash
# 1. 停止 Nginx
docker-compose stop nginx

# 2. 安装并运行 Certbot
sudo apt install certbot -y
sudo certbot certonly --standalone -d aiclaude.online -d www.aiclaude.online

# 3. 复制证书
sudo cp /etc/letsencrypt/live/aiclaude.online/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/aiclaude.online/privkey.pem ./ssl/
sudo chmod 644 ./ssl/*.pem

# 4. 编辑配置文件，启用 HTTPS
nano nginx.conf
# 找到 HTTPS server 部分，删除所有 # 注释符号

# 5. 重启服务
docker-compose up -d
```

完成后访问：https://aiclaude.online

## ❓ 常见问题

### 1. 无法访问网站？
```bash
# 检查防火墙
sudo ufw allow 80
sudo ufw allow 443

# 检查容器状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 2. DNS 未生效？
```bash
# 测试 DNS
ping aiclaude.online

# 清除本地 DNS 缓存
# Windows: ipconfig /flushdns
# Mac: sudo dscacheutil -flushcache
# Linux: sudo systemd-resolve --flush-caches
```

### 3. 构建失败？
```bash
# 清理并重试
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

## 📞 获取帮助

详细文档请查看：[DEPLOYMENT.md](./DEPLOYMENT.md)

## ✅ 部署完成检查清单

- [ ] Docker 和 Docker Compose 已安装
- [ ] 文件已上传到服务器
- [ ] deploy.sh 已执行成功
- [ ] DNS 已配置并生效
- [ ] 网站可以通过域名访问
- [ ] SSL 证书已配置（可选）
- [ ] HTTPS 访问正常（可选）

🎉 恭喜！您的 AIClaude 前端已成功部署！
