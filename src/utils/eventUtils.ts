import { v4 as uuidv4 } from 'uuid';
import { Event, EventFormData, RecurrenceRule } from '../types';
import { doEventsOverlap } from './dateUtils';

// Create a new event from form data
export const createEventFromFormData = (formData: EventFormData): Event => {
  const recurrence = formData.isRecurring
    ? buildRecurrenceRule(formData)
    : null;

  return {
    id: uuidv4(),
    title: formData.title,
    description: formData.description,
    start: new Date(formData.start),
    end: new Date(formData.end),
    color: formData.color,
    recurrence,
    isRecurring: formData.isRecurring,
  };
};

// Convert event to form data for editing
export const eventToFormData = (event: Event): EventFormData => {
  const recurrence = event.recurrence || {
    type: 'daily',
    interval: 1,
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    monthDay: null,
    endDate: null,
    count: null,
  };
  
  return {
    title: event.title,
    description: event.description,
    start: new Date(event.start).toISOString().slice(0, 16),
    end: new Date(event.end).toISOString().slice(0, 16),
    color: event.color,
    isRecurring: event.isRecurring,
    recurrenceType: recurrence.type,
    interval: recurrence.interval,
    weekdays: recurrence.weekdays || [0, 1, 2, 3, 4, 5, 6],
    monthDay: recurrence.monthDay || null,
    endDate: recurrence.endDate ? new Date(recurrence.endDate).toISOString().slice(0, 10) : '',
    count: recurrence.count ? recurrence.count.toString() : '',
  };
};

// Build recurrence rule from form data
export const buildRecurrenceRule = (formData: EventFormData): RecurrenceRule => {
  const rule: RecurrenceRule = {
    type: formData.recurrenceType,
    interval: formData.interval,
  };
  
  // Add type-specific properties
  if (formData.recurrenceType === 'weekly') {
    rule.weekdays = formData.weekdays;
  } else if (formData.recurrenceType === 'monthly') {
    rule.monthDay = formData.monthDay;
  }
  
  // Add end conditions
  if (formData.endDate) {
    rule.endDate = new Date(formData.endDate);
  }
  
  if (formData.count) {
    rule.count = parseInt(formData.count, 10);
  }
  
  return rule;
};

// Check if a new event conflicts with existing events
export const checkEventConflicts = (
  newEvent: Event,
  existingEvents: Event[],
  excludeId?: string
): Event[] => {
  return existingEvents.filter(event => {
    // Skip the event itself when updating
    if (excludeId && event.id === excludeId) {
      return false;
    }
    
    // Check if events occur on the same day and overlap in time
    return doEventsOverlap(newEvent, event);
  });
};

// Get event color styles
export const getEventColorStyles = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  };
  
  return colorMap[color] || colorMap.blue;
};

// Get a list of available event colors
export const getEventColors = () => [
  { id: 'blue', name: 'Blue', value: '#0A84FF' },
  { id: 'purple', name: 'Purple', value: '#5E5CE6' },
  { id: 'pink', name: 'Pink', value: '#FF2D55' },
  { id: 'red', name: 'Red', value: '#FF3B30' },
  { id: 'orange', name: 'Orange', value: '#FF9500' },
  { id: 'yellow', name: 'Yellow', value: '#FFCC00' },
  { id: 'green', name: 'Green', value: '#34C759' },
  { id: 'indigo', name: 'Indigo', value: '#5856D6' },
];