// This tells TypeScript that a global variable `opentype` exists
// and describes its shape, as it's loaded from a script tag.
// FIX: Wrapped opentype namespace in 'declare global' to make it accessible across all files.
declare global {
  namespace opentype {
    interface BoundingBox {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }
    interface Path {
      getBoundingBox(): BoundingBox;
      toPathData(decimalPlaces?: number): string;
    }
    interface Font {
      getPath(text: string, x: number, y: number, fontSize: number): Path;
    }
    function load(url: string, callback: (err: any, font?: Font) => void): void;
    function parse(buffer: ArrayBuffer): Font;
  }
}


export interface GeminiResponse {
  original_prompt_fa: string;
  analysis: {
    identified_dialogue: string;
    identified_visual_text: string;
  };
  processed_persian: {
    dialogue_with_diacritics: string;
    visual_text_clean: string;
  };
  enhanced_prompt_en: string;
  negative_prompt_en: string;
  generated_svg?: string;
}