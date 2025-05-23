import React, { useState } from 'react';
import { Event } from '../../types';
import { getEventColorStyles } from '../../utils/eventUtils';
import { formatTimeForDisplay } from '../../utils/dateUtils';
import EventModal from './EventModal';

interface EventChipProps {
  event: Event;
}

const EventChip: React.FC<EventChipProps> = ({ event }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const colorStyles = getEventColorStyles(event.color);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('eventId', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <>
      <div
        className={`event-chip border ${colorStyles.bg} ${colorStyles.text} ${colorStyles.border}`}
        onClick={() => setIsModalOpen(true)}
        draggable
        onDragStart={handleDragStart}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">
            {event.title}
          </span>
          <span className="text-xs whitespace-nowrap ml-1">
            {formatTimeForDisplay(new Date(event.start))}
          </span>
        </div>
      </div>
      
      {isModalOpen && (
        <EventModal
          eventId={event.id}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default EventChip;