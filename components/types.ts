export interface Question {
  id: number;
  text: string;
  minLabel: string;
  maxLabel: string;
  dimension: string;
  subDimension: string;
  facet: string;
}

export interface BackendQuestion {
  id: number;
  text: string;
  min_label: string;
  max_label: string;
  dimension: string;
  sub_dimension: string;
  facet: string;
}
