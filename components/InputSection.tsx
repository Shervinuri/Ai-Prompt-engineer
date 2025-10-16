import React from 'react';

interface InputSectionProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isFontLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ prompt, setPrompt, onGenerate, isLoading, isFontLoading }) => {
  const isButtonDisabled = isLoading || !prompt.trim() || isFontLoading;

  const getButtonText = () => {
    if (isLoading) {
      return 'در حال پردازش...';
    }
    if (isFontLoading) {
      return 'در حال بارگذاری فونت...';
    }
    return 'بهینه‌سازی پرامپت';
  };

  const placeholderText = "مثال: یک ربات در حال اسکیت‌برد سواری. ربات می‌گوید: «سلام دنیا!» روی دیوار نوشته شده: «آینده اینجاست»";

  return (
    <div>
      <label htmlFor="prompt-input" className="block text-lg font-medium text-indigo-300 mb-2">
        پرامپت خام خود را اینجا وارد کنید
      </label>
      <textarea
        id="prompt-input"
        rows={8}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full bg-gray-900 text-gray-200 border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
        placeholder={placeholderText}
      />
      <button
        onClick={onGenerate}
        disabled={isButtonDisabled}
        className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {getButtonText()}
      </button>
    </div>
  );
};

export default InputSection;