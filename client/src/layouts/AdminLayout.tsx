import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  TrophyOutlined,
  TeamOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Sider, Content } = Layout;

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: '仪表盘', path: '/admin' },
  { key: '/admin/questions', icon: <FileTextOutlined />, label: '题目管理', path: '/admin/questions' },
  { key: '/admin/contests', icon: <TrophyOutlined />, label: '竞赛管理', path: '/admin/contests' },
  { key: '/admin/users', icon: <TeamOutlined />, label: '用户管理', path: '/admin/users' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Layout className="min-h-screen bg-slate-950">
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
          items={menuItems.map(item => ({ ...item, onClick: () => navigate(item.path) }))}
          className="bg-slate-900 border-0"
        />
      </Sider>

      <Content className="p-6">
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
