import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Row, Col, Input, Segmented, message } from 'antd';
import { SearchOutlined, ClockCircleOutlined, CheckCircleOutlined, TrophyOutlined, CalendarOutlined, FileTextOutlined, HourglassOutlined, CloseOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { contestApi, Contest } from '../api/contest';
import { useThemeStore } from '../stores/themeStore';

const { Title, Text } = Typography;

const categoryGradients: Record<string, string> = {
  ongoing: 'from-emerald-500/10 via-transparent to-transparent',
  upcoming: 'from-blue-500/10 via-transparent to-transparent',
  finished: 'from-slate-600/5 via-transparent to-transparent',
};

const statusConfig: Record<string, { color: string; label: string; gradient: string }> = {
  ongoing: { color: 'emerald', label: '进行中', gradient: 'from-emerald-500 to-emerald-400' },
  upcoming: { color: 'blue', label: '即将开始', gradient: 'from-blue-500 to-blue-400' },
  finished: { color: 'default', label: '已结束', gradient: 'from-slate-600 to-slate-500' },
};

const statusLabels = ['全部', '进行中', '即将开始', '已结束'];
const statusMap: Record<string, string> = { '进行中': 'ongoing', '即将开始': 'upcoming', '已结束': 'finished' };

// Capsule status tag with pulse animation for ongoing
function StatusTag({ status }: { status: string }) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
      status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
      status === 'upcoming' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
      'bg-slate-700/50 text-slate-400 border border-slate-600/30'
    }`}>
      {status === 'ongoing' && (
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      )}
      {status === 'upcoming' && (
        <span className="w-2 h-2 rounded-full bg-blue-400" />
      )}
      {status === 'finished' && (
        <span className="w-2 h-2 rounded-full bg-slate-500" />
      )}
      {config.label}
    </span>
  );
}

// Skeleton card for loading state
function ContestSkeleton() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <Card className={`rounded-2xl overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
            <div className={`w-40 h-5 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>
          <div className={`w-16 h-5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        </div>
        <div className="space-y-2 mb-4">
          <div className={`w-full h-4 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className="flex gap-3">
            <div className={`w-24 h-4 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <div className={`w-20 h-4 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>
        </div>
        <div className={`w-full h-10 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
      </div>
    </Card>
  );
}

// Frosted glass contest detail modal
function ContestDetailModal({ contest, open, onClose }: { contest: Contest | null; open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  if (!contest) return null;

  const config = statusConfig[contest.status];

  const handleAction = () => {
    onClose();
    if (contest.userSubmission) {
      navigate(`/contests/${contest.id}/result`);
    } else if (contest.status === 'ongoing') {
      navigate(`/contests/${contest.id}`);
    } else {
      navigate(`/contests/${contest.id}`);
    }
  };

  const getActionLabel = () => {
    if (contest.userSubmission) return '查看成绩';
    if (contest.status === 'ongoing') return '立即参赛';
    if (contest.status === 'upcoming') return '预约报名';
    return '查看排名';
  };

  const getActionColor = () => {
    if (contest.userSubmission) return isDark ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200';
    if (contest.status === 'ongoing') return 'bg-emerald-500 hover:bg-emerald-400 text-white border-0';
    if (contest.status === 'upcoming') return 'bg-blue-500 hover:bg-blue-400 text-white border-0';
    return isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-0' : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-0';
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-lg pointer-events-auto rounded-3xl overflow-hidden border shadow-2xl shadow-blue-500/10 transition-colors duration-300"
              style={{
                background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
              }}
            >
              {/* Top gradient bar */}
              <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />

              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <Title level={4} className={`!mb-2 leading-snug ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>{contest.title}</Title>
                    <StatusTag status={contest.status} />
                  </div>
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'}`}
                  >
                    <CloseOutlined />
                  </button>
                </div>

                {/* Description */}
                {contest.description && (
                  <div className={`p-3 rounded-xl mb-4 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <Text className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{contest.description}</Text>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                    <CalendarOutlined className="text-blue-400" />
                    <div>
                      <Text className={`text-xs block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>开始时间</Text>
                      <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{new Date(contest.startTime).toLocaleString('zh-CN')}</Text>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                    <CalendarOutlined className="text-blue-400" />
                    <div>
                      <Text className={`text-xs block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>结束时间</Text>
                      <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{new Date(contest.endTime).toLocaleString('zh-CN')}</Text>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                    <FileTextOutlined className="text-emerald-400" />
                    <div>
                      <Text className={`text-xs block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>题目数量</Text>
                      <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{contest.questionIds?.length || 0} 题</Text>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                    <HourglassOutlined className="text-amber-400" />
                    <div>
                      <Text className={`text-xs block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>答题时长</Text>
                      <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{contest.duration} 分钟</Text>
                    </div>
                  </div>
                </div>

                {/* Score info */}
                <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <TrophyOutlined className="text-amber-400" />
                    <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>总分</Text>
                  </div>
                  <Text className="text-amber-400 font-bold text-lg">{contest.totalScore} 分</Text>
                </div>

                {/* User submission info */}
                {contest.userSubmission && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-emerald-400" />
                        <Text className="text-emerald-300 font-medium">已参加</Text>
                      </div>
                      <div className="text-right">
                        <Text className="text-emerald-400 font-bold text-lg">
                          {contest.userSubmission.score}/{contest.userSubmission.totalScore}
                        </Text>
                        <Text className="text-emerald-400/70 text-xs block">
                          正确 {contest.userSubmission.correctCount}/{contest.userSubmission.totalCount}
                        </Text>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-2 flex gap-3">
                <Button
                  onClick={onClose}
                  className={`flex-1 rounded-xl h-11 ${isDark ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700'}`}
                >
                  关闭
                </Button>
                <Button
                  onClick={handleAction}
                  className={`flex-1 ${getActionColor()} rounded-xl h-11 font-medium`}
                >
                  {getActionLabel()} →
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function ContestListPage() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('全部');
  const [detailContest, setDetailContest] = useState<Contest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    loadContests();
  }, [filter]);

  const loadContests = async () => {
    setLoading(true);
    try {
      const status = filter === '全部' ? undefined : statusMap[filter];
      const data = await contestApi.getList(status);
      setContests(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载竞赛列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleContestClick = (contest: Contest) => {
    if (contest.userSubmission) {
      navigate(`/contests/${contest.id}/result`);
    } else {
      setDetailContest(contest);
      setDetailOpen(true);
    }
  };

  const getButtonConfig = (contest: Contest) => {
    if (contest.userSubmission) {
      return {
        label: `${contest.userSubmission.score}/${contest.userSubmission.totalScore}分`,
        color: isDark ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200',
        icon: <CheckCircleOutlined />,
      };
    }

    switch (contest.status) {
      case 'ongoing':
        return { label: '立即参赛 →', color: 'bg-emerald-500 hover:bg-emerald-400 text-white border-0', icon: null };
      case 'upcoming':
        return { label: '查看详情 →', color: 'bg-blue-500 hover:bg-blue-400 text-white border-0', icon: null };
      case 'finished':
        return { label: '查看成绩 →', color: isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-0' : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-0', icon: null };
      default:
        return { label: '查看详情 →', color: isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-0' : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-0', icon: null };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Title level={3} className={`!mb-0 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>🏁 竞赛列表</Title>
        <Input
          prefix={<SearchOutlined className={isDark ? 'text-slate-500' : 'text-slate-400'} />}
          placeholder="搜索竞赛..."
          className={`w-full sm:w-64 rounded-xl ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
        />
      </div>

      <Segmented
        options={statusLabels}
        value={filter}
        onChange={(val) => setFilter(String(val))}
        className={`transition-colors duration-300 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}
      />

      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(i => (
            <Col xs={24} md={12} key={i}>
              <ContestSkeleton />
            </Col>
          ))}
        </Row>
      ) : contests.length === 0 ? (
        <Card className={`rounded-2xl transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-center py-12">
            <svg className={`w-16 h-16 mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="12" y="8" width="40" height="48" rx="4" />
              <line x1="20" y1="20" x2="44" y2="20" />
              <line x1="20" y1="28" x2="36" y2="28" />
              <line x1="20" y1="36" x2="40" y2="36" />
              <circle cx="44" cy="44" r="14" fill={isDark ? '#0f172a' : '#f8fafc'} stroke="currentColor" />
              <line x1="44" y1="38" x2="44" y2="50" />
              <line x1="38" y1="44" x2="50" y2="44" />
            </svg>
            <Text className={`text-lg block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>暂无竞赛</Text>
            <Text className={isDark ? 'text-slate-600' : 'text-slate-300'}>管理员创建竞赛后会在这里显示</Text>
          </div>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {contests.map((contest, idx) => {
            const config = statusConfig[contest.status];
            const btnConfig = getButtonConfig(contest);
            return (
              <Col xs={24} md={12} key={contest.id}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className={`rounded-2xl hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 card-highlight relative overflow-hidden ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}>
                    {/* Background gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradients[contest.status] || ''} pointer-events-none`} />
                    {/* Decorative pattern */}
                    <div className={`absolute top-0 right-0 w-32 h-32 pointer-events-none ${isDark ? 'opacity-5' : 'opacity-10'}`}>
                      <svg viewBox="0 0 128 128" fill="none" stroke="currentColor" strokeWidth="0.5">
                        <circle cx="64" cy="64" r="60" />
                        <circle cx="64" cy="64" r="40" />
                        <circle cx="64" cy="64" r="20" />
                        <line x1="4" y1="64" x2="124" y2="64" />
                        <line x1="64" y1="4" x2="64" y2="124" />
                      </svg>
                    </div>
                    {/* Top status bar */}
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${config.gradient}`} />

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Title level={5} className={`!mb-0 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>{contest.title}</Title>
                      </div>
                      <div className="flex gap-1">
                        {contest.userSubmission && (
                          <Tag color="emerald" className="flex items-center gap-1 text-xs">
                            <CheckCircleOutlined /> 已参加
                          </Tag>
                        )}
                        <StatusTag status={contest.status} />
                      </div>
                    </div>

                    <div className={`space-y-2 text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined />
                        <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                          {new Date(contest.startTime).toLocaleString('zh-CN')} ~ {new Date(contest.endTime).toLocaleString('zh-CN')}
                        </Text>
                      </div>
                      <div className="flex gap-3">
                        <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>📋 {contest.questionIds?.length || 0}题 | {contest.totalScore}分</Text>
                        <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>⏱ {contest.duration}分钟</Text>
                      </div>
                    </div>

                    {/* Score banner for participated contests */}
                    {contest.userSubmission && (
                      <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrophyOutlined className="text-emerald-400" />
                          <Text className="text-emerald-300 text-sm">
                            得分: {contest.userSubmission.score}/{contest.userSubmission.totalScore}
                          </Text>
                        </div>
                        <Text className="text-emerald-400 text-sm">
                          正确 {contest.userSubmission.correctCount}/{contest.userSubmission.totalCount}
                        </Text>
                      </div>
                    )}

                    <Button
                      onClick={() => handleContestClick(contest)}
                      className={`${btnConfig.color} rounded-xl w-full text-center`}
                    >
                      {btnConfig.icon && <span className="mr-1">{btnConfig.icon}</span>}
                      {btnConfig.label}
                    </Button>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Frosted glass detail modal */}
      <ContestDetailModal
        contest={detailContest}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
