import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { getWeekdayNames } from '../../utils/dateUtils';
import CalendarDay from './CalendarDay';

const CalendarGrid: React.FC = () => {
  const { calendarData } = useCalendar();
  const weekdayNames = getWeekdayNames();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
        {weekdayNames.map((day, index) => (
          <div
            key={index}
            className="py-2 text-center text-sm font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 grid-rows-6">
        {calendarData.weeks.map((week, weekIndex) =>
          week.days.map((day, dayIndex) => (
            <CalendarDay
              key={`${weekIndex}-${dayIndex}`}
              day={day}
              weekIndex={weekIndex}
              dayIndex={dayIndex}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarGrid;