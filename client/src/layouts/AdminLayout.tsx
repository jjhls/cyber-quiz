import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Drawer } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  TrophyOutlined,
  TeamOutlined,
  HomeOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useState } from 'react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <Layout className="min-h-screen bg-slate-950">
      {/* Mobile Header */}
      <Header className="md:hidden sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <HomeOutlined className="text-blue-400" />
          <span className="text-slate-300 text-sm">返回前台</span>
        </Link>
        <Button
          type="text"
          icon={<MenuOutlined className="text-slate-300" />}
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
          body: { padding: 0, background: '#0f172a' },
          header: { background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#f1f5f9' }
        }}
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map(item => ({ ...item, onClick: () => handleNavigate(item.path) }))}
          className="bg-slate-900 border-0"
        />
      </Drawer>

      {/* Desktop Sider */}
      <Sider
        theme="dark"
        width={220}
        className="bg-slate-900 border-r border-slate-800 hidden md:block"
      >
        <div className="p-4 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <HomeOutlined className="text-blue-400" />
            <span className="text-slate-300 text-sm">返回前台</span>
          </Link>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map(item => ({ ...item, onClick: () => handleNavigate(item.path) }))}
          className="bg-slate-900 border-0"
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
