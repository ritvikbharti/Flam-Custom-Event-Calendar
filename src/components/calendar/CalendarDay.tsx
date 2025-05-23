import React, { useState } from 'react';
import { CalendarDay as CalendarDayType } from '../../types';
import EventChip from '../events/EventChip';
import { Plus } from 'lucide-react';
import EventModal from '../events/EventModal';
import { formatTimeForDisplay } from '../../utils/dateUtils';
import { useEvents } from '../../context/EventContext';

interface CalendarDayProps {
  day: CalendarDayType;
  weekIndex: number;
  dayIndex: number;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ day, weekIndex, dayIndex }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { moveEvent } = useEvents();
  
  // Define the class based on whether it's current month and today
  const dayClass = `calendar-day ${
    day.isCurrentMonth ? 'calendar-day-current-month' : 'calendar-day-other-month'
  } ${day.isToday ? 'calendar-day-today' : ''}`;

  // Set up drag and drop handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    
    if (eventId) {
      const result = moveEvent(eventId, day.date);
      
      if (!result.success) {
        alert(`Cannot move event due to conflicts with existing events.`);
      }
    }
  };

  // Sort events by start time
  const sortedEvents = [...day.events].sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // Limit the number of events to display
  const maxVisibleEvents = 3;
  const visibleEvents = sortedEvents.slice(0, maxVisibleEvents);
  const hiddenEventsCount = sortedEvents.length - maxVisibleEvents;

  return (
    <div 
      className={dayClass}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-start">
        <span className={`text-sm ${day.isToday ? 'font-bold bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
          {day.date.getDate()}
        </span>
        <button 
          className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 transition-colors"
          onClick={() => setIsAddModalOpen(true)}
          aria-label="Add event"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      
      <div className="mt-1">
        {visibleEvents.map(event => (
          <EventChip key={event.id} event={event} />
        ))}
        
        {hiddenEventsCount > 0 && (
          <div className="text-xs text-gray-500 mt-1 pl-1">
            +{hiddenEventsCount} more
          </div>
        )}
      </div>
      
      {isAddModalOpen && (
        <EventModal
          initialDate={day.date}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CalendarDay;