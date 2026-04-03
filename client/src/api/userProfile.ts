import api from './index';

export interface UserProfile {
  id: string;
  username: string;
  role: string;
  avatar: string | null;
  experience: number;
  level: number;
  consecutiveDays: number;
  lastLoginDate: string | null;
  dailyGoals: {
    date: string;
    practice: { current: number; target: number };
    contest: { current: number; target: number };
    review: { current: number; target: number };
  };
  levelProgress: {
    current: number;
    currentThreshold: number;
    nextThreshold: number;
    progress: number;
  };
  createdAt: string;
}

export interface UserStatsTrend {
  todaySubmissions: number;
  yesterdaySubmissions: number;
  submissionTrend: number;
  totalSubmissions: number;
  avgScore: number;
  userRank: number;
  totalUsers: number;
}

export interface ContestHistory {
  id: string;
  contestTitle: string;
  score: number;
  totalScore: number;
  correctCount: number;
  totalCount: number;
  duration: number;
  submittedAt: string;
}

export interface AnswerStats {
  totalSubmissions: number;
  totalCorrect: number;
  totalQuestions: number;
  totalWrong: number;
  accuracy: number;
  categoryStats: Record<string, { correct: number; total: number }>;
}

export const userProfileApi = {
  getProfile: async () => {
    const res = await api.get<UserProfile>('/user/profile');
    return res.data;
  },
  getStatsTrend: async () => {
    const res = await api.get<UserStatsTrend>('/user/stats/trend');
    return res.data;
  },
  getHistory: async (limit = 10) => {
    const res = await api.get<ContestHistory[]>('/user/history', { params: { limit } });
    return res.data;
  },
  getAnswers: async () => {
    const res = await api.get<AnswerStats>('/user/answers');
    return res.data;
  },
  getAvatars: async () => {
    const res = await api.get<{ avatars: string[] }>('/avatars');
    return res.data;
  },
  setAvatar: async (avatar: string) => {
    const res = await api.put('/user/avatar', { avatar });
    return res.data;
  },
  addExperience: async (correct: number, count: number) => {
    const res = await api.post('/user/experience', { correct, count });
    return res.data;
  },
  getDailyGoals: async () => {
    const res = await api.get('/user/daily-goals');
    return res.data;
  },
  updateDailyGoal: async (type: string) => {
    const res = await api.put('/user/daily-goals', { type });
    return res.data;
  },
};
