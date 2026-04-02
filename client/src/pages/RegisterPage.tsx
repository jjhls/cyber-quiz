import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { motion } from 'framer-motion';

const { Title, Text, Link } = Typography;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: { username: string; password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (values.password.length < 6) {
      setError('密码长度不能少于6位');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await authApi.register(values.username, values.password);
      login(user);
      message.success('注册成功');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败，用户名可能已存在');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-full max-w-md bg-slate-900 border-slate-800 rounded-2xl shadow-glow">
          <div className="text-center mb-8">
            <Title level={2} className="text-blue-400 !mb-2 font-mono">
              注册账号
            </Title>
            <Text className="text-slate-400">加入网络安全竞赛平台</Text>
          </div>

          {error && <Alert message={error} type="error" className="mb-4" />}

          <Form onFinish={onFinish} size="large" layout="vertical">
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-500" />}
                placeholder="用户名"
                className="bg-slate-800 border-slate-700 text-slate-100 rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-500" />}
                placeholder="密码（至少6位）"
                className="bg-slate-800 border-slate-700 text-slate-100 rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[{ required: true, message: '请确认密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-500" />}
                placeholder="确认密码"
                className="bg-slate-800 border-slate-700 text-slate-100 rounded-xl"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="bg-blue-500 hover:bg-blue-400 border-0 rounded-xl h-11 text-base font-medium"
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <Text className="text-slate-500">已有账号？</Text>
            <Link onClick={() => navigate('/login')} className="text-blue-400 ml-1">
              立即登录
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
