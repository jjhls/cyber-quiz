import { Typography, Alert } from 'antd';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

export default function ExamPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <Title level={3} className="!text-slate-100">📝 答题页面</Title>
      <Alert message="答题功能将在 Phase 4 实现" type="info" className="bg-slate-800 border-slate-700 text-slate-300" />
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <p className="text-slate-500">竞赛 ID: {id}</p>
        <p className="text-slate-600 mt-2">倒计时 + 题号网格 + 题目展示 + 自动判分</p>
      </div>
    </div>
  );
}
