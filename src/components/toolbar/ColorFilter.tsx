import React from 'react';
import { getEventColors } from '../../utils/eventUtils';

interface ColorFilterProps {
  selectedColor: string | null;
  onSelectColor: (color: string | null) => void;
}

const ColorFilter: React.FC<ColorFilterProps> = ({ selectedColor, onSelectColor }) => {
  const eventColors = getEventColors();
  
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-600">Filter:</span>
      
      <div className="flex space-x-1">
        {/* All colors option */}
        <button
          onClick={() => onSelectColor(null)}
          className={`w-6 h-6 rounded-full flex items-center justify-center border ${
            selectedColor === null 
              ? 'border-gray-900' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          title="All colors"
        >
          <span className="text-xs">All</span>
        </button>
        
        {/* Color options */}
        {eventColors.map((color) => (
          <button
            key={color.id}
            onClick={() => onSelectColor(color.id)}
            className={`w-6 h-6 rounded-full border-2 ${
              selectedColor === color.id ? 'border-gray-900' : 'border-transparent'
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorFilter;