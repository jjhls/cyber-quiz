import { Typography, Card, Statistic, Progress } from 'antd';
import { useParams } from 'react-router-dom';

const { Title, Text } = Typography;

export default function ExamResultPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">🎉 竞赛完成！</Title>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800 rounded-2xl text-center">
          <Statistic value={85} valueStyle={{ color: '#60a5fa', fontSize: '3rem', fontWeight: 700 }} suffix="分" />
        </Card>
        <Card className="bg-slate-900 border-slate-800 rounded-2xl text-center">
          <Statistic value={84} precision={0} suffix="%" valueStyle={{ color: '#34d399', fontSize: '3rem', fontWeight: 700 }} />
          <Text className="text-slate-500">正确率 42/50</Text>
        </Card>
        <Card className="bg-slate-900 border-slate-800 rounded-2xl text-center">
          <Statistic value={8} valueStyle={{ color: '#fbbf24', fontSize: '3rem', fontWeight: 700 }} prefix="#" />
          <Text className="text-slate-500">排名 / 45 人</Text>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <Title level={5} className="!text-slate-100 !mb-4">📊 各分类得分</Title>
        <div className="space-y-3">
          <div><div className="flex justify-between mb-1"><Text className="text-slate-300">Web安全</Text><Text className="text-blue-400">80%</Text></div><Progress percent={80} strokeColor="#3b82f6" trailColor="#1e293b" /></div>
          <div><div className="flex justify-between mb-1"><Text className="text-slate-300">密码学</Text><Text className="text-blue-400">90%</Text></div><Progress percent={90} strokeColor="#3b82f6" trailColor="#1e293b" /></div>
          <div><div className="flex justify-between mb-1"><Text className="text-slate-300">逆向工程</Text><Text className="text-amber-400">60%</Text></div><Progress percent={60} strokeColor="#f59e0b" trailColor="#1e293b" /></div>
          <div><div className="flex justify-between mb-1"><Text className="text-slate-300">Misc</Text><Text className="text-emerald-400">95%</Text></div><Progress percent={95} strokeColor="#10b981" trailColor="#1e293b" /></div>
        </div>
      </Card>
    </div>
  );
}
