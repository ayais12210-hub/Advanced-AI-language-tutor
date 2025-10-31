import React, { useState } from 'react';
import { Language, ExperienceLevel, UserGoal, UserInterest } from './types';
import { languages } from './languages';

// --- PROPS INTERFACE ---
interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
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

// --- DATA & ICONS ---
const experienceLevels: { id: ExperienceLevel; name: string; icon: React.ReactElement }[] = [
    { id: 'Beginner', name: 'Beginner', icon: <span className="text-2xl">🌱</span> },
    { id: 'Intermediate', name: 'Intermediate', icon: <span className="text-2xl">🌿</span> },
    { id: 'Advanced', name: 'Advanced', icon: <span className="text-2xl">🌳</span> },
    { id: 'Fluent', name: 'Fluent', icon: <span className="text-2xl">🌲</span> },
];
const goals: { id: UserGoal; name: string; icon: React.ReactElement }[] = [
    { id: 'Travel', name: 'Travel', icon: <span className="text-2xl">✈️</span> },
    { id: 'Career', name: 'Career', icon: <span className="text-2xl">💼</span> },
    { id: 'School', name: 'School', icon: <span className="text-2xl">📚</span> },
    { id: 'Connect', name: 'Connect', icon: <span className="text-2xl">❤️</span> },
    { id: 'Brain Training', name: 'Brain Training', icon: <span className="text-2xl">🧠</span> },
    { id: 'Cultural Immersion', name: 'Culture', icon: <span className="text-2xl">🌍</span> },
];
const interests: { id: UserInterest; name: string; icon: React.ReactElement }[] = [
    { id: 'Technology', name: 'Tech', icon: <span className="text-2xl">💻</span> },
    { id: 'Food', name: 'Food', icon: <span className="text-2xl">🍔</span> },
    { id: 'Art & Culture', name: 'Art', icon: <span className="text-2xl">🎨</span> },
    { id: 'Sports', name: 'Sports', icon: <span className="text-2xl">⚽️</span> },
    { id: 'Science', name: 'Science', icon: <span className="text-2xl">🔬</span> },
    { id: 'History', name: 'History', icon: <span className="text-2xl">🏛️</span> },
    { id: 'Movies & TV', name: 'Movies', icon: <span className="text-2xl">🎬</span> },
    { id: 'Music', name: 'Music', icon: <span className="text-2xl">🎵</span> },
];

