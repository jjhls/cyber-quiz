import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Spin, message, Modal, Input, Checkbox, Radio, Tag, Alert } from 'antd';
import { ArrowLeftOutlined, StarFilled, SendOutlined, WarningOutlined, EyeOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { examApi, ExamData } from '../api/exam';

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
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const submitRef = useRef<Promise<void> | null>(null);
  const answersRef = useRef<AnswerMap>({});
  const remainingRef = useRef(0);
  const examContainerRef = useRef<HTMLDivElement>(null);

  // Keep refs in sync
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { remainingRef.current = remainingSec; }, [remainingSec]);

  // Load exam
  useEffect(() => {
    if (!id) return;
    examApi.start(id)
      .then(data => {
        setExam(data);
        setRemainingSec(data.duration * 60);
      })
      .catch(err => {
        setError(err.response?.data?.message || '获取试卷失败，请检查网络或联系管理员');
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
          doSubmit('timeup');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam]);

  // Tab visibility - auto submit on leave
  useEffect(() => {
    const handleLeave = () => {
      if (submitRef.current) return; // already submitting
      setTabSwitchCount(prev => prev + 1);
      doSubmit('leave');
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) handleLeave();
    });
    window.addEventListener('blur', handleLeave);

    return () => {
      document.removeEventListener('visibilitychange', handleLeave);
      window.removeEventListener('blur', handleLeave);
    };
  }, [exam]);

  // Unified submit function (prevents double submit)
  const doSubmit = useCallback((reason: 'manual' | 'timeup' | 'leave') => {
    if (submitRef.current) return submitRef.current; // prevent double submit
    if (!id || !exam) return Promise.resolve();

    const promise = (async () => {
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const duration = exam.duration * 60 - remainingRef.current;
      const currentAnswers = { ...answersRef.current };
      const answeredCount = Object.keys(currentAnswers).length;
      const totalCount = exam.questions.length;

      try {
        const result = await examApi.submit(id, { answers: currentAnswers, duration });

        if (reason === 'timeup') {
          message.warning({
            content: `⏰ 考试时间到！已自动交卷。已答 ${answeredCount}/${totalCount} 题，得分: ${result.score}/${result.totalScore}`,
            duration: 8,
          });
        } else if (reason === 'leave') {
          message.warning({
            content: `⚠️ 检测到离开考试页面，已自动交卷。已答 ${answeredCount}/${totalCount} 题，得分: ${result.score}/${result.totalScore}`,
            duration: 8,
          });
        } else {
          message.success({
            content: `🎉 提交成功！得分: ${result.score}/${result.totalScore}，正确 ${result.correctCount}/${result.totalCount}`,
            duration: 5,
          });
        }

        submitRef.current = null;
        navigate(`/contests/${id}/result`);
      } catch (err: any) {
        // If server says already submitted, navigate to result
        if (err.response?.data?.message?.includes('已提交')) {
          navigate(`/contests/${id}/result`);
          return;
        }
        message.error({
          content: `提交失败: ${err.response?.data?.message || '网络错误，请刷新页面查看成绩'}`,
          duration: 8,
        });
        setSubmitting(false);
        submitRef.current = null;
      }
    })();

    submitRef.current = promise;
    return promise;
  }, [id, exam, navigate]);

  const handleSubmit = async () => {
    if (!id || !exam) return;
    const answeredCount = Object.keys(answers).length;
    const totalCount = exam.questions.length;
    const unanswered = totalCount - answeredCount;
    const markedCount = Object.values(marks).filter(Boolean).length;

    if (unanswered > 0) {
      Modal.confirm({
        title: '⚠️ 确认提交试卷？',
        content: (
          <div className="space-y-2">
            <p>您还有 <span className="text-red-400 font-bold">{unanswered}</span> 道题未作答</p>
            {markedCount > 0 && <p>您标记了 <span className="text-amber-400 font-bold">{markedCount}</span> 道不确定的题目</p>}
            <p className="text-slate-500 text-sm">提交后将无法修改答案，确定要提交吗？</p>
          </div>
        ),
        okText: '确认提交',
        okButtonProps: { danger: true },
        cancelText: '继续答题',
        onOk: () => doSubmit('manual'),
      });
    } else {
      Modal.confirm({
        title: '✅ 确认提交试卷？',
        content: (
          <div className="space-y-2">
            <p>您已完成全部 <span className="text-emerald-400 font-bold">{totalCount}</span> 道题目</p>
            {markedCount > 0 && <p>您标记了 <span className="text-amber-400 font-bold">{markedCount}</span> 道不确定的题目，建议检查后再提交</p>}
            <p className="text-slate-500 text-sm">提交后将无法修改答案，确定要提交吗？</p>
          </div>
        ),
        okText: '确认提交',
        cancelText: '再检查一遍',
        onOk: () => doSubmit('manual'),
      });
    }
  };

  const setAnswer = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const toggleMark = (questionId: string) => {
    setMarks(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      examContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Timer display
  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const timerColor = remainingSec < 300 ? 'text-red-400 animate-pulse' : remainingSec < 900 ? 'text-amber-400' : 'text-blue-400';
  const progressPercent = exam ? Math.round((Object.keys(answers).length / exam.questions.length) * 100) : 0;

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Spin size="large" /></div>;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <Alert
            type="error"
            message="无法进入考试"
            description={error}
            showIcon
            className="bg-red-500/10 border-red-500/30 text-slate-300"
          />
          <Button onClick={() => navigate('/contests')} className="bg-blue-500 hover:bg-blue-400 border-0 rounded-xl text-white">
            返回竞赛列表
          </Button>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  const current = exam.questions[currentIdx];
  const currentAnswer = answers[current.id];

  return (
    <div ref={examContainerRef} className="min-h-screen bg-slate-950">
      {/* Fullscreen exit button (visible only in fullscreen) */}
      {isFullscreen && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            type="primary"
            icon={<FullscreenExitOutlined />}
            onClick={toggleFullscreen}
            className="bg-slate-700 hover:bg-slate-600 border-0 rounded-xl text-slate-300"
            title="退出全屏"
          />
        </div>
      )}

      {/* Warning banner */}
      {tabSwitchCount > 0 && (
        <Alert
          icon={<WarningOutlined />}
          type="warning"
          message={`⚠️ 检测到您已离开考试页面 ${tabSwitchCount} 次，系统已自动交卷`}
          className="bg-amber-500/10 border-amber-500/30 text-amber-300 rounded-none"
        />
      )}

      {/* Header */}
      <div className={`sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 md:px-6 py-3 ${isFullscreen ? '!hidden' : ''}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '⚠️ 确认离开考试？',
                  content: '离开考试页面将自动交卷，未保存的答案将按当前状态提交。确定要离开吗？',
                  okText: '确认离开',
                  okButtonProps: { danger: true },
                  cancelText: '继续答题',
                  onOk: () => navigate(`/contests/${exam.contestId}`),
                });
              }}
              className="text-slate-400 hover:text-slate-200 pl-0"
            >
              返回
            </Button>
            <Text className="text-slate-300 font-medium hidden sm:inline">{exam.title}</Text>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              已答 <span className="text-blue-400 font-bold">{Object.keys(answers).length}</span>/{exam.questions.length} 题
            </div>

            {/* Fullscreen toggle */}
            <Button
              type="text"
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
              className="text-slate-400 hover:text-slate-200"
              title={isFullscreen ? '退出全屏' : '全屏模式'}
            />

            {/* Countdown Ring */}
            <div className="relative flex items-center gap-2">
              <svg width="48" height="48" className="countdown-ring">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke={remainingSec < 300 ? '#ef4444' : remainingSec < 900 ? '#f59e0b' : '#3b82f6'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - remainingSec / (exam.duration * 60))}`}
                  className="transition-all duration-1000 ease-linear"
                  style={{
                    filter: remainingSec < 300 ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.5))' : 'none',
                  }}
                />
              </svg>
              <div className={`font-mono text-xl font-bold ${timerColor}`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Question Grid - Left */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-24">
              <div className="text-sm font-medium text-slate-300 mb-4 flex items-center justify-between">
                <span>📋 答题卡</span>
                <Tag color={progressPercent === 100 ? 'emerald' : progressPercent > 50 ? 'blue' : 'default'}>
                  {progressPercent}%
                </Tag>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {exam.questions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = answers[q.id] !== undefined;
                  const isMarked = marks[q.id];
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`relative w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-150 ${
                        isCurrent
                          ? 'bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 scale-105'
                          : isAnswered
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      {idx + 1}
                      {isMarked && (
                        <StarFilled className="absolute -top-1.5 -right-1.5 text-amber-400 text-xs drop-shadow" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-blue-500 ring-1 ring-blue-400"></span>
                    <span>当前题</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30"></span>
                    <span>已答</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span>
                    <span>未答</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarFilled className="text-amber-400 text-xs" />
                    <span>标记</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <WarningOutlined className="text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-amber-300">
                    <p className="font-medium mb-1">考试规则</p>
                    <p>• 离开页面将自动交卷</p>
                    <p>• 时间到自动交卷</p>
                    <p>• 提交后无法修改</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content - Right */}
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-w-0"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <Tag color="blue" className="text-sm px-3 py-1">
                  第 {currentIdx + 1} / {exam.questions.length} 题
                </Tag>
                <Tag color={
                  current.type === 'single' ? 'cyan' :
                  current.type === 'multiple' ? 'purple' :
                  current.type === 'truefalse' ? 'orange' : 'green'
                } className="text-sm px-3 py-1">
                  {{
                    single: '单选题', multiple: '多选题',
                    truefalse: '判断题', fillblank: '填空题',
                  }[current.type]}
                </Tag>
                <Tag color="default" className="text-sm px-3 py-1">
                  {current.score} 分
                </Tag>
                {marks[current.id] && (
                  <Tag color="warning" className="text-sm px-3 py-1">
                    <StarFilled /> 已标记
                  </Tag>
                )}
              </div>

              <Title level={4} className="!text-slate-100 !mb-8 whitespace-pre-wrap leading-relaxed">{current.title}</Title>

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
                        <span className="text-base">{opt}</span>
                      </Radio>
                    </div>
                  ))}
                </div>
              )}

              {current.type === 'multiple' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <EyeOutlined className="text-purple-400" />
                    <Text className="text-purple-400 text-sm font-medium">多选题：选择所有正确答案</Text>
                  </div>
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
                          <span className="text-base">{opt}</span>
                        </Checkbox>
                      </div>
                    );
                  })}
                </div>
              )}

              {current.type === 'truefalse' && (
                <div className="flex gap-4">
                  {['正确', '错误'].map(opt => (
                    <div
                      key={opt}
                      onClick={() => setAnswer(current.id, opt)}
                      className={`flex-1 p-8 rounded-xl cursor-pointer transition-all border text-center text-lg font-medium ${
                        currentAnswer === opt
                          ? 'border-blue-500 bg-blue-500/10 text-slate-100'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{opt === '正确' ? '✅' : '❌'}</div>
                      {opt}
                    </div>
                  ))}
                </div>
              )}

              {current.type === 'fillblank' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <EyeOutlined className="text-green-400" />
                    <Text className="text-green-400 text-sm font-medium">填空题：请输入准确答案（不区分大小写）</Text>
                  </div>
                  <Input
                    placeholder="请输入答案..."
                    value={(currentAnswer as string) || ''}
                    onChange={e => setAnswer(current.id, e.target.value)}
                    className="bg-slate-800 border-slate-600 text-slate-100 rounded-xl h-12 text-lg"
                    size="large"
                    onPressEnter={() => {
                      if (currentIdx < exam.questions.length - 1) {
                        setCurrentIdx(currentIdx + 1);
                      }
                    }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800 flex-wrap gap-3">
                <Button
                  onClick={() => toggleMark(current.id)}
                  className={`rounded-xl border text-base px-5 py-2 ${
                    marks[current.id]
                      ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                      : 'border-slate-700 text-slate-400 bg-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <StarFilled /> {marks[current.id] ? '已标记' : '标记此题'}
                </Button>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                    disabled={currentIdx === 0}
                    className="bg-slate-800 border-slate-700 text-slate-300 rounded-xl text-base px-5 disabled:opacity-30"
                  >
                    ← 上一题
                  </Button>
                  <Button
                    onClick={() => setCurrentIdx(Math.min(exam.questions.length - 1, currentIdx + 1))}
                    disabled={currentIdx === exam.questions.length - 1}
                    className="bg-blue-500 hover:bg-blue-400 border-0 text-white rounded-xl text-base px-5 disabled:opacity-30"
                  >
                    下一题 →
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={submitting}
                    className="bg-emerald-500 hover:bg-emerald-400 border-0 text-white rounded-xl text-base px-6 disabled:opacity-50"
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
    </div>
  );
}
