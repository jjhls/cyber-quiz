import { useEffect, useState, useMemo, useRef } from 'react';
import { Typography, Card, Table, message, Spin, Avatar, Select, Tag } from 'antd';
import { TrophyOutlined, RiseOutlined, ArrowUpOutlined, ArrowDownOutlined, UserOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { contestApi, Contest, ContestRanking } from '../api/contest';
import { useThemeStore } from '../stores/themeStore';
import { userProfileApi } from '../api/userProfile';

const { Title, Text } = Typography;

// Animated counter component
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
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

  return <span>{display}</span>;
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

// Podium component for top 3 with real avatars
function Podium({ rankings, isDark, userAvatars }: { rankings: ContestRanking[]; isDark: boolean; userAvatars: Record<string, string> }) {
  const top3 = rankings.slice(0, 3);
  if (top3.length < 3) return null;

  // Calculate heights based on score ratio (min h-20, max h-40)
  const maxScore = top3[0].score || 1;
  const getHeight = (score: number) => {
    const ratio = score / maxScore;
    const minH = 80; // h-20 = 5rem = 80px
    const maxH = 160; // h-40 = 10rem = 160px
    return Math.round(minH + (maxH - minH) * ratio);
  };

  const order = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
  const barHeights = order.map(r => getHeight(r.score));
  const colors = ['from-slate-400 to-slate-500', 'from-yellow-400 to-amber-500', 'from-amber-600 to-amber-700'];
  const emojis = ['🥈', '🥇', '🥉'];
  const sizes = [56, 64, 56];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <div className="flex justify-center items-end gap-4 mb-2">
        {order.map((r, i) => (
          <motion.div
            key={r.userId}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: i * 0.15, stiffness: 200 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              {userAvatars[r.userId] ? (
                <Avatar
                  src={userAvatars[r.userId]}
                  size={sizes[i]}
                  className="border-2 border-white/30"
                />
              ) : (
                <Avatar
                  size={sizes[i]}
                  className="bg-gradient-to-br from-blue-500 to-violet-500 text-white font-bold"
                  style={{ fontSize: sizes[i] * 0.4 }}
                >
                  {r.username.charAt(0)}
                </Avatar>
              )}
              <span className="absolute -top-2 -right-2 text-lg">{emojis[i]}</span>
            </div>
            <Text className={`text-sm mt-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{r.username}</Text>
            <Text className="text-blue-400 font-bold text-lg">{r.score}分</Text>
            <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {Math.floor(r.duration / 60)}分{r.duration % 60}秒
            </Text>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center gap-2 items-end">
        {order.map((r, i) => (
          <motion.div
            key={r.userId}
            initial={{ height: 0 }}
            animate={{ height: barHeights[i] }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
            className={`w-28 rounded-t-xl bg-gradient-to-t ${colors[i]} flex items-start justify-center pt-3`}
            style={{ height: barHeights[i] }}
          >
            <span className="text-white font-bold text-lg opacity-80">#{i === 0 ? 2 : i === 1 ? 1 : 3}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function EmptyRanking({ isDark }: { isDark: boolean }) {
  return (
    <div className="text-center py-12">
      <svg className={`w-20 h-20 mx-auto mb-4 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="10" y="30" width="20" height="40" rx="3" />
        <rect x="30" y="20" width="20" height="50" rx="3" />
        <rect x="50" y="35" width="20" height="35" rx="3" />
        <circle cx="20" cy="22" r="8" />
        <circle cx="40" cy="12" r="8" />
        <circle cx="60" cy="27" r="8" />
      </svg>
      <Text className={`text-lg block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>暂无排行数据</Text>
      <Text className={isDark ? 'text-slate-600' : 'text-slate-300'}>参加竞赛后即可查看排名</Text>
    </div>
  );
}

export default function RankingPage() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string | null>(null);
  const [rankings, setRankings] = useState<ContestRanking[]>([]);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  // Load contests
  useEffect(() => {
    contestApi.getList()
      .then(data => {
        const availableContests = data.filter(c => c.status === 'finished' || c.status === 'ongoing');
        setContests(availableContests);
        if (availableContests.length > 0) {
          setSelectedContestId(availableContests[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Load rankings when contest changes
  useEffect(() => {
    if (!selectedContestId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    contestApi.getRanking(selectedContestId)
      .then(data => {
        setRankings(data);
        // Find my rank
        userProfileApi.getProfile().then(profile => {
          if (profile) {
            const myEntry = data.find(r => r.userId === profile.id);
            setMyRank(myEntry ? myEntry.rank : null);
          }
        }).catch(() => {});

        // Load avatars for top users
        const avatarPromises = data.slice(0, 10).map(async (r) => {
          try {
            const profile = await userProfileApi.getProfile();
            return null; // We'll load avatars differently
          } catch {
            return null;
          }
        });
      })
      .catch(() => setRankings([]))
      .finally(() => setLoading(false));
  }, [selectedContestId]);

  const selectedContest = contests.find(c => c.id === selectedContestId);

  const columns = useMemo(() => [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (r: number, record: ContestRanking) => {
        if (r <= 3) {
          return <span className="text-lg">{r === 1 ? '🥇' : r === 2 ? '🥈' : '🥉'}</span>;
        }
        return <span className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>#{r}</span>;
      },
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      render: (u: string, r: ContestRanking) => (
        <div className="flex items-center gap-2">
          {userAvatars[r.userId] ? (
            <Avatar src={userAvatars[r.userId]} size={28} />
          ) : (
            <Avatar size={28} className="bg-gradient-to-br from-blue-500 to-violet-500 text-xs">{u.charAt(0)}</Avatar>
          )}
          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{u}</span>
        </div>
      ),
    },
    {
      title: '分数',
      dataIndex: 'score',
      key: 'score',
      render: (s: number, r: ContestRanking) => (
        <span className="text-blue-400 font-bold">{s}/{r.totalScore}</span>
      ),
    },
    {
      title: '正确',
      key: 'correct',
      render: (_: any, r: ContestRanking) => (
        <span className="text-emerald-400">{r.correctCount}/{r.totalCount}</span>
      ),
    },
    {
      title: '用时',
      dataIndex: 'duration',
      key: 'duration',
      render: (d: number) => (
        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{Math.floor(d / 60)}分{d % 60}秒</span>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (t: string) => (
        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{new Date(t).toLocaleString('zh-CN')}</span>
      ),
    },
  ], [isDark, userAvatars]);

  if (loading) {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-blue-500' : 'bg-blue-300'}`} style={{ animationDuration: '4s' }} />
        <div className={`absolute top-1/3 -left-20 w-72 h-72 rounded-full blur-3xl opacity-15 ${isDark ? 'bg-violet-500' : 'bg-violet-300'}`} style={{ animation: 'pulse 6s ease-in-out infinite' }} />
      </div>

      {/* Page Title + Contest Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <Title level={3} className={`!mb-0 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>🏆 排行榜</Title>
        {contests.length > 1 && (
          <Select
            value={selectedContestId}
            onChange={setSelectedContestId}
            className={`w-full sm:w-64 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            options={contests.map(c => ({
              value: c.id,
              label: `${c.title} (${c.status === 'ongoing' ? '进行中' : '已结束'})`,
            }))}
          />
        )}
      </motion.div>

      {/* Stats Cards - Compact inline layout */}
      {rankings.length > 0 && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BentoCard>
            <TrophyOutlined className={`absolute -right-4 -bottom-4 text-8xl rotate-12 ${isDark ? 'text-amber-500/5' : 'text-amber-500/10'}`} />
            <div className="relative z-10 flex items-center gap-4">
              <div>
                <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>参赛人数</Text>
                <div className={`text-3xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  <AnimatedCounter value={rankings.length} />
                </div>
              </div>
              <div className={`text-lg ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>人</div>
            </div>
          </BentoCard>

          <BentoCard>
            <RiseOutlined className={`absolute -right-3 -bottom-3 text-7xl rotate-12 ${isDark ? 'text-blue-500/5' : 'text-blue-500/10'}`} />
            <div className="relative z-10 flex items-center gap-4">
              <div>
                <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>最高分</Text>
                <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  <AnimatedCounter value={rankings[0]?.score || 0} />
                </div>
              </div>
              <div className={`text-lg ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ {rankings[0]?.totalScore || 0}</div>
            </div>
          </BentoCard>

          <BentoCard>
            <div className={`absolute -right-3 -bottom-3 text-7xl rotate-12 ${isDark ? 'text-emerald-500/5' : 'text-emerald-500/10'}`}>🎯</div>
            <div className="relative z-10 flex items-center gap-4">
              <div>
                <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>我的排名</Text>
                <div className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {myRank ? `#${myRank}` : '-'}
                </div>
              </div>
              <div className={`text-lg ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {myRank ? `/ ${rankings.length}` : '未参赛'}
              </div>
            </div>
          </BentoCard>
        </motion.div>
      )}

      {/* Main Content */}
      {rankings.length === 0 ? (
        <Card className={`relative z-10 rounded-2xl transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <EmptyRanking isDark={isDark} />
        </Card>
      ) : (
        <Card className={`relative z-10 rounded-2xl card-highlight transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <Podium rankings={rankings} isDark={isDark} userAvatars={userAvatars} />

          {rankings.length > 3 && (
            <Table
              columns={columns}
              dataSource={rankings.filter(r => r.rank > 3)}
              rowKey="rank"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 条`,
                className: isDark ? 'text-slate-400' : 'text-slate-600',
              }}
              className="bg-transparent"
              rowClassName={(record) => {
                if (myRank && record.rank === myRank) {
                  return isDark ? 'bg-blue-500/10' : 'bg-blue-50';
                }
                return '';
              }}
            />
          )}
        </Card>
      )}
    </div>
  );
}
