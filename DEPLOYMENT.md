# AIClaude Frontend 部署指南

本指南将帮助您使用 Docker 将 AIClaude 前端部署到生产服务器，并通过域名 `aiclaude.online` 访问。

## 📋 前置要求

- Linux 服务器（Ubuntu 20.04+ / CentOS 7+ / Debian 10+）
- Docker 和 Docker Compose 已安装
- 域名 `aiclaude.online` 已购买并指向服务器 IP
- 服务器开放 80 和 443 端口

## 🚀 快速部署

### 1. 上传文件到服务器

使用 MobaXterm、FileZilla 或 scp 将整个 `aiclaude-react` 目录上传到服务器：

```bash
# 方法1: 使用 scp
scp -r aiclaude-react/ root@your-server-ip:/root/

# 方法2: 使用 MobaXterm
# 直接拖拽文件夹到 MobaXterm 的文件浏览器
```

### 2. SSH 登录服务器

```bash
ssh root@your-server-ip
cd /root/aiclaude-react
```

### 3. 给部署脚本添加执行权限

```bash
chmod +x deploy.sh
```

### 4. 运行一键部署脚本

```bash
./deploy.sh
```

脚本会自动完成以下操作：
- ✅ 检查 Docker 环境
- ✅ 创建网络
- ✅ 构建 Docker 镜像
- ✅ 启动前端容器
- ✅ 启动 Nginx 反向代理
- ✅ 健康检查
- ✅ 显示部署结果和后续步骤

### 5. 配置 DNS（重要！）

在您的域名注册商（阿里云、腾讯云、GoDaddy 等）配置 DNS：

#### A 记录（主域名）
- **主机记录**: `@` 或留空
- **记录类型**: `A`
- **记录值**: 您的服务器公网 IP
- **TTL**: `600`（默认）

#### CNAME 记录（www 子域名）
- **主机记录**: `www`
- **记录类型**: `CNAME`
- **记录值**: `aiclaude.online`
- **TTL**: `600`（默认）

等待 5-10 分钟让 DNS 生效。

### 6. 验证部署

```bash
# 本地测试
curl http://localhost

# 域名测试（DNS 生效后）
curl http://aiclaude.online

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f aiclaude-frontend
```

## 🔒 启用 HTTPS（强烈推荐）

### 方法1: 使用 Certbot（推荐）

```bash
# 安装 Certbot
sudo apt update
sudo apt install certbot -y

# 停止 Nginx（避免端口冲突）
docker-compose stop nginx

# 获取证书
sudo certbot certonly --standalone -d aiclaude.online -d www.aiclaude.online

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/aiclaude.online/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/aiclaude.online/privkey.pem ./ssl/
sudo chmod 644 ./ssl/*.pem

# 编辑 nginx.conf，取消 HTTPS 配置的注释
nano nginx.conf
# 找到 HTTPS server 部分，删除所有 # 注释

# 重启服务
docker-compose up -d
```

### 方法2: 使用 acme.sh

```bash
# 安装 acme.sh
curl https://get.acme.sh | sh
source ~/.bashrc

# 获取证书
~/.acme.sh/acme.sh --issue -d aiclaude.online -d www.aiclaude.online --standalone

# 安装证书
~/.acme.sh/acme.sh --install-cert -d aiclaude.online \
  --cert-file ./ssl/cert.pem \
  --key-file ./ssl/privkey.pem \
  --fullchain-file ./ssl/fullchain.pem

# 编辑 nginx.conf 启用 HTTPS
nano nginx.conf

# 重启服务
docker-compose restart nginx
```

### 证书自动续期

Certbot 会自动设置定时任务续期证书。如果使用 acme.sh，添加续期钩子：

```bash
~/.acme.sh/acme.sh --install-cert -d aiclaude.online \
  --cert-file ./ssl/cert.pem \
  --key-file ./ssl/privkey.pem \
  --fullchain-file ./ssl/fullchain.pem \
  --reloadcmd "cd /root/aiclaude-react && docker-compose restart nginx"
```

## 📝 常用命令

### 容器管理

```bash
# 查看容器状态
docker-compose ps

# 启动服务
docker-compose up -d

# 停止服务
docker-compose stop

# 重启服务
docker-compose restart

# 删除容器
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

### 日志查看

```bash
# 查看前端日志
docker-compose logs -f aiclaude-frontend

# 查看 Nginx 日志
docker-compose logs -f nginx

# 查看所有日志
docker-compose logs -f

# 查看最近 100 行日志
docker-compose logs --tail=100
```

### 进入容器

```bash
# 进入前端容器
docker exec -it aiclaude-frontend sh

# 进入 Nginx 容器
docker exec -it aiclaude-nginx sh
```

### 更新部署

```bash
# 停止服务
docker-compose down

# 拉取最新代码或上传新文件

# 重新构建
docker-compose build --no-cache

# 启动服务
docker-compose up -d
```

## 🔧 配置说明

### 环境变量（.env）

创建 `.env` 文件配置环境变量：

```bash
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://your-backend-domain:8080

# 生产域名
NEXT_PUBLIC_DOMAIN=aiclaude.online
```

### Nginx 配置（nginx.conf）

默认配置包含：
- ✅ HTTP 访问（端口 80）
- ✅ Gzip 压缩
- ✅ 反向代理到 Next.js
- ✅ HTTPS 配置（需要取消注释并配置证书）

## 🔍 故障排查

### 1. 无法访问网站

```bash
# 检查容器状态
docker-compose ps

# 检查端口占用
netstat -tlnp | grep :80

# 检查防火墙
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443

# 检查日志
docker-compose logs -f
```

### 2. DNS 未生效

```bash
# 测试 DNS 解析
nslookup aiclaude.online
dig aiclaude.online

# 使用公共 DNS 测试
nslookup aiclaude.online 8.8.8.8
```

### 3. SSL 证书问题

```bash
# 检查证书文件
ls -lh ssl/

# 测试 SSL 配置
docker exec -it aiclaude-nginx nginx -t

# 查看 Nginx 错误日志
docker logs aiclaude-nginx
```

### 4. 构建失败

```bash
# 清理旧镜像和容器
docker-compose down
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

## 📊 性能优化

### 1. 开启 Nginx 缓存

编辑 `nginx.conf`，在 http 块中添加：

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
```

### 2. 配置 CDN（可选）

将静态资源（`/_next/static/`）配置到 CDN（如阿里云 CDN、腾讯云 CDN）。

### 3. 资源监控

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
df -h

# 查看 Docker 磁盘使用
docker system df
```

## 🔐 安全建议

1. **定期更新依赖**
   ```bash
   npm audit fix
   ```

2. **配置防火墙**
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   ```

3. **使用非 root 用户**（容器内已配置）

4. **定期备份**
   ```bash
   # 备份配置文件
   tar -czf aiclaude-frontend-backup-$(date +%Y%m%d).tar.gz \
     docker-compose.yml nginx.conf .env ssl/
   ```

5. **监控日志**
   ```bash
   # 设置日志轮转
   docker-compose logs --tail=1000 > logs/app.log
   ```

## 📞 技术支持

如遇到问题，请检查：
1. 容器日志：`docker-compose logs -f`
2. Nginx 配置：`docker exec -it aiclaude-nginx nginx -t`
3. DNS 解析：`nslookup aiclaude.online`
4. 防火墙设置：`sudo ufw status`

## 🎉 部署完成

恭喜！您的 AIClaude 前端已成功部署！

- 🌐 访问地址：http://aiclaude.online
- 🔒 HTTPS 地址：https://aiclaude.online（配置SSL后）

享受您的 AI 编程助手吧！
