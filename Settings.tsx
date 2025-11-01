import React, { useState, useEffect, useCallback } from 'react';
import { Language, ExperienceLevel, FeatureId } from './types';
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
}

// --- ICONS ---
const ProgressIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>);
const StreakIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-orange-400"><path fillRule="evenodd" d="M11.292 2.238a.75.75 0 01.445 1.283l-2.913 8.743a.75.75 0 01-1.46-.484l2.913-8.743a.75.75 0 011.015-.799zM6.03 7.238a.75.75 0 01.445 1.283l-1.456 4.368a.75.75 0 01-1.46-.484l1.456-4.368a.75.75 0 011.015-.799zm8.485 0a.75.75 0 011.015.8l-1.456 4.368a.75.75 0 11-1.46-.484l1.456-4.368a.75.75 0 01.445-1.283z" clipRule="evenodd" /></svg>);
const LanguageIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path d="M7.5 2.75A2.75 2.75 0 004.75 5.5v1.5a.75.75 0 001.5 0v-1.5a1.25 1.25 0 011.25-1.25h1.5a.75.75 0 000-1.5h-1.5z" /><path d="M12.5 2.75a.75.75 0 000 1.5h1.5A1.25 1.25 0 0115.25 7v1.5a.75.75 0 001.5 0v-1.5A2.75 2.75 0 0014 2.75h-1.5z" /><path d="M2.75 12.5a.75.75 0 00-1.5 0v1.5A2.75 2.75 0 004 18.25h1.5a.75.75 0 000-1.5h-1.5A1.25 1.25 0 014.75 14v-1.5z" /><path d="M15.25 12.5a.75.75 0 00-1.5 0v1.5a1.25 1.25 0 01-1.25 1.25h-1.5a.75.75 0 000 1.5h1.5A2.75 2.75 0 0017.25 14v-1.5z" /><path d="M10 8.25a.75.75 0 01.75.75v2a.75.75 0 01-1.5 0v-2a.75.75 0 01.75-.75zM5.25 10a.75.75 0 000 1.5h9.5a.75.75 0 000-1.5h-9.5z" clipRule="evenodd" /></svg>);
const GlobeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.75 7.25a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H4.75z" clipRule="evenodd" /></svg>);
const DailyGoalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 3.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" /><path d="M8.05 10.94a.75.75 0 11-1.06-1.06l4.25-4.25a.75.75 0 011.062.002l4.25 4.25a.75.75 0 11-1.06 1.06L12 7.56l-2.89 2.89a.75.75 0 01-1.06-.001z" /></svg>);
const DifficultyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.665l3-3z" /><path d="M8.6 8.6a.75.75 0 00-1.06 0l-1.225 1.224a2.5 2.5 0 003.536 3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a1 1 0 11-1.414-1.414l1.224-1.224a.75.75 0 000-1.06zM10.828 10.828a.75.75 0 00-1.06-1.06l-3 3a2.5 2.5 0 003.535 3.536l3-3a2.5 2.5 0 00-.141-3.665.75.75 0 00-.978 1.138 1 1 0 01.057 1.466l-3 3a1 1 0 11-1.414-1.414l3-3z" /></svg>);
const AutoAdaptIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10.832 2.622a.75.75 0 01.836.368l1.42 2.871 3.178.46a.75.75 0 01.416 1.28l-2.3 2.242.543 3.165a.75.75 0 01-1.088.79l-2.842-1.494-2.843 1.494a.75.75 0 01-1.087-.79l.543-3.165-2.3-2.242a.75.75 0 01.416-1.28l3.178-.46 1.42-2.87a.75.75 0 01.836-.369z" clipRule="evenodd" /></svg>);
const SoundIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path d="M10 2.5a.75.75 0 01.75.75v13.5a.75.75 0 01-1.5 0V3.25A.75.75 0 0110 2.5zM3.5 6.25a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5zM16.5 6.25a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5z" /></svg>);
const HapticIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M1.5 8.356A3.483 3.483 0 012.72 6.03l.36-.622a.75.75 0 011.299.75l-.36.623a2.002 2.002 0 00-1.12 2.574l.01.018a.75.75 0 01-1.07 1.052l-.01-.018A3.502 3.502 0 011.5 8.356zm17 0a3.483 3.483 0 00-1.22-2.326l-.36-.622a.75.75 0 10-1.3.75l.36.623a2.002 2.002 0 011.12 2.574l-.01.018a.75.75 0 101.07 1.052l.01-.018A3.502 3.502 0 0018.5 8.356zM5.503 3.82a.75.75 0 01.75 1.3l-1.02 1.767a2 2 0 001.733 3.003l.017.001a.75.75 0 01.003 1.5l-.017.001a3.5 3.5 0 01-3.033-5.255l1.02-1.767a.75.75 0 011.3 0zm9.994 0a.75.75 0 00-.75 1.3l1.02 1.767a2 2 0 01-1.733 3.003l-.017.001a.75.75 0 00-.003 1.5l.017.001a3.5 3.5 0 003.033-5.255l-1.02-1.767a.75.75 0 00-1.3 0z" clipRule="evenodd" /></svg>);
const AutoplayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.89a1.5 1.5 0 000-2.54L6.3 2.84z" /></svg>);
const BellIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.91 32.91 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.5 16.5a1.5 1.5 0 103 0h-3z" clipRule="evenodd" /></svg>);
const ReminderIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>);
const MoonIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M7.455 2.164A8.949 8.949 0 0110 2c4.43 0 8.148 3.168 8.854 7.234a.75.75 0 01-1.42.238A7.499 7.499 0 0010 3.5c-3.322 0-6.142 2.175-7.146 5.164A.75.75 0 011.25 8 9 9 0 007.455 2.164z" clipRule="evenodd" /></svg>);
const AppIconIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zM10 8a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 8zM8.25 9.5a.75.75 0 00-1.5 0v1a.75.75 0 001.5 0v-1zM13.25 9.5a.75.75 0 00-1.5 0v1a.75.75 0 001.5 0v-1z" clipRule="evenodd" /></svg>);
const SyncIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M15.312 11.342a1.25 1.25 0 01-1.25-1.25V6.36l-1.054.351a.75.75 0 01-.83-1.498l2.5-1.75a.75.75 0 01.954.088l1.75 2.5a.75.75 0 11-1.22.862l-1.07-1.528v3.73a1.25 1.25 0 01-1.25 1.25zM4.688 8.658a1.25 1.25 0 011.25 1.25v3.73l1.07-1.528a.75.75 0 111.22.862l-1.75 2.5a.75.75 0 01-.954.088l-2.5-1.75a.75.75 0 01.83-1.498l1.054.351V9.908a1.25 1.25 0 011.25-1.25z" clipRule="evenodd" /></svg>);
const ExportIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" /><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" /></svg>);
const ResetIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.046A12.004 12.004 0 0010 18.75a12.004 12.004 0 006.002-12.603l.15-.047a.75.75 0 10.23-1.482A13.455 13.455 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clipRule="evenodd" /></svg>);
const HelpIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.44a.75.75 0 011.06 0l.06.06a.75.75 0 010 1.06l-.06.06a.75.75 0 01-1.06 0l-.06-.06a.75.75 0 010-1.06l.06-.06zM10 11a.75.75 0 01.75.75v2a.75.75 0 01-1.5 0v-2A.75.75 0 0110 11z" clipRule="evenodd" /></svg>);
const SupportIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" /><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" /></svg>);
const RateIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.215-.662 1.536 0l1.681 3.462 3.815.554c.734.107 1.028.99.494 1.512l-2.762 2.69.652 3.8c.125.728-.635 1.285-1.28.944l-3.41-1.792-3.41 1.792c-.645.341-1.405-.216-1.28-.944l.652-3.8-2.762-2.69c-.534-.522-.24-1.405.494-1.512l3.815-.554 1.681-3.462z" clipRule="evenodd" /></svg>);
const PrivacyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-text-secondary"><path fillRule="evenodd" d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.023 3.483a.75.75 0 01.755.034l1.22 1.22a.75.75 0 01-1.06 1.06l-1.22-1.22A.75.75 0 015.023 3.483zm9.904 0a.75.75 0 00-.755.034l-1.22 1.22a.75.75 0 101.06 1.06l1.22-1.22a.75.75 0 00-.034-.755zM10 4a6 6 0 100 12 6 6 0 000-12zM3.483 5.023a.75.75 0 00-.034.755l1.22 1.22a.75.75 0 101.06-1.06l-1.22-1.22a.75.75 0 00-.755-.034zM16.517 5.023a.75.75 0 01.034.755l-1.22 1.22a.75.75 0 11-1.06-1.06l1.22-1.22a.75.75 0 01.755.034zM1.75 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM15.25 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM5.023 16.517a.75.75 0 00.755-.034l1.22-1.22a.75.75 0 10-1.06-1.06l-1.22 1.22a.75.75 0 00.034.755zm9.904 0a.75.75 0 01-.755-.034l-1.22-1.22a.75.75 0 111.06-1.06l1.22 1.22a.75.75 0 01.034.755zM10 18.25a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>);
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-secondary/70"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>


