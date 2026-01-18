#!/bin/bash

###############################################################################
# AIClaude Frontend 一键部署脚本
# 使用方法: ./deploy.sh
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_banner() {
    echo -e "${CYAN}"
    echo "========================================="
    echo "  $1"
    echo "========================================="
    echo -e "${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 主函数
main() {
    print_banner "AIClaude Frontend 一键部署脚本"

    # 1. 检查 Docker
    print_info "检查 Docker 环境..."
    if ! command_exists docker; then
        print_error "Docker 未安装！请先安装 Docker"
        exit 1
    fi
    print_success "Docker 已安装: $(docker --version)"

    # 2. 检查 Docker Compose
    print_info "检查 Docker Compose 环境..."
    if ! command_exists docker-compose; then
        print_error "Docker Compose 未安装！请先安装 Docker Compose"
        exit 1
    fi
    print_success "Docker Compose 已安装: $(docker-compose --version)"

    # 3. 检查网络
    print_info "检查 Docker 网络 'claude'..."
    if ! docker network ls | grep -q claude; then
        print_warning "Docker 网络 'claude' 不存在，正在创建..."
        docker network create claude
        print_success "网络创建成功"
    else
        print_success "网络 'claude' 已存在"
    fi

    # 4. 检查 .env 文件 (可选)
    print_info "检查环境配置文件..."
    if [ ! -f .env ]; then
        print_warning ".env 文件不存在，将使用默认配置"
        print_info "如需自定义配置，请从 .env.example 复制并修改"
    else
        print_success ".env 文件已存在"
    fi

    # 5. 检查 next.config.mjs 是否配置了 standalone
    print_info "检查 Next.js 配置..."
    if grep -q "output.*standalone" next.config.mjs 2>/dev/null; then
        print_success "Next.js standalone 模式已配置"
    else
        print_warning "Next.js 未配置 standalone 模式"
        print_info "正在自动配置..."

        # 备份原配置
        cp next.config.mjs next.config.mjs.backup 2>/dev/null || true

        # 添加 standalone 配置
        if [ -f next.config.mjs ]; then
            # 检查是否已有 output 配置
            if grep -q "const nextConfig" next.config.mjs; then
                # 在 nextConfig 对象中添加 output
                sed -i.bak "/const nextConfig = {/a\\  output: 'standalone'," next.config.mjs
                print_success "已添加 standalone 配置"
            fi
        fi
    fi

    # 6. 创建 SSL 目录（如果使用 HTTPS）
    print_info "创建 SSL 证书目录..."
    mkdir -p ssl
    print_success "SSL 目录已创建: ./ssl"
    print_info "如需启用 HTTPS，请将证书文件放入 ./ssl/ 目录："
    print_info "  - fullchain.pem (证书链)"
    print_info "  - privkey.pem (私钥)"

    # 7. 停止旧容器（如果存在）
    print_info "检查并停止旧容器..."
    if docker ps -a | grep -q aiclaude-frontend; then
        print_warning "检测到旧容器，正在停止..."
        docker-compose down
        print_success "旧容器已停止"
    fi

    # 8. 构建镜像
    print_banner "开始构建 Docker 镜像"
    print_warning "首次构建可能需要 5-10 分钟，请耐心等待..."
    echo

    docker-compose build --no-cache

    print_success "镜像构建完成！"
    echo

    # 9. 启动容器
    print_banner "启动应用容器"
    echo

    docker-compose up -d

    print_success "容器启动成功！"
    echo

    # 10. 等待应用启动
    print_info "等待应用启动（约 30 秒）..."
    sleep 15

    # 11. 检查容器状态
    print_info "检查容器状态..."
    docker-compose ps
    echo

    # 12. 显示日志
    print_banner "显示应用启动日志（最近 50 行）"
    echo
    docker-compose logs --tail=50 aiclaude-frontend
    echo

    # 13. 健康检查
    print_info "执行健康检查..."
    sleep 15

    if curl -f -s http://localhost:80/ > /dev/null 2>&1; then
        print_success "✅ 应用健康检查通过！"
    else
        print_warning "⚠️  健康检查未通过，应用可能仍在启动中..."
        print_info "请稍后手动检查: curl http://localhost:80/"
    fi

    # 14. DNS 配置提示
    echo
    print_banner "DNS 配置说明"
    print_info "要让用户通过 aiclaude.online 访问，请按以下步骤配置："
    echo
    print_info "1. 登录您的域名注册商（如阿里云、腾讯云、GoDaddy等）"
    print_info "2. 进入 DNS 管理页面"
    print_info "3. 添加 A 记录："
    print_info "   - 主机记录: @ (或留空)"
    print_info "   - 记录类型: A"
    print_info "   - 记录值: $(curl -s ifconfig.me 2>/dev/null || echo '您的服务器公网IP')"
    print_info "   - TTL: 600 (或默认值)"
    print_info "4. 添加 www 子域名（可选）："
    print_info "   - 主机记录: www"
    print_info "   - 记录类型: CNAME"
    print_info "   - 记录值: aiclaude.online"
    print_info "5. 等待 DNS 生效（通常 5-10 分钟）"
    echo

    # 15. SSL 配置提示
    print_banner "SSL 证书配置（可选但推荐）"
    print_info "为了启用 HTTPS，建议使用 Let's Encrypt 免费证书："
    echo
    print_info "方法1: 使用 Certbot 自动获取证书"
    print_info "  sudo apt install certbot"
    print_info "  sudo certbot certonly --standalone -d aiclaude.online -d www.aiclaude.online"
    print_info "  sudo cp /etc/letsencrypt/live/aiclaude.online/fullchain.pem ./ssl/"
    print_info "  sudo cp /etc/letsencrypt/live/aiclaude.online/privkey.pem ./ssl/"
    print_info "  sudo chmod 644 ./ssl/*.pem"
    echo
    print_info "方法2: 使用 acme.sh 获取证书"
    print_info "  curl https://get.acme.sh | sh"
    print_info "  ~/.acme.sh/acme.sh --issue -d aiclaude.online -d www.aiclaude.online --standalone"
    print_info "  ~/.acme.sh/acme.sh --install-cert -d aiclaude.online \\"
    print_info "    --cert-file ./ssl/cert.pem \\"
    print_info "    --key-file ./ssl/privkey.pem \\"
    print_info "    --fullchain-file ./ssl/fullchain.pem"
    echo
    print_info "获取证书后："
    print_info "1. 编辑 nginx.conf，取消 HTTPS server 配置的注释"
    print_info "2. 重启 Nginx: docker-compose restart nginx"
    echo

    # 16. 部署完成
    echo
    print_banner "🎉 部署完成！"
    echo
    print_success "本地访问地址: http://localhost"
    print_success "域名访问地址: http://aiclaude.online (DNS 生效后)"
    print_success "HTTPS 地址: https://aiclaude.online (配置 SSL 后)"
    echo
    print_info "常用命令:"
    print_info "  查看日志: docker-compose logs -f aiclaude-frontend"
    print_info "  查看 Nginx 日志: docker-compose logs -f nginx"
    print_info "  停止应用: docker-compose stop"
    print_info "  重启应用: docker-compose restart"
    print_info "  删除容器: docker-compose down"
    print_info "  重新构建: docker-compose up -d --build"
    echo
    print_info "容器管理:"
    print_info "  进入前端容器: docker exec -it aiclaude-frontend sh"
    print_info "  进入 Nginx 容器: docker exec -it aiclaude-nginx sh"
    echo
}

# 执行主函数
main

# 询问是否查看实时日志
echo
read -p "是否查看实时日志？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose logs -f
fi
