import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Row, Col, Input, Segmented, message, Modal } from 'antd';
import { SearchOutlined, ClockCircleOutlined, CheckCircleOutlined, TrophyOutlined, CalendarOutlined, FileTextOutlined, HourglassOutlined, CloseOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { contestApi, Contest } from '../api/contest';

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
  return (
    <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden">
      <div className="animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-40 h-5 bg-slate-700 rounded" />
          </div>
          <div className="w-16 h-5 bg-slate-700 rounded-full" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="w-full h-4 bg-slate-700 rounded" />
          <div className="flex gap-3">
            <div className="w-24 h-4 bg-slate-700 rounded" />
            <div className="w-20 h-4 bg-slate-700 rounded" />
          </div>
        </div>
        <div className="w-full h-10 bg-slate-700 rounded-xl" />
      </div>
    </Card>
  );
}

// Frosted glass contest detail modal
function ContestDetailModal({ contest, open, onClose }: { contest: Contest | null; open: boolean; onClose: () => void }) {
  const navigate = useNavigate();

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
    if (contest.userSubmission) return 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30';
    if (contest.status === 'ongoing') return 'bg-emerald-500 hover:bg-emerald-400 text-white border-0';
    if (contest.status === 'upcoming') return 'bg-blue-500 hover:bg-blue-400 text-white border-0';
    return 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-0';
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
              className="w-full max-w-lg pointer-events-auto rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-blue-500/10"
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              {/* Top gradient bar */}
              <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />

              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <Title level={4} className="!text-slate-100 !mb-2 leading-snug">{contest.title}</Title>
                    <StatusTag status={contest.status} />
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200"
                  >
                    <CloseOutlined />
                  </button>
                </div>

                {/* Description */}
                {contest.description && (
                  <div className="p-3 bg-slate-800/50 rounded-xl mb-4">
                    <Text className="text-slate-300 text-sm leading-relaxed">{contest.description}</Text>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
                    <CalendarOutlined className="text-blue-400" />
                    <div>
                      <Text className="text-slate-500 text-xs block">开始时间</Text>
                      <Text className="text-slate-300 text-sm">{new Date(contest.startTime).toLocaleString('zh-CN')}</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
                    <CalendarOutlined className="text-blue-400" />
                    <div>
                      <Text className="text-slate-500 text-xs block">结束时间</Text>
                      <Text className="text-slate-300 text-sm">{new Date(contest.endTime).toLocaleString('zh-CN')}</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
                    <FileTextOutlined className="text-emerald-400" />
                    <div>
                      <Text className="text-slate-500 text-xs block">题目数量</Text>
                      <Text className="text-slate-300 text-sm">{contest.questionIds?.length || 0} 题</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
                    <HourglassOutlined className="text-amber-400" />
                    <div>
                      <Text className="text-slate-500 text-xs block">答题时长</Text>
                      <Text className="text-slate-300 text-sm">{contest.duration} 分钟</Text>
                    </div>
                  </div>
                </div>

                {/* Score info */}
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl mb-4">
                  <div className="flex items-center gap-2">
                    <TrophyOutlined className="text-amber-400" />
                    <Text className="text-slate-300 text-sm">总分</Text>
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
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl h-11"
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
        color: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30',
        icon: <CheckCircleOutlined />,
      };
    }

    switch (contest.status) {
      case 'ongoing':
        return { label: '立即参赛 →', color: 'bg-emerald-500 hover:bg-emerald-400 text-white border-0', icon: null };
      case 'upcoming':
        return { label: '查看详情 →', color: 'bg-blue-500 hover:bg-blue-400 text-white border-0', icon: null };
      case 'finished':
        return { label: '查看成绩 →', color: 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-0', icon: null };
      default:
        return { label: '查看详情 →', color: 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-0', icon: null };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Title level={3} className="!text-slate-100 !mb-0">🏁 竞赛列表</Title>
        <Input
          prefix={<SearchOutlined className="text-slate-500" />}
          placeholder="搜索竞赛..."
          className="w-full sm:w-64 bg-slate-800 border-slate-700 text-slate-100 rounded-xl"
        />
      </div>

      <Segmented
        options={statusLabels}
        value={filter}
        onChange={(val) => setFilter(String(val))}
        className="bg-slate-800 text-slate-300"
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
        <Card className="bg-slate-900 border-slate-800 rounded-2xl">
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-3 text-slate-700" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="12" y="8" width="40" height="48" rx="4" />
              <line x1="20" y1="20" x2="44" y2="20" />
              <line x1="20" y1="28" x2="36" y2="28" />
              <line x1="20" y1="36" x2="40" y2="36" />
              <circle cx="44" cy="44" r="14" fill="#0f172a" stroke="currentColor" />
              <line x1="44" y1="38" x2="44" y2="50" />
              <line x1="38" y1="44" x2="50" y2="44" />
            </svg>
            <Text className="text-slate-500 text-lg block mb-2">暂无竞赛</Text>
            <Text className="text-slate-600">管理员创建竞赛后会在这里显示</Text>
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
                  <Card className="bg-slate-900 border-slate-800 rounded-2xl hover:border-slate-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 card-highlight relative overflow-hidden">
                    {/* Background gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradients[contest.status] || ''} pointer-events-none`} />
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
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
                        <Title level={5} className="!text-slate-100 !mb-0">{contest.title}</Title>
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

                    <div className="space-y-2 text-sm text-slate-400 mb-4">
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined />
                        <Text className="text-slate-400">
                          {new Date(contest.startTime).toLocaleString('zh-CN')} ~ {new Date(contest.endTime).toLocaleString('zh-CN')}
                        </Text>
                      </div>
                      <div className="flex gap-3">
                        <Text className="text-slate-400">📋 {contest.questionIds?.length || 0}题 | {contest.totalScore}分</Text>
                        <Text className="text-slate-400">⏱ {contest.duration}分钟</Text>
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
