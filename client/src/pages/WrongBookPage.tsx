import { Typography, Card, Tag, Button, Select, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockWrongAnswers = [
  { id: '1', category: '密码学', difficulty: 'medium', title: '以下哪个不是非对称加密算法?', yourAnswer: 'RSA', correctAnswer: 'AES', errorCount: 3, explanation: 'AES是对称加密算法，RSA/ECC/DSA是非对称加密算法。' },
  { id: '2', category: 'Web安全', difficulty: 'easy', title: 'XSS攻击主要发生在哪一层?', yourAnswer: '网络层', correctAnswer: '应用层', errorCount: 2, explanation: 'XSS（跨站脚本攻击）发生在应用层，通过注入恶意脚本到网页中执行。' },
];

const difficultyMap: Record<string, { color: string; label: string }> = {
  easy: { color: 'emerald', label: '简单' },
  medium: { color: 'amber', label: '中等' },
  hard: { color: 'red', label: '困难' },
};

export default function WrongBookPage() {
  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">❌ 我的错题本</Title>

      <div className="flex flex-wrap gap-3">
        <Select defaultValue="all" className="w-32 bg-slate-800 border-slate-700" options={[{ value: 'all', label: '全部分类' }]} />
        <Select defaultValue="count" className="w-36 bg-slate-800 border-slate-700" options={[{ value: 'count', label: '按错误次数' }, { value: 'date', label: '按时间' }]} />
        <Input prefix={<SearchOutlined className="text-slate-500" />} placeholder="搜索错题..." className="flex-1 min-w-48 bg-slate-800 border-slate-700 text-slate-100 rounded-xl" />
      </div>

      <div className="space-y-4">
        {mockWrongAnswers.map(q => {
          const diff = difficultyMap[q.difficulty];
          return (
            <Card key={q.id} className="bg-slate-900 border-slate-800 rounded-2xl">
              <div className="mb-3">
                <Tag color={diff.color}>{diff.label}</Tag>
                <Text className="text-slate-100 font-medium ml-2">{q.title}</Text>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <Text className="text-red-400 text-sm block mb-1">你的答案</Text>
                  <Text className="text-slate-100">{q.yourAnswer}</Text>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Text className="text-emerald-400 text-sm block mb-1">正确答案</Text>
                  <Text className="text-slate-100">{q.correctAnswer}</Text>
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl mb-3">
                <Text className="text-slate-400 text-sm">💡 解析: {q.explanation}</Text>
              </div>
              <Space>
                <Button type="primary" className="bg-blue-500 hover:bg-blue-400 border-0 rounded-xl">重新练习</Button>
                <Button className="bg-slate-800 border-slate-700 text-slate-400 rounded-xl">移除</Button>
              </Space>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
