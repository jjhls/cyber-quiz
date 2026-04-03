import { useEffect, useState } from 'react';
import { Typography, Table, Button, Tag, Space, Modal, Form, Input, Select, DatePicker, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { contestApi, Contest } from '../../api/contest';
import { questionApi, Question } from '../../api/question';
import { useThemeStore } from '../../stores/themeStore';

const { Title, Text } = Typography;

export default function AdminContests() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [contests, setContests] = useState<Contest[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadContests();
    questionApi.getList({ pageSize: 500 }).then(data => setQuestions(data.data)).catch(() => {});
  }, []);

  const loadContests = async () => {
    setLoading(true);
    try {
      const data = await contestApi.getList();
      setContests(data);
    } catch {
      message.error('加载竞赛列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingContest(null);
    form.resetFields();
    form.setFieldsValue({ shuffleQuestions: true, shuffleOptions: true, status: 'upcoming' });
    setModalOpen(true);
  };

  const handleEdit = (record: Contest) => {
    setEditingContest(record);
    form.setFieldsValue({
      ...record,
      startTime: dayjs(record.startTime),
      endTime: dayjs(record.endTime),
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await contestApi.delete(id);
      message.success('竞赛已删除');
      loadContests();
    } catch {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        title: values.title,
        description: values.description || '',
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        duration: values.duration,
        questionIds: values.questionIds || [],
        shuffleQuestions: values.shuffleQuestions,
        shuffleOptions: values.shuffleOptions,
        status: values.status,
      };

      if (editingContest) {
        await contestApi.update(editingContest.id, data);
        message.success('竞赛已更新');
      } else {
        await contestApi.create(data);
        message.success('竞赛已创建');
      }

      setModalOpen(false);
      loadContests();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const statusMap: Record<string, { color: string; label: string }> = {
    ongoing: { color: 'emerald', label: '进行中' },
    upcoming: { color: 'blue', label: '即将开始' },
    finished: { color: 'default', label: '已结束' },
  };

  const inputClass = isDark ? 'bg-slate-800' : 'bg-slate-50';

  const columns = [
    { title: '名称', dataIndex: 'title', key: 'title', ellipsis: true, render: (v: string) => <Text className={isDark ? 'text-slate-300' : 'text-slate-700'}>{v}</Text> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag> },
    { title: '题目', key: 'questions', width: 80, render: (_: any, r: Contest) => <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>{r.questionIds?.length || 0}题</Text> },
    { title: '时长', dataIndex: 'duration', key: 'duration', width: 80, render: (v: number) => <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>{v}分钟</Text> },
    { title: '总分', dataIndex: 'totalScore', key: 'totalScore', width: 80, render: (v: number) => <Text className="text-blue-400">{v}分</Text> },
    { title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 180, render: (v: string) => <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(v).toLocaleString('zh-CN')}</Text> },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: Contest) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} className="text-blue-400 p-0" onClick={() => handleEdit(record)} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" icon={<DeleteOutlined />} className="text-red-400 p-0" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={3} className={`!mb-0 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>🏁 竞赛管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} className="bg-blue-500 hover:bg-blue-400 border-0 rounded-xl">
          创建竞赛
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={contests}
        rowKey="id"
        loading={loading}
        pagination={false}
        className={`rounded-2xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      />

      <Modal
        title={editingContest ? '编辑竞赛' : '创建竞赛'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="title" label="竞赛名称" rules={[{ required: true }]}>
            <Input className={inputClass} />
          </Form.Item>

          <Form.Item name="description" label="竞赛描述">
            <Input.TextArea rows={2} className={inputClass} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="startTime" label="开始时间" rules={[{ required: true }]}>
              <DatePicker showTime className={`w-full ${inputClass}`} />
            </Form.Item>
            <Form.Item name="endTime" label="结束时间" rules={[{ required: true }]}>
              <DatePicker showTime className={`w-full ${inputClass}`} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item name="duration" label="答题时长（分钟）" rules={[{ required: true }]}>
              <Input type="number" className={inputClass} />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Select options={[
                { value: 'upcoming', label: '即将开始' },
                { value: 'ongoing', label: '进行中' },
                { value: 'finished', label: '已结束' },
              ]} className={inputClass} />
            </Form.Item>
            <Form.Item name="questionIds" label="选择题目" rules={[{ required: true, message: '请选择题目' }]}>
              <Select
                mode="multiple"
                options={questions.map(q => ({ value: q.id, label: `${q.title.substring(0, 30)}...` }))}
                className={inputClass}
                placeholder="搜索选择题目"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="shuffleQuestions" label="随机题目顺序" valuePropName="checked">
              <Select options={[{ value: true, label: '是' }, { value: false, label: '否' }]} className={inputClass} />
            </Form.Item>
            <Form.Item name="shuffleOptions" label="随机选项顺序" valuePropName="checked">
              <Select options={[{ value: true, label: '是' }, { value: false, label: '否' }]} className={inputClass} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
