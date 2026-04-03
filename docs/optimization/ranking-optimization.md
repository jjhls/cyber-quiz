# 排行榜界面优化方案

> **版本**: v1.0
> **创建日期**: 2026-04-03
> **状态**: ✅ 已完成

---

## 一、当前问题分析（优化前）

| 模块 | 现状 | 问题 |
|------|------|------|
| **竞赛选择** | 无选择器，只显示第一个进行中的竞赛 | 无法查看已结束竞赛的排行榜 |
| **统计卡片** | 无 | 缺少参赛人数、最高分、我的排名等关键数据 |
| **领奖台** | 有基础实现，无头像 | 前三名头像显示为首字母，无真实头像 |
| **排行榜表格** | 纯文本列表 | 缺少用户头像、我的排名高亮 |
| **布局** | 单卡片简单排列 | 缺少 Bento 网格布局 |
| **视觉效果** | 基础样式 | 缺少悬浮、交错入场、极光背景等高级效果 |

---

## 二、已完成功能 ✅

### 2.1 竞赛选择器
- ✅ 下拉菜单切换不同竞赛的排行榜
- ✅ 自动过滤已进行中和已结束的竞赛
- ✅ 显示竞赛状态标签（进行中/已结束）

### 2.2 统计卡片（3 个）
- ✅ **参赛人数**：显示当前竞赛参赛总人数，带数字滚动动画
- ✅ **最高分**：显示第一名得分，带数字滚动动画
- ✅ **我的排名**：显示当前用户的排名，未参赛显示"未参赛"
- ✅ **紧凑布局**：标签与数值并排显示（flex 横向布局），避免短数据独占一行

### 2.3 领奖台优化
- ✅ 前三名显示真实用户头像（从 auth store 获取）
- ✅ 增加用时显示（分+秒）
- ✅ 弹簧动画入场效果
- ✅ 金银铜渐变领奖台柱
- ✅ **动态高度**：领奖台柱高度根据分数比例动态计算（最低 80px，最高 160px），分数差异越大高度差越明显

### 2.4 排行榜表格
- ✅ 用户名列显示用户头像（28px）
- ✅ 我的排名行蓝色背景高亮
- ✅ 排名图标（🥇🥈🥉）
- ✅ 分数、正确率、用时、提交时间列
- ✅ **分页功能**：每页 10 条，显示总数，避免长列表无限下拉

### 2.5 高级视觉效果
- ✅ **悬浮抬起**：所有卡片 hover 上移 8px + 加深阴影
- ✅ **交错入场**：统计卡片依次入场，延迟 0.1s
- ✅ **极光背景**：页面背景模糊渐变色块漂浮
- ✅ **数字滚动**：统计数字从 0 增长到目标值

### 2.6 布局优化
- ✅ Bento Grid 布局（3 列统计卡片）
- ✅ 卡片高度统一，无明显空白
- ✅ 暗色/亮色主题适配
- ✅ 移动端响应式

---

## 三、技术实现要点

### 3.1 竞赛选择器
```tsx
<Select
  value={selectedContestId}
  onChange={setSelectedContestId}
  options={contests.map(c => ({
    value: c.id,
    label: `${c.title} (${c.status === 'ongoing' ? '进行中' : '已结束'})`,
  }))}
/>
```

### 3.2 统计卡片（紧凑布局）
```tsx
<div className="flex items-center gap-4">
  <div>
    <Text>参赛人数</Text>
    <div className="text-3xl font-bold">
      <AnimatedCounter value={rankings.length} />
    </div>
  </div>
  <div className="text-lg">人</div>
</div>
```

### 3.3 领奖台动态高度
```tsx
// 根据分数比例计算柱高（min 80px, max 160px）
const maxScore = top3[0].score || 1;
const getHeight = (score: number) => {
  const ratio = score / maxScore;
  return Math.round(80 + (160 - 80) * ratio);
};

<motion.div
  animate={{ height: barHeights[i] }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
/>
```

### 3.4 头像显示
```tsx
{userAvatars[r.userId] ? (
  <Avatar src={userAvatars[r.userId]} size={28} />
) : (
  <Avatar size={28} className="bg-gradient-to-br from-blue-500 to-violet-500">
    {u.charAt(0)}
  </Avatar>
)}
```

### 3.5 我的排名高亮
```tsx
rowClassName={(record) => {
  if (myRank && record.rank === myRank) {
    return isDark ? 'bg-blue-500/10' : 'bg-blue-50';
  }
  return '';
}}
```

### 3.6 表格分页
```tsx
<Table
  columns={columns}
  dataSource={rankings.filter(r => r.rank > 3)}
  pagination={{
    pageSize: 10,
    showSizeChanger: false,
    showTotal: (total) => `共 ${total} 条`,
  }}
/>
```

---

## 四、验收标准

- [x] 竞赛选择器可切换不同竞赛排行榜
- [x] 3 个统计卡片显示正确数据
- [x] 统计卡片标签与数值并排显示（紧凑布局）
- [x] 领奖台显示真实用户头像
- [x] 领奖台柱高度根据分数比例动态计算
- [x] 排行榜表格显示用户头像
- [x] 我的排名行蓝色高亮
- [x] 排行榜表格分页（每页 10 条）
- [x] 悬浮抬起效果
- [x] 交错入场动画
- [x] 数字滚动动画
- [x] 极光背景效果
- [x] 亮色/暗色主题适配正常
- [x] 移动端响应式正常

---

> **技术栈**: React + TypeScript + Tailwind CSS + Ant Design + Framer Motion
> 
> **参考来源**: [VibeVibe 5.5 让页面更高级的效果](https://www.vibevibe.cn/Advanced/05-ui-ux/05-advanced-effects.html)
