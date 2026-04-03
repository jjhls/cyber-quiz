import { useEffect, useState } from 'react';
import { Typography, Card, Table, message, Spin, Avatar } from 'antd';
import { motion } from 'framer-motion';
import { contestApi, ContestRanking } from '../api/contest';
import { useThemeStore } from '../stores/themeStore';

const { Title, Text } = Typography;

// Podium component for top 3
function Podium({ rankings, isDark }: { rankings: ContestRanking[]; isDark: boolean }) {
  const top3 = rankings.slice(0, 3);
  if (top3.length < 3) return null;

  const order = [top3[1], top3[0], top3[2]];
  const heights = ['h-28', 'h-36', 'h-20'];
  const colors = ['from-slate-400 to-slate-500', 'from-yellow-400 to-amber-500', 'from-amber-600 to-amber-700'];
  const emojis = ['🥈', '🥇', '🥉'];
  const sizes = [48, 56, 48];

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
              <Avatar
                size={sizes[i]}
                className="bg-gradient-to-br from-blue-500 to-violet-500 text-white font-bold"
                style={{ fontSize: sizes[i] * 0.4 }}
              >
                {r.username.charAt(0)}
              </Avatar>
              <span className="absolute -top-2 -right-2 text-lg">{emojis[i]}</span>
            </div>
            <Text className={`text-sm mt-1 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{r.username}</Text>
            <Text className="text-blue-400 font-bold">{r.score}分</Text>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center gap-2 items-end">
        {order.map((r, i) => (
          <motion.div
            key={r.userId}
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            className={`w-24 ${heights[i]} rounded-t-xl bg-gradient-to-t ${colors[i]} flex items-start justify-center pt-3`}
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
  const [rankings, setRankings] = useState<ContestRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contestApi.getList('ongoing')
      .then(contests => {
        if (contests.length > 0) {
          return contestApi.getRanking(contests[0].id);
        }
        return [];
      })
      .then(setRankings)
      .catch(() => setRankings([]))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 80, render: (r: number) => (
      r <= 3 ? '' : <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>#{r}</span>
    )},
    { title: '用户名', dataIndex: 'username', key: 'username', render: (u: string, r: ContestRanking) => (
      r.rank > 3 ? <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{u}</span> : null
    )},
    { title: '分数', dataIndex: 'score', key: 'score', render: (s: number, r: ContestRanking) => (
      r.rank > 3 ? <span className="text-blue-400 font-bold">{s}/{r.totalScore}</span> : null
    )},
    { title: '正确', key: 'correct', render: (_: any, r: ContestRanking) => (
      r.rank > 3 ? <span className="text-emerald-400">{r.correctCount}/{r.totalCount}</span> : null
    )},
    { title: '用时', dataIndex: 'duration', key: 'duration', render: (d: number, r: ContestRanking) => (
      r.rank > 3 ? <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{Math.floor(d / 60)}分{d % 60}秒</span> : null
    )},
    { title: '提交时间', dataIndex: 'submittedAt', key: 'submittedAt', render: (t: string, r: ContestRanking) => (
      r.rank > 3 ? <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{new Date(t).toLocaleString('zh-CN')}</span> : null
    )},
  ];

  if (loading) return <div className={`flex justify-center py-20 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <Title level={3} className={`!mb-0 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>🏆 排行榜</Title>

      {rankings.length === 0 ? (
        <Card className={`rounded-2xl transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <EmptyRanking isDark={isDark} />
        </Card>
      ) : (
        <Card className={`rounded-2xl card-highlight transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <Podium rankings={rankings} isDark={isDark} />

          {rankings.length > 3 && (
            <Table
              columns={columns}
              dataSource={rankings.filter(r => r.rank > 3)}
              rowKey="rank"
              pagination={false}
              className="bg-transparent"
            />
          )}
        </Card>
      )}
    </div>
  );
}
