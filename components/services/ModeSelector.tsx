import React from 'react';

type Mode = 'enhance' | 'svg';

interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const baseClasses = "px-6 py-2 rounded-md font-semibold transition-colors duration-300 w-1/2 text-center text-sm sm:text-base";
  const activeClasses = "bg-indigo-600 text-white shadow-lg";
  const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <div className="bg-gray-900/50 p-1 rounded-lg flex space-x-2 rtl:space-x-reverse mb-6 max-w-md mx-auto">
      <button 
        onClick={() => onModeChange('enhance')}
        className={`${baseClasses} ${currentMode === 'enhance' ? activeClasses : inactiveClasses}`}
      >
        بهینه‌ساز هوشمند
      </button>
      <button 
        onClick={() => onModeChange('svg')}
        className={`${baseClasses} ${currentMode === 'svg' ? activeClasses : inactiveClasses}`}
      >
        مولد متن SVG
      </button>
    </div>
  );
};

export default ModeSelector;
