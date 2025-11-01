import React, { useState, useEffect, useCallback } from 'react';
import { Language, ExperienceLevel, FeatureId, ModelId, ThinkingPreset, TtsProvider, SttProvider } from './types';
import { languages } from './languages';

// A custom hook to manage state with localStorage persistence
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(`linguamate_setting_${key}`);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(`linguamate_setting_${key}`, JSON.stringify(state));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }, [key, state]);

    return [state, setState];
}


// --- PROPS INTERFACE ---
interface SettingsProps {
    nativeLanguage: Language;
    learningLanguage: Language;
    experienceLevel: ExperienceLevel;
    setNativeLanguage: (language: Language) => void;
    setLearningLanguage: (language: Language) => void;
    setExperienceLevel: (level: ExperienceLevel) => void;
    setActiveFeature: (feature: FeatureId) => void;
    globalModel: ModelId;
    setGlobalModel: (model: ModelId) => void;
    thinkingPreset: ThinkingPreset;
    setThinkingPreset: (preset: ThinkingPreset) => void;
    ttsProvider: TtsProvider;
    setTtsProvider: (provider: TtsProvider) => void;
    sttProvider: SttProvider;
    setSttProvider: (provider: SttProvider) => void;
}

// --- ICONS ---
const ProgressIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>);
const StreakIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-orange-400"><path fillRule="evenodd" d="M11.292 2.238a.75.75 0 01.445 1.283l-2.913 8.743a.75.75 0 01-1.46-.484l2.913-8.743a.75.75 0 011.015-.799zM6.03 7.238a.75.75 0 01.445 1.283l-1.456 4.368a.75.75 0 01-1.46-.484l1.456-4.368a.75.75 0 011.015-.799zm8.485 0a.75.75 0 011.015.8l-1.456 4.368a.75.75 0 11-1.46-.484l1.456-4.368a.75.75 0 01.445-1.283z" clipRule="evenodd" /></svg>);
const LanguageIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path d="M7.5 2.75A2.75 2.75 0 004.75 5.5v1.5a.75.75 0 001.5 0v-1.5a1.25 1.25 0 011.25-1.25h1.5a.75.75 0 000-1.5h-1.5z" /><path d="M12.5 2.75a.75.75 0 000 1.5h1.5A1.25 1.25 0 0115.25 7v1.5a.75.75 0 001.5 0v-1.5A2.75 2.75 0 0014 2.75h-1.5z" /><path d="M2.75 12.5a.75.75 0 00-1.5 0v1.5A2.75 2.75 0 004 18.25h1.5a.75.75 0 000-1.5h-1.5A1.25 1.25 0 014.75 14v-1.5z" /><path d="M15.25 12.5a.75.75 0 00-1.5 0v1.5a1.25 1.25 0 01-1.25 1.25h-1.5a.75.75 0 000 1.5h1.5A2.75 2.75 0 0017.25 14v-1.5z" /><path d="M10 8.25a.75.75 0 01.75.75v2a.75.75 0 01-1.5 0v-2a.75.75 0 01.75-.75zM5.25 10a.75.75 0 000 1.5h9.5a.75.75 0 000-1.5h-9.5z" clipRule="evenodd" /></svg>);
const GlobeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.75 7.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H4.75z" clipRule="evenodd" /></svg>);
const DailyGoalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 3.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" /><path d="M8.05 10.94a.75.75 0 11-1.06-1.06l4.25-4.25a.75.75 0 011.062.002l4.25 4.25a.75.75 0 11-1.06 1.06L12 7.56l-2.89 2.89a.75.75 0 01-1.06-.001z" /></svg>);
const DifficultyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.665l3-3z" /><path d="M8.6 8.6a.75.75 0 00-1.06 0l-1.225 1.224a2.5 2.5 0 003.536 3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a1 1 0 11-1.414-1.414l1.224-1.224a.75.75 0 000-1.06zM10.828 10.828a.75.75 0 00-1.06-1.06l-3 3a2.5 2.5 0 003.535 3.536l3-3a2.5 2.5 0 00-.141-3.665.75.75 0 00-.978 1.138 1 1 0 01.057 1.466l-3 3a1 1 0 11-1.414-1.414l3-3z" /></svg>);
const AutoAdaptIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10.832 2.622a.75.75 0 01.836.368l1.42 2.871 3.178 .46a.75.75 0 01.416 1.28l-2.3 2.242.543 3.165a.75.75 0 01-1.088.79l-2.842-1.494-2.843 1.494a.75.75 0 01-1.087-.79l.543-3.165-2.3-2.242a.75.75 0 01.416-1.28l3.178-.46 1.42-2.87a.75.75 0 01.836-.369z" clipRule="evenodd" /></svg>);
const SoundIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path d="M10 2.5a.75.75 0 01.75.75v13.5a.75.75 0 01-1.5 0V3.25A.75.75 0 0110 2.5zM3.5 6.25a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5zM16.5 6.25a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5z" /></svg>);
const HapticIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M1.5 8.356A3.483 3.483 0 012.72 6.03l.36-.622a.75.75 0 011.299.75l-.36.623a2.002 2.002 0 00-1.12 2.574l.01.018a.75.75 0 01-1.07 1.052l-.01-.018A3.502 3.502 0 011.5 8.356zm17 0a3.483 3.483 0 00-1.22-2.326l-.36-.622a.75.75 0 10-1.3.75l.36.623a2.002 2.002 0 011.12 2.574l-.01.018a.75.75 0 101.07 1.052l.01-.018A3.502 3.502 0 0018.5 8.356zM5.503 3.82a.75.75 0 01.75 1.3l-1.02 1.767a2 2 0 001.733 3.003l.017.001a.75.75 0 01.003 1.5l-.017.001a3.5 3.5 0 01-3.033-5.255l1.02-1.767a.75.75 0 011.3 0zm9.994 0a.75.75 0 00-.75 1.3l1.02 1.767a2 2 0 01-1.733 3.003l-.017.001a.75.75 0 00-.003 1.5l.017.001a3.5 3.5 0 003.033-5.255l-1.02-1.767a.75.75 0 00-1.3 0z" clipRule="evenodd" /></svg>);
const AutoplayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.89a1.5 1.5 0 000-2.54L6.3 2.84z" /></svg>);
const NotificationIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.657 1.085h13.2a.75.75 0 00.656-1.085A13.43 13.43 0 0116 8a6 6 0 00-6-6zM8.25 16.5a1.75 1.75 0 103.5 0h-3.5z" clipRule="evenodd" /></svg>);
const TimeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 001.5-.06l-.3-7.5zm8.25-.22a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 01-1.06-1.06l2.25-2.25a.75.75 0 01.82.53z" clipRule="evenodd" /></svg>);
const DataIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path d="M10 2a.75.75 0 01.75.75v.518a3 3 0 000 5.464V10.5a.75.75 0 01-1.5 0v-1.768a3 3 0 000-5.464V2.75A.75.75 0 0110 2z" /><path d="M10 4a2 2 0 100 4 2 2 0 000-4zM7.25 7.25a.75.75 0 00-1.5 0v.518a3 3 0 010 5.464V15a.75.75 0 001.5 0v-1.768a3 3 0 010-5.464V7.25z" /><path d="M6 9a2 2 0 114 0 2 2 0 01-4 0zM12.75 7.25a.75.75 0 011.5 0v.518a3 3 0 000 5.464V15a.75.75 0 01-1.5 0v-1.768a3 3 0 000-5.464V7.25z" /><path d="M14 9a2 2 0 10-4 0 2 2 0 004 0z" /></svg>);
const ResetIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201-4.42 5.5 5.5 0 011.026-1.317.75.75 0 011.23.873A4 4 0 1013.5 10.5a.75.75 0 01.996.12.75.75 0 01-.11 1.045 5.501 5.501 0 01-3.256-.241zM11.69 4.83a.75.75 0 01-1.23-.873A5.5 5.5 0 0113.799 9.1a.75.75 0 01-1.26-.782 4.002 4.002 0 00-2.316-2.583.75.75 0 01-.318-.842zM4.688 8.576a5.5 5.5 0 019.201 4.42 5.5 5.5 0 01-1.026 1.317.75.75 0 11-1.23-.873A4 4 0 106.5 9.5a.75.75 0 01-.996-.12.75.75 0 01.11-1.045 5.501 5.501 0 013.256.241z" clipRule="evenodd" /></svg>);
const LegalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0015.5 2h-11zM10 4a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 4zM8.75 8.25a.75.75 0 01.75-.75h1a.75.75 0 010 1.5h-1a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9.5z" clipRule="evenodd" /></svg>);
const HelpIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.061l2.5-2.5a.75.75 0 011.06 0l2.5 2.5a.75.75 0 11-1.06 1.06L12 5.31v5.438a.75.75 0 01-1.5 0V5.31L8.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>);
const VersionIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10 2c-1.717 0-3.417.345-5.025.975A.75.75 0 004.25 4.5a.75.75 0 00.75-.75 6.5 6.5 0 0110 0 .75.75 0 00.75.75.75.75 0 00.725-1.275A8 8 0 0010 2zM4.017 6.44a.75.75 0 01.566-.02l3.431 1.47a.75.75 0 010 1.299l-3.43 1.47a.75.75 0 11-.532-1.402l2.36-1.012-2.36-1.012a.75.75 0 01-.034-1.278zm11.966 0a.75.75 0 00-.566-.02L11.986 7.43a.75.75 0 000 1.299l3.43 1.47a.75.75 0 10.532-1.402l-2.36-1.012 2.36-1.012a.75.75 0 00.034-1.278zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15z" clipRule="evenodd" /></svg>);
const BrainIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M6.25 8.75a.75.75 0 00-1.5 0v2.5A.75.75 0 006.25 12h1.5a.75.75 0 000-1.5h-1.5v-1.75z" clipRule="evenodd" /><path d="M5.002 4.5h9.996a3.5 3.5 0 013.5 3.5v3.496a3.5 3.5 0 01-3.5 3.5H5.002a3.5 3.5 0 01-3.5-3.5V8a3.5 3.5 0 013.5-3.5zM1.502 8a2 2 0 012-2h9.996a2 2 0 012 2v3.496a2 2 0 01-2 2H3.502a2 2 0 01-2-2V8z" /><path fillRule="evenodd" d="M12.25 8.75a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z" clipRule="evenodd" /></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.25 7.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" /></svg>);
const MicIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 8.5A.5.5 0 016 8v2a4 4 0 008 0V8a.5.5 0 011 0v2a5 5 0 01-10 0V8a.5.5 0 01.5-.5z" /><path d="M10 18a.5.5 0 00.5-.5v-2.09a7.002 7.002 0 004.896-6.108.5.5 0 00-.992-.123A6.002 6.002 0 0110 14c-2.33 0-4.32-1.32-5.404-3.321a.5.5 0 00-.992.123A7.002 7.002 0 009.5 15.41V17.5a.5.5 0 00.5.5z" /></svg>);

