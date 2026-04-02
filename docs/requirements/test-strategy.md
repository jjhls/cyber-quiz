# 网络安全竞赛平台 - 测试策略建议

> 针对本项目的特点，以下是分层测试策略建议。

---

## 一、测试分层策略

```
┌─────────────────────────────────────────┐
│           E2E 测试 (Playwright)          │  ← 核心用户流程
├─────────────────────────────────────────┤
│         集成测试 (Supertest)             │  ← API 端到端
├─────────────────────────────────────────┤
│       单元测试 (Jest / Vitest)           │  ← 判分逻辑、工具函数
├─────────────────────────────────────────┤
│       组件测试 (React Testing Library)   │  ← UI 组件交互
└─────────────────────────────────────────┘
```

---

## 二、各层测试重点

### 2.1 单元测试（最高优先级）

**为什么重要**: 判分逻辑是平台的核心，任何错误都会直接影响竞赛公平性。

| 测试对象 | 测试内容 | 示例用例 |
|---------|---------|---------|
| **判分引擎** | 四种题型的判分逻辑 | 单选精确匹配、多选全对才得分、填空忽略大小写、填空多答案 |
| **随机化算法** | 题目/选项随机打乱 | Fisher-Yates 洗牌、随机种子可重现 |
| **时间计算** | 倒计时、用时计算、超时判定 | 边界情况（0秒、负数、跨天） |
| **排名算法** | 同分按用时排序 | 多用户同分场景、新提交更新排名 |
| **CSV 解析** | 题目批量导入 | 编码处理、字段校验、错误行跳过 |
| **密码加密** | bcrypt 哈希验证 | 盐值随机性、哈希不可逆 |

**推荐工具**: Vitest（与 Vite 生态一致）或 Jest

**示例 - 判分逻辑测试**:

```ts
describe('Scoring Engine', () => {
  it('单选题：精确匹配选项', () => {
    expect(scoreSingleChoice('A', 'A')).toBe(true);
    expect(scoreSingleChoice('A', 'B')).toBe(false);
  });

  it('多选题：全对才得分', () => {
    expect(scoreMultipleChoice(['A', 'B'], ['A', 'B'])).toBe(true);
    expect(scoreMultipleChoice(['A'], ['A', 'B'])).toBe(false);      // 漏选
    expect(scoreMultipleChoice(['A', 'B', 'C'], ['A', 'B'])).toBe(false); // 多选
  });

  it('填空题：忽略大小写和首尾空格', () => {
    expect(scoreFillBlank('  Admin  ', ['admin'])).toBe(true);
    expect(scoreFillBlank('ADMIN', ['admin'])).toBe(true);
    expect(scoreFillBlank('admin', ['admin', 'root'])).toBe(true);  // 多答案
  });

  it('判断题：精确匹配', () => {
    expect(scoreTrueFalse('true', 'true')).toBe(true);
    expect(scoreTrueFalse('false', 'true')).toBe(false);
  });
});
```

---

### 2.2 集成测试（API 层）

**为什么重要**: 验证前后端接口契约，确保数据流转正确。

| 测试对象 | 测试内容 | 示例用例 |
|---------|---------|---------|
| **认证流程** | 注册→登录→获取用户→修改密码→登出 | Session 保持、未登录拦截 |
| **题目 CRUD** | 增删改查 + 分页筛选 | 软删除不返回、分类筛选准确 |
| **竞赛流程** | 创建→发布→报名→获取试卷 | 未开始不能报名、已结束不能答题 |
| **答题提交** | 提交答案→自动判分→生成成绩 | 重复提交拦截、超时提交处理 |
| **排行榜** | 排名计算、实时更新 | 同分排序、新提交更新排名 |
| **权限控制** | 管理员/普通用户权限 | 普通用户无法访问管理接口 |

**推荐工具**: Supertest + Jest

**示例 - API 集成测试**:

```ts
describe('POST /api/auth/login', () => {
  it('正确凭据返回 Session', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });
    
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('testuser');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('错误凭据返回 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });
    
    expect(res.status).toBe(401);
  });
});

describe('POST /api/exams/:contestId/submit', () => {
  it('提交答案后自动判分并生成成绩', async () => {
    const res = await request(app)
      .post('/api/exams/contest-123/submit')
      .send({ answers: { 'q1': 'A', 'q2': ['A', 'B'] } });
    
    expect(res.status).toBe(200);
    expect(res.body.score).toBeGreaterThan(0);
    expect(res.body.correctCount).toBeDefined();
  });

  it('重复提交返回 400', async () => {
    // 先提交一次
    await request(app).post('/api/exams/contest-123/submit').send({ answers: {} });
    // 再次提交
    const res = await request(app).post('/api/exams/contest-123/submit').send({ answers: {} });
    expect(res.status).toBe(400);
  });
});
```

