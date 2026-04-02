import { Typography, Card, Table, Button, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockContests = [
  { id: '1', title: '第三届网络安全知识竞赛', status: 'ongoing', questions: 50, participants: 42 },
  { id: '2', title: '密码学专项赛', status: 'upcoming', questions: 30, participants: 18 },
  { id: '3', title: '第二届CTF理论赛', status: 'finished', questions: 40, participants: 35 },
];

const statusMap: Record<string, { color: string; label: string }> = {
  ongoing: { color: 'emerald', label: '进行中' },
  upcoming: { color: 'blue', label: '即将开始' },
  finished: { color: 'default', label: '已结束' },
};

const columns = [
  { title: '名称', dataIndex: 'title', key: 'title', render: (v: string) => <Text className="text-slate-300">{v}</Text> },
  { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag> },
  { title: '题目', dataIndex: 'questions', key: 'questions', render: (v: number) => <Text className="text-slate-400">{v}题</Text> },
  { title: '参与', dataIndex: 'participants', key: 'participants', render: (v: number) => <Text className="text-slate-400">{v}人</Text> },
  { title: '操作', key: 'action', render: () => <Button type="link" className="text-blue-400">编辑</Button> },
];

export default function AdminContests() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={3} className="!text-slate-100 !mb-0">🏁 竞赛管理</Title>
        <Button type="primary" icon={<PlusOutlined />} className="bg-blue-500 hover:bg-blue-400 border-0 rounded-xl">创建竞赛</Button>
      </div>
      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <Table columns={columns} dataSource={mockContests} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
}
