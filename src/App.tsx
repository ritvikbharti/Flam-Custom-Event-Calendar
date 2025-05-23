import React, { useState } from 'react';
import { CalendarProvider } from './context/CalendarContext';
import { EventProvider, useEvents } from './context/EventContext';
import CalendarHeader from './components/calendar/CalendarHeader';
import CalendarGrid from './components/calendar/CalendarGrid';
import Toolbar from './components/toolbar/Toolbar';
import { Event } from './types';

const CalendarApp: React.FC = () => {
  const { events } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Event Calendar</h1>
          <Toolbar onSearchChange={setFilteredEvents} />
        </header>
        
        <main className="space-y-6">
          <CalendarHeader />
          <CalendarGrid />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <EventProvider>
      <CalendarProvider>
        <CalendarApp />
      </CalendarProvider>
    </EventProvider>
  );
}

export default App;