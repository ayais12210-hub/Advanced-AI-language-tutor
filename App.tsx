import React, { useState, useEffect, useCallback } from 'react';
import { FeatureId, Language, ExperienceLevel, UserGoal, UserInterest, ProfileStats, Badge, User, JournalEntry, SubscriptionTier, ModelId, ThinkingPreset, TtsProvider, SttProvider } from './types';
import { languages } from './languages';
import { badgeMasterList } from './achievements';
import Sidebar from './Sidebar';
import Chat from './Chat';
import VisualStudio from './VisualStudio';
import Grounding from './Grounding';
import Analyzer from './Analyzer';
import LandingPage from './LandingPage';
import Translator from './Translator';
import Lessons from './Lessons';
import LearningHub from './MasteryHub';
import Settings from './Settings';
import Help from './Help';
import PrivacyPolicy from './PrivacyPolicy';
import Profile from './Profile';
import Premium from './Premium';
import AccentCoach from './AccentCoach';

const featureComponents: { [key in FeatureId]: React.ComponentType<any> } = {
  chat: Chat,
  translator: Translator,
  lessons: Lessons,
  learningHub: LearningHub,
  speechAnalysis: AccentCoach,
  visualStudio: VisualStudio,
  grounding: Grounding,
  contentAnalyzer: Analyzer,
  settings: Settings,
  help: Help,
  privacyPolicy: PrivacyPolicy,
  profile: Profile,
  premium: Premium,
};

