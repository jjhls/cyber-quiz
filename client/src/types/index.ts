export interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
  avatar?: string | null;
  consecutiveDays?: number;
}

export interface Question {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'single' | 'multiple' | 'truefalse' | 'fillblank';
  title: string;
  options: string[];
  answer: string | string[];
  explanation: string;
  tags: string[];
  score: number;
  createdAt: string;
  updatedAt: string;
}

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

export interface Submission {
  id: string;
  userId: string;
  contestId: string;
  score: number;
  totalScore: number;
  correctCount: number;
  totalCount: number;
  duration: number;
  answers: Record<string, string | string[]>;
  startedAt: string;
  submittedAt: string;
  createdAt: string;
}

export interface WrongAnswer {
  id: string;
  userId: string;
  questionId: string;
  contestId: string | null;
  userAnswer: string;
  correctAnswer: string;
  errorCount: number;
  createdAt: string;
  updatedAt: string;
}
