import React, { createContext, useContext, useState, useEffect } from 'react';
import { CalendarMonth } from '../types';
import { generateCalendarMonth } from '../utils/dateUtils';
import { useEvents } from './EventContext';

interface CalendarContextType {
  currentMonth: number;
  currentYear: number;
  calendarData: CalendarMonth;
  prevMonth: () => void;
  nextMonth: () => void;
  goToToday: () => void;
  goToDate: (year: number, month: number) => void;
}

const CalendarContext = createContext<CalendarContextType>({
  currentMonth: 0,
  currentYear: 0,
  calendarData: { weeks: [], month: 0, year: 0 },
  prevMonth: () => {},
  nextMonth: () => {},
  goToToday: () => {},
  goToDate: () => {},
});

export const useCalendar = () => useContext(CalendarContext);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const { events } = useEvents();
  const [calendarData, setCalendarData] = useState<CalendarMonth>({
    weeks: [],
    month: currentMonth,
    year: currentYear,
  });

  // Generate calendar data when month, year, or events change
  useEffect(() => {
    setCalendarData(generateCalendarMonth(currentYear, currentMonth, events));
  }, [currentMonth, currentYear, events]);

  // Go to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(prevYear => prevYear - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(prevYear => prevYear + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // Go to today
  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // Go to specific date
  const goToDate = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  return (
    <CalendarContext.Provider
      value={{
        currentMonth,
        currentYear,
        calendarData,
        prevMonth,
        nextMonth,
        goToToday,
        goToDate,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};