---

### 2.3 组件测试（前端 UI）

**为什么重要**: 确保 UI 组件交互正确，特别是答题组件。

| 测试对象 | 测试内容 | 示例用例 |
|---------|---------|---------|
| **倒计时组件** | 时间递减、颜色变化、闪烁 | 剩余 5 分钟变红、0 时触发回调 |
| **题号网格** | 状态渲染、点击切换 | 已答/当前/标记/未答样式正确 |
| **单选题组件** | 选项选择、互斥逻辑 | 选中 A 后 B 自动取消 |
| **多选题组件** | 多选逻辑、全选/取消 | 最多选 N 个、选中状态正确 |
| **填空题组件** | 输入校验、多答案提示 | 去除首尾空格、大小写不敏感提示 |
| **提交确认弹窗** | 已答/未答题数显示 | 未答题警告、确认/取消 |

**推荐工具**: Vitest + React Testing Library

**示例 - 组件测试**:

```tsx
describe('Countdown Component', () => {
  it('正常状态显示蓝色', () => {
    render(<Countdown remainingMinutes={30} />);
    const timer = screen.getByText(/00:30:00/);
    expect(timer).toHaveClass('text-blue-400');
  });

  it('剩余不足 5 分钟显示红色并闪烁', () => {
    render(<Countdown remainingMinutes={4} />);
    const timer = screen.getByText(/00:04:00/);
    expect(timer).toHaveClass('text-red-400');
    expect(timer).toHaveClass('animate-pulse');
  });

  it('时间到触发回调', async () => {
    const onTimeout = vi.fn();
    render(<Countdown remainingMinutes={0.05} onTimeout={onTimeout} />);
    await vi.advanceTimersByTimeAsync(3000);
    expect(onTimeout).toHaveBeenCalled();
  });
});
```

---

### 2.4 E2E 测试（核心用户流程）

**为什么重要**: 模拟真实用户操作，验证完整业务流程。

| 测试场景 | 流程 | 验证点 |
|---------|------|--------|
| **完整参赛流程** | 注册→登录→浏览竞赛→报名→答题→提交→查看结果 | 成绩正确、排名更新 |
| **管理员出题流程** | 登录→创建题目→创建竞赛→发布 | 竞赛状态正确 |
| **自由练习流程** | 登录→筛选题目→答题→查看解析 | 即时反馈正确 |
| **错题本流程** | 答题出错→查看错题本→重练→移除 | 错题收集准确 |

**推荐工具**: Playwright

**示例 - E2E 测试**:

```ts
test('完整参赛流程', async ({ page }) => {
  // 1. 注册
  await page.goto('/register');
  await page.fill('[name="username"]', 'testuser');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // 2. 登录
  await page.goto('/login');
  await page.fill('[name="username"]', 'testuser');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // 3. 报名参赛
  await page.goto('/contests');
  await page.click('text=立即参赛');
  
  // 4. 答题
  await page.waitForURL(/\/exam/);
  await page.click('text=A. SQL注入');
  await page.click('text=下一题');
  
  // 5. 提交
  await page.click('text=提交试卷');
  await page.click('text=确认提交');
  
  // 6. 验证结果
  await page.waitForURL(/\/result/);
  await expect(page.locator('text=分')).toBeVisible();
});
```

---

## 三、本项目特殊测试场景

### 3.1 计时器精度测试

```ts
describe('计时器精度', () => {
  it('服务器时间与客户端时间校准', () => {
    // 客户端时间与服务器时间差 < 1 秒
    // 防止客户端篡改时间
  });

  it('网络延迟不影响计时', () => {
    // 模拟 500ms 网络延迟，计时器不受影响
  });

  it('页面刷新后计时继续', () => {
    // 刷新页面后倒计时从正确位置继续
  });
});
```

### 3.2 并发竞赛测试

```ts
describe('并发场景', () => {
  it('50 人同时提交答案', async () => {
    // 模拟 50 个用户同时提交
    // 验证：所有提交都正确处理，无数据丢失
    // 验证：排行榜正确更新
  });

  it('竞赛结束瞬间提交', () => {
    // 在竞赛结束前 1 秒提交
    // 验证：提交有效
    // 在竞赛结束后 1 秒提交
    // 验证：提交被拒绝
  });
});
```

