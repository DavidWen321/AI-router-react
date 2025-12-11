#!/bin/bash

###############################################################################
# AIClaude Frontend 打包脚本
# 打包所有需要上传到服务器的文件
###############################################################################

echo "========================================="
echo "  AIClaude Frontend 打包工具"
echo "========================================="
echo

# 创建打包目录
PACK_DIR="aiclaude-frontend-deploy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACK_FILE="aiclaude-frontend-${TIMESTAMP}.tar.gz"

echo "正在准备打包..."

# 创建临时目录
rm -rf ${PACK_DIR}
mkdir -p ${PACK_DIR}

# 复制必要文件
echo "复制文件..."
cp -r app ${PACK_DIR}/
cp -r components ${PACK_DIR}/
cp -r hooks ${PACK_DIR}/
cp -r lib ${PACK_DIR}/
cp -r public ${PACK_DIR}/
cp package*.json ${PACK_DIR}/
cp next.config.mjs ${PACK_DIR}/
cp tsconfig.json ${PACK_DIR}/
cp tailwind.config.ts ${PACK_DIR}/
cp postcss.config.mjs ${PACK_DIR}/
cp components.json ${PACK_DIR}/

# 复制部署文件
echo "复制部署配置..."
cp Dockerfile ${PACK_DIR}/
cp docker-compose.yml ${PACK_DIR}/
cp nginx.conf ${PACK_DIR}/
cp deploy.sh ${PACK_DIR}/
cp .dockerignore ${PACK_DIR}/
cp .env.example ${PACK_DIR}/

# 复制文档
echo "复制文档..."
cp README_DEPLOY.md ${PACK_DIR}/
cp DEPLOYMENT.md ${PACK_DIR}/
cp QUICK_START.txt ${PACK_DIR}/

# 打包
echo "正在打包..."
tar -czf ${PACK_FILE} ${PACK_DIR}

# 清理临时目录
rm -rf ${PACK_DIR}

echo
echo "========================================="
echo "  打包完成！"
echo "========================================="
echo
echo "压缩包: ${PACK_FILE}"
echo "大小: $(du -h ${PACK_FILE} | cut -f1)"
echo
echo "上传步骤："
echo "1. 使用 MobaXterm/FileZilla 上传 ${PACK_FILE} 到服务器"
echo "2. 在服务器上解压: tar -xzf ${PACK_FILE}"
echo "3. 进入目录: cd ${PACK_DIR}"
echo "4. 执行部署: chmod +x deploy.sh && ./deploy.sh"
echo