// --- MAIN COMPONENT ---
const Onboarding: React.FC<OnboardingProps> = (props) => {
    if (!props.isOpen) return null;

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            props.onComplete();
        }
    };
    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleGoalToggle = (goal: UserGoal) => {
        props.setUserGoals(
            props.userGoals.includes(goal)
                ? props.userGoals.filter(g => g !== goal)
                : [...props.userGoals, goal]
        );
    };
    const handleInterestToggle = (interest: UserInterest) => {
        props.setUserInterests(
            props.userInterests.includes(interest)
                ? props.userInterests.filter(i => i !== interest)
                : [...props.userInterests, interest]
        );
    };
    
    const canProceed = () => {
        switch (currentStep) {
            case 3: return props.userGoals.length > 0;
            case 4: return props.userInterests.length > 0;
            default: return true;
        }
    }

    const StepContent = () => {
        switch (currentStep) {
            case 1: return <StepLanguages {...props} />;
            case 2: return <StepExperience {...props} />;
            case 3: return <StepGoals {...props} onToggle={handleGoalToggle} />;
            case 4: return <StepInterests {...props} onToggle={handleInterestToggle} />;
            case 5: return <StepReady />;
            default: return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={props.onClose}>
            <div className="bg-background-secondary w-full max-w-2xl rounded-xl border border-background-tertiary/50 shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header and Progress */}
                <header className="p-6 border-b border-background-tertiary/50">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="font-heading text-xl font-bold">Welcome to Linguamate.ai</h2>
                         <span className="text-sm font-medium text-text-secondary">Step {currentStep} of {totalSteps}</span>
                    </div>
                    <div className="w-full bg-background-tertiary rounded-full h-1.5">
                        <div className="bg-accent-primary h-1.5 rounded-full" style={{ width: `${(currentStep / totalSteps) * 100}%`, transition: 'width 0.3s ease-in-out' }}></div>
                    </div>
                </header>
                
                {/* Step Content */}
                <div className="p-8 min-h-[300px] flex flex-col justify-center">
                    <StepContent />
                </div>
                
                {/* Footer and Navigation */}
                <footer className="p-4 bg-background-tertiary/30 flex justify-between items-center">
                    <button onClick={handleBack} disabled={currentStep === 1} className="py-2 px-5 rounded-md text-sm font-semibold text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors">
                        Back
                    </button>
                    <button onClick={handleNext} disabled={!canProceed()} className="bg-accent-primary text-background-primary font-bold py-2 px-8 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:text-text-secondary/50 transition-colors">
                        {currentStep === totalSteps ? 'Launch App' : 'Next'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

// --- STEP SUB-COMPONENTS ---
const StepLanguages: React.FC<OnboardingProps> = ({ nativeLanguage, setNativeLanguage, learningLanguage, setLearningLanguage }) => {
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
    return (
        <div className="text-center">
            <h3 className="text-2xl font-bold font-heading mb-2">Let's get set up.</h3>
            <p className="text-text-secondary mb-8">First, tell us what you speak and what you want to learn.</p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
                 <div>
                    <label htmlFor="native-lang" className="block text-sm font-medium text-text-secondary mb-2">I speak</label>
                    <select id="native-lang" value={nativeLanguage.code} onChange={handleNativeChange} className="w-full md:w-64 bg-background-tertiary rounded-md p-3 text-text-primary border border-background-tertiary/80 focus:ring-1 focus:ring-accent-primary focus:outline-none">
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="learning-lang" className="block text-sm font-medium text-text-secondary mb-2">I want to learn</label>
                    <select id="learning-lang" value={learningLanguage.code} onChange={handleLearningChange} className="w-full md:w-64 bg-background-tertiary rounded-md p-3 text-text-primary border border-background-tertiary/80 focus:ring-1 focus:ring-accent-primary focus:outline-none">
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

const StepExperience: React.FC<OnboardingProps> = ({ experienceLevel, setExperienceLevel }) => (
    <div className="text-center">
        <h3 className="text-2xl font-bold font-heading mb-2">What is your current experience level?</h3>
        <p className="text-text-secondary mb-8">This helps us tailor the difficulty and conversation style for you.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {experienceLevels.map(level => (
                <button key={level.id} onClick={() => setExperienceLevel(level.id)} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${experienceLevel === level.id ? 'border-accent-primary bg-accent-primary/10' : 'border-background-tertiary hover:border-accent-primary/50'}`}>
                    {level.icon}
                    <span className="font-semibold">{level.name}</span>
                </button>
            ))}
        </div>
    </div>
);

const StepGoals: React.FC<OnboardingProps & { onToggle: (goal: UserGoal) => void }> = ({ userGoals, onToggle }) => (
    <div className="text-center">
        <h3 className="text-2xl font-bold font-heading mb-2">What are your learning goals?</h3>
        <p className="text-text-secondary mb-8">Select all that apply. This will help us suggest relevant activities.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {goals.map(goal => (
                <button key={goal.id} onClick={() => onToggle(goal.id)} className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${userGoals.includes(goal.id) ? 'border-accent-primary bg-accent-primary/10' : 'border-background-tertiary hover:border-accent-primary/50'}`}>
                    {goal.icon}
                    <span className="font-semibold">{goal.name}</span>
                </button>
            ))}
        </div>
    </div>
);

const StepInterests: React.FC<OnboardingProps & { onToggle: (interest: UserInterest) => void }> = ({ userInterests, onToggle }) => (
    <div className="text-center">
        <h3 className="text-2xl font-bold font-heading mb-2">What topics are you interested in?</h3>
        <p className="text-text-secondary mb-8">We'll use this to make your practice conversations more engaging.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {interests.map(interest => (
                <button key={interest.id} onClick={() => onToggle(interest.id)} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${userInterests.includes(interest.id) ? 'border-accent-primary bg-accent-primary/10' : 'border-background-tertiary hover:border-accent-primary/50'}`}>
                    {interest.icon}
                    <span className="font-semibold">{interest.name}</span>
                </button>
            ))}
        </div>
    </div>
);

const StepReady = () => (
    <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold font-heading mb-2">You're all set!</h3>
        <p className="text-text-secondary mb-8 max-w-sm mx-auto">Your personalized learning environment is ready. Click the button below to start your journey.</p>
    </div>
);

export default Onboarding;