### 3.3 防作弊测试

```ts
describe('防作弊机制', () => {
  it('同一用户不能同时参加同一竞赛', () => {
    // 重复报名返回 400
  });

  it('已提交的试卷不能修改', () => {
    // 提交后再次调用提交接口返回 400
  });

  it('题目随机顺序验证', () => {
    // 同一用户两次获取试卷题目顺序不同
    // 不同用户获取同一试卷题目顺序不同
  });

  it('选项随机顺序验证', () => {
    // 同一题目不同用户看到的选项顺序不同
  });
});
```

### 3.4 数据一致性测试

```ts
describe('数据一致性', () => {
  it('提交答案后错题本自动更新', () => {
    // 答错的题目自动加入错题本
    // 答对的题目不加入错题本
  });

  it('排行榜与提交记录一致', () => {
    // 排行榜数据与 Submission 表数据一致
  });

  it('删除题目后关联数据清理', () => {
    // 软删除题目后，竞赛中不再包含该题
  });
});
```

---

## 四、测试工具推荐

| 用途 | 工具 | 理由 |
|------|------|------|
| **单元测试** | Vitest | 与 Vite 生态一致，速度快 |
| **API 集成测试** | Supertest + Jest | Express 标准测试方案 |
| **组件测试** | React Testing Library | 测试用户交互而非实现细节 |
| **E2E 测试** | Playwright | 跨浏览器，速度快，API 友好 |
| **Mock 数据** | MSW (Mock Service Worker) | 拦截 API 请求，无需启动后端 |
| **测试覆盖率** | c8 / istanbul | 覆盖率报告 |
| **数据库测试** | Prisma + SQLite (内存模式) | 每个测试用例独立数据库 |

---

## 五、测试覆盖率目标

| 层级 | 目标覆盖率 | 重点 |
|------|-----------|------|
| **判分逻辑** | ≥ 95% | 核心业务，零容忍 |
| **后端 API** | ≥ 80% | 所有端点至少一个用例 |
| **前端组件** | ≥ 70% | 交互组件优先 |
| **工具函数** | ≥ 90% | 纯函数易测试 |
| **整体项目** | ≥ 75% | 综合目标 |

---

## 六、测试执行策略

### 6.1 CI/CD 集成（未来）

```yaml
# 示例 GitHub Actions
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm ci
    - run: npx prisma db push
    - run: npm run test:unit      # 单元测试
    - run: npm run test:integration  # 集成测试
    - run: npm run test:e2e       # E2E 测试
```

### 6.2 本地开发

```bash
# 运行所有测试
npm test

# 只运行单元测试
npm run test:unit

# 只运行 API 测试
npm run test:integration

# 只运行 E2E 测试
npm run test:e2e

# 生成覆盖率报告
npm run test:coverage
```

### 6.3 测试数据管理

```ts
// 测试 fixtures
const testFixtures = {
  user: { username: 'testuser', password: 'password123' },
  admin: { username: 'admin', password: 'admin123', role: 'admin' },
  questions: [
    { type: 'single', title: '测试单选', options: ['A', 'B', 'C', 'D'], answer: 'A' },
    { type: 'multiple', title: '测试多选', options: ['A', 'B', 'C', 'D'], answer: ['A', 'B'] },
    { type: 'truefalse', title: '测试判断', answer: 'true' },
    { type: 'fillblank', title: '测试填空', answer: ['admin', 'root'] },
  ],
};
```

---

## 七、MVP 阶段测试优先级

考虑到项目规模，MVP 阶段建议按以下优先级实施测试：

| 优先级 | 测试内容 | 原因 |
|--------|---------|------|
| **P0** | 判分逻辑单元测试 | 核心功能，错误直接影响公平性 |
| **P0** | 认证 API 测试 | 安全基础 |
| **P0** | 答题提交 API 测试 | 核心流程 |
| **P1** | 完整参赛 E2E 测试 | 验证端到端流程 |
| **P1** | 排行榜逻辑测试 | 竞赛核心体验 |
| **P1** | 倒计时组件测试 | 答题关键交互 |
| **P2** | 其他组件测试 | 提升代码质量 |
| **P2** | 性能/并发测试 | 50 人并发验证 |

---

> **建议**: MVP 阶段先保证 P0 测试覆盖，后续迭代逐步补充 P1/P2。
> 判分逻辑和认证相关测试必须在 Phase 1 和 Phase 4 完成时同步完成。
