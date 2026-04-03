# 🛡️ CyberQuiz - 网络安全竞赛平台

> 一个专注于理论答题的网络安全竞赛平台，支持限时竞赛、自由练习、排行榜和错题本等功能。

---

## 📋 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [功能特性](#功能特性)
- [API 文档](#api-文档)
- [测试](#测试)
- [部署](#部署)
- [开发指南](#开发指南)

---

## 项目简介

CyberQuiz 是一个面向网络安全竞赛的在线理论答题平台。平台支持多种题型（单选、多选、判断、填空），提供限时竞赛和自由练习两种模式，内置排行榜、错题本、数据统计等功能。

### 适用场景

- 🏫 高校网络安全课程考试
- 🏢 企业内部安全培训考核
- 🏆 CTF 理论赛
- 📚 个人安全知识练习

---

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.6.x | 类型安全 |
| Vite | 6.x | 构建工具 |
| Ant Design | 5.x | UI 组件库 |
| Tailwind CSS | 3.x | 样式方案 |
| Zustand | 5.x | 状态管理 |
| Framer Motion | 11.x | 动画 |
| ECharts | 5.x | 数据可视化 |
| React Router | 6.x | 路由 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Express | 4.x/5.x | Web 框架 |
| TypeScript | 5.6.x | 类型安全 |
| Prisma | 6.x | ORM |
| SQLite | - | 数据库 |
| express-session | 1.x | 会话管理 |
| bcryptjs | 2.x | 密码加密 |

### 测试

| 技术 | 用途 |
|------|------|
| Vitest | 单元测试 |
| Supertest | API 集成测试 |

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd cyber-quiz

# 安装依赖
npm install

# 初始化数据库
npm run db:push

# 注入测试数据（可选）
cd server && npm run seed
```

### 开发模式

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:client   # 前端 http://localhost:3000
npm run dev:server   # 后端 http://localhost:4000
```

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | `admin` | `admin123` |
| 参赛者 | `张三` | `user123` |

---

## 项目结构

```
cyber-quiz/
├── client/                 # React 前端
│   ├── src/
│   │   ├── api/            # API 请求封装
│   │   ├── components/     # 通用组件
│   │   ├── layouts/        # 布局组件
│   │   ├── pages/          # 页面组件
│   │   ├── stores/         # Zustand 状态
│   │   ├── types/          # TypeScript 类型
│   │   └── utils/          # 工具函数
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── server/                 # Express 后端
│   ├── prisma/
│   │   └── schema.prisma   # 数据模型
│   └── src/
│       ├── controllers/    # 控制器
│       ├── middleware/     # 中间件
│       ├── utils/          # 工具函数
│       └── __tests__/      # 测试文件
├── docs/                   # 文档
│   ├── plans/              # 执行计划
│   └── requirements/       # 需求文档
└── package.json            # Monorepo 根配置
```

---

## 功能特性

### 参赛者

- 📝 注册/登录
- 🏁 浏览和参加竞赛
- 📊 查看成绩和排名
- 📚 自由练习刷题
- ❌ 错题本管理
- 📈 个人数据统计

### 管理员

- 📝 题目管理（增删改查 + CSV 批量导入）
- 🏁 竞赛管理（创建、发布、编辑）
- 👥 用户管理
- 📊 数据统计面板

### 系统特性

- ⏱ 倒计时自动交卷
- 🚫 离开页面自动交卷（防作弊）
- 🔀 题目/选项随机顺序
- 📱 响应式设计（移动端适配）
- 🌙 暗色主题

---

## API 文档

### 认证

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 获取当前用户 |
| POST | `/api/auth/logout` | 登出 |
| PUT | `/api/auth/password` | 修改密码 |

### 题目

| 方法 | 路径 | 权限 | 描述 |
|------|------|------|------|
| GET | `/api/questions` | 登录 | 题目列表 |
| GET | `/api/questions/:id` | 登录 | 题目详情 |
| POST | `/api/questions` | 管理员 | 创建题目 |
| PUT | `/api/questions/:id` | 管理员 | 更新题目 |
| DELETE | `/api/questions/:id` | 管理员 | 删除题目 |
| POST | `/api/questions/import` | 管理员 | 批量导入 |

### 竞赛

| 方法 | 路径 | 权限 | 描述 |
|------|------|------|------|
| GET | `/api/contests` | 登录 | 竞赛列表 |
| GET | `/api/contests/:id` | 登录 | 竞赛详情 |
| POST | `/api/contests` | 管理员 | 创建竞赛 |
| PUT | `/api/contests/:id` | 管理员 | 更新竞赛 |
| DELETE | `/api/contests/:id` | 管理员 | 删除竞赛 |
| GET | `/api/contests/:id/ranking` | 登录 | 排行榜 |

### 答题

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/exams/:contestId/start` | 获取试卷 |
| POST | `/api/exams/:contestId/submit` | 提交答案 |
| GET | `/api/exams/:contestId/result` | 查看成绩 |

---

## 测试

```bash
# 运行所有测试
cd server && npm test

# 监听模式
cd server && npm run test:watch
```

### 测试覆盖

| 测试文件 | 测试数 | 覆盖内容 |
|---------|--------|---------|
| scoring.test.ts | 28 | 判分引擎（4 种题型） |
| auth.test.ts | 14 | 认证 API |
| exam.test.ts | 11 | 答题 API |
| question.test.ts | 6 | 题目 API |

---

## 部署

### 构建

```bash
npm run build
```

### 环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `PORT` | 后端端口 | `4000` |
| `SESSION_SECRET` | Session 密钥 | `dev-secret...` |
| `NODE_ENV` | 运行环境 | `development` |

---

## 开发指南

### 代码规范

- TypeScript strict mode
- ESLint + Prettier
- 组件使用函数式组件 + Hooks

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
test: 测试相关
docs: 文档更新
style: 代码格式
refactor: 重构
```

---

## License

MIT
