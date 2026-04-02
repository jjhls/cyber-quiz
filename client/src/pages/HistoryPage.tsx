import { Typography, Card, Table, Tag } from 'antd';

const { Title, Text } = Typography;

const mockHistory = [
  { id: '1', contest: '第三届网络安全知识竞赛', score: 85, total: 100, rank: 8, date: '2026-04-05', status: '已完成' },
  { id: '2', contest: '第二届CTF理论赛', score: 72, total: 100, rank: 12, date: '2026-03-20', status: '已完成' },
];

const columns = [
  { title: '竞赛', dataIndex: 'contest', key: 'contest', render: (v: string) => <Text className="text-slate-300">{v}</Text> },
  { title: '得分', dataIndex: 'score', key: 'score', render: (v: number, r: any) => <Text className="text-blue-400 font-bold">{v}/{r.total}</Text> },
  { title: '排名', dataIndex: 'rank', key: 'rank', render: (v: number) => <Text className="text-amber-400">#{v}</Text> },
  { title: '日期', dataIndex: 'date', key: 'date', render: (v: string) => <Text className="text-slate-500">{v}</Text> },
];

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">📋 历史记录</Title>
      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <Table columns={columns} dataSource={mockHistory} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
}
