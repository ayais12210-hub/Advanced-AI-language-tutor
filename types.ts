import { Type } from '@google/genai';

export { Type }; // Re-export for convenience

export interface Language {
  code: string;
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export type FeatureId = 
  | 'chat'
  | 'translator'
  | 'liveConvo'
  | 'tts'
  | 'imageGen'
  | 'imageEdit'
  | 'videoGen'
  | 'grounding'
  | 'analyzer';

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
    // FIX: Changed placeAnswerSources from an array of objects to a single object to match SDK type.
    placeAnswerSources?: {
        // FIX: Made uri and title optional to match the SDK type where they might be missing.
        reviewSnippets?: {
            uri?: string;
            title?: string;
        }[]
    }
  };
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
export type VideoAspectRatio = "16:9" | "9:16";

// For the new advanced translator
export interface PronunciationAnalysis {
    text: string;
    ipa: string;
    syllables: string;
}

export interface TranslationAnalysis {
    professionalTranslation: string;
    translationConfidence: number; // 0-100
    sound: PronunciationAnalysis;
    meaning: string; 
    structure: string;
    learningProcess: string[];
    usage: string;
    advancedSummary: string;
    alternativeTranslations: string[];
}

// For the new advanced analyzer
export interface TextAnalysis {
    correctedText: string;
    keyFeedbackPoints: string[];
    sound: PronunciationAnalysis;
    meaningAnalysis: string;
    structureAnalysis: string;
    usageAnalysis: string;
    advancedSummary: string;
    alternativePhrasings: string[];
}


declare global {
  // Fix for: Subsequent property declarations must have the same type.
  // By declaring AIStudio in the global scope, we ensure there is only one
  // definition of this interface across the project, preventing type conflicts.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // webkitAudioContext is for Safari
    webkitAudioContext: typeof AudioContext;
    aistudio?: AIStudio;
  }
}