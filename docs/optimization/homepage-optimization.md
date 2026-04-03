# 首页欢迎页优化确认文档

> **版本**: v2.0
> **创建日期**: 2026-04-03
> **最后更新**: 2026-04-03
> **状态**: 待确认
> **UI 组件库**: [shadcn/ui](https://ui.shadcn.com/)

---

## 一、技术栈变更

### 1.1 从 Ant Design 迁移到 shadcn/ui

**为什么要换？**

| 维度 | Ant Design | shadcn/ui |
|------|-----------|-----------|
| **定制性** | 主题覆盖复杂，样式冲突多 | 组件代码直接复制，完全可控 |
| **体积** | 整体包较大 | 按需安装，零冗余 |
| **暗色主题** | 需要算法切换，性能开销 | CSS 变量原生支持，无缝切换 |
| **Tailwind** | 不原生支持 | 基于 Tailwind CSS 构建 |
| **所有权** | 第三方库，更新不可控 | 代码在你项目中，完全掌控 |

**shadcn/ui 核心组件清单**（首页优化所需）：

| 组件 | 用途 | 安装命令 |
|------|------|---------|
| `Progress` | 等级进度条、学习目标进度 | `npx shadcn@latest add progress` |
| `Card` | Bento 卡片容器 | `npx shadcn@latest add card` |
| `Badge` | 状态标签、等级标签 | `npx shadcn@latest add badge` |
| `Button` | 快捷操作按钮 | `npx shadcn@latest add button` |
| `Avatar` | 用户头像 | `npx shadcn@latest add avatar` |
| `Skeleton` | 加载骨架屏 | `npx shadcn@latest add skeleton` |
| `Tabs` | 统计卡片切换 | `npx shadcn@latest add tabs` |
| `Tooltip` | 悬浮提示 | `npx shadcn@latest add tooltip` |
| `Separator` | 内容分隔线 | `npx shadcn@latest add separator` |
| `Chart` | 雷达图/趋势图 | `npx shadcn@latest add chart` |

---

## 二、当前问题分析

| 模块 | 现状 | 问题 |
|------|------|------|
| **欢迎区** | 头像+用户名+等级+参赛次数 | 缺少连续登录、等级进度、今日目标 |
| **统计卡片** | 静态数字展示 | 缺少趋势对比、点击交互 |
| **雷达图** | 基于错题数推算 | 数据不准确，应该基于实际答题正确率 |
| **最近提交** | 依赖后端数据 | 暂无数据时体验差 |
| **公告区** | 硬编码单条公告 | 需要动态数据支持 |

---

## 三、优化方案

### 3.1 欢迎区升级

```
┌─────────────────────────────────────────────────────────┐
│  [Avatar] 👋 早上好，张三                                │
│  🔥 连续登录 7 天    🏅 安全工程师 Lv.4                  │
│  [Progress] ████████████░░░░░░  67/100 经验值             │
│                                                         │
│  [Button⚡]  [Button🏁]  [Button📊]  [Button📝]          │
└─────────────────────────────────────────────────────────┘
```

**shadcn/ui 组件映射**：

| 元素 | shadcn/ui 组件 | 说明 |
|------|---------------|------|
| 用户头像 | `Avatar` + `AvatarImage` + `AvatarFallback` | 首字母 fallback |
| 等级标签 | `Badge` variant="secondary" | 等级名称 + 图标 |
| 经验值进度 | `Progress` | 可视化等级进度 |
| 快捷按钮 | `Button` variant="outline" | 4 个快捷操作 |
| 连续登录 | `Badge` variant="default" | 🔥 连续 X 天 |

### 3.2 统计卡片交互化

```
┌─────────────────────┐  ┌──────────────┐  ┌──────────────┐
│  [Card] 🏁 正在进行  │  │  [Card] 📊   │  │  [Card] 🏆   │
│                     │  │   平均得分    │  │   当前排名    │
│        3            │  │     78.5     │  │     #15      │
│  ↑ 较昨日 +1        │  │  ↑ +2.3%     │  │  ↑ 较上周+3  │
│                     │  │              │  │              │
│  [Button 立即参加]   │  │  [Button]    │  │  [Button]    │
└─────────────────────┘  └──────────────┘  └──────────────┘
```

**shadcn/ui 组件映射**：

| 元素 | shadcn/ui 组件 | 说明 |
|------|---------------|------|
| 卡片容器 | `Card` + `CardHeader` + `CardContent` + `CardFooter` | 结构化卡片 |
| 趋势指示 | `Badge` variant="outline" | ↑/↓ 箭头 + 百分比 |
| 操作按钮 | `Button` variant="ghost" | 底部快捷操作 |
| 悬浮提示 | `Tooltip` | 鼠标悬浮显示详情 |

### 3.3 雷达图数据优化

**shadcn/ui `Chart` 组件**：
- 基于 Recharts 构建
- 原生支持暗色/亮色主题切换
- 内置 Tooltip、Legend、Grid 样式
- 与 Tailwind CSS 完美集成

### 3.4 新增模块

#### 每日安全小贴士

```
┌─────────────────────────────────────────────────────────┐
│  [Card] 💡 每日安全小贴士                                │
│                                                         │
│  SQL注入是最常见的Web攻击方式之一。使用参数化查询可以      │
│  有效防止SQL注入攻击。                                    │
│                                                         │
│  [Button 换一条]  [Button 了解更多 →]                     │
└─────────────────────────────────────────────────────────┘
```

#### 学习目标

```
┌─────────────────────────────────────────────────────────┐
│  [Card] 🎯 今日学习目标                                  │
│                                                         │
│  [Field] 完成 5 道练习题                                  │
│  [Progress value={60}] 3/5  60%                         │
│                                                         │
│  [Field] 参加 1 场竞赛                                   │
│  [Progress value={0}] 0/1  0%                           │
│                                                         │
│  [Field] 复习 3 道错题                                   │
│  [Progress value={100}] 3/3  100%                       │
└─────────────────────────────────────────────────────────┘
```

---

## 四、优先级排序

| 优先级 | 功能 | shadcn/ui 组件 | 工作量 | 效果 |
|--------|------|---------------|--------|------|
| **P0** | 安装 shadcn/ui + 配置主题 | `components.json` | 低 | 高 |
| **P0** | 欢迎区升级（时段问候+连续登录+等级进度） | `Avatar`, `Badge`, `Progress`, `Button` | 中 | 高 |
| **P0** | 统计卡片交互化 | `Card`, `Badge`, `Button`, `Tooltip` | 低 | 高 |
| **P1** | 雷达图数据优化 | `Chart` (Radar) | 中 | 中 |
| **P1** | 每日安全小贴士 | `Card`, `Button` | 低 | 中 |
| **P2** | 学习目标系统 | `Card`, `Progress`, `Field` | 高 | 中 |

---

## 五、数据持久化方案

### 5.1 数据存储策略

**为什么不使用 localStorage？**

| 维度 | localStorage | SQLite (后端) |
|------|-------------|---------------|
| **跨设备同步** | ❌ 不支持 | ✅ 支持 |
| **数据安全性** | ❌ 用户可清除 | ✅ 服务器保护 |
| **多端一致** | ❌ 换设备丢失 | ✅ 账号绑定 |
| **数据完整性** | ❌ 无法关联答题记录 | ✅ 关联用户/答题/竞赛 |
| **查询能力** | ❌ 仅键值对 | ✅ SQL 复杂查询 |

**混合存储方案**：

```
┌─────────────────────────────────────────────────────────┐
│                    数据存储策略                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  localStorage (前端 - 仅临时状态)                        │
│  ├── 主题偏好 (dark/light) - 已实现                     │
│  ├── 表单草稿                                            │
│  └── 页面滚动位置                                        │
│                                                         │
│  SQLite (后端 - 核心业务数据)                            │
│  ├── 用户经验值/等级                                     │
│  ├── 连续登录天数                                        │
│  ├── 每日目标进度                                        │
│  ├── 答题记录                                            │
│  └── 竞赛成绩                                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Prisma Schema 扩展

在现有 `User` 模型中新增字段：

```prisma
model User {
  // ... 现有字段
  id            String   @id @default(cuid())
  username      String   @unique
  password      String
  role          String   @default("user")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 新增：游戏化系统
  experience      Int      @default(0)      // 经验值
  level           Int      @default(1)      // 等级
  consecutiveDays Int      @default(0)      // 连续登录天数
  lastLoginDate   DateTime?                // 上次登录日期

  // 新增：每日目标 (JSON 存储)
  // 格式: { practice: { current: 3, target: 5 }, contest: { current: 0, target: 1 }, review: { current: 2, target: 3 } }
  dailyGoals      String   @default("{}")   // JSON 字符串

  submissions   Submission[]
  wrongAnswers  WrongAnswer[]
}
```

### 5.3 后端 API 设计（新增）

| 接口 | 方法 | 描述 | 权限 |
|------|------|------|------|
| `/api/user/profile` | GET | 获取用户完整资料（含经验值、等级、连续登录） | 登录 |
| `/api/user/login` | POST | 登录时更新连续登录天数和经验值 | 公开 |
| `/api/user/experience` | POST | 增加经验值（答题后调用） | 登录 |
| `/api/user/daily-goals` | GET | 获取今日目标进度 | 登录 |
| `/api/user/daily-goals` | PUT | 更新目标进度 | 登录 |
| `/api/user/stats/trend` | GET | 获取趋势数据（用于统计卡片） | 登录 |

### 5.4 经验值规则

| 行为 | 经验值 | 说明 |
|------|--------|------|
| 答对一题 | +10 | 竞赛或练习均可 |
| 答错一题 | +2 | 鼓励参与 |
| 完成每日练习目标 | +50 | 额外奖励 |
| 参加竞赛 | +20 | 参与奖励 |
| 连续登录 7 天 | +100 | 周奖励 |
| 连续登录 30 天 | +500 | 月奖励 |

**等级阈值**：

| 等级 | 名称 | 所需经验 | 图标 |
|------|------|---------|------|
| Lv.1 | 网络安全学徒 | 0 | 🌱 |
| Lv.2 | 安全爱好者 | 100 | 🔰 |
| Lv.3 | 安全研究员 | 300 | 🔬 |
| Lv.4 | 安全工程师 | 600 | 🛡️ |
| Lv.5 | 安全专家 | 1000 | ⚔️ |
| Lv.6 | 网络安全大师 | 1500 | 👑 |

### 5.5 连续登录逻辑

```typescript
// 后端登录时调用
async function updateConsecutiveLogin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.lastLoginDate) {
    // 首次登录
    await prisma.user.update({
      where: { id: userId },
      data: { consecutiveDays: 1, lastLoginDate: today },
    });
    return;
  }

  const lastLogin = new Date(user.lastLoginDate);
  lastLogin.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // 连续登录
    await prisma.user.update({
      where: { id: userId },
      data: {
        consecutiveDays: { increment: 1 },
        lastLoginDate: today,
        experience: { increment: diffDays >= 7 ? 100 : 0 }, // 7天奖励
      },
    });
  } else if (diffDays > 1) {
    // 中断后重新登录
    await prisma.user.update({
      where: { id: userId },
      data: { consecutiveDays: 1, lastLoginDate: today },
    });
  }
  // diffDays === 0 表示今天已登录过，不重复计算
}
```

---

## 六、技术实现要点

### 6.1 shadcn/ui 安装配置

```bash
# 初始化 shadcn/ui
npx shadcn@latest init

