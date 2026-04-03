import { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Spin } from 'antd';
import { TeamOutlined, FileTextOutlined, TrophyOutlined, BarChartOutlined } from '@ant-design/icons';
import { statsApi } from '../../api/stats';
import { useThemeStore } from '../../stores/themeStore';

const { Title } = Typography;

export default function AdminDashboard() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState({ totalUsers: 0, totalQuestions: 0, totalContests: 0, totalSubmissions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={`flex justify-center py-20 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <Title level={3} className={`!mb-0 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>📊 管理仪表盘</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={`rounded-2xl transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <Statistic title={<span className={isDark ? 'text-slate-400' : 'text-slate-500'}>总用户</span>} value={stats.totalUsers} prefix={<TeamOutlined className="text-blue-400" />} valueStyle={{ color: '#60a5fa' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={`rounded-2xl transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <Statistic title={<span className={isDark ? 'text-slate-400' : 'text-slate-500'}>总题目</span>} value={stats.totalQuestions} prefix={<FileTextOutlined className="text-emerald-400" />} valueStyle={{ color: '#34d399' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={`rounded-2xl transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <Statistic title={<span className={isDark ? 'text-slate-400' : 'text-slate-500'}>总竞赛</span>} value={stats.totalContests} prefix={<TrophyOutlined className="text-amber-400" />} valueStyle={{ color: '#fbbf24' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={`rounded-2xl transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <Statistic title={<span className={isDark ? 'text-slate-400' : 'text-slate-500'}>总提交</span>} value={stats.totalSubmissions} prefix={<BarChartOutlined className="text-purple-400" />} valueStyle={{ color: '#c084fc' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
