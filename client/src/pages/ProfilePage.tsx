import { Typography, Card, Descriptions, Avatar, Button, Form, Input, message } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">👤 个人中心</Title>

      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <Title level={4} className="!text-slate-100 !mb-1">{user?.username}</Title>
            <Text className="text-slate-500">注册时间: 2026-03-15</Text>
          </div>
        </div>

        <Descriptions column={1} className="text-slate-300">
          <Descriptions.Item label="参赛次数">12</Descriptions.Item>
          <Descriptions.Item label="总得分">980</Descriptions.Item>
          <Descriptions.Item label="总排名">#15</Descriptions.Item>
          <Descriptions.Item label="角色">{user?.role === 'admin' ? '管理员' : '参赛者'}</Descriptions.Item>
        </Descriptions>

        <Button type="primary" className="mt-4 bg-blue-500 hover:bg-blue-400 border-0 rounded-xl" icon={<EditOutlined />}>
          修改密码
        </Button>
      </Card>
    </div>
  );
}
