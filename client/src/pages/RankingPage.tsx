import { useEffect, useState } from 'react';
import { Typography, Card, Table, message, Spin } from 'antd';
import { contestApi, ContestRanking } from '../api/contest';

const { Title, Text } = Typography;

export default function RankingPage() {
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
      r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : r
    )},
    { title: '用户名', dataIndex: 'username', key: 'username', render: (u: string) => (
      <span className="text-slate-300">{u}</span>
    )},
    { title: '分数', dataIndex: 'score', key: 'score', render: (s: number, r: ContestRanking) => (
      <span className="text-blue-400 font-bold">{s}/{r.totalScore}</span>
    )},
    { title: '正确', key: 'correct', render: (_: any, r: ContestRanking) => (
      <span className="text-emerald-400">{r.correctCount}/{r.totalCount}</span>
    )},
    { title: '用时', dataIndex: 'duration', key: 'duration', render: (d: number) => (
      <span className="text-slate-400">{Math.floor(d / 60)}分{d % 60}秒</span>
    )},
    { title: '提交时间', dataIndex: 'submittedAt', key: 'submittedAt', render: (t: string) => (
      <span className="text-slate-500">{new Date(t).toLocaleString('zh-CN')}</span>
    )},
  ];

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">🏆 排行榜</Title>

      {rankings.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 rounded-2xl">
          <div className="text-center py-10">
            <span className="text-slate-500 text-lg">暂无排行数据</span>
          </div>
        </Card>
      ) : (
        <Card className="bg-slate-900 border-slate-800 rounded-2xl">
          <Table columns={columns} dataSource={rankings} rowKey="rank" pagination={false} />
        </Card>
      )}
    </div>
  );
}
