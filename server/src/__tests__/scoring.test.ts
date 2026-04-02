import { describe, it, expect } from 'vitest';

// ---- Scoring functions extracted from examController ----
function scoreSingleChoice(userAnswer: string, correctAnswer: string): boolean {
  if (!userAnswer || !correctAnswer) return false;
  return userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
}

function scoreMultipleChoice(userAnswer: string[], correctAnswer: string[]): boolean {
  if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) return false;
  if (userAnswer.length === 0 || correctAnswer.length === 0) return false;
  const sortedUser = [...userAnswer].map(a => a.trim().toUpperCase()).sort();
  const sortedCorrect = [...correctAnswer].map(a => a.trim().toUpperCase()).sort();
  if (sortedUser.length !== sortedCorrect.length) return false;
  return sortedUser.every((a, i) => a === sortedCorrect[i]);
}

function scoreTrueFalse(userAnswer: string, correctAnswer: string): boolean {
  if (!userAnswer || !correctAnswer) return false;
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}

function scoreFillBlank(userAnswer: string, correctAnswer: string[]): boolean {
  if (!userAnswer || !Array.isArray(correctAnswer) || correctAnswer.length === 0) return false;
  const trimmed = userAnswer.trim().toLowerCase();
  return correctAnswer.some((a: string) => a.trim().toLowerCase() === trimmed);
}

function safeParse<T = any>(json: string, fallback: T): T {
  try { return JSON.parse(json); } catch { return fallback; }
}

function scoreAnswer(type: string, userAnswer: any, correctAnswer: any): boolean {
  try {
    switch (type) {
      case 'single': return scoreSingleChoice(String(userAnswer ?? ''), String(correctAnswer ?? ''));
      case 'multiple': return scoreMultipleChoice(
        Array.isArray(userAnswer) ? userAnswer : [userAnswer],
        Array.isArray(correctAnswer) ? correctAnswer : safeParse(String(correctAnswer), [])
      );
      case 'truefalse': return scoreTrueFalse(String(userAnswer ?? ''), String(correctAnswer ?? ''));
      case 'fillblank': return scoreFillBlank(
        String(userAnswer ?? ''),
        Array.isArray(correctAnswer) ? correctAnswer : safeParse(String(correctAnswer), [])
      );
      default: return false;
    }
  } catch { return false; }
}

// ---- Tests ----

describe('Scoring Engine - 单选题', () => {
  it('正确答案返回 true', () => {
    expect(scoreSingleChoice('A', 'A')).toBe(true);
    expect(scoreSingleChoice('B', 'B')).toBe(true);
    expect(scoreSingleChoice('D', 'D')).toBe(true);
  });

  it('错误答案返回 false', () => {
    expect(scoreSingleChoice('A', 'B')).toBe(false);
    expect(scoreSingleChoice('C', 'D')).toBe(false);
  });

  it('忽略大小写', () => {
    expect(scoreSingleChoice('a', 'A')).toBe(true);
    expect(scoreSingleChoice('A', 'a')).toBe(true);
  });

  it('忽略首尾空格', () => {
    expect(scoreSingleChoice(' A ', 'A')).toBe(true);
    expect(scoreSingleChoice('A', '  A  ')).toBe(true);
  });

  it('空值返回 false', () => {
    expect(scoreSingleChoice('', 'A')).toBe(false);
    expect(scoreSingleChoice('A', '')).toBe(false);
  });
});

describe('Scoring Engine - 多选题', () => {
  it('全对返回 true', () => {
    expect(scoreMultipleChoice(['A', 'B'], ['A', 'B'])).toBe(true);
    expect(scoreMultipleChoice(['A', 'B', 'C'], ['A', 'B', 'C'])).toBe(true);
  });

  it('顺序无关', () => {
    expect(scoreMultipleChoice(['B', 'A'], ['A', 'B'])).toBe(true);
    expect(scoreMultipleChoice(['C', 'A', 'B'], ['A', 'B', 'C'])).toBe(true);
  });

  it('漏选返回 false', () => {
    expect(scoreMultipleChoice(['A'], ['A', 'B'])).toBe(false);
  });

  it('多选返回 false', () => {
    expect(scoreMultipleChoice(['A', 'B', 'C'], ['A', 'B'])).toBe(false);
  });

  it('全错返回 false', () => {
    expect(scoreMultipleChoice(['C', 'D'], ['A', 'B'])).toBe(false);
  });

  it('空数组返回 false', () => {
    expect(scoreMultipleChoice([], ['A', 'B'])).toBe(false);
    expect(scoreMultipleChoice(['A'], [])).toBe(false);
  });
});

