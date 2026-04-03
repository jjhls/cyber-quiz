import { useEffect, useState } from 'react';
import { Typography, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, ImportOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { questionApi, Question } from '../../api/question';

const { Title } = Typography;

const categoryOptions = [
  'Web安全', '密码学', '逆向工程', 'Pwn', 'Misc',
  '网络安全基础', '操作系统安全', '安全法规与合规',
].map(c => ({ value: c, label: c }));

const difficultyOptions = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

const typeOptions = [
  { value: 'single', label: '单选题' },
  { value: 'multiple', label: '多选题' },
  { value: 'truefalse', label: '判断题' },
  { value: 'fillblank', label: '填空题' },
];

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [form] = Form.useForm();

  useEffect(() => { loadQuestions(); }, [page]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await questionApi.getList({ page, pageSize: 10 });
      setQuestions(data.data);
      setTotal(data.total);
    } catch {
      message.error('加载题目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    form.resetFields();
    form.setFieldsValue({ options: [], tags: [], score: 2 });
    setModalOpen(true);
  };

  const handleEdit = (record: Question) => {
    setEditingQuestion(record);
    form.setFieldsValue({
      ...record,
      options: (record.options || []).join(', '),
      tags: (record.tags || []).join(', '),
      answer: Array.isArray(record.answer) ? record.answer.join(', ') : record.answer,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await questionApi.delete(id);
      message.success('题目已删除');
      loadQuestions();
    } catch {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const isFillBlankOrTrueFalse = values.type === 'fillblank' || values.type === 'truefalse';

      // Parse answer
      let answer: any = values.answer;
      if (values.type === 'single' || values.type === 'truefalse') {
        answer = values.answer;
      } else if (values.type === 'multiple') {
        answer = values.answer.split(',').map((a: string) => a.trim()).filter(Boolean);
      } else if (values.type === 'fillblank') {
        answer = values.answer.split(',').map((a: string) => a.trim()).filter(Boolean);
      }

      // Parse options
      let options: string[] = [];
      if (!isFillBlankOrTrueFalse && values.options) {
        options = values.options.split(',').map((o: string) => o.trim()).filter(Boolean);
      }

      const data = {
        category: values.category,
        difficulty: values.difficulty,
        type: values.type,
        title: values.title,
        options,
        answer,
        explanation: values.explanation || '',
        tags: values.tags || [],
        score: values.score || 2,
      };

      if (editingQuestion) {
        await questionApi.update(editingQuestion.id, data);
        message.success('题目已更新');
      } else {
        await questionApi.create(data);
        message.success('题目已创建');
      }

      setModalOpen(false);
      loadQuestions();
    } catch (err: any) {
      if (err.errorFields) return; // validation error
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, render: (v: string) => <span className="text-slate-500 text-xs">{v.slice(-6)}</span> },
    { title: '题目', dataIndex: 'title', key: 'title', ellipsis: true, render: (v: string) => <span className="text-slate-300">{v}</span> },
    { title: '分类', dataIndex: 'category', key: 'category', width: 100, render: (v: string) => <Tag className="text-xs">{v}</Tag> },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty', width: 80, render: (v: string) => {
      const colors: Record<string, string> = { easy: 'emerald', medium: 'amber', hard: 'red' };
      return <Tag color={colors[v]}>{v === 'easy' ? '简单' : v === 'medium' ? '中等' : '困难'}</Tag>;
    }},
    { title: '题型', dataIndex: 'type', key: 'type', width: 80, render: (v: string) => <span className="text-slate-400 text-sm">{{ single: '单选', multiple: '多选', truefalse: '判断', fillblank: '填空' }[v]}</span> },
    { title: '分值', dataIndex: 'score', key: 'score', width: 60, render: (v: number) => <span className="text-blue-400">{v}</span> },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: Question) => (
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
        <Title level={3} className="!text-slate-100 !mb-0">📝 题目管理</Title>
        <Space>
          <Button icon={<ImportOutlined />} className="bg-slate-800 border-slate-700 text-slate-300 rounded-xl">
            批量导入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} className="bg-blue-500 hover:bg-blue-400 border-0 rounded-xl">
            新增题目
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={questions}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: 10,
          total,
          onChange: (p) => setPage(p),
          showTotal: (t) => `共 ${t} 题`,
        }}
        className="bg-slate-900 rounded-2xl"
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingQuestion ? '编辑题目' : '新增题目'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-3 gap-4">
            <Form.Item name="category" label="分类" rules={[{ required: true }]}>
              <Select options={categoryOptions} className="bg-slate-800" />
            </Form.Item>
            <Form.Item name="difficulty" label="难度" rules={[{ required: true }]}>
              <Select options={difficultyOptions} className="bg-slate-800" />
            </Form.Item>
            <Form.Item name="type" label="题型" rules={[{ required: true }]}>
              <Select options={typeOptions} className="bg-slate-800" />
            </Form.Item>
          </div>

          <Form.Item name="title" label="题目内容" rules={[{ required: true }]}>
            <Input.TextArea rows={3} className="bg-slate-800" />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              const showOptions = type === 'single' || type === 'multiple';
              return showOptions ? (
                <Form.Item name="options" label="选项（每行一个，用逗号分隔）">
                  <Input placeholder="A. 选项一, B. 选项二, C. 选项三, D. 选项四" className="bg-slate-800" />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item name="answer" label="正确答案" rules={[{ required: true, message: '请填写正确答案' }]}>
            <Input placeholder="单选题填选项字母，多选题用逗号分隔，填空题用逗号分隔多个答案" className="bg-slate-800" />
          </Form.Item>

          <Form.Item name="explanation" label="解析">
            <Input.TextArea rows={2} className="bg-slate-800" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="tags" label="标签">
              <Input placeholder="用逗号分隔，如: SQL注入, 注入攻击" className="bg-slate-800" />
            </Form.Item>
            <Form.Item name="score" label="分值">
              <Input type="number" className="bg-slate-800" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
