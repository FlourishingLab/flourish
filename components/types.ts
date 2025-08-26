export interface Question {
  category: string;
  subcategory: string;
  text: string;
  minLabel: string;
  maxLabel: string;
}

export type QuestionsResponse = Record<string, Question>;
