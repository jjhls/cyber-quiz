# 网络安全竞赛平台（理论答题）- 需求文档

> **版本**: v1.0  
> **状态**: ✅ 已冻结  
> **创建日期**: 2026-04-02  
> **最后更新**: 2026-04-02

---

## 1. 项目概述

### 1.1 项目目标

构建一个面向网络安全竞赛的在线理论答题平台，支持用户注册登录、参加限时竞赛、自由刷题练习、查看排行榜和错题本等功能。平台专注于理论答题，不涉及实操环境。

### 1.2 目标用户

| 角色 | 描述 |
|------|------|
| **参赛者** | 注册/登录、浏览比赛、在线答题、查看成绩排名、管理错题本 |
| **超级管理员** | 用户管理、题库管理、竞赛管理、数据统计、系统配置 |

### 1.3 非目标

- 不涉及实操类 CTF 题目（如 Web 靶机、二进制漏洞利用环境）
- 不支持团队赛/组队参赛
- 不支持简答题人工评分
- 不部署上线（MVP 阶段本地开发运行）

---

## 2. 功能需求

### 2.1 用户系统 (P0)

#### 2.1.1 注册
- 用户名、密码、确认密码
- 用户名唯一性校验
- 密码强度校验（最少 6 位）
- 注册后自动登录

#### 2.1.2 登录
- 用户名 + 密码登录
- Session + Cookie 认证
- 登录失败提示（用户名或密码错误）
- 记住登录状态

#### 2.1.3 个人中心
- 查看个人信息（用户名、注册时间、参赛次数、总排名）
- 修改密码
- 查看历史成绩记录

### 2.2 题库管理 (P0)

#### 2.2.1 题目模型
```
Question {
  id: string
  category: string        // 分类: Web安全/密码学/逆向工程/Pwn/Misc/网络安全基础/操作系统安全/安全法规
  difficulty: string      // 难度: easy/medium/hard
  type: string            // 题型: single/multiple/truefalse/fillblank
  title: string           // 题目内容
  options: string[]       // 选项（单选/多选题使用）
  answer: string | string[] // 正确答案
  explanation: string     // 题目解析
  tags: string[]          // 标签
  score: number           // 分值
  createdAt: Date
  updatedAt: Date
}
```

#### 2.2.2 题目 CRUD
- 新增题目（表单录入）
- 编辑题目
- 删除题目（软删除）
- 题目列表（分页、筛选、搜索）
- 按分类/难度/题型筛选

#### 2.2.3 批量导入
- 支持 CSV 格式批量导入题目
- 导入前预览和校验
- 导入结果报告（成功/失败条数）

### 2.3 竞赛管理 (P0)

#### 2.3.1 竞赛模型
```
Contest {
  id: string
  title: string           // 竞赛标题
  description: string     // 竞赛描述
  startTime: Date         // 开始时间
  endTime: Date           // 结束时间
  duration: number        // 答题时长（分钟）
  questionIds: string[]   // 题目 ID 列表
  totalScore: number      // 总分
  status: string          // 状态: upcoming/ongoing/finished
  shuffleQuestions: boolean  // 是否随机题目顺序
  shuffleOptions: boolean    // 是否随机选项顺序
  createdAt: Date
}
```

#### 2.3.2 竞赛 CRUD
- 创建竞赛（选择题目、设置时间/规则）
- 编辑竞赛
- 发布/取消竞赛
- 竞赛列表（按状态筛选）

#### 2.3.3 报名机制
- 自由报名参赛
- 报名后记录报名时间
- 竞赛开始后自动进入答题

### 2.4 在线答题 (P0)

#### 2.4.1 答题流程
1. 用户进入竞赛 → 确认参赛 → 开始答题
2. 答题页面显示题目、选项、倒计时
3. 支持标记不确定的题目
4. 支持上一题/下一题自由切换
5. 答题过程中不可暂停
6. 时间到自动提交，或用户主动提交

#### 2.4.2 答题页面
- 左侧题号网格（已答/当前/标记/未答 四种状态）
- 顶部倒计时（< 15min 橙色，< 5min 红色闪烁）
- 题目随机顺序（如果竞赛设置开启）
- 选项随机顺序（如果竞赛设置开启）
- 提交前弹窗确认（显示已答/未答题数）

#### 2.4.3 自动判分
- **单选题**: 精确匹配选项
- **多选题**: 全对才得分（多选/漏选/错选均不得分）
- **判断题**: 精确匹配
- **填空题**: 忽略大小写和首尾空格，支持多个正确答案

### 2.5 排行榜 (P0)

#### 2.5.1 实时排行
- 竞赛进行中实时更新排名
- 按总分降序排列，同分按用时升序排列
- 显示排名、用户名、分数、用时

