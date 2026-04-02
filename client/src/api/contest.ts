import api from './index';

export interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalScore: number;
  status: 'upcoming' | 'ongoing' | 'finished';
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  questionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContestRanking {
  rank: number;
  userId: string;
  username: string;
  score: number;
  totalScore: number;
  correctCount: number;
  totalCount: number;
  duration: number;
  submittedAt: string;
}

export const contestApi = {
  getList: async (status?: string) => {
    const res = await api.get<Contest[]>('/contests', { params: status ? { status } : {} });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<Contest>(`/contests/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post<Contest>('/contests', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put<Contest>(`/contests/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await api.delete(`/contests/${id}`);
  },
  getRanking: async (id: string) => {
    const res = await api.get<ContestRanking[]>(`/contests/${id}/ranking`);
    return res.data;
  },
};
