import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Tag, Descriptions, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { contestApi, Contest } from '../api/contest';
import { useThemeStore } from '../stores/themeStore';

const { Title, Text } = Typography;

export default function ContestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      contestApi.getById(id)
        .then(data => setContest(data))
        .catch(err => message.error(err.response?.data?.message || '加载竞赛详情失败'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className={`flex justify-center py-20 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}><Spin size="large" /></div>;
  if (!contest) return <div className="text-center py-20"><Text className={isDark ? 'text-slate-500' : 'text-slate-400'}>竞赛不存在</Text></div>;

  const statusConfig: Record<string, { color: string; label: string }> = {
    ongoing: { color: 'emerald', label: '进行中' },
    upcoming: { color: 'blue', label: '即将开始' },
    finished: { color: 'default', label: '已结束' },
  };

  const config = statusConfig[contest.status];

  return (
    <div className="space-y-6">
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/contests')} className="text-blue-400 pl-0">
        返回竞赛列表
      </Button>

      <Card className={`rounded-2xl transition-colors duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <Title level={3} className={`!mb-2 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>{contest.title}</Title>
            <Tag color={config.color}>{config.label}</Tag>
            <Tag color="default">个人赛</Tag>
          </div>
          {contest.status === 'ongoing' && (
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(`/contests/${contest.id}/exam`)}
              className="bg-emerald-500 hover:bg-emerald-400 border-0 rounded-xl px-8"
            >
              立即参赛
            </Button>
          )}
        </div>

        <Descriptions column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label={<><ClockCircleOutlined /> 时间</>}>
            {new Date(contest.startTime).toLocaleString('zh-CN')} ~ {new Date(contest.endTime).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label={<><FileTextOutlined /> 题目</>}>{contest.questionIds?.length || 0} 题</Descriptions.Item>
          <Descriptions.Item label="总分">{contest.totalScore} 分</Descriptions.Item>
          <Descriptions.Item label="答题时长">{contest.duration} 分钟</Descriptions.Item>
        </Descriptions>

        {contest.description && (
          <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <Text className={isDark ? 'text-slate-300' : 'text-slate-600'}>{contest.description}</Text>
          </div>
        )}
      </Card>
    </div>
  );
}
