import React from 'react';
import { Language } from './types';
import { languages } from './languages';

interface PageHeaderProps {
  title: string;
  description: string;
  nativeLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  learningLanguage: Language;
  setLearningLanguage: (language: Language) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  nativeLanguage,
  setNativeLanguage,
  learningLanguage,
  setLearningLanguage,
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
      <div className="flex gap-4">
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
      </div>
    </header>
  );
};