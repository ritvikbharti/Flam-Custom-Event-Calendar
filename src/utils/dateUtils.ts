import { CalendarDay, CalendarMonth, CalendarWeek, Event, RecurrenceRule } from '../types';

// Get days in month
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Get day of week (0-6, where 0 is Sunday)
export const getDayOfWeek = (date: Date): number => {
  return date.getDay();
};

// Check if two dates are the same day
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Format date to YYYY-MM-DD
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format time to HH:MM
export const formatTimeForInput = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Format datetime for input (YYYY-MM-DDTHH:MM)
export const formatDateTimeForInput = (date: Date): string => {
  const dateStr = formatDateForInput(date);
  const timeStr = formatTimeForInput(date);
  return `${dateStr}T${timeStr}`;
};

// Generate calendar data for a month
export const generateCalendarMonth = (
  year: number,
  month: number,
  events: Event[]
): CalendarMonth => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get the day of the week for the first day (0-6)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Calculate days from previous month to show
  const daysFromPrevMonth = firstDayOfWeek;
  
  // Calculate total days to display (including days from prev/next month)
  const totalDays = Math.ceil((daysInMonth + daysFromPrevMonth) / 7) * 7;
  
  // Create calendar days
  const days: CalendarDay[] = [];
  const today = new Date();
  
  // Previous month days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
  
  for (let i = 0; i < daysFromPrevMonth; i++) {
    const day = daysInPrevMonth - daysFromPrevMonth + i + 1;
    const date = new Date(prevMonthYear, prevMonth, day);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      events: getEventsForDay(date, events),
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      events: getEventsForDay(date, events),
    });
  }
  
  // Next month days
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  
  const remainingDays = totalDays - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(nextMonthYear, nextMonth, i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      events: getEventsForDay(date, events),
    });
  }
  
  // Group days into weeks
  const weeks: CalendarWeek[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push({
      days: days.slice(i, i + 7),
    });
  }
  
  return {
    weeks,
    month,
    year,
  };
};

// Get events for a specific day
export const getEventsForDay = (date: Date, events: Event[]): Event[] => {
  const dayEvents: Event[] = [];
  
  // First add non-recurring events
  events.forEach((event) => {
    const eventStart = new Date(event.start);
    
    // Check if it's a non-recurring event that falls on this day
    if (!event.isRecurring && isSameDay(eventStart, date)) {
      dayEvents.push(event);
      return;
    }
    
    // If it's recurring, check if it occurs on this day
    if (event.isRecurring && event.recurrence) {
      if (doesRecurringEventOccurOnDate(event, date)) {
        dayEvents.push({
          ...event,
          // Adjust start and end times to the current date while keeping the same time
          start: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            new Date(event.start).getHours(),
            new Date(event.start).getMinutes()
          ),
          end: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            new Date(event.end).getHours(),
            new Date(event.end).getMinutes()
          ),
        });
      }
    }
  });
  
  return dayEvents;
};

// Check if a recurring event occurs on a specific date
export const doesRecurringEventOccurOnDate = (event: Event, date: Date): boolean => {
  if (!event.isRecurring || !event.recurrence) return false;
  
  const eventStart = new Date(event.start);
  const recurrence = event.recurrence;
  
  // Check if the date is before the event start
  if (date < eventStart) return false;
  
  // Check if the date is after the recurrence end date
  if (recurrence.endDate && date > new Date(recurrence.endDate)) return false;
  
  // Calculate the difference in days between the event start and the target date
  const diffTime = date.getTime() - eventStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Handle different recurrence types
  switch (recurrence.type) {
    case 'daily':
      return diffDays % recurrence.interval === 0;
      
    case 'weekly':
      // Check if the day of the week matches
      if (!recurrence.weekdays || recurrence.weekdays.length === 0) {
        // If no weekdays specified, recur on the same day of the week as the start date
        return (
          date.getDay() === eventStart.getDay() &&
          Math.floor(diffDays / 7) % recurrence.interval === 0
        );
      } else {
        // Check if the current day of the week is in the selected weekdays
        // and if it's within the recurrence interval
        const weeksSinceStart = Math.floor(diffDays / 7);
        return (
          recurrence.weekdays.includes(date.getDay()) &&
          weeksSinceStart % recurrence.interval === 0
        );
      }
      
    case 'monthly':
      // Check if it's the same day of the month and within the interval
      const monthDiff = 
        (date.getFullYear() - eventStart.getFullYear()) * 12 +
        (date.getMonth() - eventStart.getMonth());
        
      if (recurrence.monthDay) {
        // Use the specified monthDay
        return (
          date.getDate() === recurrence.monthDay &&
          monthDiff % recurrence.interval === 0
        );
      } else {
        // Use the same day of the month as the start date
        return (
          date.getDate() === eventStart.getDate() &&
          monthDiff % recurrence.interval === 0
        );
      }
      
    case 'custom':
      // Custom is handled the same as the specific type above based on the interval
      return diffDays % recurrence.interval === 0;
      
    default:
      return false;
  }
};

// Check if two events overlap in time
export const doEventsOverlap = (event1: Event, event2: Event): boolean => {
  const start1 = new Date(event1.start).getTime();
  const end1 = new Date(event1.end).getTime();
  const start2 = new Date(event2.start).getTime();
  const end2 = new Date(event2.end).getTime();
  
  return (start1 < end2 && start2 < end1);
};

// Format date for display
export const formatDateForDisplay = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

// Format time for display
export const formatTimeForDisplay = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

// Get month name
export const getMonthName = (month: number): string => {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2000, month, 1));
};

// Get weekday names
export const getWeekdayNames = (short: boolean = false): string[] => {
  const format = short ? 'narrow' : 'short';
  const weekdays = [];
  
  for (let i = 0; i < 7; i++) {
    weekdays.push(
      new Intl.DateTimeFormat('en-US', { weekday: format }).format(new Date(2000, 0, i + 2))
    );
  }
  
  return weekdays;
};