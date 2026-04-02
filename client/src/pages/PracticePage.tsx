import { Typography, Card, Tag, Button, Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockQuestions = [
  { id: '1', category: 'Web安全', difficulty: 'easy', title: 'SQL注入中，以下哪个字符通常用于闭合字符串?', accuracy: 78, practiced: 156, tags: ['SQL注入'] },
  { id: '2', category: '密码学', difficulty: 'medium', title: 'AES加密的分组长度是多少位?', accuracy: 62, practiced: 89, tags: ['对称加密', 'AES'] },
  { id: '3', category: '逆向工程', difficulty: 'hard', title: '以下哪个工具常用于Windows平台的动态调试?', accuracy: 45, practiced: 34, tags: ['调试', '逆向'] },
];

const difficultyMap: Record<string, { color: string; label: string }> = {
  easy: { color: 'emerald', label: '简单' },
  medium: { color: 'amber', label: '中等' },
  hard: { color: 'red', label: '困难' },
};

export default function PracticePage() {
  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">📚 题库练习</Title>

      <div className="flex flex-wrap gap-3">
        <Select defaultValue="all" className="w-32 bg-slate-800 border-slate-700" options={[{ value: 'all', label: '全部分类' }, { value: 'web', label: 'Web安全' }, { value: 'crypto', label: '密码学' }]} />
        <Select defaultValue="all" className="w-32 bg-slate-800 border-slate-700" options={[{ value: 'all', label: '全部难度' }, { value: 'easy', label: '简单' }, { value: 'medium', label: '中等' }, { value: 'hard', label: '困难' }]} />
        <Input prefix={<SearchOutlined className="text-slate-500" />} placeholder="搜索题目..." className="flex-1 min-w-48 bg-slate-800 border-slate-700 text-slate-100 rounded-xl" />
      </div>

      <div className="space-y-4">
        {mockQuestions.map(q => {
          const diff = difficultyMap[q.difficulty];
          return (
            <Card key={q.id} className="bg-slate-900 border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag color={diff.color}>{diff.label}</Tag>
                    <Text className="text-slate-100 font-medium">{q.title}</Text>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Text className="text-slate-500">分类: {q.category}</Text>
                    <Text className="text-slate-500">正确率: {q.accuracy}%</Text>
                    <Text className="text-slate-500">已练习 {q.practiced} 次</Text>
                  </div>
                  <Space className="mt-2">
                    {q.tags.map(t => <Tag key={t} className="text-xs">{t}</Tag>)}
                  </Space>
                </div>
                <Button type="primary" className="bg-blue-500 hover:bg-blue-400 border-0 rounded-xl shrink-0">开始练习</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
