import { Typography, Card, Row, Col, Statistic } from 'antd';
import { TeamOutlined, FileTextOutlined, TrophyOutlined, BarChartOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">📊 管理仪表盘</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl">
            <Statistic title={<span className="text-slate-400">总用户</span>} value={86} prefix={<TeamOutlined className="text-blue-400" />} valueStyle={{ color: '#60a5fa' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl">
            <Statistic title={<span className="text-slate-400">总题目</span>} value={320} prefix={<FileTextOutlined className="text-emerald-400" />} valueStyle={{ color: '#34d399' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl">
            <Statistic title={<span className="text-slate-400">总竞赛</span>} value={12} prefix={<TrophyOutlined className="text-amber-400" />} valueStyle={{ color: '#fbbf24' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl">
            <Statistic title={<span className="text-slate-400">总提交</span>} value={1240} prefix={<BarChartOutlined className="text-purple-400" />} valueStyle={{ color: '#c084fc' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
