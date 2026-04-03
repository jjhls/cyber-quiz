import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Drawer } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  TrophyOutlined,
  TeamOutlined,
  HomeOutlined,
  MenuOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useThemeStore } from '../stores/themeStore';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: '仪表盘', path: '/admin' },
  { key: '/admin/questions', icon: <FileTextOutlined />, label: '题目管理', path: '/admin/questions' },
  { key: '/admin/contests', icon: <TrophyOutlined />, label: '竞赛管理', path: '/admin/contests' },
  { key: '/admin/users', icon: <TeamOutlined />, label: '用户管理', path: '/admin/users' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <Layout className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Mobile Header */}
      <Header className={`md:hidden sticky top-0 z-50 backdrop-blur border-b px-4 flex items-center justify-between h-14 transition-colors duration-300 ${
        isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <HomeOutlined className="text-blue-400" />
            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>返回前台</span>
          </Link>
          <Button
            type="text"
            icon={isDark ? <SunOutlined className="text-amber-400" /> : <MoonOutlined className="text-slate-500" />}
            onClick={toggleTheme}
            size="small"
          />
        </div>
        <Button
          type="text"
          icon={<MenuOutlined className={isDark ? 'text-slate-300' : 'text-slate-700'} />}
          onClick={() => setMobileMenuOpen(true)}
        />
      </Header>

      {/* Mobile Drawer Menu */}
      <Drawer
        title="管理菜单"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="md:hidden"
        styles={{
          body: { padding: 0, background: isDark ? '#0f172a' : '#ffffff' },
          header: { background: isDark ? '#0f172a' : '#ffffff', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, color: isDark ? '#f1f5f9' : '#0f172a' }
        }}
      >
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map(item => ({ ...item, onClick: () => handleNavigate(item.path) }))}
          className={`border-0 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
        />
      </Drawer>

      {/* Desktop Sider */}
      <Sider
        theme={isDark ? 'dark' : 'light'}
        width={220}
        className={`border-r hidden md:block transition-colors duration-300 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`p-4 border-b transition-colors duration-300 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <HomeOutlined className="text-blue-400" />
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>返回前台</span>
            </Link>
            <Button
              type="text"
              icon={isDark ? <SunOutlined className="text-amber-400" /> : <MoonOutlined className="text-slate-500" />}
              onClick={toggleTheme}
              size="small"
            />
          </div>
        </div>
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map(item => ({ ...item, onClick: () => handleNavigate(item.path) }))}
          className={`border-0 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
        />
      </Sider>

      <Content className="p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </Content>
    </Layout>
  );
}