// --- HELPER COMPONENTS ---
const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-sm font-bold text-text-secondary/80 uppercase tracking-wider mb-2 px-2">{title}</h2>
        <div className="bg-background-secondary rounded-lg border border-background-tertiary/50">
            {React.Children.toArray(children).map((child, index, arr) => (
                <React.Fragment key={index}>
                    {child}
                    {index < arr.length - 1 && <hr className="border-background-tertiary/50" />}
                </React.Fragment>
            ))}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => {
    return (
        <button
            type="button" role="switch" aria-checked={checked} onClick={() => !disabled && onChange(!checked)} disabled={disabled}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background-secondary ${checked ? 'bg-accent-primary' : 'bg-background-tertiary/70'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
            <span aria-hidden="true" className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );
};

interface SettingsItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    value?: string;
    control?: React.ReactNode;
    onClick?: () => void;
    titleColor?: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon, title, subtitle, value, control, onClick, titleColor }) => {
    const content = (
        <>
            <div className="w-6 flex justify-center items-center">{icon}</div>
            <div className="flex-1">
                <p className={`font-medium ${titleColor || 'text-text-primary'}`}>{title}</p>
                {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
            </div>
            {value && <p className="text-text-secondary font-medium">{value}</p>}
            {control}
            {onClick && !control && <ChevronRightIcon />}
        </>
    );

    const commonProps = {
        className: "w-full flex items-center gap-4 p-3 text-left transition-colors rounded-lg hover:bg-background-tertiary/50"
    };

    return onClick ? (
        <button onClick={onClick} {...commonProps}>
            {content}
        </button>
    ) : (
        <div {...commonProps}>
            {content}
        </div>
    );
};


// --- MAIN SETTINGS COMPONENT ---
const Settings: React.FC<SettingsProps> = ({ nativeLanguage, learningLanguage, experienceLevel, setNativeLanguage, setLearningLanguage, setExperienceLevel, setActiveFeature }) => {
    // States for toggles and values, persisted in localStorage
    const [dailyProgress, setDailyProgress] = usePersistentState('dailyProgress', 5);
    const [dailyGoal, setDailyGoal] = usePersistentState('dailyGoal', 15);
    const [streak, setStreak] = usePersistentState('streak', 1);
    const [autoAdapt, setAutoAdapt] = usePersistentState('autoAdapt', false);
    const [soundEffects, setSoundEffects] = usePersistentState('soundEffects', true);
    const [hapticFeedback, setHapticFeedback] = usePersistentState('hapticFeedback', false);
    const [autoPlayAudio, setAutoPlayAudio] = usePersistentState('autoPlayAudio', false);
    const [pushNotifications, setPushNotifications] = usePersistentState('pushNotifications', true);
    const [reminderTime, setReminderTime] = usePersistentState('reminderTime', '7:00 PM');
    const [lightMode, setLightMode] = usePersistentState('lightMode', false);
    const [appIcon, setAppIcon] = usePersistentState('appIcon', 'Default');
    const [isSyncing, setIsSyncing] = useState(false);

    const progressPercentage = Math.min((dailyProgress / dailyGoal) * 100, 100);

    // --- INTERACTIVE HANDLERS ---
    const handleSetDailyGoal = () => {
        const newGoal = prompt('Set your new daily goal in minutes:', String(dailyGoal));
        const newGoalNum = Number(newGoal);
        if (newGoal && !isNaN(newGoalNum) && newGoalNum > 0) {
            setDailyGoal(newGoalNum);
        } else if (newGoal) {
            alert('Please enter a valid number of minutes.');
        }
    };

    const handleSetDifficulty = () => {
        const levels: ExperienceLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Fluent'];
        const newLevel = prompt(`Set new difficulty level (${levels.join(', ')}):`, experienceLevel);
        if (newLevel && levels.includes(newLevel as ExperienceLevel)) {
            setExperienceLevel(newLevel as ExperienceLevel);
        } else if (newLevel) {
            alert('Invalid level selected.');
        }
    };
    
    const handleSetReminder = () => {
        const newTime = prompt('Set your daily reminder time (e.g., 8:00 PM):', reminderTime);
        if (newTime) setReminderTime(newTime);
    };

    const handleSetAppIcon = () => {
        const newIcon = prompt('Choose an app icon (e.g., Default, Minimalist, Vivid):', appIcon);
        if(newIcon) setAppIcon(newIcon);
    };
    
    const handleSyncData = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            alert('Progress Synced!');
        }, 1500);
    };

    const handleExportData = () => {
        const allSettings = Object.keys(localStorage)
            .filter(key => key.startsWith('linguamate_setting_'))
            .reduce((obj, key) => {
                obj[key.replace('linguamate_setting_', '')] = JSON.parse(localStorage.getItem(key) || 'null');
                return obj;
            }, {} as Record<string, any>);
            
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allSettings, null, 2));
        const downloadNode = document.createElement('a');
        downloadNode.setAttribute("href", dataStr);
        downloadNode.setAttribute("download", "linguamate_settings.json");
        document.body.appendChild(downloadNode);
        downloadNode.click();
        downloadNode.remove();
    };

    const handleResetProgress = () => {
        if (confirm('Are you sure you want to reset all settings and progress? This action cannot be undone.')) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('linguamate_setting_')) {
                    localStorage.removeItem(key);
                }
            });
            window.location.reload();
        }
    };
    
    // Effect to handle light/dark mode theme switching
    useEffect(() => {
        const styleId = 'light-mode-styles';
        let styleElement = document.getElementById(styleId);

        if (lightMode) {
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }
            styleElement.innerHTML = `
                .light-mode.bg-background-primary { background-color: #f4f4f5 !important; }
                .light-mode .text-text-primary { color: #18181b !important; }
                .light-mode .bg-background-secondary, .light-mode .bg-background-secondary\\/50 { background-color: #fafafa !important; }
                .light-mode .text-text-secondary, .light-mode .text-text-secondary\\/80 { color: #52525b !important; }
                .light-mode .bg-background-tertiary { background-color: #e4e4e7 !important; }
                .light-mode .border-background-tertiary\\/50 { border-color: #d4d4d8 !important; }
                .light-mode .hover\\:bg-background-tertiary\\/50:hover { background-color: #e4e4e7 !important; }
                .light-mode .text-red-500 { color: #ef4444 !important; }
            `;
        } else {
            if (styleElement) {
                styleElement.remove();
            }
        }
    }, [lightMode]);


    return (
        <div className={`h-full overflow-y-auto bg-background-primary text-text-primary p-4 sm:p-6 md:p-8 ${lightMode ? 'light-mode' : ''}`}>
            <header className="mb-8">
                <h1 className="text-4xl font-heading font-bold tracking-tight">Settings</h1>
            </header>

            <main className="max-w-3xl mx-auto">
                <SettingsSection title="Progress">
                    <SettingsItem icon={<ProgressIcon />} title="Today's Progress" subtitle={`${dailyProgress} of ${dailyGoal} minutes`} control={<div className="w-24"><div className="w-full bg-background-tertiary rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}/></div></div>} />
                    <SettingsItem icon={<StreakIcon />} title="Learning Streak" value={`${streak} day${streak > 1 ? 's' : ''}`} />
                </SettingsSection>

                <SettingsSection title="Learning Preferences">
                    <SettingsItem icon={<LanguageIcon />} title="Learning Language" subtitle="Language you want to learn" value={learningLanguage.name} onClick={() => alert('This would navigate to the language selection screen.')} />
                    <SettingsItem icon={<GlobeIcon />} title="Native Language" subtitle="Your native language for translations" value={nativeLanguage.name} onClick={() => alert('This would navigate to the language selection screen.')} />
                    <SettingsItem icon={<DailyGoalIcon />} title="Daily Goal" subtitle="Consistent practice" value={`${dailyGoal} minutes/day`} onClick={handleSetDailyGoal} />
                    <SettingsItem icon={<DifficultyIcon />} title="Difficulty Level" subtitle="Building foundations" value={experienceLevel} onClick={handleSetDifficulty} />
                    <SettingsItem icon={<AutoAdaptIcon />} title="Auto-Adapt Difficulty" subtitle="Manual difficulty control" control={<ToggleSwitch checked={autoAdapt} onChange={setAutoAdapt} />} />
                </SettingsSection>

                <SettingsSection title="Audio & Feedback">
                    <SettingsItem icon={<SoundIcon />} title="Sound Effects" subtitle="Play sounds for interactions" control={<ToggleSwitch checked={soundEffects} onChange={setSoundEffects} />} />
                    <SettingsItem icon={<HapticIcon />} title="Haptic Feedback" subtitle="Vibration for interactions" control={<ToggleSwitch checked={hapticFeedback} onChange={setHapticFeedback} />} />
                    <SettingsItem icon={<AutoplayIcon />} title="Auto-play Audio" subtitle="Automatically play pronunciation" control={<ToggleSwitch checked={autoPlayAudio} onChange={setAutoPlayAudio} />} />
                </SettingsSection>

                <SettingsSection title="Notifications">
                    <SettingsItem icon={<BellIcon />} title="Push Notifications" subtitle="Reminders and updates" control={<ToggleSwitch checked={pushNotifications} onChange={setPushNotifications} />} />
                    <SettingsItem icon={<ReminderIcon />} title="Study Reminders" subtitle="Daily notification enabled" value={`Daily at ${reminderTime}`} onClick={handleSetReminder} />
                </SettingsSection>

                <SettingsSection title="Appearance">
                    <SettingsItem icon={<MoonIcon />} title="Light Mode" subtitle="Use light theme" control={<ToggleSwitch checked={lightMode} onChange={setLightMode} />} />
                    <SettingsItem icon={<AppIconIcon />} title="App Icon" subtitle="Customize your app icon" value={appIcon} onClick={handleSetAppIcon} />
                </SettingsSection>

                <SettingsSection title="Data Management">
                    <SettingsItem icon={<SyncIcon />} title={isSyncing ? "Syncing..." : "Sync Data"} subtitle="Backup your progress" onClick={handleSyncData} />
                    <SettingsItem icon={<ExportIcon />} title="Export Progress" subtitle="Download your learning data" onClick={handleExportData} />
                    <SettingsItem icon={<ResetIcon />} title="Reset Progress" subtitle="Clear all learning data" titleColor="text-red-500" onClick={handleResetProgress} />
                </SettingsSection>

                <SettingsSection title="Support & Legal">
                    <SettingsItem icon={<HelpIcon />} title="Help & FAQ" subtitle="Get help and find answers" onClick={() => setActiveFeature('help')} />
                    <SettingsItem icon={<SupportIcon />} title="Contact Support" subtitle="Get in touch with our team" onClick={() => alert('Opening mail client...')} />
                    <SettingsItem icon={<RateIcon />} title="Rate the App" subtitle="Leave a review on the App Store" onClick={() => alert('Opening App Store...')} />
                    <SettingsItem icon={<PrivacyIcon />} title="Privacy Policy" subtitle="How we protect your data" onClick={() => window.open('https://policies.google.com/privacy', '_blank')} />
                </SettingsSection>
            </main>
        </div>
    );
};

export default Settings;