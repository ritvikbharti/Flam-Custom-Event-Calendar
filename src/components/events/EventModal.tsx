import React, { useState, useEffect } from 'react';
import { useEvents } from '../../context/EventContext';
import { EventFormData } from '../../types';
import EventForm from './EventForm';
import { formatDateTimeForInput } from '../../utils/dateUtils';
import { eventToFormData } from '../../utils/eventUtils';

interface EventModalProps {
  eventId?: string;
  initialDate?: Date;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ eventId, initialDate, onClose }) => {
  const { getEventById, addEvent, updateEvent, deleteEvent } = useEvents();
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  
  // Prepare initial form data
  let initialFormData: EventFormData;
  
  if (eventId) {
    // Editing an existing event
    const event = getEventById(eventId);
    
    if (!event) {
      onClose();
      return null;
    }
    
    initialFormData = eventToFormData(event);
  } else {
    // Creating a new event
    const now = initialDate || new Date();
    const start = new Date(now);
    
    // Round to nearest half hour
    start.setMinutes(Math.ceil(start.getMinutes() / 30) * 30);
    start.setSeconds(0);
    start.setMilliseconds(0);
    
    // End time is 1 hour after start
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    
    initialFormData = {
      title: '',
      description: '',
      start: formatDateTimeForInput(start),
      end: formatDateTimeForInput(end),
      color: 'blue',
      isRecurring: false,
      recurrenceType: 'daily',
      interval: 1,
      weekdays: [0, 1, 2, 3, 4, 5, 6],
      monthDay: null,
      endDate: '',
      count: '',
    };
  }
  
  // Handle form submission
  const handleSubmit = (formData: EventFormData) => {
    let result;
    
    if (eventId) {
      // Update existing event
      result = updateEvent(eventId, formData);
    } else {
      // Add new event
      result = addEvent(formData);
    }
    
    if (result.success) {
      onClose();
    } else {
      // Show conflict warning
      setConflictWarning(
        `This event conflicts with ${result.conflicts.length} existing event(s). Please choose a different time.`
      );
    }
  };
  
  // Handle event deletion
  const handleDelete = () => {
    if (eventId) {
      deleteEvent(eventId);
      onClose();
    }
  };
  
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/25"
        onClick={onClose}
      />
      
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 m-4 animate-fade-in">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {eventId ? 'Edit Event' : 'Add Event'}
          </h2>
          
          {conflictWarning && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {conflictWarning}
            </div>
          )}
          
          <EventForm
            initialData={initialFormData}
            onSubmit={handleSubmit}
            onCancel={onClose}
            onDelete={eventId ? handleDelete : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default EventModal;