// --- MODEL DEFINITIONS ---
const models = {
    'Google': [
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    ],
    'OpenAI (simulated)': [
        { id: 'gpt-5', name: 'GPT-5' },
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'gpt-4.1', name: 'GPT-4.1 (Legacy)' },
        { id: 'o3', name: 'o3 (Legacy)' },
        { id: 'o4-mini', name: 'o4-mini (Legacy)' },
    ],
    'Anthropic (simulated)': [
        { id: 'claude-opus-4.1', name: 'Opus 4.1' },
        { id: 'claude-sonnet-4.5', name: 'Sonnet 4.5' },
        { id: 'claude-haiku-4.5', name: 'Haiku 4.5' },
        { id: 'claude-opus-4', name: 'Opus 4 (Legacy)' },
        { id: 'claude-sonnet-4', name: 'Sonnet 4 (Legacy)' },
        { id: 'claude-sonnet-3.7', name: 'Sonnet 3.7 (Legacy)' },
        { id: 'claude-opus-3', name: 'Opus 3 (Legacy)' },
        { id: 'claude-haiku-3.5', name: 'Haiku 3.5 (Legacy)' },
    ]
};

const thinkingPresets = [
    { id: 'auto', name: 'Auto - Decides how long to think' },
    { id: 'instant', name: 'Instant - Answers right away' },
    { id: 'mini', name: 'Thinking mini - Thinks quickly' },
    { id: 'thinking', name: 'Thinking - Thinks longer for better answers' },
];

