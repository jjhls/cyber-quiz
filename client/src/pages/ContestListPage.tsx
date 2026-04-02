import { Card, Typography, Tag, Button, Row, Col, Input, Segmented } from 'antd';
import { SearchOutlined, TrophyOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const mockContests = [
  { id: '1', title: '第三届网络安全知识竞赛', status: 'ongoing', startTime: '04-05 10:00', endTime: '04-05 11:30', questions: 50, score: 100, participants: 42, categories: ['Web安全', '密码学', '逆向', '杂项'] },
  { id: '2', title: '密码学专项赛', status: 'upcoming', startTime: '04-10 14:00', endTime: '04-10 15:00', questions: 30, score: 100, participants: 18, categories: ['密码学'] },
  { id: '3', title: '第二届CTF理论赛', status: 'finished', startTime: '03-20 10:00', endTime: '03-20 11:00', questions: 40, score: 100, participants: 35, categories: ['综合'], myRank: 8, myScore: 85 },
  { id: '4', title: 'Web安全专项赛', status: 'ongoing', startTime: '04-06 14:00', endTime: '04-06 15:30', questions: 25, score: 100, participants: 23, categories: ['Web安全'] },
];

const statusConfig: Record<string, { color: string; label: string; action: string; actionColor: string }> = {
  ongoing: { color: 'emerald', label: '进行中', action: '立即参赛', actionColor: 'bg-emerald-500 hover:bg-emerald-400' },
  upcoming: { color: 'blue', label: '即将开始', action: '预约报名', actionColor: 'bg-blue-500 hover:bg-blue-400' },
  finished: { color: 'default', label: '已结束', action: '查看成绩', actionColor: 'bg-slate-600 hover:bg-slate-500' },
};

export default function ContestListPage() {
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
        options={['全部', '进行中', '即将开始', '已结束']}
        className="bg-slate-800 text-slate-300"
      />

      <Row gutter={[16, 16]}>
        {mockContests.map((contest, idx) => {
          const config = statusConfig[contest.status];
          return (
            <Col xs={24} md={12} key={contest.id}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
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
                      <Text className="text-slate-400">{contest.startTime} ~ {contest.endTime}</Text>
                    </div>
                    <div className="flex gap-3">
                      <Text className="text-slate-400">📋 {contest.questions}题 | {contest.score}分</Text>
                      <Text className="text-slate-400 flex items-center gap-1"><TeamOutlined /> {contest.participants}人已报名</Text>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {contest.categories.map(c => <Tag key={c} className="text-xs">{c}</Tag>)}
                    </div>
                  </div>

                  {contest.status === 'finished' && contest.myRank && (
                    <div className="mb-3 p-2 bg-slate-800/50 rounded-lg">
                      <Text className="text-slate-300 text-sm">🏅 我的排名: #{contest.myRank} | 得分: {contest.myScore}</Text>
                    </div>
                  )}

                  <Button className={`${config.actionColor} text-white border-0 rounded-xl w-full`}>
                    {config.action} →
                  </Button>
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
