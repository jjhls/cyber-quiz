import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Statistic, Spin, Button, message } from 'antd';
import { examApi, ExamResult } from '../api/exam';
import { contestApi, ContestRanking } from '../api/contest';

const { Title, Text } = Typography;

export default function ExamResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (!result) return <div className="text-center py-20"><Text className="text-slate-500">未找到考试结果</Text></div>;

  const correctRate = result.totalCount > 0 ? Math.round((result.correctCount / result.totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">🎉 竞赛完成！</Title>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800 rounded-2xl text-center">
          <Statistic
            value={result.score}
            valueStyle={{
              color: result.score >= 80 ? '#34d399' : result.score >= 60 ? '#fbbf24' : '#ef4444',
              fontSize: '3rem', fontWeight: 700,
            }}
            suffix="分"
          />
          <Text className="text-slate-500">满分 {result.totalScore}</Text>
        </Card>
        <Card className="bg-slate-900 border-slate-800 rounded-2xl text-center">
          <Statistic
            value={correctRate}
            suffix="%"
            valueStyle={{ color: '#60a5fa', fontSize: '3rem', fontWeight: 700 }}
          />
          <Text className="text-slate-500">正确率 {result.correctCount}/{result.totalCount}</Text>
        </Card>
        <Card className="bg-slate-900 border-slate-800 rounded-2xl text-center">
          <Statistic
            value={Math.floor(result.duration / 60)}
            suffix="分钟"
            valueStyle={{ color: '#fbbf24', fontSize: '3rem', fontWeight: 700 }}
          />
          <Text className="text-slate-500">用时 {result.duration % 60}秒</Text>
        </Card>
      </div>

      {/* Recent Ranking */}
      {ranking.length > 0 && (
        <Card className="bg-slate-900 border-slate-800 rounded-2xl">
          <Title level={5} className="!text-slate-100 !mb-4">🏆 排行榜 TOP 5</Title>
          <div className="space-y-2">
            {ranking.slice(0, 5).map((r) => (
              <div key={r.rank} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}
                  </span>
                  <Text className="text-slate-300">{r.username}</Text>
                </div>
                <div className="flex items-center gap-4">
                  <Text className="text-blue-400 font-bold">{r.score}</Text>
                  <Text className="text-slate-500 text-sm">{Math.floor(r.duration / 60)}分{r.duration % 60}秒</Text>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => navigate(`/contests/${id}`)}
          className="bg-blue-500 hover:bg-blue-400 border-0 text-white rounded-xl"
        >
          查看排名
        </Button>
        <Button
          onClick={() => navigate('/contests')}
          className="bg-slate-800 border-slate-700 text-slate-300 rounded-xl"
        >
          返回竞赛列表
        </Button>
      </div>
    </div>
  );
}
