import { Typography, Card, Table, Tag, Button, Space } from 'antd';

const { Title, Text } = Typography;

const mockUsers = [
  { id: '1', username: '张三', role: 'user', status: 'active', joinDate: '2026-03-15' },
  { id: '2', username: 'admin', role: 'admin', status: 'active', joinDate: '2026-01-01' },
  { id: '3', username: '李四', role: 'user', status: 'active', joinDate: '2026-03-20' },
];

const columns = [
  { title: '用户名', dataIndex: 'username', key: 'username', render: (v: string) => <Text className="text-slate-300">{v}</Text> },
  { title: '角色', dataIndex: 'role', key: 'role', render: (v: string) => <Tag color={v === 'admin' ? 'red' : 'blue'}>{v === 'admin' ? '管理员' : '参赛者'}</Tag> },
  { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color="emerald">正常</Tag> },
  { title: '注册时间', dataIndex: 'joinDate', key: 'joinDate', render: (v: string) => <Text className="text-slate-500">{v}</Text> },
  { title: '操作', key: 'action', render: () => <Space><Button type="link" className="text-blue-400">编辑</Button><Button type="link" danger>禁用</Button></Space> },
];

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">👥 用户管理</Title>
      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <Table columns={columns} dataSource={mockUsers} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
}
