import React, { useState, useEffect, useRef } from 'react';
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
  const splineViewerRef = useRef<any>(null);

  useEffect(() => {
    const splineElement = splineViewerRef.current;
    if (!splineElement) return;

    const hideLogo = () => {
      // Access the shadow DOM and inject a style tag to hide the logo.
      // This is more robust than directly manipulating the style of the element.
      if (splineElement.shadowRoot) {
        const style = document.createElement('style');
        style.textContent = '#logo { display: none !important; }';
        splineElement.shadowRoot.appendChild(style);
      }
    };

    // The 'load' event is the most reliable way to know when the scene is ready.
    splineElement.addEventListener('load', hideLogo);

    // Also try to hide it immediately in case the component is already loaded
    // from cache and the 'load' event has already fired.
    hideLogo();

    return () => {
      // Clean up the event listener when the component unmounts.
      if (splineElement) {
        splineElement.removeEventListener('load', hideLogo);
      }
    };
  }, []);


  return (
    <div className="bg-background-primary text-text-primary font-sans antialiased">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="font-heading text-2xl font-bold text-white">Linguamate.ai</span>
          </div>
          <button 
            onClick={props.onLaunchApp}
            className="hidden md:block bg-white/10 text-white font-semibold py-2 px-5 rounded-lg border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-colors duration-200"
          >
            Launch App
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-black">
        <spline-viewer
            ref={splineViewerRef}
            url="https://prod.spline.design/QUR5nCM30VWy8K4a/scene.splinecode"
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
            }}
        />

        <div className="relative z-10 text-center backdrop-blur-sm bg-black/25 p-8 rounded-2xl">
          <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-white">
            Learn languages like <br/> you were born to.
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-zinc-200">
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