export interface IEventItem {
  Id: number;
  Title: string;
  Description?: string;
  EventDate: string;
  EndDate?: string;
  Location?: string;
  Category?: string;
  Image?: string;
  Created: string;
}

export const EVENT_CATEGORIES = ['Wellness', 'Company', 'Learning', 'Social'];

export const EVENT_CATEGORY_COLORS: Record<string, string> = {
  'Wellness': '#10b981',
  'Company': '#3b82f6',
  'Learning': '#8b5cf6',
  'Social': '#f97316',
};
