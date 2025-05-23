export interface Event {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  color: string;
  recurrence: RecurrenceRule | null;
  isRecurring: boolean;
}

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number; // Every X days/weeks/months
  weekdays?: number[]; // 0-6, Sunday to Saturday
  monthDay?: number; // Day of the month (1-31)
  endDate?: Date | null; // When the recurrence ends
  count?: number | null; // Number of occurrences
}

export interface EventFormData {
  title: string;
  description: string;
  start: string;
  end: string;
  color: string;
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  interval: number;
  weekdays: number[];
  monthDay: number | null;
  endDate: string;
  count: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

export interface CalendarWeek {
  days: CalendarDay[];
}

export interface CalendarMonth {
  weeks: CalendarWeek[];
  month: number;
  year: number;
}