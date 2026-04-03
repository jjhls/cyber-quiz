import { Typography, Card, Descriptions, Avatar, Button, Form, Input, message, Modal } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { authApi } from '../api/auth';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleChangePassword = async () => {
    try {
      const values = await form.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }
      await authApi.changePassword(values.oldPassword, values.newPassword);
      message.success('密码修改成功');
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || '修改密码失败');
    }
  };

  return (
    <div className="space-y-6">
      <Title level={3} className={`!mb-0 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>👤 个人中心</Title>

      <Card className={`rounded-2xl transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4 mb-6">
          <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <Title level={4} className={`!mb-1 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>{user?.username}</Title>
            <Text className={isDark ? 'text-slate-500' : 'text-slate-400'}>注册时间: 2026-03-15</Text>
          </div>
        </div>

        <Descriptions column={1}>
          <Descriptions.Item label="参赛次数">12</Descriptions.Item>
          <Descriptions.Item label="总得分">980</Descriptions.Item>
          <Descriptions.Item label="总排名">#15</Descriptions.Item>
          <Descriptions.Item label="角色">{user?.role === 'admin' ? '管理员' : '参赛者'}</Descriptions.Item>
        </Descriptions>

        <Button type="primary" onClick={() => setModalOpen(true)} className="mt-4 bg-blue-500 hover:bg-blue-400 border-0 rounded-xl" icon={<EditOutlined />}>
          修改密码
        </Button>
      </Card>

      {/* Change Password Modal */}
      <Modal
        title="修改密码"
        open={modalOpen}
        onOk={handleChangePassword}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="oldPassword" label="旧密码" rules={[{ required: true, message: '请输入旧密码' }]}>
            <Input.Password className={isDark ? 'bg-slate-800' : 'bg-slate-50'} />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码至少6位' }]}>
            <Input.Password className={isDark ? 'bg-slate-800' : 'bg-slate-50'} />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认新密码" rules={[{ required: true, message: '请确认新密码' }]}>
            <Input.Password className={isDark ? 'bg-slate-800' : 'bg-slate-50'} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
