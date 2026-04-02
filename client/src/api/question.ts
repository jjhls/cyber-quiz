import api from './index';

export interface Question {
  id: string;
  category: string;
  difficulty: string;
  type: string;
  title: string;
  options: string[];
  answer: any;
  explanation: string;
  tags: string[];
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionListResult {
  data: Question[];
  total: number;
  page: number;
  pageSize: number;
}

export const questionApi = {
  getList: async (params?: { category?: string; difficulty?: string; type?: string; search?: string; page?: number; pageSize?: number }) => {
    const res = await api.get<QuestionListResult>('/questions', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<Question>(`/questions/${id}`);
    return res.data;
  },
  create: async (data: Partial<Question>) => {
    const res = await api.post<Question>('/questions', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Question>) => {
    const res = await api.put<Question>(`/questions/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await api.delete(`/questions/${id}`);
  },
  import: async (questions: any[]) => {
    const res = await api.post('/questions/import', { questions });
    return res.data;
  },
};

export const practiceApi = {
  getList: async (params?: { category?: string; difficulty?: string; page?: number; pageSize?: number }) => {
    const res = await api.get<QuestionListResult>('/practice', { params });
    return res.data;
  },
  submitAnswer: async (questionId: string, answer: any) => {
    const res = await api.post(`/practice/${questionId}/answer`, { answer });
    return res.data;
  },
};

export const wrongBookApi = {
  getList: async () => {
    const res = await api.get('/wrong-book');
    return res.data;
  },
  remove: async (id: string) => {
    await api.delete(`/wrong-book/${id}`);
  },
};