# 安装所需组件
npx shadcn@latest add progress card badge button avatar skeleton tooltip separator chart
```

**主题配置**（与现有 Tailwind 暗色主题兼容）：

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 6.9%;
    --card-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
  }
}
```

### 6.2 主题配置（与现有 Tailwind 暗色主题兼容）

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 6.9%;
    --card-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
  }
}
```

### 6.3 时段问候
- 6:00-11:59 → 早上好
- 12:00-17:59 → 下午好
- 18:00-23:59 → 晚上好
- 0:00-5:59 → 夜深了

### 6.4 统计卡片趋势
- 比较今日与昨日数据
- 显示上升/下降箭头和百分比
- 使用 Framer Motion 添加入场动画

---

## 七、验收标准

- [ ] shadcn/ui 组件库正确安装和配置
- [ ] 暗色/亮色主题无缝切换
- [ ] 欢迎区显示正确的时段问候
- [ ] 连续登录天数正确计算和显示（SQLite 持久化）
- [ ] 等级进度条可视化显示（shadcn Progress）
- [ ] 统计卡片可点击跳转（shadcn Card）
- [ ] 趋势指示正确显示（shadcn Badge）
- [ ] 雷达图数据基于实际答题记录（shadcn Chart）
- [ ] 每日安全小贴士随机显示（shadcn Card + Button）
- [ ] 学习目标模块显示进度（shadcn Progress + Field）
- [ ] 亮色/暗色主题适配正常
- [ ] 移动端响应式正常
- [ ] Prisma Schema 新增字段正确迁移
- [ ] 后端 API 接口正常工作

---

## 八、迁移策略

### 8.1 渐进式迁移

不一次性替换所有 Ant Design 组件，而是：

1. **首页优先**：首页使用 shadcn/ui 组件
2. **逐步替换**：其他页面按需迁移
3. **共存兼容**：Ant Design 和 shadcn/ui 可以共存

### 8.2 组件对照表

| 功能 | Ant Design | shadcn/ui |
|------|-----------|-----------|
| 卡片 | `Card` | `Card` |
| 按钮 | `Button` | `Button` |
| 头像 | `Avatar` | `Avatar` |
| 标签 | `Tag` | `Badge` |
| 进度条 | `Progress` | `Progress` |
| 骨架屏 | `Spin` | `Skeleton` |
| 提示框 | `Tooltip` | `Tooltip` |
| 图表 | `echarts-for-react` | `Chart` (Recharts) |
| 分隔线 | `Divider` | `Separator` |
| 标签页 | `Tabs` | `Tabs` |

---

## 九、确认签字

| 角色 | 姓名 | 日期 | 确认 |
|------|------|------|------|
| 产品经理 | | | ☐ |
| UI设计师 | | | ☐ |
| 前端开发 | | | ☐ |
| 测试工程师 | | | ☐ |

---

> **下一步**: 确认后进入实施阶段，按 P0 → P1 → P2 优先级逐个实现。
> 
> **技术栈**: React + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