describe('Scoring Engine - 判断题', () => {
  it('正确判断', () => {
    expect(scoreTrueFalse('正确', '正确')).toBe(true);
    expect(scoreTrueFalse('错误', '错误')).toBe(true);
  });

  it('错误判断', () => {
    expect(scoreTrueFalse('正确', '错误')).toBe(false);
    expect(scoreTrueFalse('错误', '正确')).toBe(false);
  });

  it('忽略首尾空格', () => {
    expect(scoreTrueFalse(' 正确 ', '正确')).toBe(true);
  });
});

describe('Scoring Engine - 填空题', () => {
  it('精确匹配', () => {
    expect(scoreFillBlank('admin', ['admin'])).toBe(true);
  });

  it('忽略大小写', () => {
    expect(scoreFillBlank('ADMIN', ['admin'])).toBe(true);
    expect(scoreFillBlank('Admin', ['admin'])).toBe(true);
  });

  it('忽略首尾空格', () => {
    expect(scoreFillBlank('  admin  ', ['admin'])).toBe(true);
  });

  it('多答案匹配', () => {
    expect(scoreFillBlank('admin', ['admin', 'root'])).toBe(true);
    expect(scoreFillBlank('root', ['admin', 'root'])).toBe(true);
    expect(scoreFillBlank('other', ['admin', 'root'])).toBe(false);
  });

  it('空值返回 false', () => {
    expect(scoreFillBlank('', ['admin'])).toBe(false);
  });
});

describe('Scoring Engine - scoreAnswer 统一入口', () => {
  it('单选题判分', () => {
    expect(scoreAnswer('single', 'A', 'A')).toBe(true);
    expect(scoreAnswer('single', 'B', 'A')).toBe(false);
  });

  it('多选题判分', () => {
    expect(scoreAnswer('multiple', ['A', 'B'], ['A', 'B'])).toBe(true);
    expect(scoreAnswer('multiple', ['A'], ['A', 'B'])).toBe(false);
  });

  it('判断题判分', () => {
    expect(scoreAnswer('truefalse', '正确', '正确')).toBe(true);
    expect(scoreAnswer('truefalse', '错误', '正确')).toBe(false);
  });

  it('填空题判分（数组形式）', () => {
    expect(scoreAnswer('fillblank', 'admin', ['admin'])).toBe(true);
    expect(scoreAnswer('fillblank', 'ADMIN', ['admin'])).toBe(true);
  });

  it('填空题判分（JSON 字符串形式）', () => {
    expect(scoreAnswer('fillblank', 'admin', '["admin","root"]')).toBe(true);
    expect(scoreAnswer('fillblank', 'root', '["admin","root"]')).toBe(true);
  });

  it('多选题判分（JSON 字符串形式）', () => {
    expect(scoreAnswer('multiple', ['A', 'B'], '["A","B"]')).toBe(true);
    expect(scoreAnswer('multiple', ['A'], '["A","B"]')).toBe(false);
  });

  it('未知题型返回 false', () => {
    expect(scoreAnswer('unknown', 'A', 'A')).toBe(false);
  });

  it('无效 JSON 不崩溃', () => {
    expect(scoreAnswer('fillblank', 'admin', 'invalid-json')).toBe(false);
  });

  it('null 输入不崩溃', () => {
    expect(scoreAnswer('single', null, null)).toBe(false);
    expect(scoreAnswer('multiple', null, null)).toBe(false);
    expect(scoreAnswer('truefalse', null, null)).toBe(false);
    expect(scoreAnswer('fillblank', null, null)).toBe(false);
  });
});
