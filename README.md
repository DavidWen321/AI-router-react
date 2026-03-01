# AI Router Web

基于 Next.js 14 构建的 AI 路由服务前端，提供用户仪表板、会员管理和后台管理功能。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 14.2.5 | React 全栈框架 |
| React | 18 | UI 库 |
| TypeScript | 5 | 类型系统 |
| Tailwind CSS | 4.x | 原子化 CSS |
| Radix UI | latest | 无障碍组件库 |
| React Hook Form | 7.x | 表单状态管理 |
| Zod | 3.x | 数据校验 |
| Recharts | latest | 图表库 |

## 功能模块

### 用户端
- 登录注册（邮箱验证码）
- 个人仪表板
- API 密钥管理
- 用量统计查看
- 套餐订阅与续费

### 管理后台
- 用户管理（增删改查）
- API 密钥管理
- 套餐配置
- 账号池管理
- 数据统计报表

### 其他特性
- 深色/浅色主题切换
- 中英文双语支持
- 响应式布局
- Cloudflare Turnstile 人机验证

## 项目结构

```
├── app/                      # Next.js App Router
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   ├── dashboard/           # 用户仪表板
│   │   ├── page.tsx         # 仪表板首页
│   │   └── admin/           # 管理后台
│   │       ├── users/       # 用户管理
│   │       ├── keys/        # 密钥管理
│   │       └── packages/    # 套餐管理
│   ├── docs/                # 文档页面
│   ├── features/            # 功能介绍
│   └── pricing/             # 定价页面
├── components/              # React 组件
│   ├── ui/                  # 基础 UI 组件
│   ├── navigation.tsx       # 导航栏
│   ├── auth-modal.tsx       # 认证弹窗
│   └── ...
├── hooks/                   # 自定义 Hooks
├── lib/                     # 工具函数
│   ├── utils.ts            # 通用工具
│   └── language-context.tsx # 多语言上下文
└── public/                  # 静态资源
```

## 快速开始

### 环境要求
- Node.js 18+
- npm 9+ 或 pnpm 8+

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_key
```

也可以直接复制 `.env.local.example` 再按需修改。

### 启动开发服务器

```bash
npm run dev
```

默认运行在 `http://localhost:2025`

### 生产构建

```bash
npm run build
npm run start
```

## Docker 部署

### 构建镜像

```bash
docker build -t ai-router-web .
```

### 运行容器

```bash
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.example.com \
  ai-router-web
```

### Docker Compose

```bash
docker-compose up -d
```

## 组件库

项目使用 shadcn/ui 组件库，基于 Radix UI 构建，支持以下组件：

- 表单组件：Input、Select、Checkbox、Switch、Slider
- 布局组件：Card、Dialog、Sheet、Tabs、Accordion
- 反馈组件：Toast、Alert、Progress、Skeleton
- 导航组件：Navigation Menu、Dropdown Menu、Context Menu

添加新组件：

```bash
npx shadcn@latest add [component-name]
```

## 开发规范

### 代码风格
- 遵循 ESLint 规则
- 使用 Prettier 格式化
- 组件使用 PascalCase 命名
- 工具函数使用 camelCase 命名

### 提交规范
```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 样式调整
refactor: 代码重构
```

### 目录规范
- 页面组件放在 `app/` 目录
- 可复用组件放在 `components/`
- 业务逻辑封装在 `hooks/`
- 工具函数放在 `lib/`

## 环境变量说明

| 变量名 | 说明 | 必填 |
|--------|------|------|
| NEXT_PUBLIC_API_URL | 后端 API 地址 | 是 |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | Turnstile 站点密钥 | 是 |

## 浏览器支持

- Chrome >= 90
- Firefox >= 90
- Safari >= 14
- Edge >= 90

## 许可证

MIT License
