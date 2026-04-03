# UI 美化 P0 - 执行计划

> **关联需求**: `docs/requirements/ui-beautification-p0.md`

---

## 1. 执行策略

**等级: M**（单文件修改，无依赖关系）

---

## 2. 阶段划分

### Phase A: 全局样式增强（index.css）
- 添加背景网格 CSS
- 添加聚光灯渐变 CSS
- 添加卡片顶部高亮条 CSS
- 添加倒计时圆形进度环样式

### Phase B: 布局组件更新（MainLayout）
- 在 Content 区域应用背景网格
- 确保不影响现有布局

### Phase C: 答题结果页美化（ExamResultPage）
- 数字滚动动画
- 圆形进度图
- 分数评价系统

### Phase D: 答题页倒计时优化（ExamPage）
- SVG 圆形进度环
- 颜色动态变化

---

## 3. 文件变更清单

| 文件 | 变更类型 | 描述 |
|------|---------|------|
| `client/src/index.css` | 修改 | 添加背景网格、聚光灯、卡片装饰样式 |
| `client/src/layouts/MainLayout.tsx` | 修改 | 应用背景效果 |
| `client/src/pages/ExamResultPage.tsx` | 重写 | 分数动画 + 圆形进度图 + 评价 |
| `client/src/pages/ExamPage.tsx` | 修改 | 倒计时圆形进度环 |

---

## 4. 验证

- `cd client && npx tsc --noEmit` 通过
- 浏览器手动验证视觉效果
