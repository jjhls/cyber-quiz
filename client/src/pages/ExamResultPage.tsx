import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Spin, Button, message, Tag } from 'antd';
import { motion, animate } from 'framer-motion';
import { examApi, ExamResult } from '../api/exam';
import { contestApi, ContestRanking } from '../api/contest';
import { useThemeStore } from '../stores/themeStore';

const { Title, Text } = Typography;

const scoreEvaluation = [
  { min: 90, emoji: '🎉', title: '太棒了！', desc: '你是网络安全高手！', color: '#34d399' },
  { min: 80, emoji: '👏', title: '优秀！', desc: '表现非常出色，继续保持！', color: '#60a5fa' },
  { min: 70, emoji: '👍', title: '不错！', desc: '基础扎实，还有提升空间', color: '#60a5fa' },
  { min: 60, emoji: '💪', title: '及格了！', desc: '继续加油，你可以更好！', color: '#fbbf24' },
  { min: 0, emoji: '📚', title: '还需努力', desc: '多练习，下次一定能进步！', color: '#f97316' },
];

function getEvaluation(scorePercent: number) {
  return scoreEvaluation.find(e => scorePercent >= e.min) || scoreEvaluation[scoreEvaluation.length - 1];
}

function AnimatedNumber({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value, duration]);

  return <>{display}</>;
}

function ScoreCircle({ percent, size = 160, strokeWidth = 10, color, isDark }: { percent: number; size?: number; strokeWidth?: number; color: string; isDark: boolean }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const targetOffset = circumference - (percent / 100) * circumference;
    const timer = setTimeout(() => setOffset(targetOffset), 300);
    return () => clearTimeout(timer);
  }, [percent, circumference]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isDark ? '#1e293b' : '#e2e8f0'}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
        style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
      />
    </svg>
  );
}

export default function ExamResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [result, setResult] = useState<ExamResult | null>(null);
  const [ranking, setRanking] = useState<ContestRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      examApi.getResult(id).catch(() => null),
      contestApi.getRanking(id).catch(() => []),
    ])
      .then(([r, rank]) => {
        setResult(r);
        setRanking(rank);
      })
      .catch(err => message.error('加载结果失败'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}><Spin size="large" /></div>;
  if (!result) return <div className="text-center py-20"><Text className={isDark ? 'text-slate-500' : 'text-slate-400'}>未找到考试结果</Text></div>;

  const scorePercent = result.totalScore > 0 ? Math.round((result.score / result.totalScore) * 100) : 0;
  const correctRate = result.totalCount > 0 ? Math.round((result.correctCount / result.totalCount) * 100) : 0;
  const evaluation = getEvaluation(scorePercent);
  const minutes = Math.floor(result.duration / 60);
  const seconds = result.duration % 60;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
          className="text-6xl mb-4"
        >
          {evaluation.emoji}
        </motion.div>
        <Title level={2} className={`!mb-2 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>{evaluation.title}</Title>
        <Text className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{evaluation.desc}</Text>
      </motion.div>

      {/* Score Circle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center"
      >
        <Card className={`rounded-3xl p-8 card-highlight transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="relative flex items-center justify-center">
            <ScoreCircle percent={scorePercent} size={180} strokeWidth={12} color={evaluation.color} isDark={isDark} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-5xl font-bold"
                style={{ color: evaluation.color }}
              >
                <AnimatedNumber value={result.score} duration={1.5} />
              </motion.span>
              <Text className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ {result.totalScore} 分</Text>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className={`rounded-2xl text-center card-highlight transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-3xl font-bold text-blue-400">
            <AnimatedNumber value={correctRate} duration={1.2} />%
          </div>
          <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>正确率</Text>
        </Card>
        <Card className={`rounded-2xl text-center card-highlight transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-3xl font-bold text-emerald-400">
            <AnimatedNumber value={result.correctCount} duration={1} />
          </div>
          <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>答对 {result.correctCount}/{result.totalCount}</Text>
        </Card>
        <Card className={`rounded-2xl text-center card-highlight transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-3xl font-bold text-amber-400">
            {minutes}<span className="text-lg">分</span>{seconds}<span className="text-lg">秒</span>
          </div>
          <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>用时</Text>
        </Card>
        <Card className={`rounded-2xl text-center card-highlight transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-3xl font-bold text-red-400">
            <AnimatedNumber value={result.totalCount - result.correctCount} duration={1} />
          </div>
          <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>答错</Text>
        </Card>
      </motion.div>

      {/* Score Tags */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center gap-3 flex-wrap"
      >
        {scorePercent >= 90 && <Tag color="emerald" className="text-base px-4 py-1">🏆 满分大神</Tag>}
        {scorePercent >= 80 && scorePercent < 90 && <Tag color="blue" className="text-base px-4 py-1">⭐ 优秀选手</Tag>}
        {scorePercent >= 60 && scorePercent < 80 && <Tag color="default" className="text-base px-4 py-1">💡 继续加油</Tag>}
        {scorePercent < 60 && <Tag color="orange" className="text-base px-4 py-1">📖 需要复习</Tag>}
        {minutes < 10 && <Tag color="purple" className="text-base px-4 py-1">⚡ 闪电侠</Tag>}
        {result.correctCount === result.totalCount && <Tag color="emerald" className="text-base px-4 py-1">🎯 全对！</Tag>}
      </motion.div>

      {/* Ranking */}
      {ranking.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className={`rounded-2xl card-highlight transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <Title level={5} className={`!mb-4 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>🏆 排行榜 TOP 5</Title>
            <div className="space-y-2">
              {ranking.slice(0, 5).map((r) => (
                <div key={r.rank} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  r.rank <= 3
                    ? isDark ? 'bg-slate-800/70' : 'bg-slate-100'
                    : isDark ? 'bg-slate-800/30' : 'bg-slate-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center">
                      {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
                    </span>
                    <Text className={isDark ? 'text-slate-300' : 'text-slate-700'}>{r.username}</Text>
                  </div>
                  <div className="flex items-center gap-4">
                    <Text className="text-blue-400 font-bold">{r.score}</Text>
                    <Text className={isDark ? 'text-slate-500 text-sm' : 'text-slate-400 text-sm'}>{Math.floor(r.duration / 60)}分{r.duration % 60}秒</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex gap-3 justify-center"
      >
        <Button
          onClick={() => navigate(`/contests/${id}`)}
          className="bg-blue-500 hover:bg-blue-400 border-0 text-white rounded-xl px-8 h-11 text-base"
        >
          查看排名
        </Button>
        <Button
          onClick={() => navigate('/contests')}
          className={`rounded-xl px-8 h-11 text-base ${isDark ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700'}`}
        >
          返回竞赛列表
        </Button>
      </motion.div>
    </div>
  );
}