// --- MAIN COMPONENT ---
const Settings: React.FC<SettingsProps> = ({
    nativeLanguage, learningLanguage, experienceLevel,
    setNativeLanguage, setLearningLanguage, setExperienceLevel,
    setActiveFeature,
    globalModel, setGlobalModel,
    thinkingPreset, setThinkingPreset,
    ttsProvider, setTtsProvider,
    sttProvider, setSttProvider,
}) => {
    // Component-level state for settings that might not be in App.tsx
    const [dailyGoal, setDailyGoal] = usePersistentState('dailyGoal', 15);
    const [autoAdaptDifficulty, setAutoAdaptDifficulty] = usePersistentState('autoAdaptDifficulty', true);
    const [soundEffects, setSoundEffects] = usePersistentState('soundEffects', true);
    const [hapticFeedback, setHapticFeedback] = usePersistentState('hapticFeedback', true);
    const [autoplayAudio, setAutoplayAudio] = usePersistentState('autoplayAudio', false);
    const [notificationsEnabled, setNotificationsEnabled] = usePersistentState('notificationsEnabled', true);
    const [reminderTime, setReminderTime] = usePersistentState('reminderTime', '19:00');
    
    // Handlers for language changes
    const handleNativeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = languages.find(l => l.code === e.target.value);
        if (lang) {
            if (lang.code === learningLanguage.code) setLearningLanguage(nativeLanguage);
            setNativeLanguage(lang);
        }
    };
    const handleLearningChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = languages.find(l => l.code === e.target.value);
        if (lang) {
            if (lang.code === nativeLanguage.code) setNativeLanguage(learningLanguage);
            setLearningLanguage(lang);
        }
    };
    const handleExperienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setExperienceLevel(e.target.value as ExperienceLevel);
    };

    // Placeholder data for stats
    const stats = {
        lessonsCompleted: 42,
        wordsLearned: 312,
        currentStreak: 12,
    };

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <header>
                <h1 className="text-4xl font-heading font-bold tracking-tight">Settings</h1>
                <p className="text-text-secondary mt-2 text-lg">Customize your Linguamate.ai experience.</p>
            </header>

            <main className="flex-1 overflow-y-auto mt-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    
                    {/* User Profile & Stats */}
                    <SettingsSection title="Profile & Progress" description="View your achievements and manage your profile.">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-background-tertiary p-4 rounded-lg flex items-center gap-3">
                                <ProgressIcon />
                                <div>
                                    <p className="text-sm text-text-secondary">Lessons Completed</p>
                                    <p className="font-bold text-lg">{stats.lessonsCompleted}</p>
                                </div>
                            </div>
                            <div className="bg-background-tertiary p-4 rounded-lg flex items-center gap-3">
                                <LanguageIcon />
                                <div>
                                    <p className="text-sm text-text-secondary">Words Learned</p>
                                    <p className="font-bold text-lg">{stats.wordsLearned}</p>
                                </div>
                            </div>
                            <div className="bg-background-tertiary p-4 rounded-lg flex items-center gap-3">
                                <StreakIcon />
                                <div>
                                    <p className="text-sm text-text-secondary">Current Streak</p>
                                    <p className="font-bold text-lg">{stats.currentStreak} days</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-4">
                            <button className="flex-1 bg-background-tertiary text-text-primary font-semibold py-2 px-4 rounded-lg hover:bg-background-tertiary/70">Edit Profile</button>
                            <button className="flex-1 bg-background-tertiary text-text-primary font-semibold py-2 px-4 rounded-lg hover:bg-background-tertiary/70">View Achievements</button>
                        </div>
                    </SettingsSection>

                    {/* Learning Preferences */}
                    <SettingsSection title="Learning Preferences" description="Adjust how the app teaches you.">
                        <SettingsItem icon={<GlobeIcon />} title="Languages">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label htmlFor="native-lang" className="text-sm font-medium">I Speak</label>
                                    <select id="native-lang" value={nativeLanguage.code} onChange={handleNativeChange} className="w-full mt-1 bg-background-tertiary rounded-md p-2 text-sm focus:ring-1 focus:ring-accent-primary focus:outline-none">
                                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="learning-lang" className="text-sm font-medium">I'm Learning</label>
                                    <select id="learning-lang" value={learningLanguage.code} onChange={handleLearningChange} className="w-full mt-1 bg-background-tertiary rounded-md p-2 text-sm focus:ring-1 focus:ring-accent-primary focus:outline-none">
                                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </SettingsItem>
                        <SettingsItem icon={<DailyGoalIcon />} title="Daily Goal">
                            <div>
                                <input type="range" min="5" max="60" step="5" value={dailyGoal} onChange={e => setDailyGoal(Number(e.target.value))} className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer" />
                                <p className="text-sm text-right mt-1">{dailyGoal} minutes per day</p>
                            </div>
                        </SettingsItem>
                         <SettingsItem icon={<DifficultyIcon />} title="Experience Level">
                            <select value={experienceLevel} onChange={handleExperienceChange} className="w-full bg-background-tertiary rounded-md p-2 text-sm focus:ring-1 focus:ring-accent-primary focus:outline-none">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Fluent">Fluent</option>
                            </select>
                        </SettingsItem>
                        <SettingsItem icon={<AutoAdaptIcon />} title="Adaptive Learning">
                            <div className="flex justify-between items-center">
                                <p className="text-sm">Automatically adjust difficulty based on my performance</p>
                                <ToggleSwitch checked={autoAdaptDifficulty} onChange={setAutoAdaptDifficulty} />
                            </div>
                        </SettingsItem>
                    </SettingsSection>
                    
                     {/* AI Models & Voice */}
                    <SettingsSection title="AI Models & Voice" description="Configure the AI engines that power your learning experience.">
                        <SettingsItem icon={<BrainIcon />} title="Default Language Model">
                            <select value={globalModel} onChange={e => setGlobalModel(e.target.value as ModelId)} className="w-full bg-background-tertiary rounded-md p-2 text-sm focus:ring-1 focus:ring-accent-primary focus:outline-none">
                                {Object.entries(models).map(([provider, modelList]) => (
                                    <optgroup key={provider} label={provider}>
                                        {modelList.map(model => (
                                            <option key={model.id} value={model.id}>{model.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </SettingsItem>
                        
                        {globalModel === 'gpt-5' && (
                            <SettingsItem icon={<ClockIcon />} title="Thinking Time (for GPT-5)">
                                <select value={thinkingPreset} onChange={e => setThinkingPreset(e.target.value as ThinkingPreset)} className="w-full bg-background-tertiary rounded-md p-2 text-sm focus:ring-1 focus:ring-accent-primary focus:outline-none">
                                    {thinkingPresets.map(preset => (
                                        <option key={preset.id} value={preset.id}>{preset.name}</option>
                                    ))}
                                </select>
                            </SettingsItem>
                        )}

                        <SettingsItem icon={<SoundIcon />} title="Text-to-Speech (TTS) Voice">
                            <select value={ttsProvider} onChange={e => setTtsProvider(e.target.value as TtsProvider)} className="w-full bg-background-tertiary rounded-md p-2 text-sm focus:ring-1 focus:ring-accent-primary focus:outline-none">
                                <option value="Gemini">Gemini Voices</option>
                                <option value="ElevenLabs">ElevenLabs (Simulated)</option>
                            </select>
                        </SettingsItem>
                        <SettingsItem icon={<MicIcon />} title="Speech-to-Text (STT) Engine">
                            <select value={sttProvider} onChange={e => setSttProvider(e.target.value as SttProvider)} className="w-full bg-background-tertiary rounded-md p-2 text-sm focus:ring-1 focus:ring-accent-primary focus:outline-none">
                                <option value="Gemini">Gemini (Live API)</option>
                                <option value="Whisper">Whisper (Simulated)</option>
                                <option value="Deepgram">Deepgram (Simulated)</option>
                            </select>
                            <p className="text-xs text-text-secondary mt-1">All STT is powered by Gemini for real-time performance.</p>
                        </SettingsItem>
                    </SettingsSection>

                    {/* Audio & Haptics */}
                    <SettingsSection title="Audio & Haptics" description="Manage sound and feedback settings.">
                        <SettingsItem icon={<SoundIcon />} title="Sound Effects">
                            <ToggleSwitch checked={soundEffects} onChange={setSoundEffects} />
                        </SettingsItem>
                        <SettingsItem icon={<HapticIcon />} title="Haptic Feedback">
                            <ToggleSwitch checked={hapticFeedback} onChange={setHapticFeedback} />
                        </SettingsItem>
                        <SettingsItem icon={<AutoplayIcon />} title="Autoplay Audio">
                            <div className="flex justify-between items-center">
                                <p className="text-sm">Autoplay audio for new words and phrases in lessons</p>
                                <ToggleSwitch checked={autoplayAudio} onChange={setAutoplayAudio} />
                            </div>
                        </SettingsItem>
                    </SettingsSection>
                    
                     {/* Notifications */}
                    <SettingsSection title="Notifications" description="Stay on track with learning reminders.">
                        <SettingsItem icon={<NotificationIcon />} title="Push Notifications">
                            <ToggleSwitch checked={notificationsEnabled} onChange={setNotificationsEnabled} />
                        </SettingsItem>
                         <SettingsItem icon={<TimeIcon />} title="Daily Reminder">
                            <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} disabled={!notificationsEnabled}
                             className="w-full bg-background-tertiary rounded-md p-2 text-sm focus:ring-1 focus:ring-accent-primary focus:outline-none disabled:opacity-50" />
                        </SettingsItem>
                    </SettingsSection>

                    {/* Data & Privacy */}
                    <SettingsSection title="Data & Privacy" description="Manage your personal data and application settings.">
                        <SettingsItem icon={<DataIcon />} title="Export Progress">
                           <button className="w-full text-left text-sm text-accent-secondary hover:underline">Download my learning data</button>
                        </SettingsItem>
                        <SettingsItem icon={<ResetIcon />} title="Reset Progress">
                            <button className="w-full text-left text-sm text-red-400 hover:underline">Permanently delete all learning data</button>
                        </SettingsItem>
                        <SettingsItem icon={<LegalIcon />} title="Privacy Policy">
                            <button onClick={() => setActiveFeature('privacyPolicy')} className="w-full text-left text-sm text-accent-secondary hover:underline">View our privacy policy</button>
                        </SettingsItem>
                    </SettingsSection>

                    {/* About & Support */}
                    <SettingsSection title="About & Support" description="Get help and see application information.">
                         <SettingsItem icon={<HelpIcon />} title="Help & FAQ">
                            <button onClick={() => setActiveFeature('help')} className="w-full text-left text-sm text-accent-secondary hover:underline">Find answers to common questions</button>
                        </SettingsItem>
                        <SettingsItem icon={<VersionIcon />} title="App Version">
                           <p className="text-sm text-text-secondary">1.0.0 (Build 20240520)</p>
                        </SettingsItem>
                    </SettingsSection>

                </div>
            </main>
        </div>
    );
};

// --- SECTION & ITEM COMPONENTS ---
const SettingsSection: React.FC<{ title: string, description: string, children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-6">
        <h2 className="text-xl font-bold font-heading">{title}</h2>
        <p className="text-sm text-text-secondary mt-1 mb-4">{description}</p>
        <div className="space-y-4">{children}</div>
    </div>
);

const SettingsItem: React.FC<{ icon: React.ReactElement, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex flex-col sm:flex-row gap-4 items-start pt-4 border-t border-background-tertiary/50 first:border-t-0 first:pt-0">
        <div className="flex items-center gap-3 w-full sm:w-1/3">
            {icon}
            <h3 className="font-semibold">{title}</h3>
        </div>
        <div className="w-full sm:w-2/3">{children}</div>
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background-secondary ${
        checked ? 'bg-accent-primary' : 'bg-background-tertiary/70'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export default Settings;