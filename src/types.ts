export interface FormTheme {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
}

export interface QuestionLogic {
  condition: "equals" | "not_equals" | "always" | "contains";
  value: string;
  goToQuestionId: string; // question ID or 'thank-you'
}

export interface Question {
  id: string;
  formId: string;
  type: "short_text" | "long_text" | "multiple_choice" | "dropdown" | "email" | "number" | "yes_no" | "rating";
  title: string;
  description: string;
  required: boolean;
  options: string[];
  orderIndex: number;
  minVal?: number;
  maxVal?: number;
  logic?: QuestionLogic;
}

export interface Form {
  id: string;
  title: string;
  status: "draft" | "published";
  shareLink: string;
  views: number;
  theme: FormTheme;
  createdAt: string;
  updatedAt: string;
  questionsCount?: number;
  submissionsCount?: number;
}

export interface Submission {
  id: string;
  formId: string;
  submittedAt: string;
  answers: { [questionId: string]: any };
}

export interface DistributionItem {
  choice: string;
  count: number;
  percentage: number;
}

export interface QuestionStat {
  type: Question["type"];
  title: string;
  totalAnswers: number;
  average?: number;
  distribution?: DistributionItem[];
  recentAnswers?: any[];
}

export interface FormStats {
  views: number;
  submissionsCount: number;
  completionRate: number;
  questionsStats: { [questionId: string]: QuestionStat };
}
