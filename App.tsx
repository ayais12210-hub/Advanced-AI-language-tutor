import React, { useState } from 'react';
import { FeatureId, Language } from './types';
import Sidebar from './Sidebar';
import Chat from './Chat';
import ImageGen from './ImageGen';
import ImageEdit from './ImageEdit';
import VideoGen from './VideoGen';
import LiveConvo from './LiveConvo';
import Grounding from './Grounding';
import Analyzer from './Analyzer';
import TTS from './TTS';
import LandingPage from './LandingPage';
import Translator from './Translator';
import { languages } from './languages';

const featureComponents: { [key in FeatureId]: React.ComponentType<any> } = {
  chat: Chat,
  translator: Translator,
  imageGen: ImageGen,
  imageEdit: ImageEdit,
  videoGen: VideoGen,
  liveConvo: LiveConvo,
  grounding: Grounding,
  analyzer: Analyzer,
  tts: TTS,
};

const App: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeFeature, setActiveFeature] = useState<FeatureId>('chat');
  const [nativeLanguage, setNativeLanguage] = useState<Language>(languages.find(l => l.code === 'en') || languages[0]);
  const [learningLanguage, setLearningLanguage] = useState<Language>(languages.find(l => l.code === 'es') || languages[1]);


  const ActiveComponent = featureComponents[activeFeature];
  
  if (!showDashboard) {
    return <LandingPage onLaunchApp={() => setShowDashboard(true)} />;
  }

  return (
    <div className="flex h-screen bg-background-primary text-text-primary font-sans antialiased">
      <Sidebar 
        activeFeature={activeFeature} 
        setActiveFeature={setActiveFeature}
      />
      <main className="flex-1 overflow-y-auto">
        <ActiveComponent 
          nativeLanguage={nativeLanguage} 
          learningLanguage={learningLanguage}
          setNativeLanguage={setNativeLanguage}
          setLearningLanguage={setLearningLanguage}
        />
      </main>
    </div>
  );
};

export default App;