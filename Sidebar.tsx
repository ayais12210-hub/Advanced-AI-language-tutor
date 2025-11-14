import React from 'react';
import { FeatureId } from './types';

const LogoIcon = () => (
    <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent-primary">
        <path d="M32 5C17.088 5 5 17.088 5 32C5 46.912 17.088 59 32 59C46.912 59 59 46.912 59 32C59 17.088 46.912 5 32 5Z" stroke="currentColor" strokeWidth="4"/>
        <path d="M32 15C22.6112 15 15 22.6112 15 32C15 37.5456 17.4304 42.4832 21.248 45.7504" stroke="#e4e4e7" strokeWidth="4" strokeLinecap="round"/>
        <path d="M32 49C41.3888 49 49 41.3888 49 32C49 26.4544 46.5696 21.5168 42.752 18.2496" stroke="#facc15" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);
const PremiumIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.321l5.478.398a.562.562 0 01.31.956l-4.2 3.548a.562.562 0 00-.192.558l1.287 5.345a.562.562 0 01-.82.634l-4.79-2.848a.563.563 0 00-.58 0l-4.79 2.848a.562.562 0 01-.82-.634l1.287-5.345a.562.562 0 00-.192-.558l-4.2-3.548a.562.562 0 01.31-.956l5.478-.398a.563.563 0 00.475-.321L11.48 3.5z" /></svg>);
const ChatIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.53-.388A5.86 5.86 0 0111.25 12.75a5.86 5.86 0 013.22-5.412A9.753 9.753 0 0112 3c4.97 0 9 3.694 9 8.25z" /></svg>);
const TranslateIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>);
const BookIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>);
const BrainIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 013.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 013.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 12a8.25 8.25 0 11-16.5 0 8.25 8.25 0 0116.5 0z" /></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 013.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 013.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 01-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" /></svg>);
const GlobeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0112 13.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0l-2.11 2.11m-2.11-2.11l2.11 2.11m0 0l-2.11 2.11m2.11-2.11l2.11 2.11M12 13.5a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" /></svg>);
const AnalyzerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>);
const SpeakerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28 .53v15.88a.75.75 0 01-1.28 .53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>);
const ProfileIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.113-1.113l.448-.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5zM12 8.25a3.75 3.75 0 110 7.5 3.75 3.75 0 010-7.5z" /></svg>);
const MinimizeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" /></svg>);
const MaximizeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5" /></svg>);

interface Feature {
    id: FeatureId;
    name: string;
    // FIX: The type `JSX.Element` was not found due to an issue with global JSX namespace merging.
    // Switched to `React.ReactElement` which is a more stable and explicit type for React components.
    icon: React.ReactElement;
}

const coreFeatures: Feature[] = [
    { id: 'chat', name: 'Practice Conversation', icon: <ChatIcon /> },
    { id: 'translator', name: 'AI Language Coach', icon: <TranslateIcon /> },
    { id: 'lessons', name: 'Interactive Lessons', icon: <BookIcon /> },
    { id: 'learningHub', name: 'Learning Hub', icon: <BrainIcon /> },
];

const aiTools: Feature[] = [
    { id: 'speechAnalysis', name: 'Accent Coach', icon: <SpeakerIcon /> },
    { id: 'visualStudio', name: 'Visual Studio', icon: <EditIcon /> },
    { id: 'grounding', name: 'Explore & Discover', icon: <GlobeIcon /> },
    { id: 'contentAnalyzer', name: 'Content Analyzer', icon: <AnalyzerIcon /> },
];

const profileAndSettings: Feature[] = [
    { id: 'profile', name: 'Profile', icon: <ProfileIcon /> },
    { id: 'settings', name: 'Settings', icon: <SettingsIcon /> },
];

interface FeatureButtonProps {
    feature: Feature;
    isActive: boolean;
    isMinimized: boolean;
    onClick: () => void;
}

const FeatureButton: React.FC<FeatureButtonProps> = ({ feature, isActive, isMinimized, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-accent-primary text-background-primary' : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'}`}
        aria-label={feature.name}
        title={isMinimized ? feature.name : ''}
    >
        {feature.icon}
        {!isMinimized && <span className="ml-4 font-semibold">{feature.name}</span>}
    </button>
);

interface SidebarProps {
    activeFeature: FeatureId;
    setActiveFeature: (feature: FeatureId) => void;
    isLoggedIn: boolean;
    isSidebarMinimized: boolean;
    setIsSidebarMinimized: (isMinimized: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeFeature, setActiveFeature, isLoggedIn, isSidebarMinimized, setIsSidebarMinimized }) => {
    return (
        <aside className={`bg-background-secondary flex flex-col transition-all duration-300 ease-in-out ${isSidebarMinimized ? 'w-20' : 'w-64'}`}>
            <div className={`p-4 flex items-center ${isSidebarMinimized ? 'justify-center' : 'justify-between'}`}>
                 <div className={`flex items-center gap-2 overflow-hidden ${isSidebarMinimized ? 'w-0' : 'w-auto'}`}>
                    <LogoIcon />
                    {!isSidebarMinimized && <span className="font-heading text-xl font-bold">Linguamate</span>}
                 </div>
                <button 
                    onClick={() => setIsSidebarMinimized(!isSidebarMinimized)} 
                    className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
                    aria-label={isSidebarMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
                    title={isSidebarMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
                >
                    {isSidebarMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
                </button>
            </div>
            
            <nav className="flex-1 px-4 py-2 space-y-6">
                <div>
                    <h3 className={`px-3 text-xs font-semibold uppercase text-text-secondary mb-2 ${isSidebarMinimized ? 'hidden' : ''}`}>Core</h3>
                    <div className="space-y-1">
                        {coreFeatures.map(f => <FeatureButton key={f.id} feature={f} isActive={activeFeature === f.id} onClick={() => setActiveFeature(f.id)} isMinimized={isSidebarMinimized} />)}
                    </div>
                </div>
                <div>
                    <h3 className={`px-3 text-xs font-semibold uppercase text-text-secondary mb-2 ${isSidebarMinimized ? 'hidden' : ''}`}>AI Tools</h3>
                    <div className="space-y-1">
                        {aiTools.map(f => <FeatureButton key={f.id} feature={f} isActive={activeFeature === f.id} onClick={() => setActiveFeature(f.id)} isMinimized={isSidebarMinimized} />)}
                    </div>
                </div>
            </nav>

            <div className="px-4 py-4">
                <div className="space-y-1">
                     <button onClick={() => setActiveFeature('premium')} className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 bg-gradient-to-r from-cyan-500 to-yellow-400 text-white ${isSidebarMinimized ? 'justify-center' : ''}`}>
                        <PremiumIcon />
                        {!isSidebarMinimized && <span className="ml-4 font-bold">Upgrade to Pro</span>}
                    </button>
                    {isLoggedIn && profileAndSettings.map(f => <FeatureButton key={f.id} feature={f} isActive={activeFeature === f.id} onClick={() => setActiveFeature(f.id)} isMinimized={isSidebarMinimized} />)}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;