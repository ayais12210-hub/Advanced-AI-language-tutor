import { Type } from '@google/genai';

export { Type }; // Re-export for convenience

export interface Language {
  code: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
  sources?: GroundingChunk[];
}

export type TutorStyle = 'Standard' | 'Patient' | 'Concise';
export type ConversationMode = 'Fast' | 'Smart' | 'Genius';


export type FeatureId = 
  | 'chat'
  | 'translator'
  | 'lessons'
  | 'learningHub' // Renamed from masteryHub
  | 'liveConvo'
  | 'tts'
  | 'imageGen'
  | 'imageEdit'
  | 'videoGen'
  | 'grounding'
  | 'contentAnalyzer';

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

// For the new onboarding flow
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Fluent';
export type UserGoal = 'Travel' | 'Career' | 'School' | 'Connect' | 'Brain Training' | 'Cultural Immersion';
export type UserInterest = 'Technology' | 'Food' | 'Art & Culture' | 'Sports' | 'Science' | 'History' | 'Movies & TV' | 'Music';


// Expanded LessonType for both Lessons and Mastery Hub
export type LessonType = 
  // Original Lesson Types
  'alphabet' | 'numbers' | 'colors' | 'phrases' | 'grammar' | 'quiz' | 
  'nouns' | 'vowels' | 'consonants' | 'sentenceScramble' |

  // New Mastery Hub Types
  'phonetics' | 'highFrequencyVocab' | 'essentialGrammar' | 'comprehensionCore' | 'speakingFundamentals' |
  'extendedVocab' | 'intermediateGrammar' | 'listeningForMeaning' | 'conversationalPatterns' | 'culturalCompetence' |
  'readingMastery' | 'writingCompetence' | 'pronunciationRefinement' | 'idiomaticMastery' | 'cognitiveFlexibility' |
  'linguisticNuance' | 'culturalImmersion' | 'creativeExpression' | 'sociolinguisticAwareness' | 'selfIdentityIntegration' |
  'etymology' | 'comparativeLinguistics' | 'linguisticPhilosophy' | 'languageMaintenance' | 'polyglotSystems';


// For the original Lessons feature
export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  description: string;
}

export interface Unit {
  id: string;
  title:string;
  description: string;
  lessons: Lesson[];
}

export type LessonStatus = 'locked' | 'active' | 'completed';


// For the new Mastery Hub feature
export interface MasteryLevel {
  id: string;
  tierId: number;
  title: string;
  description: string;
  type: LessonType;
  xp: number;
}

export interface MasteryTier {
  id: number;
  title: string;
  description: string;
  levels: MasteryLevel[];
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  achievements: string[];
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