#### 2.5.2 历史排行
- 查看已结束竞赛的排行榜
- 查看个人历史排名

### 2.6 错题本 (P1)

- 自动收集答错的题目
- 按分类/错误次数筛选
- 显示正确答案和解析
- 支持重新练习
- 支持移除错题

### 2.7 成绩统计 (P1)

#### 2.7.1 个人数据面板
- 总正确率
- 各分类正确率（雷达图）
- 参赛次数、总得分
- 排名趋势

#### 2.7.2 竞赛结果页
- 得分、正确率、用时、排名
- 各分类得分进度条
- 薄弱项提示
- 查看错题入口

### 2.8 自由练习 (P0)

- 不限时刷题
- 按分类/难度/标签筛选题目
- 即时反馈（答对/答错 + 解析）
- 记录练习历史

### 2.9 后台管理 (P1)

- 仪表盘（总用户数、总题目数、总竞赛数）
- 题目管理（CRUD + 批量导入）
- 竞赛管理（CRUD + 发布）
- 用户管理（查看列表、禁用用户）
- 数据统计（参赛率、正确率分布）

---

## 3. 技术架构

### 3.1 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **前端框架** | React + TypeScript | 18.x |
| **UI 组件库** | Ant Design | 5.x |
| **样式方案** | Tailwind CSS | 3.x |
| **图表库** | ECharts | 5.x |
| **动画库** | Framer Motion | 11.x |
| **图标库** | Lucide React | latest |
| **路由** | React Router | 6.x |
| **状态管理** | Zustand | 4.x |
| **表单** | React Hook Form + Zod | latest |
| **后端框架** | Express | 4.x / 5.x |
| **认证** | express-session + connect-sqlite3 | - |
| **数据库** | SQLite + Prisma ORM | latest |
| **项目结构** | Monorepo | - |

### 3.2 项目结构

```
cyber-quiz/
├── client/                 # React 前端
│   ├── public/
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── pages/          # 页面组件
│   │   ├── layouts/        # 布局组件
│   │   ├── stores/         # Zustand 状态
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── api/            # API 请求封装
│   │   ├── types/          # TypeScript 类型
│   │   ├── utils/          # 工具函数
│   │   ├── assets/         # 静态资源
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── package.json
├── server/                 # Express 后端
│   ├── src/
│   │   ├── routes/         # 路由
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件（认证等）
│   │   ├── services/       # 业务逻辑
│   │   ├── utils/          # 工具函数
│   │   └── index.ts        # 入口
│   ├── prisma/
│   │   └── schema.prisma   # 数据模型
│   └── package.json
├── package.json            # Monorepo 根配置
└── docs/                   # 文档
```

### 3.3 数据库模型（Prisma Schema）

```prisma
model User {
  id            String   @id @default(cuid())
  username      String   @unique
  password      String   // bcrypt 哈希
  role          String   @default("user") // user | admin
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  submissions   Submission[]
  wrongAnswers  WrongAnswer[]
}

model Question {
  id            String   @id @default(cuid())
  category      String   // Web安全/密码学/逆向工程/Pwn/Misc/网络安全基础/操作系统安全/安全法规
  difficulty    String   // easy/medium/hard
  type          String   // single/multiple/truefalse/fillblank
  title         String
  options       String[] // JSON 数组（单选/多选题使用）
  answer        String   // JSON 字符串（支持多答案）
  explanation   String   @default("")
  tags          String[] // JSON 数组
  score         Int      @default(2)
  deleted       Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  contests      Contest[]
}

model Contest {
  id                String   @id @default(cuid())
  title             String
  description       String   @default("")
  startTime         DateTime
  endTime           DateTime
  duration          Int      // 分钟
  totalScore        Int
  status            String   @default("upcoming") // upcoming/ongoing/finished
  shuffleQuestions  Boolean  @default(false)
  shuffleOptions    Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  questions         Question[]
  submissions       Submission[]
}

model Submission {
  id            String   @id @default(cuid())
  userId        String
  contestId     String
  score         Int      @default(0)
  totalScore    Int
  correctCount  Int      @default(0)
  totalCount    Int
  duration      Int      // 实际用时（秒）
  answers       String   // JSON: { questionId: answer }
  startedAt     DateTime
  submittedAt   DateTime
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
  contest       Contest  @relation(fields: [contestId], references: [id])
}

model WrongAnswer {
  id            String   @id @default(cuid())
  userId        String
  questionId    String
  contestId     String?
  userAnswer    String
  correctAnswer String
  errorCount    Int      @default(1)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id])
}
```

### 3.4 API 设计

