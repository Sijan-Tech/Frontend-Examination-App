import type { Question } from '../data/questions';
import defaultQuestions from '../data/questions';

const KEYS = {
  questions: 'exam_questions',
  attempts: 'exam_attempts',
  profile: 'exam_profile',
  currentExam: 'exam_current',
} as const;

export interface ExamAttempt {
  id: string;
  subject: string;
  date: string;
  score: number;
  total: number;
  percentage: number;
  timeTaken: number;
  answers: Record<string, string>;
  markedForReview: string[];
  questions: Question[];
}

export interface UserProfile {
  username: string;
  loginTime: string;
}

export interface CurrentExam {
  subject: string;
  duration: number;
  questionCount: number;
  questions: Question[];
  startTime: number;
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export function getQuestions(): Question[] {
  const stored = localStorage.getItem(KEYS.questions);
  if (!stored) {
    safeSet(KEYS.questions, defaultQuestions);
    return defaultQuestions;
  }
  return safeGet<Question[]>(KEYS.questions, defaultQuestions);
}

export function saveQuestions(questions: Question[]): void {
  safeSet(KEYS.questions, questions);
}

export function addQuestion(question: Question): void {
  const questions = getQuestions();
  saveQuestions([...questions, question]);
}

export function updateQuestion(updated: Question): void {
  const questions = getQuestions();
  saveQuestions(questions.map((q) => (q.id === updated.id ? updated : q)));
}

export function deleteQuestion(id: string): void {
  const questions = getQuestions();
  saveQuestions(questions.filter((q) => q.id !== id));
}

export function getSubjects(): string[] {
  const questions = getQuestions();
  return [...new Set(questions.map((q) => q.subject))].sort();
}

export function getAttempts(): ExamAttempt[] {
  return safeGet<ExamAttempt[]>(KEYS.attempts, []);
}

export function saveAttempt(attempt: ExamAttempt): void {
  const attempts = getAttempts();
  safeSet(KEYS.attempts, [attempt, ...attempts]);
}

export function getProfile(): UserProfile | null {
  return safeGet<UserProfile | null>(KEYS.profile, null);
}

export function saveProfile(profile: UserProfile): void {
  safeSet(KEYS.profile, profile);
}

export function clearProfile(): void {
  localStorage.removeItem(KEYS.profile);
  localStorage.removeItem(KEYS.currentExam);
}

export function getCurrentExam(): CurrentExam | null {
  return safeGet<CurrentExam | null>(KEYS.currentExam, null);
}

export function saveCurrentExam(exam: CurrentExam): void {
  safeSet(KEYS.currentExam, exam);
}

export function clearCurrentExam(): void {
  localStorage.removeItem(KEYS.currentExam);
}

export function generateId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
