import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event, EventFormData } from '../types';
import { createEventFromFormData, checkEventConflicts } from '../utils/eventUtils';

interface EventContextType {
  events: Event[];
  addEvent: (formData: EventFormData) => { success: boolean; conflicts: Event[] };
  updateEvent: (id: string, formData: EventFormData) => { success: boolean; conflicts: Event[] };
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
  moveEvent: (id: string, newDate: Date) => { success: boolean; conflicts: Event[] };
  searchEvents: (query: string) => Event[];
  filterEventsByColor: (color: string) => Event[];
}

const EventContext = createContext<EventContextType>({
  events: [],
  addEvent: () => ({ success: false, conflicts: [] }),
  updateEvent: () => ({ success: false, conflicts: [] }),
  deleteEvent: () => {},
  getEventById: () => undefined,
  moveEvent: () => ({ success: false, conflicts: [] }),
  searchEvents: () => [],
  filterEventsByColor: () => [],
});

export const useEvents = () => useContext(EventContext);

const STORAGE_KEY = 'calendar_events';

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const storedEvents = localStorage.getItem(STORAGE_KEY);
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        // Convert string dates back to Date objects
        return parsedEvents.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          recurrence: event.recurrence
            ? {
                ...event.recurrence,
                endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : null,
              }
            : null,
        }));
      }
    } catch (error) {
      console.error('Error loading events from localStorage:', error);
    }
    return [];
  });

  // Save events to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
    }
  }, [events]);

  // Add a new event
  const addEvent = (formData: EventFormData) => {
    const newEvent = createEventFromFormData(formData);
    
    // Check for conflicts
    const conflicts = checkEventConflicts(newEvent, events);
    
    if (conflicts.length === 0) {
      setEvents(prevEvents => [...prevEvents, newEvent]);
      return { success: true, conflicts: [] };
    }
    
    return { success: false, conflicts };
  };

  // Update an existing event
  const updateEvent = (id: string, formData: EventFormData) => {
    const updatedEvent = {
      ...createEventFromFormData(formData),
      id,
    };
    
    // Check for conflicts (excluding the event being updated)
    const conflicts = checkEventConflicts(updatedEvent, events, id);
    
    if (conflicts.length === 0) {
      setEvents(prevEvents =>
        prevEvents.map(event => (event.id === id ? updatedEvent : event))
      );
      return { success: true, conflicts: [] };
    }
    
    return { success: false, conflicts };
  };

  // Delete an event
  const deleteEvent = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };

  // Get an event by ID
  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  // Move an event to a new date
  const moveEvent = (id: string, newDate: Date) => {
    const event = getEventById(id);
    
    if (!event) {
      return { success: false, conflicts: [] };
    }
    
    // Calculate the difference in time between the new date and the original date
    const originalDate = new Date(event.start);
    const timeDiff = newDate.getTime() - new Date(
      originalDate.getFullYear(),
      originalDate.getMonth(),
      originalDate.getDate()
    ).getTime();
    
    // Create a new event with updated dates
    const movedEvent = {
      ...event,
      start: new Date(event.start.getTime() + timeDiff),
      end: new Date(event.end.getTime() + timeDiff),
    };
    
    // Check for conflicts (excluding the event being moved)
    const conflicts = checkEventConflicts(movedEvent, events, id);
    
    if (conflicts.length === 0) {
      setEvents(prevEvents =>
        prevEvents.map(event => (event.id === id ? movedEvent : event))
      );
      return { success: true, conflicts: [] };
    }
    
    return { success: false, conflicts };
  };

  // Search events by title or description
  const searchEvents = (query: string) => {
    if (!query.trim()) return events;
    
    const lowerCaseQuery = query.toLowerCase().trim();
    return events.filter(
      event =>
        event.title.toLowerCase().includes(lowerCaseQuery) ||
        (event.description && event.description.toLowerCase().includes(lowerCaseQuery))
    );
  };

  // Filter events by color
  const filterEventsByColor = (color: string) => {
    if (!color) return events;
    return events.filter(event => event.color === color);
  };

  return (
    <EventContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        moveEvent,
        searchEvents,
        filterEventsByColor,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};