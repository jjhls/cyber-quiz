import { Card, Typography, Button, Tag, Descriptions, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, ClockCircleOutlined, TeamOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function ContestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/contests')} className="text-blue-400 pl-0">
        返回竞赛列表
      </Button>

      <Card className="bg-slate-900 border-slate-800 rounded-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <Title level={3} className="!text-slate-100 !mb-2">第三届网络安全知识竞赛</Title>
            <Tag color="emerald">进行中</Tag>
            <Tag color="default">个人赛</Tag>
          </div>
          <Button type="primary" size="large" className="bg-emerald-500 hover:bg-emerald-400 border-0 rounded-xl px-8">
            立即参赛
          </Button>
        </div>

        <Descriptions column={{ xs: 1, sm: 2 }} className="text-slate-300">
          <Descriptions.Item label={<><ClockCircleOutlined /> 时间</>}>04-05 10:00 ~ 11:30</Descriptions.Item>
          <Descriptions.Item label={<><FileTextOutlined /> 题目</>}>50 题</Descriptions.Item>
          <Descriptions.Item label="总分">100 分</Descriptions.Item>
          <Descriptions.Item label={<><TeamOutlined /> 已报名</>}>42 人</Descriptions.Item>
        </Descriptions>

        <div className="mt-6">
          <Text className="text-slate-400">分类：</Text>
          <Space className="mt-2">
            <Tag>Web安全</Tag><Tag>密码学</Tag><Tag>逆向</Tag><Tag>杂项</Tag>
          </Space>
        </div>

        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
          <Text className="text-slate-300">竞赛说明：本次竞赛包含 50 道理论题目，涵盖 Web 安全、密码学、逆向工程和杂项四个分类。答题时间 90 分钟，答对得分，答错不扣分。同分按用时排序。</Text>
        </div>
      </Card>
    </div>
  );
}
