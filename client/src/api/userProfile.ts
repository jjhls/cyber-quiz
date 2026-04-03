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

export const userProfileApi = {
  getProfile: async () => {
    const res = await api.get<UserProfile>('/user/profile');
    return res.data;
  },
  getStatsTrend: async () => {
    const res = await api.get<UserStatsTrend>('/user/stats/trend');
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
