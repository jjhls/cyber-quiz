import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { authApi } from '../api/auth';
import {
  Layout, Menu, Avatar, Dropdown, Space, Typography, Button, Switch,
} from 'antd';
import {
  HomeOutlined,
  TrophyOutlined,
  BookOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    import('../api/userProfile').then(({ userProfileApi }) => {
      userProfileApi.getProfile().then(profile => {
        setUserAvatar(profile.avatar);
      }).catch(() => {});
    });
  }, []);

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
    { key: 'theme', icon: isDark ? <SunOutlined /> : <MoonOutlined />, label: isDark ? '🌞 切换亮色主题' : '🌙 切换暗色主题', onClick: toggleTheme },
    { type: 'divider' as const },
    { key: 'profile', icon: <UserOutlined />, label: '个人中心', onClick: () => navigate('/profile') },
    { key: 'wrong-book', icon: <BookOutlined />, label: '错题本', onClick: () => navigate('/wrong-book') },
    { key: 'history', icon: <BarChartOutlined />, label: '历史记录', onClick: () => navigate('/history') },
    ...(user?.role === 'admin' ? [
      { type: 'divider' as const },
      { key: 'admin', icon: <DashboardOutlined />, label: '🛡️ 管理后台', onClick: () => navigate('/admin') },
    ] : []),
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true, onClick: handleLogout },
  ];

  return (
    <Layout className={`min-h-screen relative transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Background effects */}
      <div className="fixed inset-0 bg-cyber-grid pointer-events-none z-0" />
      <div className="fixed inset-0 bg-cyber-spotlight pointer-events-none z-0" />

      <Header className={`sticky top-0 z-50 backdrop-blur border-b px-4 md:px-8 flex items-center gap-6 h-16 relative z-10 transition-colors duration-300 ${
        isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className={`text-xl font-bold font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>CyberQuiz</span>
          <span className={`animate-pulse ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>_</span>
        </Link>

        {/* Desktop nav */}
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems.map(item => ({ ...item, onClick: () => navigate(item.path) }))}
          className="hidden md:flex flex-1 border-0"
          style={{ background: 'transparent' }}
        />

        {/* Theme toggle + User dropdown */}
        <div className="flex items-center gap-3">
          {/* Desktop theme toggle */}
          <div className="hidden md:flex items-center gap-2">
            <SunOutlined className={`text-sm ${isDark ? 'text-slate-500' : 'text-amber-500'}`} />
            <Switch
              checked={isDark}
              onChange={toggleTheme}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
              size="small"
            />
            <MoonOutlined className={`text-sm ${isDark ? 'text-blue-400' : 'text-slate-400'}`} />
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space className="cursor-pointer hover:opacity-80 transition-opacity">
              {userAvatar ? (
                <Avatar src={userAvatar} className="bg-blue-500" />
              ) : (
                <Avatar icon={<UserOutlined />} className="bg-blue-500" />
              )}
              <Text className={`hidden sm:inline ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{user?.username}</Text>
            </Space>
          </Dropdown>
        </div>
      </Header>

      <Content className={`px-4 md:px-8 py-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </Content>

      <Footer className={`text-center text-sm border-t transition-colors duration-300 ${
        isDark ? 'text-slate-500 bg-slate-900 border-slate-800' : 'text-slate-400 bg-white border-slate-200'
      }`}>
        CyberQuiz 网络安全竞赛平台 © 2026
      </Footer>

      {/* Mobile bottom tab */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t z-50 transition-colors duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex justify-around py-2">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'text-blue-500'
                  : isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {item.key === '/profile' && userAvatar ? (
                <Avatar src={userAvatar} size={20} className="bg-blue-500" />
              ) : (
                item.icon
              )}
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
