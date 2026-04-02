# 网络安全竞赛平台 - UI/UX 设计方案（v2 - Bento + Tailwind）

---

## 一、整体设计风格

### 风格定位：Bento Grid + Tailwind 暗色科技风

融合 **Bento 网格布局** 的秩序感与 **Tailwind 配色系统** 的克制美学，打造现代、专业、干净的网络安全竞赛平台。

| 维度 | 方案 |
|------|------|
| **布局哲学** | Bento Grid — 模块化卡片网格，大小不一但和谐统一 |
| **主题模式** | 暗色模式（Dark Mode）为主 |
| **背景色系** | Tailwind `slate` 色系（slate-950 → slate-800） |
| **主色调** | Tailwind `blue` 色系（blue-500 / blue-400 作为强调色） |
| **圆角** | 中等圆角（12-16px），Bento 风格标志性柔和感 |
| **字体** | 标题 `Inter` / `Noto Sans SC`；代码片段 `JetBrains Mono` |
| **阴影** | 柔和层叠阴影，不用发光效果，保持克制 |

### 颜色系统（Tailwind 原生色值）

```
背景层:
  bg-primary:      slate-950  (#020617)  — 页面底色
  bg-secondary:    slate-900  (#0f172a)  — 卡片背景
  bg-tertiary:     slate-800  (#1e293b)  — 输入框/次级面板
  bg-elevated:     slate-700  (#334155)  — 悬浮层/弹窗

主色调 (blue 系):
  accent:          blue-500   (#3b82f6)  — 主按钮/链接/高亮
  accent-hover:    blue-400   (#60a5fa)  — hover 状态
  accent-subtle:   blue-500/10           — 低透明度背景点缀
  accent-border:   blue-500/20           — 强调边框

语义色:
  success:         emerald-500 (#10b981) — 正确/通过
  warning:         amber-500   (#f59e0b) — 警告/即将超时
  error:           red-500     (#ef4444) — 错误/失败
  info:            sky-400     (#38bdf8) — 信息提示

文字:
  text-primary:    slate-100   (#f1f5f9) — 主文字
  text-secondary:  slate-400   (#94a3b8) — 次要文字
  text-muted:      slate-500   (#64748b) — 弱化文字

边框:
  border-default:  slate-800   (#1e293b)
  border-strong:   slate-700   (#334155)
```

### 为什么选 Slate + Blue？

- **Slate** 是 Tailwind 最中性、最克制的灰色系，带微蓝底调，比纯灰更有质感，比纯蓝更沉稳
- **Blue** 作为唯一强调色，建立清晰的视觉层级，不会像霓虹色那样喧宾夺主
- 整体感觉：**专业竞赛平台**，而不是"黑客主题网站"，更符合实际使用场景

---

## 二、Bento Grid 布局详解

### 2.1 Bento 布局核心规则

```
┌─────────────┬─────────────┬─────────────┐
│   2x2 大卡   │   1x2 中卡   │   1x1 小卡   │
│             │             │             │
│             ├─────────────┼─────────────┤
│             │   1x1 小卡   │   1x1 小卡   │
├─────────────┴─────────────┴─────────────┤
│              2x1 宽卡（全宽）             │
└─────────────────────────────────────────┘
```

**Bento 卡片规则**：
- 每张卡片是独立的功能模块，有明确的边界
- 卡片尺寸遵循 1x1 / 2x1 / 1x2 / 2x2 网格系统
- 卡片间距统一（gap-4 / gap-6）
- 卡片内边距统一（p-5 / p-6）
- 卡片背景：`bg-slate-900` + `border border-slate-800` + `rounded-2xl`

