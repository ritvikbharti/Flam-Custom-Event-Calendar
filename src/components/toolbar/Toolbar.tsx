import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import SearchBar from './SearchBar';
import ColorFilter from './ColorFilter';
import EventModal from '../events/EventModal';
import { useEvents } from '../../context/EventContext';
import { Event } from '../../types';

interface ToolbarProps {
  onSearchChange: (events: Event[]) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onSearchChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { events, searchEvents, filterEventsByColor } = useEvents();
  
  // Combined search and filter effect
  useEffect(() => {
    let filteredEvents = events;
    
    // Apply search filter
    if (searchQuery) {
      filteredEvents = searchEvents(searchQuery);
    }
    
    // Apply color filter
    if (selectedColor) {
      filteredEvents = filteredEvents.filter(event => event.color === selectedColor);
    }
    
    onSearchChange(filteredEvents);
  }, [searchQuery, selectedColor, events, searchEvents, onSearchChange]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleColorFilter = (color: string | null) => {
    setSelectedColor(color);
  };
  
  return (
    <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
      <div className="flex items-center space-x-4">
        <SearchBar onSearch={handleSearch} />
        <ColorFilter 
          selectedColor={selectedColor}
          onSelectColor={handleColorFilter}
        />
      </div>
      
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn btn-primary"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Event
      </button>
      
      {isModalOpen && (
        <EventModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Toolbar;