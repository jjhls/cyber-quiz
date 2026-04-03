import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Card, Typography, Tag, Button, Avatar, Spin, Progress, Modal, Form, Input, message, Row, Col } from 'antd';
import { UserOutlined, EditOutlined, FireOutlined, TrophyOutlined, BarChartOutlined, SafetyCertificateOutlined, RiseOutlined, ArrowUpOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useNavigate } from 'react-router-dom';
import { userProfileApi, UserProfile, UserStatsTrend, ContestHistory, AnswerStats } from '../api/userProfile';

const { Title, Text } = Typography;

// Level config
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

// Animated counter component
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) {
      setDisplay(value);
      return;
    }
    let start = 0;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * end);
      setDisplay(start);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setHasAnimated(true);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, hasAnimated]);

  return <span ref={ref}>{display}</span>;
}

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// BentoCard with hover lift effect
function BentoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-blue-500/10' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-blue-500/15'} border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statsTrend, setStatsTrend] = useState<UserStatsTrend | null>(null);
  const [history, setHistory] = useState<ContestHistory[]>([]);
  const [answerStats, setAnswerStats] = useState<AnswerStats | null>(null);
  const [avatarList, setAvatarList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    Promise.all([
      userProfileApi.getProfile().catch(() => null),
      userProfileApi.getStatsTrend().catch(() => null),
      userProfileApi.getHistory(5).catch(() => []),
      userProfileApi.getAnswers().catch(() => null),
      userProfileApi.getAvatars().catch(() => ({ avatars: [] })),
    ])
      .then(([prof, trend, hist, answers, avatars]) => {
        setProfile(prof);
        setStatsTrend(trend);
        setHistory(hist);
        setAnswerStats(answers);
        setAvatarList(avatars.avatars || []);
      })
      .catch(err => console.error('Failed to load profile:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectAvatar = useCallback(async (avatarUrl: string) => {
    try {
      await userProfileApi.setAvatar(avatarUrl);
      setProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      message.success('头像已更换');
      setAvatarModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.message || '更换头像失败');
    }
  }, []);

  const handleChangePassword = useCallback(async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }
      const { authApi } = await import('../api/auth');
      await authApi.changePassword(values.oldPassword, values.newPassword);
      message.success('密码修改成功');
      setPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || '修改密码失败');
    }
  }, [passwordForm]);

  const levelInfo = profile ? getLevelInfo(profile.experience) : null;
  const levelProgress = profile?.levelProgress?.progress || 0;

  // Radar chart for category stats
  const categoryNames = Object.keys(answerStats?.categoryStats || {});
  const radarOption = useMemo(() => {
    const cats = categoryNames.length > 0 ? categoryNames : ['Web安全', '密码学', '逆向工程', 'Misc', '网络安全基础', '操作系统安全', '安全法规与合规'];
    const values = cats.map(c => {
      const stat = answerStats?.categoryStats?.[c];
      return stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 50;
    });

    return {
      radar: {
        indicator: cats.map(c => ({ name: c, max: 100 })),
        shape: 'polygon',
        splitNumber: 4,
        axisName: {
          color: isDark ? '#94a3b8' : '#475569',
          fontSize: 10,
          padding: [3, 5],
        },
        splitLine: { lineStyle: { color: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.15)' } },
        splitArea: {
          areaStyle: { color: isDark ? ['rgba(59, 130, 246, 0.02)', 'rgba(59, 130, 246, 0.05)'] : ['rgba(59, 130, 246, 0.03)', 'rgba(59, 130, 246, 0.08)'] },
        },
        axisLine: { lineStyle: { color: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.2)' } },
      },
      series: [{
        type: 'radar',
        data: [{
          value: values,
          name: '能力分布',
          areaStyle: {
            color: { type: 'radial', x: 0.5, y: 0.5, r: 0.5, colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.3)' }, { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }] },
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
    };
  }, [answerStats, categoryNames, isDark]);

  if (loading) {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Spin size="large" />
      </div>
    );
  }

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
      </div>

      {/* Profile Card - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-10 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-6 card-highlight relative overflow-hidden`}
      >
        <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          <svg viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="128" cy="128" r="120" /><circle cx="128" cy="128" r="80" /><circle cx="128" cy="128" r="40" />
            <line x1="8" y1="128" x2="248" y2="128" /><line x1="128" y1="8" x2="128" y2="248" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar + Info */}
            <div className="flex items-center gap-4">
              <Avatar
                size={72}
                src={profile?.avatar || undefined}
                className="bg-gradient-to-br from-blue-500 to-violet-500 text-white text-2xl font-bold cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setAvatarModalOpen(true)}
              >
                {user?.username?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div>
                <Title level={4} className={`!mb-2 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>{user?.username}</Title>
                <div className="flex items-center gap-3 flex-wrap">
                  {levelInfo && (
                    <Tag color={levelInfo.currentLevel.color} className="text-xs px-2 py-0.5">
                      {levelInfo.currentLevel.icon} {levelInfo.currentLevel.name}
                    </Tag>
                  )}
                  <Tag color="default" className="text-xs px-2 py-0.5 flex items-center gap-1">
                    <FireOutlined style={{ color: '#f59e0b' }} /> 连续 {profile?.consecutiveDays || 0} 天
                  </Tag>
                  <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    注册于 {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('zh-CN') : '-'}
                  </Text>
                </div>
              </div>
            </div>

            {/* Right: Level Progress + Actions */}
            <div className="flex flex-col gap-4 lg:items-end">
              {levelInfo && (
                <div className="w-full lg:w-64">
                  <div className="flex items-center justify-between mb-1">
                    <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      经验值 {profile?.experience || 0} / {levelInfo.nextLevel.min}
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{levelProgress}%</Text>
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
              <div className="flex gap-2">
                <Button onClick={() => setAvatarModalOpen(true)} className={`${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'} rounded-xl`}>
                  🎨 选择头像
                </Button>
                <Button onClick={() => setPasswordModalOpen(true)} className={`${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'} rounded-xl`}>
                  <EditOutlined /> 修改密码
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <BentoCard>
            <TrophyOutlined className={`absolute -right-4 -bottom-4 text-8xl rotate-12 ${isDark ? 'text-blue-500/5' : 'text-blue-500/10'}`} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <TrophyOutlined className="text-xl text-blue-400" />
                <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>参赛次数</Text>
              </div>
              <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <AnimatedCounter value={trend.totalSubmissions} />
              </div>
              {trend.submissionTrend > 0 && (
                <Text className={`text-xs mt-1 flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <ArrowUpOutlined className="text-emerald-400" /> +{trend.submissionTrend}
                </Text>
              )}
            </div>
          </BentoCard>
        </div>

        <div>
          <BentoCard>
            <BarChartOutlined className={`absolute -right-3 -bottom-3 text-7xl rotate-12 ${isDark ? 'text-emerald-500/5' : 'text-emerald-500/10'}`} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <BarChartOutlined className="text-xl text-emerald-400" />
                <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>总得分</Text>
              </div>
              <div className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <AnimatedCounter value={Math.round(trend.avgScore * trend.totalSubmissions)} />
              </div>
              <Text className={`text-xs mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                平均分 {trend.avgScore}
              </Text>
            </div>
          </BentoCard>
        </div>

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

        <div>
          <BentoCard>
            <RiseOutlined className={`absolute -right-3 -bottom-3 text-7xl rotate-12 ${isDark ? 'text-purple-500/5' : 'text-purple-500/10'}`} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <RiseOutlined className="text-xl text-purple-400" />
                <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>正确率</Text>
              </div>
              <div className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                <AnimatedCounter value={answerStats?.accuracy || 0} />%
              </div>
              <Text className={`text-xs mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                答对 {answerStats?.totalCorrect || 0}/{answerStats?.totalQuestions || 0}
              </Text>
            </div>
          </BentoCard>
        </div>
      </motion.div>

      {/* Radar Chart + Learning Goals */}
      <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BentoCard className="min-h-[280px]">
            <Title level={5} className={`!mb-2 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>📈 各分类能力分布</Title>
            <div className="h-56">
              <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </BentoCard>
        </div>

        <div>
          <BentoCard className="min-h-[280px]">
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
                    <Progress percent={(profile.dailyGoals.practice.current / profile.dailyGoals.practice.target) * 100} size="small" strokeColor="#3b82f6" trailColor={isDark ? '#1e293b' : '#e2e8f0'} showInfo={false} />
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
                    <Progress percent={(profile.dailyGoals.contest.current / profile.dailyGoals.contest.target) * 100} size="small" strokeColor="#3b82f6" trailColor={isDark ? '#1e293b' : '#e2e8f0'} showInfo={false} />
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
                    <Progress percent={(profile.dailyGoals.review.current / profile.dailyGoals.review.target) * 100} size="small" strokeColor="#3b82f6" trailColor={isDark ? '#1e293b' : '#e2e8f0'} showInfo={false} />
                  </div>
                </>
              ) : (
                <Text className={isDark ? 'text-slate-500' : 'text-slate-400'}>暂无目标数据</Text>
              )}
            </div>
          </BentoCard>
        </div>
      </motion.div>

      {/* Recent History + Answer Stats */}
      <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Contest History */}
        <BentoCard className="min-h-[200px]">
          <Title level={5} className={`!mb-3 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>📋 最近参赛记录</Title>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <div>
                    <Text className={`block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{h.contestTitle}</Text>
                    <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(h.submittedAt).toLocaleDateString('zh-CN')} | {Math.floor(h.duration / 60)}分{h.duration % 60}秒
                    </Text>
                  </div>
                  <div className="text-right">
                    <Text className="text-blue-400 font-bold block">{h.score}/{h.totalScore}</Text>
                    <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {h.correctCount}/{h.totalCount} 正确
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-36">
              <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>暂无参赛记录</Text>
              <Button type="link" onClick={() => navigate('/contests')} className="text-blue-400 mt-1">去参加竞赛 →</Button>
            </div>
          )}
        </BentoCard>

        {/* Answer Statistics */}
        <BentoCard className="min-h-[200px]">
          <Title level={5} className={`!mb-3 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>📊 答题统计</Title>
          {answerStats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <Text className={`text-sm block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>总答题数</Text>
                <Text className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{answerStats.totalQuestions}</Text>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <Text className={`text-sm block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>正确数</Text>
                <Text className="text-2xl font-bold text-emerald-400">{answerStats.totalCorrect}</Text>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <Text className={`text-sm block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>错题数</Text>
                <Text className="text-2xl font-bold text-red-400">{answerStats.totalWrong}</Text>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <Text className={`text-sm block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>参赛次数</Text>
                <Text className="text-2xl font-bold text-blue-400">{answerStats.totalSubmissions}</Text>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-36">
              <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>暂无答题数据</Text>
            </div>
          )}
        </BentoCard>
      </motion.div>

      {/* Avatar Selection Modal */}
      <Modal
        title="选择头像"
        open={avatarModalOpen}
        onCancel={() => setAvatarModalOpen(false)}
        footer={null}
        width={600}
        className={isDark ? 'dark-modal' : ''}
      >
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 p-2 max-h-[60vh] overflow-y-auto">
          {avatarList.map((url, idx) => (
            <motion.div
              key={url}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                profile?.avatar === url
                  ? 'border-blue-500 shadow-lg shadow-blue-500/30'
                  : isDark ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-400'
              }`}
              onClick={() => handleSelectAvatar(url)}
            >
              <img src={url} alt={`头像 ${idx + 1}`} className="w-full aspect-square object-cover" />
            </motion.div>
          ))}
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="修改密码"
        open={passwordModalOpen}
        onOk={handleChangePassword}
        onCancel={() => { setPasswordModalOpen(false); passwordForm.resetFields(); }}
        okText="确认"
        cancelText="取消"
      >
        <Form form={passwordForm} layout="vertical" className="mt-4">
          <Form.Item name="oldPassword" label="旧密码" rules={[{ required: true, message: '请输入旧密码' }]}>
            <Input.Password className={isDark ? 'bg-slate-800' : 'bg-slate-50'} />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码至少6位' }]}>
            <Input.Password className={isDark ? 'bg-slate-800' : 'bg-slate-50'} />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认新密码" rules={[{ required: true, message: '请确认新密码' }]}>
            <Input.Password className={isDark ? 'bg-slate-800' : 'bg-slate-50'} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
