import { useEffect, useState, useMemo, useRef } from 'react';
import { Typography, Card, Tag, Button, Input, Select, Space, Spin, message, Radio, Checkbox, Pagination } from 'antd';
import { SearchOutlined, RiseOutlined, TrophyOutlined, FireOutlined, BookOutlined, TagOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { practiceApi } from '../api/question';
import { userProfileApi } from '../api/userProfile';
import { useThemeStore } from '../stores/themeStore';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const difficultyMap: Record<string, { color: string; label: string }> = {
  easy: { color: 'emerald', label: '简单' },
  medium: { color: 'amber', label: '中等' },
  hard: { color: 'red', label: '困难' },
};

const typeMap: Record<string, { color: string; label: string }> = {
  single: { color: 'cyan', label: '单选题' },
  multiple: { color: 'purple', label: '多选题' },
  truefalse: { color: 'orange', label: '判断题' },
  fillblank: { color: 'green', label: '填空题' },
};

// Animated counter component
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) {
      setDisplay(value);
      return;
    }
    let start = 0;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * end);
      setDisplay(start);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setHasAnimated(true);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, hasAnimated]);

  return <span>{display}</span>;
}

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

// BentoCard with hover lift effect
function BentoCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-blue-500/10' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-blue-500/15'} border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Question card skeleton
function QuestionSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <Card className={`rounded-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="animate-pulse space-y-3">
        <div className="flex gap-2">
          <div className={`w-12 h-5 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`w-12 h-5 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        </div>
        <div className={`w-full h-5 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className={`w-2/3 h-5 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className="flex justify-between items-center">
          <div className={`w-32 h-4 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`w-20 h-8 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
        </div>
      </div>
    </Card>
  );
}

interface PracticeQuestion {
  id: string;
  category: string;
  difficulty: string;
  type: string;
  title: string;
  options: string[];
  tags: string[];
  score: number;
  accuracy?: number;
  practiceCount?: number;
}

export default function PracticePage() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [currentQ, setCurrentQ] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  // Practice stats
  const [practiceStats, setPracticeStats] = useState<{
    todaySubmissions: number;
    todayAccuracy: number;
    overallAccuracy: number;
    consecutiveDays: number;
  } | null>(null);

  // Load practice stats
  useEffect(() => {
    userProfileApi.getProfile().catch(() => {});
    userProfileApi.getAnswers().then(stats => {
      setPracticeStats({
        todaySubmissions: stats.totalSubmissions || 0,
        todayAccuracy: stats.accuracy || 0,
        overallAccuracy: stats.accuracy || 0,
        consecutiveDays: 0,
      });
    }).catch(() => {});
  }, []);

  // Load questions
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await practiceApi.getList({
        category,
        difficulty,
        type,
        search: search || undefined,
        page,
        pageSize,
      });
      setQuestions(data.data);
      setTotal(data.total);
    } catch (err: any) {
      message.error(err.response?.data?.message || '加载题目失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [category, difficulty, type, page, pageSize]);

  const handleStartPractice = (q: PracticeQuestion) => {
    setCurrentQ(q);
    setUserAnswer(null);
    setResult(null);
    setShowResult(false);
  };

  const handleSubmit = async () => {
    if (!currentQ || !userAnswer) {
      message.warning('请先选择答案');
      return;
    }
    try {
      const res = await practiceApi.submitAnswer(currentQ.id, userAnswer);
      setResult(res);
      setShowResult(true);
    } catch (err: any) {
      message.error(err.response?.data?.message || '提交失败');
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadQuestions();
  };

  const inputClass = isDark ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900';
  const cardClass = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const optionBase = isDark ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600' : 'border-slate-200 bg-slate-50 hover:border-slate-300';
  const optionSelected = 'border-blue-500 bg-blue-500/10';
  const selectClass = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  // Practice view
  if (currentQ) {
    const diff = difficultyMap[currentQ.difficulty];
    const typeInfo = typeMap[currentQ.type];
    return (
      <div className="space-y-6">
        <Button onClick={() => { setCurrentQ(null); setShowResult(false); }} className={`rounded-xl mb-4 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
          ← 返回题库
        </Button>

        <Card className={`rounded-2xl ${cardClass}`}>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Tag color={diff?.color}>{diff?.label}</Tag>
            <Tag color={typeInfo?.color}>{typeInfo?.label}</Tag>
            <Tag color="default">{currentQ.score}分</Tag>
            <Tag color="cyan">{currentQ.category}</Tag>
          </div>

          <Title level={4} className={`!mb-6 whitespace-pre-wrap ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>{currentQ.title}</Title>

          {currentQ.type === 'single' && (
            <Radio.Group value={userAnswer} onChange={e => setUserAnswer(e.target.value)} className="w-full">
              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    userAnswer === opt ? optionSelected : optionBase
                  }`}>
                    <Radio value={opt} className={isDark ? 'text-slate-300' : 'text-slate-700'}>{opt}</Radio>
                  </div>
                ))}
              </div>
            </Radio.Group>
          )}

          {currentQ.type === 'multiple' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Tag color="purple">多选题：选择所有正确答案</Tag>
              </div>
              {currentQ.options.map((opt, idx) => {
                const selected = Array.isArray(userAnswer) && userAnswer.includes(opt);
                const toggle = () => {
                  const arr = Array.isArray(userAnswer) ? [...userAnswer] : [];
                  const newAns = selected ? arr.filter(a => a !== opt) : [...arr, opt];
                  setUserAnswer(newAns);
                };
                return (
                  <div
                    key={idx}
                    onClick={toggle}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selected ? optionSelected : optionBase
                    }`}
                  >
                    <Checkbox checked={selected} className={isDark ? 'text-slate-300' : 'text-slate-700'}>{opt}</Checkbox>
                  </div>
                );
              })}
            </div>
          )}

          {currentQ.type === 'truefalse' && (
            <Radio.Group value={userAnswer} onChange={e => setUserAnswer(e.target.value)} className="w-full">
              <div className="space-y-3">
                {['正确', '错误'].map(opt => (
                  <div key={opt} className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    userAnswer === opt ? optionSelected : optionBase
                  }`}>
                    <Radio value={opt} className={isDark ? 'text-slate-300' : 'text-slate-700'}>{opt === '正确' ? '✅ 正确' : '❌ 错误'}</Radio>
                  </div>
                ))}
              </div>
            </Radio.Group>
          )}

          {currentQ.type === 'fillblank' && (
            <Input
              placeholder="请输入答案..."
              value={userAnswer || ''}
              onChange={e => setUserAnswer(e.target.value)}
              className={`rounded-xl h-12 ${inputClass}`}
              size="large"
              onPressEnter={handleSubmit}
            />
          )}

          <div className="mt-6 flex gap-3">
            {!showResult ? (
              <Button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-400 border-0 text-white rounded-xl">
                提交答案
              </Button>
            ) : (
              <div className="w-full">
                <div className={`p-4 rounded-xl mb-4 ${result?.correct ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <div className="text-lg font-medium mb-2">
                    {result?.correct ? '✅ 回答正确！' : '❌ 回答错误'}
                  </div>
                  {!result?.correct && (
                    <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      正确答案: {Array.isArray(result?.correctAnswer) ? result.correctAnswer.join(', ') : result?.correctAnswer}
                    </div>
                  )}
                </div>
                {result?.explanation && (
                  <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>💡 解析: {result.explanation}</Text>
                  </div>
                )}
                <Button onClick={() => { setCurrentQ(null); setShowResult(false); loadQuestions(); }} className="bg-blue-500 hover:bg-blue-400 border-0 text-white rounded-xl">
                  继续练习
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Question list view
  return (
    <div className="space-y-6">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-blue-500' : 'bg-blue-300'}`} style={{ animationDuration: '4s' }} />
        <div className={`absolute top-1/3 -left-20 w-72 h-72 rounded-full blur-3xl opacity-15 ${isDark ? 'bg-violet-500' : 'bg-violet-300'}`} style={{ animation: 'pulse 6s ease-in-out infinite' }} />
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <Title level={3} className={`!mb-0 ${isDark ? '!text-slate-100' : '!text-slate-900'}`}>📚 题库练习</Title>
      </motion.div>

      {/* Stats Cards */}
      {practiceStats && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          <BentoCard>
            <BookOutlined className={`absolute -right-4 -bottom-4 text-8xl rotate-12 ${isDark ? 'text-blue-500/5' : 'text-blue-500/10'}`} />
            <div className="relative z-10">
              <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>今日练习</Text>
              <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <AnimatedCounter value={practiceStats.todaySubmissions} />
              </div>
              <Text className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>道题</Text>
            </div>
          </BentoCard>

          <BentoCard>
            <RiseOutlined className={`absolute -right-3 -bottom-3 text-7xl rotate-12 ${isDark ? 'text-emerald-500/5' : 'text-emerald-500/10'}`} />
            <div className="relative z-10">
              <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>正确率</Text>
              <div className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <AnimatedCounter value={practiceStats.todayAccuracy} />%
              </div>
              <Text className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>总正确率 {practiceStats.overallAccuracy}%</Text>
            </div>
          </BentoCard>

          <BentoCard>
            <FireOutlined className={`absolute -right-3 -bottom-3 text-7xl rotate-12 ${isDark ? 'text-amber-500/5' : 'text-amber-500/10'}`} />
            <div className="relative z-10">
              <Text className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>总答题数</Text>
              <div className={`text-3xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                <AnimatedCounter value={practiceStats.todaySubmissions > 0 ? practiceStats.todaySubmissions : 0} />
              </div>
              <Text className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>次竞赛</Text>
            </div>
          </BentoCard>
        </motion.div>
      )}

      {/* Advanced Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`relative z-10 p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-200'} backdrop-blur-sm`}
      >
        <div className="flex flex-wrap gap-3 items-center">
          <Select
            value={category || 'all'}
            onChange={(v) => { setCategory(v === 'all' ? undefined : v); setPage(1); }}
            className={`w-32 ${selectClass}`}
            options={[
              { value: 'all', label: '全部分类' },
              { value: 'Web安全', label: 'Web安全' },
              { value: '密码学', label: '密码学' },
              { value: '逆向工程', label: '逆向工程' },
              { value: 'Misc', label: 'Misc' },
              { value: '网络安全基础', label: '网络安全基础' },
              { value: '操作系统安全', label: '操作系统安全' },
              { value: '安全法规与合规', label: '安全法规' },
            ]}
          />
          <Select
            value={difficulty || 'all'}
            onChange={(v) => { setDifficulty(v === 'all' ? undefined : v); setPage(1); }}
            className={`w-28 ${selectClass}`}
            options={[
              { value: 'all', label: '全部难度' },
              { value: 'easy', label: '简单' },
              { value: 'medium', label: '中等' },
              { value: 'hard', label: '困难' },
            ]}
          />
          <Select
            value={type || 'all'}
            onChange={(v) => { setType(v === 'all' ? undefined : v); setPage(1); }}
            className={`w-28 ${selectClass}`}
            options={[
              { value: 'all', label: '全部题型' },
              { value: 'single', label: '单选题' },
              { value: 'multiple', label: '多选题' },
              { value: 'truefalse', label: '判断题' },
              { value: 'fillblank', label: '填空题' },
            ]}
          />
          <Input
            prefix={<SearchOutlined className={isDark ? 'text-slate-500' : 'text-slate-400'} />}
            placeholder="搜索题目..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            className={`w-48 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} rounded-xl`}
          />
          <Button onClick={handleSearch} className="bg-blue-500 hover:bg-blue-400 border-0 text-white rounded-xl">
            搜索
          </Button>
        </div>
      </motion.div>

      {/* Question List */}
      {loading ? (
        <div className="space-y-4 relative z-10">
          {[1, 2, 3].map(i => <QuestionSkeleton key={i} isDark={isDark} />)}
        </div>
      ) : questions.length === 0 ? (
        <Card className={`rounded-2xl relative z-10 ${cardClass}`}>
          <div className="text-center py-10">
            <BookOutlined className={`text-4xl mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <Text className={`text-lg block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>暂无题目</Text>
            <Text className={isDark ? 'text-slate-600' : 'text-slate-300'}>请尝试调整筛选条件</Text>
          </div>
        </Card>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 relative z-10">
          {questions.map(q => {
            const diff = difficultyMap[q.difficulty];
            const typeInfo = typeMap[q.type];
            return (
              <motion.div key={q.id} variants={itemVariants}>
                <Card className={`rounded-2xl transition-all ${cardClass} ${isDark ? 'hover:border-slate-700' : 'hover:border-blue-300'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Tag color={diff?.color}>{diff?.label}</Tag>
                        <Tag color={typeInfo?.color}>{typeInfo?.label}</Tag>
                        <span className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{q.title}</span>
                      </div>
                      <div className={`flex items-center gap-4 text-sm flex-wrap ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span className="flex items-center gap-1"><TagOutlined className="text-xs" /> {q.category}</span>
                        <span>💰 {q.score}分</span>
                      </div>
                      <Space className="mt-2">
                        {q.tags.map((t: string) => <Tag key={t} className="text-xs">{t}</Tag>)}
                      </Space>
                    </div>
                    <Button onClick={() => handleStartPractice(q)} className="bg-blue-500 hover:bg-blue-400 border-0 text-white rounded-xl shrink-0">
                      开始练习
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex justify-center relative z-10">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
            showTotal={(t) => `共 ${t} 题`}
            className={isDark ? '[&_.ant-pagination-item]:bg-slate-800 [&_.ant-pagination-item]:border-slate-700 [&_.ant-pagination-item-link]:bg-slate-800 [&_.ant-pagination-item-link]:border-slate-700' : ''}
          />
        </div>
      )}
    </div>
  );
}
