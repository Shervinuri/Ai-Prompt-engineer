import React, { useState } from 'react';
import { CopyIcon, DownloadIcon, CheckIcon } from './icons';

interface OutputBoxProps {
  title: string;
  content: string;
  fileName: string;
  isJson?: boolean;
  isCode?: boolean;
}

const OutputBox: React.FC<OutputBoxProps> = ({ title, content, fileName, isJson = false, isCode = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: isJson ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formattedContent = (() => {
    if (!isJson || !content) {
      return content;
    }
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return content; // Return raw content if parsing fails
    }
  })();
  
  const codeContainer = (
    <pre className="p-4 text-sm text-gray-300 overflow-auto whitespace-pre-wrap break-words flex-grow">
      <code className="text-left" dir="ltr">{formattedContent}</code>
    </pre>
  );

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex flex-col h-full">
      <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700">
        <h3 className="text-md font-semibold text-indigo-300">{title}</h3>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors" title="کپی کردن">
            {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
          </button>
          <button onClick={handleDownload} className="text-gray-400 hover:text-white transition-colors" title="دانلود">
            <DownloadIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      {isCode ? codeContainer : <div className="p-4 text-sm text-gray-300 overflow-auto">{formattedContent}</div>}
    </div>
  );
};

export default OutputBox;
