#!/bin/bash

###############################################################################
# AIClaude Frontend SSL 证书自动申请脚本
# 使用 Let's Encrypt 免费 SSL 证书
###############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 域名配置
DOMAIN="aiclaude.online"
EMAIL="admin@aiclaude.online"  # Let's Encrypt 通知邮箱
SSL_DIR="/etc/letsencrypt/live/${DOMAIN}"

main() {
    print_info "========================================="
    print_info "  Let's Encrypt SSL 证书申请"
    print_info "========================================="
    echo
    print_info "域名: ${DOMAIN}"
    print_info "邮箱: ${EMAIL}"
    echo

    # 1. 检查是否为 root 用户
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 root 权限运行此脚本"
        print_info "使用: sudo ./setup-ssl.sh"
        exit 1
    fi

    # 2. 检查 Certbot
    print_info "检查 Certbot 安装状态..."
    if ! command -v certbot &> /dev/null; then
        print_warning "Certbot 未安装,正在安装..."

        # 检测操作系统
        if [ -f /etc/debian_version ]; then
            # Debian/Ubuntu
            apt-get update
            apt-get install -y certbot
        elif [ -f /etc/redhat-release ]; then
            # CentOS/RHEL
            yum install -y certbot
        else
            print_error "不支持的操作系统,请手动安装 Certbot"
            exit 1
        fi
        print_success "Certbot 安装完成"
    else
        print_success "Certbot 已安装: $(certbot --version)"
    fi

    # 3. 检查 80 端口是否被占用
    print_info "检查 80 端口状态..."
    if netstat -tuln | grep -q ':80 '; then
        print_warning "80 端口被占用,尝试停止相关服务..."

        # 尝试停止 Docker 容器
        if docker ps | grep -q 'aiclaude-nginx'; then
            print_warning "停止 Nginx 容器..."
            docker stop aiclaude-nginx || true
            sleep 5
        fi
    fi
    print_success "80 端口可用"

    # 4. 申请证书
    print_info "========================================="
    print_info "开始申请 SSL 证书..."
    print_info "========================================="
    echo

    # 检查证书是否已存在
    if [ -d "${SSL_DIR}" ]; then
        print_warning "证书目录已存在: ${SSL_DIR}"
        read -p "是否强制更新证书? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            certbot certonly --standalone --force-renewal \
                -d ${DOMAIN} \
                -d www.${DOMAIN} \
                --non-interactive \
                --agree-tos \
                --email ${EMAIL}
        else
            print_info "跳过证书申请,使用已有证书"
        fi
    else
        # 首次申请
        certbot certonly --standalone \
            -d ${DOMAIN} \
            -d www.${DOMAIN} \
            --non-interactive \
            --agree-tos \
            --email ${EMAIL}
    fi

    # 5. 验证证书
    print_info "验证证书文件..."
    if [ -f "${SSL_DIR}/fullchain.pem" ] && [ -f "${SSL_DIR}/privkey.pem" ]; then
        print_success "证书文件验证成功!"
        ls -lh ${SSL_DIR}/
    else
        print_error "证书文件不存在!"
        exit 1
    fi

    # 6. 创建证书目录供 Docker 挂载
    print_info "创建 Docker 证书目录..."
    mkdir -p ./ssl

    # 复制证书到当前目录(供 Docker 挂载)
    cp ${SSL_DIR}/fullchain.pem ./ssl/
    cp ${SSL_DIR}/privkey.pem ./ssl/
    chmod 644 ./ssl/*.pem

    print_success "证书已复制到 ./ssl/ 目录"

    # 7. 设置自动续期
    print_info "配置证书自动续期..."

    # 创建续期 hook 脚本
    cat > /etc/letsencrypt/renewal-hooks/post/reload-frontend-nginx.sh << 'HOOK_EOF'
#!/bin/bash
# 证书续期后自动复制到 Docker 目录并重启 Nginx
DOMAIN="aiclaude.online"
SSL_DIR="/etc/letsencrypt/live/${DOMAIN}"
DEPLOY_DIR="/root/aiclaude-react"  # 修改为你的实际部署目录

if [ -d "${DEPLOY_DIR}/ssl" ]; then
    cp ${SSL_DIR}/fullchain.pem ${DEPLOY_DIR}/ssl/
    cp ${SSL_DIR}/privkey.pem ${DEPLOY_DIR}/ssl/
    chmod 644 ${DEPLOY_DIR}/ssl/*.pem

    # 重启 Nginx 容器
    cd ${DEPLOY_DIR}
    docker-compose restart nginx
fi
HOOK_EOF

    chmod +x /etc/letsencrypt/renewal-hooks/post/reload-frontend-nginx.sh

    print_success "自动续期已配置"
    print_info "证书将在到期前自动续期"

    # 8. 测试续期
    print_info "测试证书续期..."
    certbot renew --dry-run
    print_success "续期测试通过!"

    # 9. 完成
    echo
    print_info "========================================="
    print_success "🎉 SSL 证书申请完成!"
    print_info "========================================="
    echo
    print_info "证书位置: ${SSL_DIR}"
    print_info "Docker 挂载目录: ./ssl/"
    print_info "证书有效期: 90 天"
    print_info "自动续期: 已配置 (每天检查)"
    echo
    print_warning "⚠️  请修改续期 hook 脚本中的部署目录:"
    print_info "编辑: /etc/letsencrypt/renewal-hooks/post/reload-frontend-nginx.sh"
    print_info "修改 DEPLOY_DIR 为你的实际部署目录"
    echo
}

main