### 2.2 首页（Dashboard）— Bento 布局

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] 导航栏 [竞赛] [题库] [排行] [我的]         [头像] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  👋 欢迎回来，张三                                        │
│                                                          │
│  ┌─────────────────┬──────────────┬──────────────────┐  │
│  │                 │              │                  │  │
│  │  🏁 正在进行的   │  📊 我的     │  🏆 当前排名     │  │
│  │  竞赛 (3)       │  总正确率     │  #15 / 86 人     │  │
│  │                 │  78.5%       │  ↑ 较上周 +3     │  │
│  │  [立即参加 →]   │  ↑ +2.3%     │                  │  │
│  │                 │              │                  │  │
│  └─────────────────┴──────────────┴──────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────┬──────────────────┐ │
│  │                                  │                  │ │
│  │  📈 能力雷达图                     │  ⏰ 下一场比赛    │ │
│  │  (Web/密码/逆向/Misc/基础/法规)   │                  │ │
│  │                                  │  密码学专项赛     │ │
│  │                                  │  04-10 14:00     │ │
│  │                                  │  [预约提醒]       │ │
│  │                                  │                  │ │
│  └──────────────────────────────────┴──────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  📢 最新公告                                        │  │
│  │  [2026-04-01] 第三届网络安全知识竞赛即将开始...      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Bento 网格实现（Tailwind CSS）**：

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 2x2 大卡 — 正在进行竞赛 */}
  <div className="col-span-1 md:col-span-2 row-span-2 
                  bg-slate-900 border border-slate-800 rounded-2xl p-6">
    <h3 className="text-lg font-semibold text-slate-100">🏁 正在进行的竞赛</h3>
    {/* 竞赛列表 */}
  </div>

  {/* 1x2 中卡 — 正确率 */}
  <div className="col-span-1 row-span-2 
                  bg-slate-900 border border-slate-800 rounded-2xl p-6">
    <h3 className="text-lg font-semibold text-slate-100">📊 总正确率</h3>
    <p className="text-4xl font-bold text-blue-400 mt-4">78.5%</p>
  </div>

  {/* 1x1 小卡 — 排名 */}
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
    <h3 className="text-sm font-medium text-slate-400">🏆 当前排名</h3>
    <p className="text-3xl font-bold text-slate-100 mt-2">#15</p>
  </div>

  {/* 1x1 小卡 — 下一场 */}
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
    <h3 className="text-sm font-medium text-slate-400">⏰ 下一场比赛</h3>
    <p className="text-slate-100 mt-2">密码学专项赛</p>
  </div>

  {/* 2x1 宽卡 — 雷达图 */}
  <div className="col-span-1 md:col-span-2 
                  bg-slate-900 border border-slate-800 rounded-2xl p-6">
    <h3 className="text-lg font-semibold text-slate-100">📈 能力分布</h3>
    {/* ECharts 雷达图 */}
  </div>

  {/* 2x1 宽卡 — 公告 */}
  <div className="col-span-1 md:col-span-2 lg:col-span-4 
                  bg-slate-900 border border-slate-800 rounded-2xl p-6">
    <h3 className="text-lg font-semibold text-slate-100">📢 最新公告</h3>
  </div>
</div>
```

### 2.3 竞赛列表页 — Bento 卡片

```
┌──────────────────────────────────────────────────────────┐
│  🏁 竞赛列表                                              │
│  [全部] [进行中] [即将开始] [已结束]        [🔍 搜索]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────┬─────────────────────────┐│
│  │ 🟢 第三届网络安全知识竞赛    │ 🟡 密码学专项赛          ││
│  │                            │                         ││
│  │ ⏰ 04-05 10:00 ~ 11:30     │ ⏰ 04-10 14:00 ~ 15:00 ││
│  │ 📋 50题 | 100分            │ 📋 30题 | 100分         ││
│  │ 👥 42人已报名               │ 👥 18人已报名            ││
│  │                            │                         ││
│  │ [立即参赛 →]               │ [预约报名 →]             ││
│  └────────────────────────────┴─────────────────────────┘│
│                                                          │
│  ┌────────────────────────────┬─────────────────────────┐│
│  │ 🔴 第二届CTF理论赛          │ 🟢 Web安全专项赛         ││
│  │                            │                         ││
│  │ ⏰ 已结束 | 40题 | 100分    │ ⏰ 进行中 | 25题 | 100分││
│  │ 🏅 我的排名: #8 | 85分     │ 👥 23人已报名            ││
│  │                            │                         ││
│  │ [查看成绩 →]               │ [立即参赛 →]             ││
│  └────────────────────────────┴─────────────────────────┘│
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.4 答题页面 — 专注模式

```
┌──────────────────────────────────────────────────────────┐
│ ← 返回    第三届网络安全知识竞赛                          │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│  ⏱ 01:23:45  │  第 12/50 题        [单选题]  [3分]       │
│  (blue-400)  │                                           │
│              │  以下哪种攻击方式属于注入攻击？             │
│  ┌─────────┐ │                                           │
│  │ 1  2  3 │ │  ○ A. SQL注入                             │
│  │ 4  5  6 │ │  ○ B. XSS跨站脚本                         │
│  │ 7  8  9 │ │  ○ C. CSRF跨站请求伪造                    │
│  │10 11 12 │ │  ○ D. 中间人攻击                          │
│  │13 14 15 │ │                                           │
│  │ ...     │ │  [上一题]  [☆ 标记]  [下一题 →]           │
│  │         │ │                                           │
│  │ 图例:    │ │                     [提交试卷]            │
│  │ ■ 已答   │ │                                           │
│  │ ■ 当前   │ │                                           │
│  │ ☆ 标记   │ │                                           │
│  │ ■ 未答   │ │                                           │
│  └─────────┘ │                                           │
└──────────────┴───────────────────────────────────────────┘
```

