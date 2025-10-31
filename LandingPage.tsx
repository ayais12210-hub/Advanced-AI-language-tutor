import React, { useState } from 'react';
import { Language, ExperienceLevel, UserGoal, UserInterest } from './types';
import Onboarding from './Onboarding';

interface LandingPageProps {
  onLaunchApp: () => void;
  nativeLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  learningLanguage: Language;
  setLearningLanguage: (language: Language) => void;
  experienceLevel: ExperienceLevel;
  setExperienceLevel: (level: ExperienceLevel) => void;
  userGoals: UserGoal[];
  setUserGoals: (goals: UserGoal[]) => void;
  userInterests: UserInterest[];
  setUserInterests: (interests: UserInterest[]) => void;
}

const LogoIcon = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent-primary">
        <path d="M32 5C17.088 5 5 17.088 5 32C5 46.912 17.088 59 32 59C46.912 59 59 46.912 59 32C59 17.088 46.912 5 32 5Z" stroke="currentColor" strokeWidth="3"/>
        <path d="M32 15C22.6112 15 15 22.6112 15 32C15 37.5456 17.4304 42.4832 21.248 45.7504" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round"/>
        <path d="M32 49C41.3888 49 49 41.3888 49 32C49 26.4544 46.5696 21.5168 42.752 18.2496" stroke="#facc15" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);


const LandingPage: React.FC<LandingPageProps> = (props) => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <div className="min-h-screen bg-background-primary text-text-primary font-sans antialiased flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="font-heading text-2xl font-bold">Linguamate.ai</span>
          </div>
          <button 
            onClick={props.onLaunchApp}
            className="hidden md:block bg-background-secondary/50 text-text-primary font-semibold py-2 px-5 rounded-lg border border-background-tertiary hover:bg-background-secondary transition-colors duration-200"
          >
            Launch App
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl animate-pulse"></div>

        <div className="z-10">
          <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight">
            Learn languages like <br/> you were born to.
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-text-secondary">
            Linguamate.ai is your personal AI companion that merges neuroscience, emotion, and technology to teach languages naturally and intuitively.
          </p>
          <button 
            onClick={() => setShowOnboarding(true)}
            className="mt-10 bg-accent-primary hover:bg-accent-primary-dark text-background-primary font-bold text-lg py-4 px-10 rounded-full shadow-lg shadow-accent-primary/20 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Get Started For Free
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6">
        <div className="container mx-auto text-center text-text-secondary/70 text-sm">
          &copy; {new Date().getFullYear()} Linguamate.ai — An Enlightened Approach to Language.
        </div>
      </footer>
      
      <Onboarding 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)}
        onComplete={props.onLaunchApp}
        {...props}
      />
    </div>
  );
};

export default LandingPage;