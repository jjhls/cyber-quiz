import { Typography, Card, Table, Tag, Avatar, Space } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockRankings = [
  { rank: 1, username: '张三', score: 98, time: '42:15', avatar: '' },
  { rank: 2, username: '李四', score: 95, time: '45:30', avatar: '' },
  { rank: 3, username: '王五', score: 92, time: '48:20', avatar: '' },
  { rank: 4, username: '赵六', score: 90, time: '50:10', avatar: '' },
  { rank: 5, username: '钱七', score: 88, time: '51:45', avatar: '' },
  { rank: 8, username: '我', score: 85, time: '58:32', avatar: '', isMe: true },
];

const columns = [
  { title: '排名', dataIndex: 'rank', key: 'rank', width: 80, render: (r: number, record: any) => {
    if (r === 1) return '🥇';
    if (r === 2) return '🥈';
    if (r === 3) return '🥉';
    return r;
  }},
  { title: '用户名', dataIndex: 'username', key: 'username', render: (u: string, record: any) => (
    <Space><Avatar size="small" className="bg-blue-500" /> <Text className={record.isMe ? 'text-blue-400 font-bold' : 'text-slate-300'}>{u}</Text></Space>
  )},
  { title: '分数', dataIndex: 'score', key: 'score', render: (s: number) => <Text className="text-blue-400 font-bold">{s}</Text> },
  { title: '用时', dataIndex: 'time', key: 'time', render: (t: string) => <Text className="text-slate-400">{t}</Text> },
];

export default function RankingPage() {
  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">🏆 排行榜</Title>
      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <Table
          columns={columns}
          dataSource={mockRankings}
          rowKey="rank"
          pagination={false}
          className="bg-transparent"
          rowClassName={(record) => record.isMe ? 'bg-blue-500/10' : ''}
        />
      </Card>
    </div>
  );
}