#### 认证相关
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/logout` | 登出 |
| GET  | `/api/auth/me` | 获取当前用户信息 |
| PUT  | `/api/auth/password` | 修改密码 |

#### 题目相关
| 方法 | 路径 | 描述 |
|------|------|------|
| GET    | `/api/questions` | 题目列表（分页+筛选） |
| GET    | `/api/questions/:id` | 题目详情 |
| POST   | `/api/questions` | 新增题目（管理员） |
| PUT    | `/api/questions/:id` | 编辑题目（管理员） |
| DELETE | `/api/questions/:id` | 删除题目（管理员） |
| POST   | `/api/questions/import` | CSV 批量导入（管理员） |

#### 竞赛相关
| 方法 | 路径 | 描述 |
|------|------|------|
| GET    | `/api/contests` | 竞赛列表 |
| GET    | `/api/contests/:id` | 竞赛详情 |
| POST   | `/api/contests` | 创建竞赛（管理员） |
| PUT    | `/api/contests/:id` | 编辑竞赛（管理员） |
| POST   | `/api/contests/:id/join` | 报名参赛 |
| GET    | `/api/contests/:id/ranking` | 竞赛排行榜 |

#### 答题相关
| 方法 | 路径 | 描述 |
|------|------|------|
| GET    | `/api/exams/:contestId/start` | 获取答题试卷（随机化） |
| POST   | `/api/exams/:contestId/submit` | 提交答案 |
| GET    | `/api/exams/:contestId/result` | 查看答题结果 |

#### 练习相关
| 方法 | 路径 | 描述 |
|------|------|------|
| GET    | `/api/practice` | 练习题目列表 |
| POST   | `/api/practice/:questionId/answer` | 提交练习答案 |

#### 错题本
| 方法 | 路径 | 描述 |
|------|------|------|
| GET    | `/api/wrong-book` | 错题列表 |
| DELETE | `/api/wrong-book/:id` | 移除错题 |

#### 统计相关
| 方法 | 路径 | 描述 |
|------|------|------|
| GET    | `/api/stats/overview` | 个人数据概览 |
| GET    | `/api/stats/category` | 各分类正确率 |
| GET    | `/api/admin/stats` | 管理员统计面板 |

---

## 4. UI/UX 设计规范

### 4.1 设计风格

- **布局**: Bento Grid 网格布局
- **主题**: 暗色模式（Dark Mode）
- **背景色**: Tailwind slate 色系（slate-950 → slate-800）
- **主色调**: Tailwind blue 色系（blue-500 / blue-400）
- **圆角**: 16px（rounded-2xl）
- **字体**: Inter / Noto Sans SC（正文），JetBrains Mono（代码）

### 4.2 颜色系统

```
bg-primary:      slate-950  #020617
bg-secondary:    slate-900  #0f172a
bg-tertiary:     slate-800  #1e293b
accent:          blue-500   #3b82f6
accent-hover:    blue-400   #60a5fa
success:         emerald-500 #10b981
warning:         amber-500   #f59e0b
error:           red-500     #ef4444
text-primary:    slate-100   #f1f5f9
text-secondary:  slate-400   #94a3b8
```

### 4.3 响应式断点

| 断点 | 宽度 | 设备 |
|------|------|------|
| sm | 640px | 手机横屏 |
| md | 768px | 平板 |
| lg | 1024px | 小桌面 |
| xl | 1280px | 桌面 |

### 4.4 移动端导航

- PC 端：顶部水平导航
- 移动端（< 768px）：底部 Tab 导航（首页/竞赛/题库/排行/我的）

---

## 5. 非功能需求

| 维度 | 要求 |
|------|------|
| **性能** | 页面首屏加载 < 3s，API 响应 < 200ms |
| **并发** | 支持 50 人同时在线答题 |
| **安全** | 密码 bcrypt 加密，Session 安全配置，CSRF 防护 |
| **兼容性** | Chrome / Firefox / Safari / Edge 最新两个版本 |
| **移动端** | 响应式设计，适配手机/平板 |

---

## 6. 验收标准

### 6.1 P0 功能验收

- [ ] 用户可以注册、登录、修改密码
- [ ] 管理员可以创建、编辑、删除题目
- [ ] 管理员可以创建、发布竞赛
- [ ] 用户可以报名参赛并在线答题
- [ ] 答题支持单选/多选/判断/填空四种题型
- [ ] 系统自动判分并生成成绩
- [ ] 排行榜实时更新
- [ ] 用户可以自由练习刷题

### 6.2 P1 功能验收

- [ ] 错题本自动收集错题，支持重练
- [ ] 个人数据统计面板（雷达图、正确率）
- [ ] 防作弊（题目随机、选项随机、限时）
- [ ] 后台管理面板

---

> **文档状态**: ✅ 已冻结  
> **下一步**: 生成执行计划 (xl_plan)
