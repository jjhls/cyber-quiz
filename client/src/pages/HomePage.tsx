import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Tag, Button, Spin } from 'antd';
import { TrophyOutlined, BarChartOutlined, RiseOutlined, ClockCircleOutlined, ScheduleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { statsApi, DashboardData } from '../api/stats';

const { Title, Text } = Typography;

function BentoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.getDashboard()
      .then(data => setDashboard(data))
      .catch(err => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const d = dashboard ?? {
    ongoingContests: 0, upcomingContests: 0, totalSubmissions: 0,
    avgScore: 0, userRank: 0, totalUsers: 0, nextContest: null, recentSubmissions: [],
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <Title level={3} className="!text-slate-100 !mb-1">
          👋 欢迎回来，{user?.username}
        </Title>
        <Text className="text-slate-500">开始你的网络安全学习之旅</Text>
      </div>

      {/* Bento Grid Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={12}>
          <BentoCard>
            <div className="flex items-center gap-3 mb-3">
              <TrophyOutlined className="text-2xl text-blue-400" />
              <Text className="text-lg font-semibold text-slate-100">正在进行的竞赛</Text>
            </div>
            <Statistic
              value={d.ongoingContests}
              valueStyle={{ color: '#60a5fa', fontSize: '2.5rem', fontWeight: 700 }}
            />
            <Text className="text-slate-500 mt-2 block">点击竞赛列表立即参加</Text>
          </BentoCard>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <BentoCard>
            <div className="flex items-center gap-2 mb-2">
              <BarChartOutlined className="text-xl text-emerald-400" />
              <Text className="text-sm font-medium text-slate-400">平均得分</Text>
            </div>
            <Statistic
              value={d.avgScore}
              precision={0}
              valueStyle={{ color: '#34d399', fontSize: '2rem', fontWeight: 700 }}
            />
            <Text className="text-slate-500 text-xs mt-1 block">
              共 {d.totalSubmissions} 次提交
            </Text>
          </BentoCard>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <BentoCard>
            <div className="flex items-center gap-2 mb-2">
              <TrophyOutlined className="text-xl text-amber-400" />
              <Text className="text-sm font-medium text-slate-400">当前排名</Text>
            </div>
            <Statistic
              value={d.userRank}
              valueStyle={{ color: '#fbbf24', fontSize: '2rem', fontWeight: 700 }}
              prefix="#"
            />
            <Text className="text-slate-500 text-xs mt-1 block">/ {d.totalUsers} 人</Text>
          </BentoCard>
        </Col>
      </Row>

      {/* Bento Grid Charts & Info */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <BentoCard>
            <Title level={5} className="!text-slate-100 !mb-4">📈 能力分布</Title>
            <div className="h-64 flex items-center justify-center text-slate-600">
              雷达图区域（ECharts）- Phase 5 实现
            </div>
          </BentoCard>
        </Col>

        <Col xs={24} lg={8}>
          <BentoCard>
            <Title level={5} className="!text-slate-100 !mb-4">⏰ 下一场比赛</Title>
            {d.nextContest ? (
              <div className="space-y-3">
                <Text className="text-slate-100 font-medium block text-lg">{d.nextContest.title}</Text>
                <div className="flex items-center gap-2 text-slate-400">
                  <ClockCircleOutlined />
                  <Text>{new Date(d.nextContest.startTime).toLocaleString('zh-CN')}</Text>
                </div>
                <Button
                  type="primary"
                  onClick={() => navigate(`/contests/${d.nextContest?.id}`)}
                  className="mt-2 bg-blue-500 hover:bg-blue-400 border-0 rounded-xl"
                >
                  查看详情 →
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <ScheduleOutlined className="text-3xl text-slate-600 mb-2 block" />
                <Text className="text-slate-500">暂无即将开始的比赛</Text>
              </div>
            )}
          </BentoCard>
        </Col>
      </Row>

      {/* Recent Submissions & Announcement */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <BentoCard>
            <Title level={5} className="!text-slate-100 !mb-3">📋 最近提交</Title>
            {d.recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {d.recentSubmissions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <div>
                      <Text className="text-slate-300 block">{s.contestTitle}</Text>
                      <Text className="text-slate-500 text-xs">
                        {new Date(s.submittedAt).toLocaleString('zh-CN')}
                      </Text>
                    </div>
                    <Text className="text-blue-400 font-bold">{s.score}/{s.totalScore}</Text>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Text className="text-slate-500">暂无提交记录</Text>
                <div className="mt-2">
                  <Button type="primary" onClick={() => navigate('/contests')} className="bg-blue-500 hover:bg-blue-400 border-0 rounded-xl">
                    去参加竞赛 →
                  </Button>
                </div>
              </div>
            )}
          </BentoCard>
        </Col>

        <Col xs={24} md={12}>
          <BentoCard>
            <Title level={5} className="!text-slate-100 !mb-3">📢 最新公告</Title>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                <Tag color="blue">2026-04-01</Tag>
                <Text className="text-slate-300">网络安全竞赛平台正式上线，欢迎注册体验！</Text>
              </div>
            </div>
          </BentoCard>
        </Col>
      </Row>
    </div>
  );
}
