import api from './index';

export interface ExamQuestion {
  id: string;
  type: 'single' | 'multiple' | 'truefalse' | 'fillblank';
  title: string;
  options: string[];
  score: number;
}

export interface ExamData {
  contestId: string;
  title: string;
  duration: number;
  totalScore: number;
  questions: ExamQuestion[];
}

export interface SubmitResult {
  id: string;
  score: number;
  totalScore: number;
  correctCount: number;
  totalCount: number;
  duration: number;
  wrongCount: number;
}

export interface ExamResult {
  score: number;
  totalScore: number;
  correctCount: number;
  totalCount: number;
  duration: number;
  submittedAt: string;
}

export const examApi = {
  start: async (contestId: string) => {
    const res = await api.get<ExamData>(`/exams/${contestId}/start`);
    return res.data;
  },
  submit: async (contestId: string, data: { answers: Record<string, any>; duration: number }) => {
    const res = await api.post<SubmitResult>(`/exams/${contestId}/submit`, data);
    return res.data;
  },
  getResult: async (contestId: string) => {
    const res = await api.get<ExamResult>(`/exams/${contestId}/result`);
    return res.data;
  },
};
