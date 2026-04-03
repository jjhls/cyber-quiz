import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Card, Typography, Tag, Button, Avatar, Spin, Progress, Badge } from 'antd';
import { TrophyOutlined, BarChartOutlined, ClockCircleOutlined, ScheduleOutlined, ThunderboltOutlined, FlagOutlined, BarChartOutlined as BarChartFilled, BookOutlined, RiseOutlined, ArrowUpOutlined, FireOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useNavigate } from 'react-router-dom';
import { statsApi, DashboardData } from '../api/stats';
import { userProfileApi, UserProfile, UserStatsTrend } from '../api/userProfile';

const { Title, Text } = Typography;

// Level config (based on experience points)
const levels = [
  { min: 0, name: '网络安全学徒', color: '#94a3b8', icon: '🌱' },
  { min: 100, name: '安全爱好者', color: '#60a5fa', icon: '🔰' },
  { min: 300, name: '安全研究员', color: '#34d399', icon: '🔬' },
  { min: 600, name: '安全工程师', color: '#fbbf24', icon: '🛡️' },
  { min: 1000, name: '安全专家', color: '#f97316', icon: '⚔️' },
  { min: 1500, name: '网络安全大师', color: '#ef4444', icon: '👑' },
];

function getLevelInfo(experience: number) {
  let currentLevel = levels[0];
  let nextLevel = levels[1];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (experience >= levels[i].min) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || levels[levels.length - 1];
      break;
    }
  }
  return { currentLevel, nextLevel };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return { text: '早上好', emoji: '🌅' };
  if (hour >= 12 && hour < 18) return { text: '下午好', emoji: '☀️' };
  if (hour >= 18 && hour < 24) return { text: '晚上好', emoji: '🌆' };
  return { text: '夜深了', emoji: '🌙' };
}

const categories = ['Web安全', '密码学', '逆向工程', 'Misc', '网络安全基础', '操作系统安全', '安全法规与合规'];

// Security tips database
const securityTips = [
  { title: 'SQL注入防御', content: 'SQL注入是最常见的Web攻击方式之一。使用参数化查询可以有效防止SQL注入攻击。在编写数据库查询时，永远不要直接拼接用户输入。' },
  { title: 'XSS攻击防护', content: '跨站脚本攻击（XSS）通过在网页中注入恶意脚本来窃取用户信息。对用户输入进行HTML编码和输出转义是基本的防护手段。' },
  { title: '密码安全', content: '密码应该使用bcrypt等单向哈希算法存储，并添加盐值。避免使用MD5或SHA1等已被证明不安全的哈希算法。' },
  { title: 'HTTPS的重要性', content: 'HTTPS通过SSL/TLS协议加密传输层数据，防止中间人攻击。所有涉及敏感信息传输的网站都应该启用HTTPS。' },
  { title: 'CSRF防护', content: '跨站请求伪造（CSRF）攻击利用用户的登录状态发送恶意请求。使用CSRF Token和SameSite Cookie属性可以有效防御。' },
  { title: '文件上传安全', content: '文件上传功能应该验证文件类型、限制文件大小、重命名上传文件，并将文件存储在Web根目录之外。' },
  { title: '会话管理', content: '会话ID应该足够随机且不可预测。设置合理的会话超时时间，并在用户注销时销毁会话。' },
  { title: '输入验证', content: '永远不要信任用户输入。在服务端和客户端都应该进行输入验证，使用白名单而非黑名单策略。' },
];

