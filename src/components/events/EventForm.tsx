import React, { useState, useEffect } from 'react';
import { EventFormData, RecurrenceType } from '../../types';
import { getEventColors } from '../../utils/eventUtils';

interface EventFormProps {
  initialData: EventFormData;
  onSubmit: (formData: EventFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
}) => {
  const [formData, setFormData] = useState<EventFormData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});
  
  const eventColors = getEventColors();
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'isRecurring') {
      setFormData(prev => ({
        ...prev,
        isRecurring: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'weekdays') {
      // Handle weekday checkboxes
      const weekdayValue = parseInt((e.target as HTMLInputElement).value, 10);
      const isChecked = (e.target as HTMLInputElement).checked;
      
      setFormData(prev => {
        const updatedWeekdays = isChecked
          ? [...prev.weekdays, weekdayValue]
          : prev.weekdays.filter(day => day !== weekdayValue);
        
        return {
          ...prev,
          weekdays: updatedWeekdays,
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.start) {
      newErrors.start = 'Start date/time is required';
    }
    
    if (!formData.end) {
      newErrors.end = 'End date/time is required';
    }
    
    if (formData.start && formData.end && new Date(formData.start) >= new Date(formData.end)) {
      newErrors.end = 'End time must be after start time';
    }
    
    if (formData.isRecurring) {
      if (formData.recurrenceType === 'weekly' && formData.weekdays.length === 0) {
        newErrors.weekdays = 'Select at least one day of the week';
      }
      
      if (formData.recurrenceType === 'monthly' && !formData.monthDay) {
        newErrors.monthDay = 'Day of month is required';
      }
      
      if (formData.interval <= 0) {
        newErrors.interval = 'Interval must be greater than 0';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Create array of days in month for the monthly recurrence option
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Handle recurrence type change
  useEffect(() => {
    // Reset monthDay when recurrence type changes from monthly to something else
    if (formData.recurrenceType !== 'monthly' && formData.monthDay !== null) {
      setFormData(prev => ({ ...prev, monthDay: null }));
    }
  }, [formData.recurrenceType]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`form-input ${errors.title ? 'border-red-500' : ''}`}
          placeholder="Event title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>
      
      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start" className="block text-sm font-medium text-gray-700">
            Start
          </label>
          <input
            type="datetime-local"
            id="start"
            name="start"
            value={formData.start}
            onChange={handleChange}
            className={`form-input ${errors.start ? 'border-red-500' : ''}`}
          />
          {errors.start && <p className="mt-1 text-sm text-red-500">{errors.start}</p>}
        </div>
        <div>
          <label htmlFor="end" className="block text-sm font-medium text-gray-700">
            End
          </label>
          <input
            type="datetime-local"
            id="end"
            name="end"
            value={formData.end}
            onChange={handleChange}
            className={`form-input ${errors.end ? 'border-red-500' : ''}`}
          />
          {errors.end && <p className="mt-1 text-sm text-red-500">{errors.end}</p>}
        </div>
      </div>
      
      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="form-input"
          placeholder="Event description"
        />
      </div>
      
      {/* Color Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {eventColors.map(color => (
            <div 
              key={color.id}
              onClick={() => setFormData(prev => ({ ...prev, color: color.id }))}
              className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                formData.color === color.id ? 'border-gray-900' : 'border-transparent'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>
      
      {/* Recurrence Options */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="isRecurring"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isRecurring" className="ml-2 block text-sm font-medium text-gray-700">
            Recurring Event
          </label>
        </div>
        
        {formData.isRecurring && (
          <div className="pl-6 space-y-4 border-l-2 border-blue-100">
            {/* Recurrence Type */}
            <div>
              <label htmlFor="recurrenceType" className="block text-sm font-medium text-gray-700">
                Repeat
              </label>
              <select
                id="recurrenceType"
                name="recurrenceType"
                value={formData.recurrenceType}
                onChange={handleChange}
                className="form-input"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            {/* Interval */}
            <div>
              <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                Every
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="interval"
                  name="interval"
                  value={formData.interval}
                  onChange={handleChange}
                  min="1"
                  className="form-input w-20"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {formData.recurrenceType === 'daily' && 'day(s)'}
                  {formData.recurrenceType === 'weekly' && 'week(s)'}
                  {formData.recurrenceType === 'monthly' && 'month(s)'}
                  {formData.recurrenceType === 'custom' && 'day(s)'}
                </span>
              </div>
              {errors.interval && <p className="mt-1 text-sm text-red-500">{errors.interval}</p>}
            </div>
            
            {/* Weekly Options */}
            {formData.recurrenceType === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  On
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekdayNames.map((day, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        name="weekdays"
                        value={index}
                        checked={formData.weekdays.includes(index)}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
                {errors.weekdays && (
                  <p className="mt-1 text-sm text-red-500">{errors.weekdays}</p>
                )}
              </div>
            )}
            
            {/* Monthly Options */}
            {formData.recurrenceType === 'monthly' && (
              <div>
                <label htmlFor="monthDay" className="block text-sm font-medium text-gray-700">
                  Day of Month
                </label>
                <select
                  id="monthDay"
                  name="monthDay"
                  value={formData.monthDay || ''}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select a day</option>
                  {daysInMonth.map(day => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                {errors.monthDay && (
                  <p className="mt-1 text-sm text-red-500">{errors.monthDay}</p>
                )}
              </div>
            )}
            
            {/* End Conditions */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date (Optional)
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div>
              <label htmlFor="count" className="block text-sm font-medium text-gray-700">
                Occurrences (Optional)
              </label>
              <input
                type="number"
                id="count"
                name="count"
                value={formData.count}
                onChange={handleChange}
                min="1"
                className="form-input"
                placeholder="Number of occurrences"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="btn btn-danger"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default EventForm;