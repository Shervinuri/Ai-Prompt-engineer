import React, { useState, useEffect } from 'react';
import type { GeminiResponse } from './services/types';
import OutputBox from './OutputBox';

interface OutputSectionProps {
  response: GeminiResponse;
}

const OutputSection: React.FC<OutputSectionProps> = ({ response }) => {
  const [txtContent, setTxtContent] = useState('');
  const [jsonContent, setJsonContent] = useState('');

  useEffect(() => {
    if (response) {
      const { generated_svg, ...restOfResponse } = response;
      const enhanced = restOfResponse.enhanced_prompt_en || '';
      const negative = restOfResponse.negative_prompt_en || '';
      
      setTxtContent(`${enhanced}\n--neg ${negative}`);
      setJsonContent(JSON.stringify(restOfResponse, null, 2));
    } else {
        // Clear content when response is null
        setTxtContent('');
        setJsonContent('');
    }
  }, [response]);

  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      {response.generated_svg && (
        <OutputBox
            title="کد SVG تولید شده (برای دقت در متن بصری)"
            content={response.generated_svg}
            fileName="generated_text.svg"
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OutputBox
            title="پرامپت نهایی (TXT)"
            content={txtContent}
            fileName="enhanced_prompt.txt"
        />
        <OutputBox
            title="پاسخ کامل (JSON)"
            content={jsonContent}
            fileName="full_response.json"
            isJson
        />
      </div>
    </div>
  );
};

export default OutputSection;