// A custom hook to manage state with localStorage persistence
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(`linguamate_${key}`);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage for key "${key}"`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(`linguamate_${key}`, JSON.stringify(state));
        } catch (error) {
            console.error(`Error writing to localStorage for key "${key}"`, error);
        }
    }, [key, state]);

    return [state, setState];
}


const App: React.FC = () => {
  const [showDashboard, setShowDashboard] = usePersistentState('showDashboard', false);
  const [activeFeature, setActiveFeature] = useState<FeatureId>('speechAnalysis');
  const [isSidebarMinimized, setIsSidebarMinimized] = usePersistentState('isSidebarMinimized', false);
  const [nativeLanguage, setNativeLanguage] = usePersistentState<Language>('nativeLanguage', languages.find(l => l.code === 'en') || languages[0]);
  const [learningLanguage, setLearningLanguage] = usePersistentState<Language>('learningLanguage', languages.find(l => l.code === 'es') || languages[1]);
  
  // Onboarding & Profile State
  const [experienceLevel, setExperienceLevel] = usePersistentState<ExperienceLevel>('experienceLevel', 'Beginner');
  const [userGoals, setUserGoals] = usePersistentState<UserGoal[]>('userGoals', []);
  const [userInterests, setUserInterests] = usePersistentState<UserInterest[]>('userInterests', []);
  const [subscriptionTier, setSubscriptionTier] = usePersistentState<SubscriptionTier>('subscriptionTier', 'Free');

  // --- NEW GLOBAL AI SETTINGS ---
  const [globalModel, setGlobalModel] = usePersistentState<ModelId>('globalModel', 'gemini-2.5-flash');
  const [thinkingPreset, setThinkingPreset] = usePersistentState<ThinkingPreset>('thinkingPreset', 'auto');
  const [ttsProvider, setTtsProvider] = usePersistentState<TtsProvider>('ttsProvider', 'Gemini');
  const [sttProvider, setSttProvider] = usePersistentState<SttProvider>('sttProvider', 'Gemini');

  // --- NEW CENTRALIZED USER STATE ---
  const [isLoggedIn, setIsLoggedIn] = usePersistentState('isLoggedIn', false);
  const [user, setUser] = usePersistentState<User | null>('user', null);
  const [userStats, setUserStats] = usePersistentState<ProfileStats>('userStats', {
    totalChats: 0,
    currentStreak: 1,
    wordsLearned: 0,
    xpPoints: 0,
  });
  const [userBadges, setUserBadges] = usePersistentState<Badge[]>('userBadges', badgeMasterList.map(b => ({ ...b, earned: false })));
  const [journalEntries, setJournalEntries] = usePersistentState<JournalEntry[]>('journalEntries', []);

  // --- STATE UPDATE HANDLERS ---
  const handleSignIn = () => {
    setUser({ name: 'Alex Rivera', email: 'alex.rivera@example.com', avatarInitial: 'A' });
    setIsLoggedIn(true);
    // In a real app, you'd fetch user data here.
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUser(null);
    setSubscriptionTier('Free'); // Downgrade on sign out
    // Optionally reset stats on sign out, or persist them per-account
    // For this demo, we'll keep them to show persistence.
  };

  const addXp = useCallback((amount: number) => {
    setUserStats(prev => ({ ...prev, xpPoints: prev.xpPoints + amount }));
  }, [setUserStats]);

  const incrementChatCount = useCallback(() => {
    setUserStats(prev => ({ ...prev, totalChats: prev.totalChats + 1 }));
  }, [setUserStats]);
  
  const handleJournalSave = useCallback((content: string) => {
    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      date: new Date().toISOString(),
      content,
    };
    setJournalEntries(prev => [newEntry, ...prev]);
  }, [setJournalEntries]);
  
  // TODO: Implement a real streak logic based on activity dates
  const updateStreak = useCallback(() => {
      // This is a placeholder. A real implementation would check localStorage for the
      // last active date and compare it to the current date.
  }, []);

  // Effect to check for and award badges when stats change
  useEffect(() => {
    if (!isLoggedIn) return;

    const checkAndAwardBadges = () => {
        let changed = false;
        const updatedBadges = userBadges.map(badge => {
            if (badge.earned) return badge; // Already earned

            let justEarned = false;
            switch(badge.id) {
                case 'c1': if (userStats.totalChats >= 1) justEarned = true; break;
                case 'c2': if (userStats.totalChats >= 50) justEarned = true; break;
                case 'x1': if (userStats.xpPoints >= 1000) justEarned = true; break;
                case 'x2': if (userStats.xpPoints >= 10000) justEarned = true; break;
                case 'x3': if (userStats.xpPoints >= 50000) justEarned = true; break;
                case 'p1': if (journalEntries.length >= 1) justEarned = true; break;
                // Add more checks here for other badges
            }
            
            if (justEarned) {
                changed = true;
                return { ...badge, earned: true, earnedDate: new Date().toLocaleDateString('en-US') };
            }
            return badge;
        });

        if (changed) {
            setUserBadges(updatedBadges);
        }
    };
    checkAndAwardBadges();
  }, [userStats, journalEntries.length, isLoggedIn, setUserBadges, userBadges]);


  const ActiveComponent = featureComponents[activeFeature];
  
  if (!showDashboard) {
    return (
      <LandingPage 
        onLaunchApp={() => setShowDashboard(true)} 
        nativeLanguage={nativeLanguage}
        learningLanguage={learningLanguage}
        setNativeLanguage={setNativeLanguage}
        setLearningLanguage={setLearningLanguage}
        experienceLevel={experienceLevel}
        setExperienceLevel={setExperienceLevel}
        userGoals={userGoals}
        setUserGoals={setUserGoals}
        userInterests={userInterests}
        setUserInterests={setUserInterests}
      />
    );
  }

  return (
    <div className="flex h-screen bg-background-primary text-text-primary font-sans antialiased">
      <Sidebar 
        activeFeature={activeFeature} 
        setActiveFeature={setActiveFeature}
        isLoggedIn={isLoggedIn}
        isSidebarMinimized={isSidebarMinimized}
        setIsSidebarMinimized={setIsSidebarMinimized}
      />
      <main className="flex-1 overflow-y-auto">
        <ActiveComponent 
          // Standard props
          nativeLanguage={nativeLanguage} 
          learningLanguage={learningLanguage}
          setNativeLanguage={setNativeLanguage}
          setLearningLanguage={setLearningLanguage}
          experienceLevel={experienceLevel}
          setExperienceLevel={setExperienceLevel}
          setActiveFeature={setActiveFeature}
          // User & Profile props
          isLoggedIn={isLoggedIn}
          user={user}
          stats={userStats}
          badges={userBadges}
          journalEntries={journalEntries}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onJournalSave={handleJournalSave}
          addXp={addXp}
          incrementChatCount={incrementChatCount}
          // Global AI settings props
          globalModel={globalModel}
          setGlobalModel={setGlobalModel}
          thinkingPreset={thinkingPreset}
          setThinkingPreset={setThinkingPreset}
          ttsProvider={ttsProvider}
          setTtsProvider={setTtsProvider}
          sttProvider={sttProvider}
          setSttProvider={setSttProvider}
          // Subscription props
          subscriptionTier={subscriptionTier}
          setSubscriptionTier={setSubscriptionTier}
        />
      </main>
    </div>
  );
};

export default App;