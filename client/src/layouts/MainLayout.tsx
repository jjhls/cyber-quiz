import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import {
  Layout, Menu, Avatar, Dropdown, Space, Typography, Button,
} from 'antd';
import {
  HomeOutlined,
  TrophyOutlined,
  BookOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页', path: '/' },
  { key: '/contests', icon: <TrophyOutlined />, label: '竞赛', path: '/contests' },
  { key: '/practice', icon: <BookOutlined />, label: '题库', path: '/practice' },
  { key: '/rankings', icon: <BarChartOutlined />, label: '排行', path: '/rankings' },
  { key: '/profile', icon: <UserOutlined />, label: '我的', path: '/profile' },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      logout();
      navigate('/login');
    }
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心', onClick: () => navigate('/profile') },
    { key: 'wrong-book', icon: <BookOutlined />, label: '错题本', onClick: () => navigate('/wrong-book') },
    { key: 'history', icon: <BarChartOutlined />, label: '历史记录', onClick: () => navigate('/history') },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true, onClick: handleLogout },
  ];

  return (
    <Layout className="min-h-screen bg-slate-950">
      <Header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 md:px-8 flex items-center gap-6 h-16">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold text-blue-400 font-mono">CyberQuiz</span>
          <span className="text-blue-400 animate-pulse">_</span>
        </Link>

        {/* Desktop nav */}
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems.map(item => ({ ...item, onClick: () => navigate(item.path) }))}
          className="hidden md:flex flex-1 bg-transparent border-0 text-slate-300"
          style={{ background: 'transparent' }}
        />

        {/* User dropdown */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space className="cursor-pointer hover:opacity-80 transition-opacity">
            <Avatar icon={<UserOutlined />} className="bg-blue-500" />
            <Text className="hidden sm:inline text-slate-300">{user?.username}</Text>
          </Space>
        </Dropdown>
      </Header>

      <Content className="px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </Content>

      <Footer className="text-center text-slate-500 text-sm bg-slate-900 border-t border-slate-800">
        CyberQuiz 网络安全竞赛平台 © 2026
      </Footer>

      {/* Mobile bottom tab */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
        <div className="flex justify-around py-2">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'text-blue-400'
                  : 'text-slate-500'
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