// Animated counter component
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * end);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration, isInView]);

  return <span ref={ref}>{display}</span>;
}

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// BentoCard with hover lift effect
function BentoCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-blue-500/10' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-blue-500/15'} border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 card-highlight relative overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statsTrend, setStatsTrend] = useState<UserStatsTrend | null>(null);
  const [categoryAccuracy, setCategoryAccuracy] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    Promise.all([
      statsApi.getDashboard(),
      userProfileApi.getProfile().catch(() => null),
      userProfileApi.getStatsTrend().catch(() => null),
    ])
      .then(([dash, prof, trend]) => {
        setDashboard(dash);
        setProfile(prof);
        setStatsTrend(trend);
      })
      .catch(err => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  const loadCategoryAccuracy = useCallback(async () => {
    try {
      const catStats = await statsApi.getCategoryStats().catch(() => ({ categoryErrors: {} }));
      const catStatsTyped = catStats as { categoryErrors: Record<string, number> };
      const categoryErrors = catStatsTyped.categoryErrors || {};
      const hasData = Object.values(categoryErrors).some((v: number) => v > 0);
      const accuracy: Record<string, number> = {};
      for (const cat of categories) {
        if (hasData) {
          const total = (categoryErrors[cat] || 0) + 1;
          const correct = Math.max(0, total - (categoryErrors[cat] || 0));
          accuracy[cat] = Math.round((correct / total) * 100);
        } else {
          accuracy[cat] = 50;
        }
      }
      setCategoryAccuracy(accuracy);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadCategoryAccuracy();
  }, [loadCategoryAccuracy]);

  const greeting = getGreeting();
  const levelInfo = profile ? getLevelInfo(profile.experience) : null;
  const levelProgress = profile?.levelProgress?.progress || 0;

  const radarOption = useMemo(() => ({
    radar: {
      indicator: categories.map(c => ({ name: c, max: 100 })),
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: isDark ? '#94a3b8' : '#475569',
        fontSize: 11,
        padding: [3, 5],
      },
      splitLine: {
        lineStyle: { color: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.15)' },
      },
      splitArea: {
        areaStyle: {
          color: isDark
            ? ['rgba(59, 130, 246, 0.02)', 'rgba(59, 130, 246, 0.05)']
            : ['rgba(59, 130, 246, 0.03)', 'rgba(59, 130, 246, 0.08)'],
        },
      },
      axisLine: {
        lineStyle: { color: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.2)' },
      },
    },
    series: [{
      type: 'radar',
      data: [{
        value: categories.map(c => categoryAccuracy[c] || 0),
        name: '能力分布',
        areaStyle: {
          color: {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.5,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ],
          },
        },
        lineStyle: { color: '#3b82f6', width: 2 },
        itemStyle: { color: '#3b82f6' },
        symbol: 'circle',
        symbolSize: 6,
      }],
    }],
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      textStyle: { color: isDark ? '#f1f5f9' : '#0f172a' },
    },
  }), [categoryAccuracy, isDark]);

  if (loading) {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Spin size="large" />
      </div>
    );
  }

  const d = dashboard ?? {
    ongoingContests: 0, upcomingContests: 0, totalSubmissions: 0,
    avgScore: 0, userRank: 0, totalUsers: 0, nextContest: null, recentSubmissions: [],
  };

  const trend = statsTrend ?? {
    todaySubmissions: 0, yesterdaySubmissions: 0, submissionTrend: 0,
    totalSubmissions: 0, avgScore: 0, userRank: 0, totalUsers: 0,
  };

  return (
    <div className="space-y-6">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-blue-500' : 'bg-blue-300'}`} style={{ animationDuration: '4s' }} />
        <div className={`absolute top-1/3 -left-20 w-72 h-72 rounded-full blur-3xl opacity-15 ${isDark ? 'bg-violet-500' : 'bg-violet-300'}`} style={{ animation: 'pulse 6s ease-in-out infinite' }} />
        <div className={`absolute bottom-20 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 ${isDark ? 'bg-emerald-500' : 'bg-emerald-300'}`} style={{ animation: 'pulse 8s ease-in-out infinite' }} />
      </div>

      {/* Welcome Area - Upgraded */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-10 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 card-highlight relative overflow-hidden`}
      >
        {/* Background decoration */}
        <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="128" cy="128" r="120" />
            <circle cx="128" cy="128" r="80" />
            <circle cx="128" cy="128" r="40" />
            <line x1="8" y1="128" x2="248" y2="128" />
            <line x1="128" y1="8" x2="128" y2="248" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar + Greeting + Level */}
            <div className="flex items-center gap-4">
              <Avatar
                size={56}
                src={profile?.avatar || undefined}
                className="bg-gradient-to-br from-blue-500 to-violet-500 text-white text-xl font-bold"
              >
                {user?.username?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div>
                <Title level={4} className={`!mb-2 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>
                  {greeting.emoji} {greeting.text}，{user?.username}
                </Title>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge count={<FireOutlined style={{ color: '#f59e0b' }} />} size="small">
                    <Tag color="default" className="text-xs px-2 py-0.5">
                      连续 {profile?.consecutiveDays || 0} 天
                    </Tag>
                  </Badge>
                  {levelInfo && (
                    <Tag color={levelInfo.currentLevel.color} className="text-xs px-2 py-0.5">
                      {levelInfo.currentLevel.icon} {levelInfo.currentLevel.name}
                    </Tag>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Level Progress + Quick Actions */}
            <div className="flex flex-col gap-4 lg:items-end">
              {levelInfo && (
                <div className="w-full lg:w-64">
                  <div className="flex items-center justify-between mb-1">
                    <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      经验值 {profile?.experience || 0} / {levelInfo.nextLevel.min}
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {levelProgress}%
                    </Text>
                  </div>
                  <Progress
                    percent={levelProgress}
                    size="small"
                    strokeColor="#3b82f6"
                    trailColor={isDark ? '#1e293b' : '#e2e8f0'}
                    showInfo={false}
                  />
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => navigate('/practice')}
                  className={`${isDark ? 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600'} rounded-xl`}
                >
                  <ThunderboltOutlined /> 快速练习
                </Button>
                <Button
                  onClick={() => navigate('/contests')}
                  className={`${isDark ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-600'} rounded-xl`}
                >
                  <FlagOutlined /> 参加竞赛
                </Button>
                <Button
                  onClick={() => navigate('/rankings')}
                  className={`${isDark ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-600'} rounded-xl`}
                >
                  <BarChartFilled /> 查看排名
                </Button>
                <Button
                  onClick={() => navigate('/wrong-book')}
                  className={`${isDark ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400' : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'} rounded-xl`}
                >
                  <BookOutlined /> 错题复习
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid Stats - CSS Grid for better alignment */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Ongoing Contests - spans 2 columns on lg */}
        <div className="sm:col-span-2 lg:col-span-2">
          <BentoCard>
            <TrophyOutlined className={`absolute -right-4 -bottom-4 text-8xl rotate-12 ${isDark ? 'text-blue-500/5' : 'text-blue-500/10'}`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <TrophyOutlined className="text-2xl text-blue-400" />
                  <Text className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>正在进行的竞赛</Text>
                </div>
                {trend.submissionTrend > 0 && (
                  <Tag color="emerald" className="flex items-center gap-1">
                    <ArrowUpOutlined /> +{trend.submissionTrend}
                  </Tag>
                )}
              </div>
              <div className={`text-4xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <AnimatedCounter value={d.ongoingContests} />
              </div>
              <Text className={`mt-2 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>点击竞赛列表立即参加</Text>
            </div>
          </BentoCard>
        </div>

        {/* Average Score */}
        <div>
          <BentoCard>
            <BarChartOutlined className={`absolute -right-3 -bottom-3 text-7xl rotate-12 ${isDark ? 'text-emerald-500/5' : 'text-emerald-500/10'}`} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <BarChartOutlined className="text-xl text-emerald-400" />
                <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>平均得分</Text>
              </div>
              <div className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <AnimatedCounter value={Math.round(trend.avgScore)} />
              </div>
              <Text className={`text-xs mt-1 block flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <RiseOutlined className="text-emerald-400" /> 共 <AnimatedCounter value={trend.totalSubmissions} /> 次提交
              </Text>
            </div>
          </BentoCard>
        </div>

        {/* Current Rank */}
        <div>
          <BentoCard>
            <SafetyCertificateOutlined className={`absolute -right-3 -bottom-3 text-7xl rotate-12 ${isDark ? 'text-amber-500/5' : 'text-amber-500/10'}`} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <SafetyCertificateOutlined className="text-xl text-amber-400" />
                <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>当前排名</Text>
              </div>
              <div className={`text-3xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                #<AnimatedCounter value={trend.userRank} />
              </div>
              <Text className={`text-xs mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ {trend.totalUsers} 人</Text>
            </div>
          </BentoCard>
        </div>
      </motion.div>

      {/* Bento Grid Charts & Info - Equal height row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Radar Chart - spans 2 columns */}
        <div className="lg:col-span-2">
          <BentoCard className="min-h-[280px]">
            <Title level={5} className={`!mb-2 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>📈 能力分布</Title>
            <Text className={`text-xs block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>基于答题正确率评估各安全领域掌握程度</Text>
            <div className="h-56">
              <ReactECharts
                option={radarOption}
                style={{ height: '100%', width: '100%' }}
              />
            </div>
          </BentoCard>
        </div>

        {/* Next Contest */}
        <div>
          <BentoCard className="min-h-[280px]">
            <Title level={5} className={`!mb-4 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>⏰ 下一场比赛</Title>
            {d.nextContest ? (
              <div className="space-y-3">
                <Text className={`font-medium block text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{d.nextContest.title}</Text>
                <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
              <div className="flex flex-col items-center justify-center h-40">
                <ScheduleOutlined className={`text-4xl mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                <Text className={isDark ? 'text-slate-500' : 'text-slate-400'}>暂无即将开始的比赛</Text>
              </div>
            )}
          </BentoCard>
        </div>
      </motion.div>

      {/* Daily Tips + Learning Goals - Equal height row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Security Tips */}
        <BentoCard className="min-h-[200px]">
          <div className="flex items-center justify-between mb-3">
            <Title level={5} className={`!mb-0 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>💡 每日安全小贴士</Title>
            <Button
              type="link"
              size="small"
              onClick={() => setCurrentTip((currentTip + 1) % securityTips.length)}
              className={isDark ? 'text-blue-400' : 'text-blue-600'}
            >
              换一条
            </Button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Tag color="blue" className="mb-2">{securityTips[currentTip].title}</Tag>
              <Text className={isDark ? 'text-slate-300' : 'text-slate-600'}>{securityTips[currentTip].content}</Text>
            </motion.div>
          </AnimatePresence>
        </BentoCard>

        {/* Learning Goals */}
        <BentoCard className="min-h-[200px]">
          <Title level={5} className={`!mb-3 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>🎯 今日学习目标</Title>
          <div className="space-y-3">
            {profile?.dailyGoals ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Text className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      {profile.dailyGoals.practice.current >= profile.dailyGoals.practice.target ? '✅' : '⬜'} 完成 {profile.dailyGoals.practice.target} 道练习题
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {profile.dailyGoals.practice.current}/{profile.dailyGoals.practice.target}
                    </Text>
                  </div>
                  <Progress
                    percent={(profile.dailyGoals.practice.current / profile.dailyGoals.practice.target) * 100}
                    size="small"
                    strokeColor="#3b82f6"
                    trailColor={isDark ? '#1e293b' : '#e2e8f0'}
                    showInfo={false}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Text className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      {profile.dailyGoals.contest.current >= profile.dailyGoals.contest.target ? '✅' : '⬜'} 参加 {profile.dailyGoals.contest.target} 场竞赛
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {profile.dailyGoals.contest.current}/{profile.dailyGoals.contest.target}
                    </Text>
                  </div>
                  <Progress
                    percent={(profile.dailyGoals.contest.current / profile.dailyGoals.contest.target) * 100}
                    size="small"
                    strokeColor="#3b82f6"
                    trailColor={isDark ? '#1e293b' : '#e2e8f0'}
                    showInfo={false}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Text className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      {profile.dailyGoals.review.current >= profile.dailyGoals.review.target ? '✅' : '⬜'} 复习 {profile.dailyGoals.review.target} 道错题
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {profile.dailyGoals.review.current}/{profile.dailyGoals.review.target}
                    </Text>
                  </div>
                  <Progress
                    percent={(profile.dailyGoals.review.current / profile.dailyGoals.review.target) * 100}
                    size="small"
                    strokeColor="#3b82f6"
                    trailColor={isDark ? '#1e293b' : '#e2e8f0'}
                    showInfo={false}
                  />
                </div>
              </>
            ) : (
              <Text className={isDark ? 'text-slate-500' : 'text-slate-400'}>暂无目标数据</Text>
            )}
          </div>
        </BentoCard>
      </motion.div>

      {/* Recent Submissions & Announcement - Equal height row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Recent Submissions */}
        <BentoCard className="min-h-[200px]">
          <Title level={5} className={`!mb-3 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>📋 最近提交</Title>
          {d.recentSubmissions.length > 0 ? (
            <div className="space-y-2">
              {d.recentSubmissions.slice(0, 5).map((s) => (
                <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <div>
                    <Text className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.contestTitle}</Text>
                    <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(s.submittedAt).toLocaleString('zh-CN')}
                    </Text>
                  </div>
                  <Text className="text-blue-400 font-bold">{s.score}/{s.totalScore}</Text>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-36">
              <svg className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="8" y="12" width="48" height="40" rx="4" />
                <line x1="16" y1="24" x2="48" y2="24" />
                <line x1="16" y1="32" x2="40" y2="32" />
                <line x1="16" y1="40" x2="32" y2="40" />
                <circle cx="48" cy="44" r="12" fill={isDark ? '#0f172a' : '#f8fafc'} stroke="currentColor" />
                <line x1="48" y1="40" x2="48" y2="48" />
                <line x1="44" y1="44" x2="52" y2="44" />
              </svg>
              <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>暂无提交记录</Text>
              <Button
                type="link"
                onClick={() => navigate('/contests')}
                className="text-blue-400 mt-1"
              >
                去参加竞赛 →
              </Button>
            </div>
          )}
        </BentoCard>

        {/* Announcements */}
        <BentoCard className="min-h-[200px]">
          <Title level={5} className={`!mb-3 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>📢 最新公告</Title>
          <div className="space-y-2">
            <div className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <Tag color="blue">2026-04-01</Tag>
              <Text className={isDark ? 'text-slate-300' : 'text-slate-700'}>网络安全竞赛平台正式上线，欢迎注册体验！</Text>
            </div>
          </div>
        </BentoCard>
      </motion.div>
    </div>
  );
}
