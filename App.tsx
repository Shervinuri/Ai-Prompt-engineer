import React, { useState, useEffect, useCallback } from 'react';
import type { GeminiResponse } from './components/services/types';
import { enhancePrompt } from './components/services/geminiService';
import { identifyTextParts, generateSvgFromText } from './components/services/svgService';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import Logger from './components/Logger';
import ApiKeyModal from './components/ApiKeyModal';
import { SettingsIcon } from './components/icons';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [apiResponse, setApiResponse] = useState<GeminiResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [font, setFont] = useState<opentype.Font | null>(null);
  const [isFontLoading, setIsFontLoading] = useState<boolean>(true);


  useEffect(() => {
    // Check for saved API key on initial load
    const savedKey = sessionStorage.getItem('gemini-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setIsModalOpen(true);
    }

    const loadFont = async () => {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/TTF/Vazirmatn-Regular.ttf');
        if (!response.ok) {
          throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
        }
        const fontBuffer = await response.arrayBuffer();
        const loadedFont = opentype.parse(fontBuffer);
        setFont(loadedFont);
      } catch (err) {
        console.error('Font could not be loaded: ', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setApiError(`خطای حیاتی: فونت برای تولید SVG بارگذاری نشد. ${errorMessage}. لطفاً صفحه را رفرش کنید.`);
      } finally {
        setIsFontLoading(false);
      }
    };

    loadFont();
  }, []);

  const handleSaveApiKey = (key: string) => {
    if (key.trim()) {
      setApiKey(key);
      sessionStorage.setItem('gemini-api-key', key);
      setIsModalOpen(false);
      setApiError(null);
    } else {
      setApiError("کلید API نمی‌تواند خالی باشد.");
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      setApiError("لطفاً ابتدا کلید API خود را وارد کنید.");
      setIsModalOpen(true);
      return;
    }
    if (!prompt.trim()) {
      setApiError("لطفاً یک پرامپت وارد کنید.");
      return;
    }
    
    setIsLoading(true);
    setApiError(null);
    setApiResponse(null);
    setLogMessages(['در حال آماده‌سازی درخواست...']);

    try {
      let svgCode: string | undefined = undefined;
      const { visualText } = identifyTextParts(prompt);
      
      if (visualText && font) {
        setLogMessages(prev => [...prev, 'متن بصری شناسایی شد، در حال تبدیل به SVG...']);
        svgCode = generateSvgFromText(visualText, font);
        setLogMessages(prev => [...prev, 'تبدیل به SVG با موفقیت انجام شد.']);
      } else if (visualText && !font) {
         setLogMessages(prev => [...prev, 'متن بصری شناسایی شد اما فونت بارگذاری نشده است. از روش استاندارد استفاده می‌شود.']);
      }

      setLogMessages(prev => [...prev, 'در حال ارسال درخواست به Gemini API...']);
      const result = await enhancePrompt(prompt, apiKey, svgCode);
      
      setLogMessages(prev => [...prev, 'پاسخ دریافت شد، در حال پردازش...']);
      setApiResponse(result);
      setLogMessages(prev => [...prev, 'پردازش با موفقیت انجام شد!']);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'یک خطای ناشناخته رخ داد.';
      setApiError(`خطا: ${errorMessage}`);
      setLogMessages(prev => [...prev, 'عملیات با خطا مواجه شد.']);
    } finally {
        setIsLoading(false);
    }
  }, [prompt, font, apiKey]);
  
  return (
    <div className="bg-gray-900 text-gray-200">
      <div className={`min-h-screen transition-filter duration-300 ${isModalOpen ? 'filter blur-sm' : ''}`}>
        <header className="bg-gradient-to-l from-purple-900 via-indigo-900 to-blue-900 p-6 shadow-lg text-center relative">
          <h1 className="text-4xl font-bold text-white drop-shadow-md">SHΞN™ Prompt Engineer</h1>
          <p className="text-lg text-indigo-200 mt-2">ابزار جامع بهینه‌سازی پرامپت برای هوش مصنوعی</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="absolute top-4 right-4 text-indigo-200 hover:text-white transition-colors"
            aria-label="تنظیمات کلید API"
            title="تنظیمات کلید API"
          >
            <SettingsIcon className="w-8 h-8"/>
          </button>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6">
            <InputSection 
              prompt={prompt} 
              setPrompt={setPrompt}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              isFontLoading={isFontLoading}
            />

            {isLoading && <Logger messages={logMessages} />}

            {apiError && <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">{apiError}</div>}
            
            {apiResponse && <OutputSection response={apiResponse} />}

          </div>
        </main>
        
        <footer className="text-center py-6 text-gray-500">
          <a href="https://t.me/shervini" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
            Exclusive SHΞN™ made
          </a>
        </footer>
      </div>
      <ApiKeyModal
        isOpen={isModalOpen}
        onClose={() => { if (apiKey) setIsModalOpen(false); }}
        onSave={handleSaveApiKey}
      />
    </div>
  );
};

export default App;