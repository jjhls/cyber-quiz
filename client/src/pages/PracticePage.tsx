import { useEffect, useState } from 'react';
import { Typography, Card, Tag, Button, Input, Select, Space, Spin, message, Radio, Checkbox } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { practiceApi, wrongBookApi } from '../api/question';

const { Title, Text } = Typography;

interface PracticeQuestion {
  id: string;
  category: string;
  difficulty: string;
  type: string;
  title: string;
  options: string[];
  tags: string[];
  score: number;
}

const difficultyMap: Record<string, { color: string; label: string }> = {
  easy: { color: 'emerald', label: '简单' },
  medium: { color: 'amber', label: '中等' },
  hard: { color: 'red', label: '困难' },
};

export default function PracticePage() {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async (params?: { category?: string; difficulty?: string }) => {
    setLoading(true);
    try {
      const data = await practiceApi.getList(params);
      setQuestions(data.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载题目失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = (q: PracticeQuestion) => {
    setCurrentQ(q);
    setUserAnswer(null);
    setResult(null);
    setShowResult(false);
  };

  const handleSubmit = async () => {
    if (!currentQ || !userAnswer) {
      message.warning('请先选择答案');
      return;
    }
    try {
      const res = await practiceApi.submitAnswer(currentQ.id, userAnswer);
      setResult(res);
      setShowResult(true);
    } catch (err: any) {
      message.error(err.response?.data?.message || '提交失败');
    }
  };

  // Practice view
  if (currentQ) {
    const diff = difficultyMap[currentQ.difficulty];
    return (
      <div className="space-y-6">
        <Button onClick={() => { setCurrentQ(null); setShowResult(false); }} className="bg-slate-800 border-slate-700 text-slate-300 rounded-xl mb-4">
          ← 返回题库
        </Button>

        <Card className="bg-slate-900 border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Tag color={diff?.color}>{diff?.label}</Tag>
            <Tag color="default">{currentQ.score}分</Tag>
            <Tag color="cyan">{currentQ.category}</Tag>
          </div>

          <Title level={4} className="!text-slate-100 !mb-6 whitespace-pre-wrap">{currentQ.title}</Title>

          {currentQ.type === 'single' && (
            <Radio.Group value={userAnswer} onChange={e => setUserAnswer(e.target.value)} className="w-full">
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    userAnswer === opt
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}>
                    <Radio value={opt} className="text-slate-300">{opt}</Radio>
                  </div>
                ))}
              </div>
            </Radio.Group>
          )}

          {currentQ.type === 'truefalse' && (
            <Radio.Group value={userAnswer} onChange={e => setUserAnswer(e.target.value)} className="w-full">
              <div className="space-y-3">
                {['正确', '错误'].map(opt => (
                  <div key={opt} className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    userAnswer === opt
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}>
                    <Radio value={opt} className="text-slate-300">{opt === '正确' ? '✅ 正确' : '❌ 错误'}</Radio>
                  </div>
                ))}
              </div>
            </Radio.Group>
          )}

          {currentQ.type === 'fillblank' && (
            <Input
              placeholder="请输入答案..."
              value={userAnswer || ''}
              onChange={e => setUserAnswer(e.target.value)}
              className="bg-slate-800 border-slate-600 text-slate-100 rounded-xl h-12"
              size="large"
            />
          )}

          <div className="mt-6 flex gap-3">
            {!showResult ? (
              <Button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-400 border-0 text-white rounded-xl">
                提交答案
              </Button>
            ) : (
              <div className="w-full">
                <div className={`p-4 rounded-xl mb-4 ${result?.correct ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <div className="text-lg font-medium mb-2">
                    {result?.correct ? '✅ 回答正确！' : '❌ 回答错误'}
                  </div>
                  {!result?.correct && (
                    <div className="text-slate-300">
                      正确答案: {Array.isArray(result?.correctAnswer) ? result.correctAnswer.join(', ') : result?.correctAnswer}
                    </div>
                  )}
                </div>
                {result?.explanation && (
                  <div className="p-4 bg-slate-800/50 rounded-xl mb-4">
                    <Text className="text-slate-400">💡 解析: {result.explanation}</Text>
                  </div>
                )}
                <Button onClick={() => { setCurrentQ(null); setShowResult(false); }} className="bg-blue-500 hover:bg-blue-400 border-0 text-white rounded-xl">
                  继续练习
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Question list view
  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">📚 题库练习</Title>

      <div className="flex flex-wrap gap-3">
        <Select
          defaultValue="all"
          className="w-32 bg-slate-800 border-slate-700"
          onChange={(v) => loadQuestions(v === 'all' ? undefined : { category: v })}
          options={[
            { value: 'all', label: '全部分类' },
            { value: 'Web安全', label: 'Web安全' },
            { value: '密码学', label: '密码学' },
            { value: '逆向工程', label: '逆向工程' },
            { value: 'Misc', label: 'Misc' },
          ]}
        />
        <Select
          defaultValue="all"
          className="w-32 bg-slate-800 border-slate-700"
          onChange={(v) => loadQuestions(v === 'all' ? undefined : { difficulty: v })}
          options={[
            { value: 'all', label: '全部难度' },
            { value: 'easy', label: '简单' },
            { value: 'medium', label: '中等' },
            { value: 'hard', label: '困难' },
          ]}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spin size="large" /></div>
      ) : questions.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 rounded-2xl">
          <div className="text-center py-10">
            <span className="text-slate-500 text-lg">暂无题目</span>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map(q => {
            const diff = difficultyMap[q.difficulty];
            return (
              <Card key={q.id} className="bg-slate-900 border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag color={diff?.color}>{diff?.label}</Tag>
                      <span className="text-slate-100 font-medium">{q.title.substring(0, 80)}{q.title.length > 80 ? '...' : ''}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span>分类: {q.category}</span>
                      <span>{q.score}分</span>
                    </div>
                    <Space className="mt-2">
                      {q.tags.map((t: string) => <Tag key={t} className="text-xs">{t}</Tag>)}
                    </Space>
                  </div>
                  <Button onClick={() => handleStartPractice(q)} className="bg-blue-500 hover:bg-blue-400 border-0 text-white rounded-xl shrink-0">
                    开始练习
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
