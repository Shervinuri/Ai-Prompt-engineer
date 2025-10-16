import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Reset local state when modal is opened/closed if needed
    if (!isOpen) {
      setApiKey('');
    }
  }, [isOpen]);

  const handleSaveClick = () => {
    onSave(apiKey);
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title" className="text-2xl font-bold text-center text-indigo-300 mb-4">
          ورود کلید Gemini API
        </h2>
        <p className="text-gray-400 text-center mb-6">
          برای استفاده از برنامه، لطفاً کلید API خود را از Google AI Studio دریافت و در کادر زیر وارد کنید.
        </p>
        <div className="space-y-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-gray-900 text-gray-200 border border-gray-600 rounded-lg p-3 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            placeholder="••••••••••••••••••••••••••••••••••"
            aria-label="Gemini API Key"
          />
          <button
            onClick={handleSaveClick}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            disabled={!apiKey.trim()}
          >
            ذخیره و ادامه
          </button>
        </div>
         <p className="text-xs text-gray-500 text-center mt-4">
          کلید شما فقط در این مرورگر ذخیره شده و به هیچ سروری ارسال نمی‌شود.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;