**答题页设计要点**：
- 左侧题号网格：`bg-slate-900 rounded-2xl` 卡片
- 当前题号：`bg-blue-500 text-white rounded-lg` 高亮
- 已答题号：`bg-blue-500/20 text-blue-400 rounded-lg`
- 标记题号：`border-amber-500 border-2`
- 倒计时颜色变化：正常 `text-blue-400` → < 15min `text-amber-400` → < 5min `text-red-400 animate-pulse`
- 选项选择：`border-blue-500 bg-blue-500/10` 选中态

### 2.5 答题结果页 — 数据展示

```
┌──────────────────────────────────────────────────────────┐
│  🎉 竞赛完成！                                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────┬────────────────┬───────────────┐ │
│  │                    │                │               │ │
│  │     85 分          │  答对 42/50    │  排名 #8      │ │
│  │  (text-5xl bold)   │  正确率 84%    │  / 45 人      │ │
│  │  (text-blue-400)   │                │               │ │
│  │                    │  用时 58:32    │  [查看排行]    │ │
│  │                    │                │               │ │
│  └────────────────────┴────────────────┴───────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  📊 各分类得分                                      │  │
│  │                                                    │  │
│  │  Web安全    ████████████░░░░  80%  (24/30)         │  │
│  │  密码学     ██████████████░░  90%  (18/20)         │  │
│  │  逆向工程   ████████░░░░░░░░  60%  (12/20)         │  │
│  │  Misc       ███████████████░  95%  (19/20)         │  │
│  │                                                    │  │
│  │  💡 薄弱项：逆向工程，建议加强练习                   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  [查看错题]  [返回首页]                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.6 排行榜页

```
┌──────────────────────────────────────────────────────────┐
│  🏆 排行榜                                                │
│  [总排行] [第三届竞赛] [密码学专项]                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │  🥇  1. 张三        98分    用时 42:15              │  │
│  │  🥈  2. 李四        95分    用时 45:30              │  │
│  │  🥉  3. 王五        92分    用时 48:20              │  │
│  │                                                    │  │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  │
│  │                                                    │  │
│  │      4. 赵六        90分    用时 50:10              │  │
│  │      5. 钱七        88分    用时 51:45              │  │
│  │      6. 孙八        87分    用时 53:20              │  │
│  │      7. 周九        86分    用时 55:10              │  │
│  │                                                    │  │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  │
│  │                                                    │  │
│  │  🔵  8. 我(张三)    85分    用时 58:32  ← 你在这里   │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.7 错题本页

```
┌──────────────────────────────────────────────────────────┐
│  ❌ 我的错题本                                            │
│  筛选: [分类▼] [难度▼] [错误次数▼]    [🔍 搜索]           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  [中等] 以下哪个不是非对称加密算法?                   │  │
│  │  分类: 密码学 | 错误次数: 3                         │  │
│  │                                                    │  │
│  │  你的答案: RSA          ❌                          │  │
│  │  正确答案: AES          ✅                          │  │
│  │                                                    │  │
│  │  💡 解析: AES是对称加密算法，RSA/ECC/DSA是非对称...   │  │
│  │                                                    │  │
│  │  [重新练习 →]  [移除]                               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 三、移动端适配方案

### 响应式断点（Tailwind 默认）

```
sm: 640px    — 手机横屏
md: 768px    — 平板
lg: 1024px   — 小桌面
xl: 1280px   — 桌面
```

### 移动端布局变化

| 页面 | PC（lg+） | 平板（md） | 手机（sm） |
|------|-----------|-----------|-----------|
| 首页 | 4 列 Bento | 2 列 Bento | 单列堆叠 |
| 导航栏 | 顶部水平导航 | 顶部水平导航 | 底部 Tab 导航 |
| 竞赛列表 | 2 列卡片 | 2 列卡片 | 单列卡片 |
| 答题页 | 左侧进度 + 右侧题目 | 同上 | 顶部进度条 + 全屏题目 |
| 排行榜 | 完整列表 | 完整列表 | 精简列表 |
| 后台 | 左侧菜单 + 内容 | 同上 | 抽屉式菜单 |

### 移动端底部 Tab

```
┌─────────────────────────────────┐
│                                 │
│         页面内容                 │
│                                 │
├─────────────────────────────────┤
│  🏠     🏁     📚     🏆   👤   │
│ 首页   竞赛   题库   排行  我的  │
└─────────────────────────────────┘
```

实现：`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800`

---

## 四、组件设计规范

### 4.1 Bento 卡片基础样式

```tsx
// 标准 Bento 卡片
const BentoCard = ({ children, className = '' }) => (
  <div className={`
    bg-slate-900 
    border border-slate-800 
    rounded-2xl 
    p-6
    hover:border-slate-700 
    hover:shadow-lg hover:shadow-blue-500/5
    transition-all duration-200
    ${className}
  `}>
    {children}
  </div>
);
```

### 4.2 按钮规范

```tsx
// 主按钮
className="bg-blue-500 hover:bg-blue-400 text-white 
           px-5 py-2.5 rounded-xl font-medium 
           transition-colors duration-200"

