import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Card, Tag, Button, Space, Spin, message } from 'antd';
import { wrongBookApi } from '../api/question';

const { Title, Text } = Typography;

interface WrongItem {
  id: string;
  questionId: string;
  userAnswer: any;
  correctAnswer: any;
  errorCount: number;
  question: { title: string; category: string; difficulty: string; type: string; explanation: string } | null;
}

const difficultyMap: Record<string, { color: string; label: string }> = {
  easy: { color: 'emerald', label: '简单' },
  medium: { color: 'amber', label: '中等' },
  hard: { color: 'red', label: '困难' },
};

export default function WrongBookPage() {
  const navigate = useNavigate();
  const [wrongItems, setWrongItems] = useState<WrongItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wrongBookApi.getList()
      .then(setWrongItems)
      .catch(err => message.error(err.response?.data?.message || '加载错题本失败'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await wrongBookApi.remove(id);
      setWrongItems(prev => prev.filter(w => w.id !== id));
      message.success('已移除错题');
    } catch (err: any) {
      message.error(err.response?.data?.message || '移除失败');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">❌ 我的错题本</Title>

      {wrongItems.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 rounded-2xl">
          <div className="text-center py-12">
            <svg className="w-20 h-20 mx-auto mb-4 text-slate-700" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="10" y="10" width="60" height="60" rx="8" />
              <line x1="25" y1="30" x2="55" y2="30" />
              <line x1="25" y1="40" x2="50" y2="40" />
              <line x1="25" y1="50" x2="45" y2="50" />
              <circle cx="58" cy="58" r="14" fill="#0f172a" stroke="currentColor" />
              <path d="M52 58 L58 64 L66 52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Text className="text-slate-500 text-lg block mb-2">暂无错题</Text>
            <Text className="text-slate-600">参加竞赛或练习后，错题会自动收录</Text>
            <div className="mt-4">
              <Button onClick={() => navigate('/practice')} className="bg-blue-500 hover:bg-blue-400 border-0 text-white rounded-xl">
                去练习 →
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {wrongItems.map(q => {
            const diff = difficultyMap[q.question?.difficulty || ''];
            return (
              <Card key={q.id} className="bg-slate-900 border-slate-800 rounded-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <Tag color={diff?.color}>{diff?.label}</Tag>
                  <span className="text-slate-100 font-medium">{q.question?.title || '题目已删除'}</span>
                </div>
                {q.question && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="p-3 bg-red-500/10 rounded-xl">
                      <span className="text-red-400 text-sm block mb-1">你的答案</span>
                      <span className="text-slate-100">{Array.isArray(q.userAnswer) ? q.userAnswer.join(', ') : String(q.userAnswer)}</span>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                      <span className="text-emerald-400 text-sm block mb-1">正确答案</span>
                      <span className="text-slate-100">{Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer)}</span>
                    </div>
                  </div>
                )}
                {q.question?.explanation && (
                  <div className="p-3 bg-slate-800/50 rounded-xl mb-3">
                    <span className="text-slate-400 text-sm">💡 解析: {q.question.explanation}</span>
                  </div>
                )}
                <Space>
                  <Button onClick={() => handleRemove(q.id)} className="bg-slate-800 border-slate-700 text-slate-400 rounded-xl">移除</Button>
                  <span className="text-slate-600 text-sm">错误次数: {q.errorCount}</span>
                </Space>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
