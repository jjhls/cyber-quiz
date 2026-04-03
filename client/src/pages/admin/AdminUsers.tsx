import { useEffect, useState } from 'react';
import { Typography, Table, Tag, Button, Space, Modal, Form, Select, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import api from '../../api';
import { useThemeStore } from '../../stores/themeStore';

const { Title, Text } = Typography;

interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsers() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({ role: record.role });
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, { role: values.role });
        message.success('用户角色已更新');
        setModalOpen(false);
        loadUsers();
      }
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username', render: (v: string) => <Text className={isDark ? 'text-slate-300' : 'text-slate-700'}>{v}</Text> },
    { title: '角色', dataIndex: 'role', key: 'role', width: 120, render: (v: string) => (
      <Tag color={v === 'admin' ? 'red' : 'blue'}>{v === 'admin' ? '管理员' : '参赛者'}</Tag>
    )},
    { title: '注册时间', dataIndex: 'createdAt', key: 'createdAt', width: 200, render: (v: string) => (
      <Text className={isDark ? 'text-slate-500' : 'text-slate-400'}>{new Date(v).toLocaleString('zh-CN')}</Text>
    )},
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: User) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          className="text-blue-400 p-0"
          onClick={() => handleEdit(record)}
        >
          编辑角色
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Title level={3} className={`!mb-0 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>👥 用户管理</Title>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 人` }}
        className={`rounded-2xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      />

      <Modal
        title="编辑用户角色"
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item label="用户名">
            <Text className={isDark ? 'text-slate-300' : 'text-slate-700'}>{editingUser?.username}</Text>
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select options={[
              { value: 'user', label: '参赛者' },
              { value: 'admin', label: '管理员' },
            ]} className={isDark ? 'bg-slate-800' : 'bg-slate-50'} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
