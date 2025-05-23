import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { getMonthName } from '../../utils/dateUtils';

const CalendarHeader: React.FC = () => {
  const { currentMonth, currentYear, prevMonth, nextMonth, goToToday } = useCalendar();

  return (
    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
      <div className="flex items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {getMonthName(currentMonth)} {currentYear}
        </h2>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={goToToday}
          className="btn btn-ghost text-sm"
          aria-label="Today"
        >
          <CalendarIcon className="w-4 h-4 mr-1" />
          Today
        </button>
        
        <div className="flex items-center bg-white rounded-md border border-gray-200 shadow-sm">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-50 rounded-l-md"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-50 rounded-r-md"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;