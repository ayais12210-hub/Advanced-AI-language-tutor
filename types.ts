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
export type TtsProvider = 'Gemini' | 'ElevenLabs';
export type SttProvider = 'Gemini' | 'Whisper' | 'Deepgram';
export type ThinkingPreset = 'auto' | 'instant' | 'mini' | 'thinking';

export type ModelProvider = 'Auto' | 'Google' | 'OpenAI' | 'Anthropic';
export type ModelId = 
  // Auto
  | 'auto'
  // Google
  | 'gemini-2.5-pro' | 'gemini-2.5-flash'
  // OpenAI (simulated)
  | 'gpt-5' | 'gpt-4o' | 'gpt-4.1' | 'o3' | 'o4-mini'
  // Anthropic (simulated)
  | 'claude-opus-4.1' | 'claude-sonnet-4.5' | 'claude-haiku-4.5' | 'claude-opus-4' | 'claude-sonnet-4' | 'claude-sonnet-3.7' | 'claude-opus-3' | 'claude-haiku-3.5';

export type SubscriptionTier = 'Free' | 'Plus' | 'Pro' | 'Infinite';

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
  | 'contentAnalyzer'
  | 'settings'
  | 'help'
  | 'privacyPolicy'
  | 'profile'
  | 'premium';

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
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
  xp: number; // For gamification
}

export interface Unit {
  id:string;
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

// For gamification of the original Lessons feature
export interface UserLessonStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
}

// --- NEW/UPDATED TYPES FOR FUNCTIONAL PROFILE ---
export interface User {
    name: string;
    email: string;
    avatarInitial: string;
}

export interface JournalEntry {
    id: string;
    date: string;
    content: string;
}

export interface ProfileStats {
  totalChats: number;
  currentStreak: number;
  wordsLearned: number; // For now, let's tie this to completed lessons * a multiplier
  xpPoints: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji
  earned: boolean;
  earnedDate?: string;
}

export interface FriendActivity {
  id: string;
  friendName: string;
  friendAvatar: string;
  action: string;
  timestamp: string;
  xpGained: number;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string; // URL or emoji
  xp: number;
  level: number;
  streak: number;
  isCurrentUser?: boolean;
}

// --- NEW TYPES FOR CONTENT ANALYZER ---
export type SourceType = 'pdf' | 'audio' | 'website' | 'youtube' | 'text' | 'gdoc';

export interface Source {
  id: string;
  type: SourceType;
  title: string;
  content: string; // For text, URL summaries
  timestamp: string;
}

export interface Notebook {
  id: string;
  title: string;
  sources: Source[];
  createdAt: string;
  audioSummary?: string;
  audioData?: string; // base64 encoded
  textSummary?: string;
  keyPoints?: string;
  faq?: string;
  chatHistory?: ChatMessage[];
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