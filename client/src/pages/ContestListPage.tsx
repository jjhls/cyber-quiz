import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Row, Col, Input, Segmented, Spin, message } from 'antd';
import { SearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { contestApi, Contest } from '../api/contest';

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; label: string; action: string; actionColor: string }> = {
  ongoing: { color: 'emerald', label: '进行中', action: '立即参赛', actionColor: 'bg-emerald-500 hover:bg-emerald-400' },
  upcoming: { color: 'blue', label: '即将开始', action: '查看详情', actionColor: 'bg-blue-500 hover:bg-blue-400' },
  finished: { color: 'default', label: '已结束', action: '查看成绩', actionColor: 'bg-slate-600 hover:bg-slate-500' },
};

const statusLabels = ['全部', '进行中', '即将开始', '已结束'];
const statusMap: Record<string, string> = { '进行中': 'ongoing', '即将开始': 'upcoming', '已结束': 'finished' };

export default function ContestListPage() {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('全部');

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
        <div className="flex justify-center py-20"><Spin size="large" /></div>
      ) : contests.length === 0 ? (
        <div className="text-center py-20">
          <Text className="text-slate-500 text-lg">暂无竞赛</Text>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {contests.map((contest, idx) => {
            const config = statusConfig[contest.status];
            return (
              <Col xs={24} md={12} key={contest.id}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="bg-slate-900 border-slate-800 rounded-2xl hover:border-slate-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          contest.status === 'ongoing' ? 'bg-emerald-400 animate-pulse' :
                          contest.status === 'upcoming' ? 'bg-blue-400' : 'bg-slate-500'
                        }`} />
                        <Title level={5} className="!text-slate-100 !mb-0">{contest.title}</Title>
                      </div>
                      <Tag color={config.color}>{config.label}</Tag>
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

                    <Button
                      onClick={() => navigate(`/contests/${contest.id}`)}
                      className={`${config.actionColor} text-white border-0 rounded-xl w-full`}
                    >
                      {config.action} →
                    </Button>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
