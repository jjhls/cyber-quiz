import { useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Tag, Spin, Button } from 'antd';
import { TrophyOutlined, BarChartOutlined, RiseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';

const { Title, Text } = Typography;

// Bento card component
function BentoCard({ children, className = '', span = 1 }: { children: React.ReactNode; className?: string; span?: number }) {
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
            <Statistic value={3} valueStyle={{ color: '#60a5fa', fontSize: '2.5rem', fontWeight: 700 }} />
            <Text className="text-slate-500 mt-2 block">点击竞赛列表立即参加</Text>
          </BentoCard>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <BentoCard>
            <div className="flex items-center gap-2 mb-2">
              <BarChartOutlined className="text-xl text-emerald-400" />
              <Text className="text-sm font-medium text-slate-400">总正确率</Text>
            </div>
            <Statistic value={78.5} precision={1} suffix="%" valueStyle={{ color: '#34d399', fontSize: '2rem', fontWeight: 700 }} />
            <Text className="text-emerald-400 text-xs mt-1 block flex items-center gap-1">
              <RiseOutlined /> +2.3%
            </Text>
          </BentoCard>
        </Col>

        <Col xs={12} sm={12} lg={6}>
          <BentoCard>
            <div className="flex items-center gap-2 mb-2">
              <TrophyOutlined className="text-xl text-amber-400" />
              <Text className="text-sm font-medium text-slate-400">当前排名</Text>
            </div>
            <Statistic value={15} valueStyle={{ color: '#fbbf24', fontSize: '2rem', fontWeight: 700 }} prefix="#" />
            <Text className="text-slate-500 text-xs mt-1 block">/ 86 人</Text>
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
            <div className="space-y-3">
              <Text className="text-slate-100 font-medium block text-lg">密码学专项赛</Text>
              <div className="flex items-center gap-2 text-slate-400">
                <ClockCircleOutlined />
                <Text>04-10 14:00</Text>
              </div>
              <Tag color="blue">密码学</Tag>
              <Tag color="default">30题</Tag>
              <Button type="primary" className="mt-2 bg-blue-500 hover:bg-blue-400 border-0 rounded-xl">
                预约提醒
              </Button>
            </div>
          </BentoCard>
        </Col>
      </Row>

      {/* Announcement */}
      <BentoCard>
        <Title level={5} className="!text-slate-100 !mb-3">📢 最新公告</Title>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
            <Tag color="blue">2026-04-01</Tag>
            <Text className="text-slate-300">第三届网络安全知识竞赛即将开始，欢迎报名参赛！</Text>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
            <Tag color="default">2026-03-28</Tag>
            <Text className="text-slate-300">题库新增 50 道逆向工程题目，快去练习吧！</Text>
          </div>
        </div>
      </BentoCard>
    </div>
  );
}
