import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { motion } from 'framer-motion';

const { Title, Text, Link } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const store = useAuthStore.getState();
      if (store.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      const user = await authApi.login(values.username, values.password);
      login(user);
      message.success('登录成功');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className={`w-full max-w-md rounded-2xl transition-colors duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800 shadow-glow' : 'bg-white border-slate-200 shadow-lg'
        }`}>
          <div className="text-center mb-8">
            <Title level={2} className={`!mb-2 font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              CyberQuiz<span className="animate-pulse">_</span>
            </Title>
            <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>网络安全竞赛平台</Text>
          </div>

          {error && <Alert message={error} type="error" className="mb-4" />}

          <Form onFinish={onFinish} size="large" layout="vertical">
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className={isDark ? 'text-slate-500' : 'text-slate-400'} />}
                placeholder="用户名"
                className={`rounded-xl ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className={isDark ? 'text-slate-500' : 'text-slate-400'} />}
                placeholder="密码"
                className={`rounded-xl ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
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
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <Text className={isDark ? 'text-slate-500' : 'text-slate-400'}>还没有账号？</Text>
            <Link onClick={() => navigate('/register')} className="text-blue-400 ml-1">
              立即注册
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
