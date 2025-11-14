import React from 'react';
import { Language, FeatureId } from './types';
import { languages } from './languages';

const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.113-1.113l.448-.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5zM12 8.25a3.75 3.75 0 110 7.5 3.75 3.75 0 010-7.5z" /></svg>);


interface PageHeaderProps {
  title: string;
  description: string;
  nativeLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  learningLanguage: Language;
  setLearningLanguage: (language: Language) => void;
  setActiveFeature: (feature: FeatureId) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  nativeLanguage,
  setNativeLanguage,
  learningLanguage,
  setLearningLanguage,
  setActiveFeature,
}) => {
  const handleNativeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = languages.find(l => l.code === e.target.value);
    if (lang) {
      if (lang.code === learningLanguage.code) {
        setLearningLanguage(nativeLanguage);
      }
      setNativeLanguage(lang);
    }
  };

  const handleLearningChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = languages.find(l => l.code === e.target.value);
    if (lang) {
      if (lang.code === nativeLanguage.code) {
        setNativeLanguage(learningLanguage);
      }
      setLearningLanguage(lang);
    }
  };

  return (
    <header className="flex flex-col md:flex-row justify-between md:items-start gap-4">
      <div>
        <h1 className="text-4xl font-heading font-bold tracking-tight">{title}</h1>
        <p className="text-text-secondary mt-2 text-lg">{description}</p>
      </div>
      <div className="flex items-end gap-4">
        <div>
          <label htmlFor="native-lang" className="block text-xs font-medium text-text-secondary mb-1">I Speak</label>
          <select 
            id="native-lang" 
            value={nativeLanguage.code}
            onChange={handleNativeChange}
            className="w-full md:w-48 bg-background-secondary rounded-md p-2 text-sm text-text-primary border border-background-tertiary/50 focus:ring-1 focus:ring-accent-primary focus:outline-none"
          >
            {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="learning-lang" className="block text-xs font-medium text-text-secondary mb-1">I'm Learning</label>
          <select 
            id="learning-lang" 
            value={learningLanguage.code}
            onChange={handleLearningChange}
            className="w-full md:w-48 bg-background-secondary rounded-md p-2 text-sm text-text-primary border border-background-tertiary/50 focus:ring-1 focus:ring-accent-primary focus:outline-none"
          >
            {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
          </select>
        </div>
        <button 
            onClick={() => setActiveFeature('settings')}
            className="p-2 rounded-full text-text-secondary hover:bg-background-secondary hover:text-text-primary transition-colors"
            aria-label="Open settings"
            title="Settings"
        >
            <SettingsIcon />
        </button>
      </div>
    </header>
  );
};
