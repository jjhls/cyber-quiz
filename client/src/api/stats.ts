import api from './index';

export interface DashboardData {
  ongoingContests: number;
  upcomingContests: number;
  totalSubmissions: number;
  avgScore: number;
  userRank: number;
  totalUsers: number;
  nextContest: {
    id: string;
    title: string;
    startTime: string;
  } | null;
  recentSubmissions: {
    id: string;
    contestTitle: string;
    score: number;
    totalScore: number;
    submittedAt: string;
  }[];
}

export const statsApi = {
  getDashboard: async () => {
    const res = await api.get<DashboardData>('/stats/dashboard');
    return res.data;
  },
  getCategoryStats: async () => {
    const res = await api.get('/stats/category');
    return res.data;
  },
  getAdminStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
};