// 次按钮
className="bg-slate-800 hover:bg-slate-700 text-slate-300 
           px-5 py-2.5 rounded-xl font-medium 
           border border-slate-700
           transition-colors duration-200"

// 文字按钮
className="text-blue-400 hover:text-blue-300 
           font-medium transition-colors duration-200"
```

### 4.3 标签/徽章规范

```tsx
// 难度标签
简单: "bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg text-sm"
中等: "bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg text-sm"
困难: "bg-red-500/10 text-red-400 px-2.5 py-1 rounded-lg text-sm"

// 竞赛状态
进行中: "bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm flex items-center gap-1.5"
       // 前面加一个绿色小圆点 animate-pulse
即将开始: "bg-amber-500/10 text-amber-400 ..."
已结束: "bg-slate-700 text-slate-400 ..."
```

### 4.4 输入框规范

```tsx
className="bg-slate-800 border border-slate-700 
           rounded-xl px-4 py-2.5 
           text-slate-100 placeholder-slate-500
           focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
           transition-colors duration-200"
```

---

## 五、动画与交互

### 推荐动画（克制、有目的）

| 场景 | 效果 | 实现 |
|------|------|------|
| 卡片 hover | 边框变亮 + 微阴影 | CSS transition |
| 页面切换 | 淡入淡出 | Framer Motion `AnimatePresence` |
| 按钮点击 | 缩放 0.97 | CSS `active:scale-[0.97]` |
| 倒计时 < 5min | 红色文字闪烁 | `animate-pulse` |
| 答题正确 | 绿色边框 + 轻微弹跳 | CSS animation |
| 答题错误 | 红色边框 + 抖动 | CSS animation |
| 列表加载 | 逐行淡入 | Framer Motion stagger |
| 进度条 | 平滑填充 | CSS `transition: width 0.5s ease` |

### 加载状态

- 使用 **Skeleton** 骨架屏（`bg-slate-800 animate-pulse rounded-xl`）
- 空状态：简洁插画 + 引导文字

---

## 六、技术选型

| 用途 | 选型 | 理由 |
|------|------|------|
| UI 框架 | **React 18 + TypeScript** | 类型安全，生态成熟 |
| 组件库 | **Ant Design 5** | 组件丰富，支持 CSS 变量主题定制 |
| 样式方案 | **Tailwind CSS** | 原子化 CSS，快速构建 Bento 布局 |
| 图表 | **ECharts** | 雷达图、柱状图功能完善 |
| 动画 | **Framer Motion** | React 动画首选，API 简洁 |
| 图标 | **Lucide React** | 现代简洁，Tree-shaking 友好 |
| 路由 | **React Router v6** | 标准选择 |
| 状态管理 | **Zustand** | 轻量，API 极简 |
| 表单 | **React Hook Form + Zod** | 类型安全表单验证 |

### Tailwind 配置建议

```ts
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 使用 Tailwind 原生 slate + blue，无需自定义
      },
      borderRadius: {
        '2xl': '1rem',     // 16px — Bento 卡片
        '3xl': '1.5rem',   // 24px — 大卡片
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
```

---

## 七、页面路由规划

```
/                    → 首页（Dashboard — Bento 布局）
/login               → 登录
/register            → 注册

/contests            → 竞赛列表
/contests/:id        → 竞赛详情
/contests/:id/join   → 报名确认
/contests/:id/exam   → 答题页面
/contests/:id/result → 答题结果

/practice            → 题库练习
/practice/:id        → 单题练习

/rankings            → 排行榜

/wrong-book          → 错题本
/profile             → 个人中心
/history             → 历史记录

/admin               → 后台管理首页
/admin/questions     → 题目管理
/admin/contests      → 竞赛管理
/admin/users         → 用户管理
/admin/stats         → 数据统计
```

---

## 八、设计检查清单

- [x] 确认使用深色主题（Dark Mode）
- [x] 确认背景色使用 Tailwind slate 色系
- [x] 确认主色调使用 Tailwind blue 色系
- [x] 确认使用 Bento Grid 布局
- [x] 确认卡片圆角 16px（rounded-2xl）
- [x] 确认使用 Ant Design + Tailwind CSS 组合
- [x] 确认使用 ECharts 做数据可视化
- [x] 确认响应式适配移动端
- [x] 确认移动端底部 Tab 导航
- [x] 确认页面路由结构
- [x] 确认动画效果范围（克制、有目的）

---

> **下一步**：确认此 UI 方案后，我将冻结需求文档并生成执行计划。
