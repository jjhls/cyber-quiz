import { Typography, Card, Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, ImportOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockQuestions = [
  { id: '001', category: 'Web安全', difficulty: 'easy', type: '单选', status: '启用' },
  { id: '002', category: '密码学', difficulty: 'medium', type: '多选', status: '启用' },
  { id: '003', category: '逆向工程', difficulty: 'hard', type: '填空', status: '启用' },
];

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '分类', dataIndex: 'category', key: 'category', render: (v: string) => <Text className="text-slate-300">{v}</Text> },
  { title: '难度', dataIndex: 'difficulty', key: 'difficulty', render: (v: string) => {
    const colors: Record<string, string> = { easy: 'emerald', medium: 'amber', hard: 'red' };
    return <Tag color={colors[v]}>{v}</Tag>;
  }},
  { title: '题型', dataIndex: 'type', key: 'type', render: (v: string) => <Text className="text-slate-300">{v}</Text> },
  { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color="emerald">{v}</Tag> },
  { title: '操作', key: 'action', render: () => <Button type="link" className="text-blue-400">编辑</Button> },
];

export default function AdminQuestions() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={3} className="!text-slate-100 !mb-0">📝 题目管理</Title>
        <Space>
          <Button icon={<ImportOutlined />} className="bg-slate-800 border-slate-700 text-slate-300 rounded-xl">批量导入</Button>
          <Button type="primary" icon={<PlusOutlined />} className="bg-blue-500 hover:bg-blue-400 border-0 rounded-xl">新增题目</Button>
        </Space>
      </div>
      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <Table columns={columns} dataSource={mockQuestions} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
