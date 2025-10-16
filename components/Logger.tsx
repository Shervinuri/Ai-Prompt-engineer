
import React from 'react';

interface LoggerProps {
  messages: string[];
}

const Logger: React.FC<LoggerProps> = ({ messages }) => {
  return (
    <div className="mt-6 bg-gray-900/50 border border-gray-700 rounded-lg p-4 font-mono text-sm">
      <p className="text-indigo-400 font-bold mb-2">[وضعیت پردازش]</p>
      {messages.map((msg, index) => (
        <div key={index} className="flex items-center">
          <span className="text-gray-500 mr-2 rtl:mr-0 rtl:ml-2">&gt;</span>
          <p className="text-gray-300">{msg}</p>
        </div>
      ))}
    </div>
  );
};

export default Logger;
