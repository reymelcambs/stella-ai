export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type UserRole = 'student' | 'teacher' | 'institution';

export interface SchoolTimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  branch?: string;
  teacher?: string;
}

export interface RevisionTimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  topic: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role: UserRole;
  subjects: string[];
  coverage: Record<string, string[]>; // subject -> list of topics
  level: 'S4' | 'S5' | 'S6';
  schoolName?: string;
  district?: string;
  expectedGraduationYear?: number;
  signupCode?: string;
  goals?: Goal[];
  verificationCode?: string;
  isVerified?: boolean;
  createdAt: number;
  updatedAt?: number;
  onboarded: boolean;
  schoolTimetable?: SchoolTimetableEntry[];
  revisionTimetable?: RevisionTimetableEntry[];
  questionsAttempted?: number;
  averageScore?: number;
  lastActiveAt?: number;
}

export interface LearningOutcome {
  id: string;
  subject: string;
  topic: string;
  subtopic: string;
  outcome: string;
  cognitiveLevel: string[];
}

export interface GraphData {
  graph_type: 'function' | 'data';
  equation?: string;
  data_points?: { x: number | string, y: number | string }[];
  x_range?: [number, number];
  x_label: string;
  y_label: string;
  title?: string;
}

export interface BasisOfAssessment {
  id: string;
  name: string;
  description: string;
  section: 'Interpretation' | 'Ideas' | 'Judgment';
  score?: number; // 1-4
  feedback?: string;
}

export interface QuestionItem {
  id: string;
  userId: string;
  subject: string;
  topics: string[];
  construct?: string;
  concept?: string;
  patternUsed?: string;
  stepsOfSolution?: string[];
  questionType?: string;
  questionText: string;
  scenario: string;
  task: string;
  basesOfAssessment: BasisOfAssessment[];
  scenarioData?: any;
  markingScheme?: string;
  difficulty?: string;
  examRealismScore?: number;
  competencyCoveragePercentage?: number;
  createdAt: number;
  type: 'generated' | 'uploaded';
  scenarioGraph?: GraphData;
  solutionGraph?: GraphData;
  scenarioImage?: string;
}

export interface QuestionPattern {
  id: string;
  subject: string;
  topics: string[];
  patternName: string;
  steps: string[];
  difficulty: string;
}

export interface ReferenceQuestion {
  id: string;
  subject: string;
  topics: string[];
  questionText: string;
  markingScheme?: string;
  difficulty: string;
}

export interface AnswerRecord {
  id?: string;
  userId: string;
  questionId: string;
  answerText: string;
  voiceTranscript?: string;
  feedback: string;
  scoresByBasis: Record<string, number>;
  totalScore: number;
  maxTotalScore: number;
  percentageScore: number;
  achievementLevel: 'Exceptional' | 'Outstanding' | 'Satisfactory' | 'Basic' | 'Elementary';
  gradeWeight: number;
  timestamp: number;
}

export interface AnalyticsRecord {
  userId: string;
  topicPerformance: Record<string, { 
    attempts: number; 
    averageScore: number;
    masteryLevel: 'Novice' | 'Intermediate' | 'Proficient' | 'Expert';
    lastAttemptTimestamp: number;
    trend: 'improving' | 'declining' | 'stable';
  }>;
  conceptMastery: Record<string, {
    masteryScore: number; // 0-100
    questionsSolved: number;
    lastTested: number;
  }>;
  timeSpent: number; // total minutes
  mistakesFrequency: Record<string, number>; // common error types
  lastUpdated?: number;
}

export interface ExamRecord {
  id: string;
  userId: string;
  subject: string;
  topics: string[];
  questions: QuestionItem[];
  answers: Record<string, string>;
  results: AnswerRecord[];
  totalScore: number;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
}

export interface ChatMessage {
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
  attachments?: { name: string; type: string; data: string; mimeType: string }[];
  graph?: GraphData;
  image?: string;
  generatedExam?: any;
  recommendedVideos?: any[];
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  subject: string;
  topic: string;
  competency: string;
  level: string;
  learningOutcomes: string[];
  duration: string;
  introduction: string;
  development: { step: string; activity: string; method: string }[];
  conclusion: string;
  assessmentTask: { scenario: string; task: string; rubric: string };
  createdAt: number;
  updatedAt: number;
}

export interface SchemeOfWork {
  id: string;
  teacherId: string;
  subject: string;
  term: number;
  year: number;
  level: string;
  weeks: {
    week: number;
    topic: string;
    subTopic: string;
    competency: string;
    activities: string[];
    materials: string[];
  }[];
  createdAt: number;
  updatedAt: number;
}
