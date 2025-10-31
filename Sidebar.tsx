import React from 'react';
import { FeatureId } from './types';

const LogoIcon = () => (
    <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent-primary">
        <path d="M32 5C17.088 5 5 17.088 5 32C5 46.912 17.088 59 32 59C46.912 59 59 46.912 59 32C59 17.088 46.912 5 32 5Z" stroke="currentColor" strokeWidth="4"/>
        <path d="M32 15C22.6112 15 15 22.6112 15 32C15 37.5456 17.4304 42.4832 21.248 45.7504" stroke="#e4e4e7" strokeWidth="4" strokeLinecap="round"/>
        <path d="M32 49C41.3888 49 49 41.3888 49 32C49 26.4544 46.5696 21.5168 42.752 18.2496" stroke="#facc15" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);
const ChatIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.53-.388A5.86 5.86 0 0111.25 12.75a5.86 5.86 0 013.22-5.412A9.753 9.753 0 0112 3c4.97 0 9 3.694 9 8.25z" /></svg>);
const TranslateIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>);
const ImageIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 013.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 013.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 01-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" /></svg>);
const VideoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>);
const MicIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 7.5v-1.5a6 6 0 00-6-6v-1.5a6 6 0 00-6 6v1.5m6 7.5a6 6 0 00-6-6" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a3 3 0 003-3v-3a3 3 0 00-6 0v3a3 3 0 003 3z" /></svg>);
const GlobeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0112 13.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0l-2.11 2.11m-2.11-2.11l2.11 2.11m0 0l-2.11 2.11m2.11-2.11l2.11 2.11M12 13.5a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" /></svg>);
const AnalyzerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>);
const SpeakerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>);

const features: { id: FeatureId; name: string; icon: React.ReactElement }[] = [
    { id: 'chat', name: 'Practice Conversation', icon: <ChatIcon /> },
    { id: 'translator', name: 'AI Translator', icon: <TranslateIcon /> },
    { id: 'liveConvo', name: 'Live Tutoring', icon: <MicIcon /> },
    { id: 'tts', name: 'Pronunciation Practice', icon: <SpeakerIcon /> },
    { id: 'imageGen', name: 'Visual Vocabulary', icon: <ImageIcon /> },
    { id: 'imageEdit', name: 'Cultural Context', icon: <EditIcon /> },
    { id: 'videoGen', name: 'Immersive Scenarios', icon: <VideoIcon /> },
    { id: 'grounding', name: 'Explore & Discover', icon: <GlobeIcon /> },
    { id: 'analyzer', name: 'Text Analyzer', icon: <AnalyzerIcon /> },
];

interface SidebarProps {
  activeFeature: FeatureId;
  setActiveFeature: (feature: FeatureId) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeFeature, 
  setActiveFeature,
}) => {
  return (
    <aside className="w-64 bg-background-secondary text-text-secondary flex flex-col p-4 border-r border-background-tertiary/50">
      <div className="font-heading text-2xl font-bold mb-10 flex items-center space-x-3 text-text-primary pt-2">
        <LogoIcon />
        <span>Linguamate.ai</span>
      </div>
      <nav className="flex flex-col space-y-2 flex-1">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setActiveFeature(feature.id)}
            className={`flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-primary ${
              activeFeature === feature.id
                ? 'bg-accent-primary text-background-primary font-semibold shadow-lg'
                : 'hover:bg-background-tertiary/50 hover:text-text-primary'
            }`}
            aria-current={activeFeature === feature.id ? 'page' : undefined}
          >
            {feature.icon}
            <span>{feature.name}</span>
          </button>
        ))}
      </nav>
      
      <div className="mt-6 text-xs text-center text-text-secondary/70">
        <p>Your AI Language Companion</p>
        <p className="mt-1">&copy; 2024 Linguamate.ai</p>
      </div>
    </aside>
  );
};

export default Sidebar;