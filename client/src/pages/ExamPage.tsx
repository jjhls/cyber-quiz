import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Spin, message, Modal, Input, Checkbox, Radio, Tag } from 'antd';
import { ArrowLeftOutlined, CheckCircleFilled, QuestionCircleOutlined, StarFilled, SendOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { examApi, ExamData, ExamQuestion } from '../api/exam';

const { Title, Text } = Typography;

interface AnswerMap {
  [questionId: string]: string | string[];
}

interface MarkSet {
  [questionId: string]: boolean;
}

export default function ExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [marks, setMarks] = useState<MarkSet>({});
  const [remainingSec, setRemainingSec] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load exam
  useEffect(() => {
    if (!id) return;
    examApi.start(id)
      .then(data => {
        setExam(data);
        setRemainingSec(data.duration * 60);
      })
      .catch(err => {
        setError(err.response?.data?.message || '获取试卷失败');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Timer
  useEffect(() => {
    if (!exam || remainingSec <= 0) return;
    timerRef.current = setInterval(() => {
      setRemainingSec(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam]);

  const handleAutoSubmit = useCallback(async () => {
    if (!id || !exam || submitting) return;
    setSubmitting(true);
    const duration = exam.duration * 60;
    try {
      await examApi.submit(id, { answers, duration });
      navigate(`/contests/${id}/result`);
    } catch (err: any) {
      message.error(err.response?.data?.message || '自动提交失败');
      setSubmitting(false);
    }
  }, [id, exam, answers, navigate, submitting]);

  const handleSubmit = async () => {
    if (!id || !exam) return;
    const answeredCount = Object.keys(answers).length;
    const totalCount = exam.questions.length;

    if (answeredCount < totalCount) {
      Modal.confirm({
        title: '确认提交？',
        content: `还有 ${totalCount - answeredCount} 道题未作答，确定要提交吗？`,
        okText: '确认提交',
        cancelText: '继续答题',
        onOk: () => doSubmit(),
      });
    } else {
      doSubmit();
    }
  };

  const doSubmit = async () => {
    if (!id || !exam || submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const duration = exam.duration * 60 - remainingSec;
    try {
      const result = await examApi.submit(id, { answers, duration });
      message.success(`答题完成！得分: ${result.score}/${result.totalScore}`);
      navigate(`/contests/${id}/result`);
    } catch (err: any) {
      message.error(err.response?.data?.message || '提交失败');
      setSubmitting(false);
    }
  };

  const setAnswer = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const toggleMark = (questionId: string) => {
    setMarks(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // Timer display
  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const timerColor = remainingSec < 300 ? 'text-red-400 animate-pulse' : remainingSec < 900 ? 'text-amber-400' : 'text-blue-400';

  if (loading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <Text className="text-red-400 text-lg">{error}</Text>
        <br />
        <Button onClick={() => navigate('/contests')} className="bg-blue-500 hover:bg-blue-400 border-0 rounded-xl text-white">
          返回竞赛列表
        </Button>
      </div>
    );
  }

  if (!exam) return null;

  const current = exam.questions[currentIdx];
  const currentAnswer = answers[current.id];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(`/contests/${exam.contestId}`)} className="text-blue-400 pl-0">
          返回
        </Button>
        <Text className="text-slate-300 font-medium">{exam.title}</Text>
        <div className={`font-mono text-2xl font-bold ${timerColor}`}>
          ⏱ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Question Grid - Left */}
        <div className="lg:w-52 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-sm text-slate-500 mb-3">
              📊 答题进度: {Object.keys(answers).length}/{exam.questions.length}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = answers[q.id] !== undefined;
                const isMarked = marks[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`relative w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
                      isCurrent ? 'bg-blue-500 text-white ring-2 ring-blue-400' :
                      isAnswered ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {idx + 1}
                    {isMarked && (
                      <StarFilled className="absolute -top-1 -right-1 text-amber-400 text-xs" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-col gap-1 text-xs text-slate-500">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500"></span> 当前题</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30"></span> 已答</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span> 未答</div>
              <div className="flex items-center gap-2"><StarFilled className="text-amber-400 text-xs" /> 标记</div>
            </div>
          </div>
        </div>

        {/* Question Content - Right */}
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Tag color="blue">第 {currentIdx + 1}/{exam.questions.length} 题</Tag>
              <Tag color={
                current.type === 'single' ? 'cyan' :
                current.type === 'multiple' ? 'purple' :
                current.type === 'truefalse' ? 'orange' : 'green'
              }>
                {{
                  single: '单选题', multiple: '多选题',
                  truefalse: '判断题', fillblank: '填空题',
                }[current.type]}
              </Tag>
              <Tag color="default">{current.score}分</Tag>
            </div>

            <Title level={4} className="!text-slate-100 !mb-6 whitespace-pre-wrap">{current.title}</Title>

            {/* Single Choice */}
            {current.type === 'single' && (
              <div className="space-y-3">
                {current.options.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => setAnswer(current.id, opt)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      currentAnswer === opt
                        ? 'border-blue-500 bg-blue-500/10 text-slate-100'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <Radio checked={currentAnswer === opt} className="text-slate-300">
                      {opt}
                    </Radio>
                  </div>
                ))}
              </div>
            )}

            {/* Multiple Choice */}
            {current.type === 'multiple' && (
              <div className="space-y-3">
                <Text className="text-slate-500 text-sm">（多选）</Text>
                {current.options.map((opt, idx) => {
                  const selected = Array.isArray(currentAnswer) && currentAnswer.includes(opt);
                  const toggle = () => {
                    const arr = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
                    const newAns = selected ? arr.filter(a => a !== opt) : [...arr, opt];
                    setAnswer(current.id, newAns);
                  };
                  return (
                    <div
                      key={idx}
                      onClick={toggle}
                      className={`p-4 rounded-xl cursor-pointer transition-all border ${
                        selected
                          ? 'border-purple-500 bg-purple-500/10 text-slate-100'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <Checkbox checked={selected} className="text-slate-300">
                        {opt}
                      </Checkbox>
                    </div>
                  );
                })}
              </div>
            )}

            {/* True/False */}
            {current.type === 'truefalse' && (
              <div className="flex gap-4">
                {['正确', '错误'].map(opt => (
                  <div
                    key={opt}
                    onClick={() => setAnswer(current.id, opt)}
                    className={`flex-1 p-6 rounded-xl cursor-pointer transition-all border text-center text-lg font-medium ${
                      currentAnswer === opt
                        ? 'border-blue-500 bg-blue-500/10 text-slate-100'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    {opt === '正确' ? '✅' : '❌'} {opt}
                  </div>
                ))}
              </div>
            )}

            {/* Fill Blank */}
            {current.type === 'fillblank' && (
              <div>
                <Input
                  placeholder="请输入答案..."
                  value={(currentAnswer as string) || ''}
                  onChange={e => setAnswer(current.id, e.target.value)}
                  className="bg-slate-800 border-slate-600 text-slate-100 rounded-xl h-12 text-lg"
                  size="large"
                />
              </div>
            )}

            {/* Mark & Navigation */}
            <div className="flex items-center justify-between mt-8 flex-wrap gap-3">
              <div className="flex gap-3">
                <Button
                  onClick={() => toggleMark(current.id)}
                  className={`rounded-xl border ${marks[current.id] ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-slate-700 text-slate-400 bg-slate-800'}`}
                >
                  <StarFilled /> {marks[current.id] ? '已标记' : '标记'}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                  disabled={currentIdx === 0}
                  className="bg-slate-800 border-slate-700 text-slate-300 rounded-xl disabled:opacity-30"
                >
                  上一题
                </Button>
                <Button
                  onClick={() => setCurrentIdx(Math.min(exam.questions.length - 1, currentIdx + 1))}
                  disabled={currentIdx === exam.questions.length - 1}
                  className="bg-blue-500 hover:bg-blue-400 border-0 text-white rounded-xl disabled:opacity-30"
                >
                  下一题
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={submitting}
                  className="bg-emerald-500 hover:bg-emerald-400 border-0 text-white rounded-xl"
                  icon={<SendOutlined />}
                >
                  提交试卷
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
