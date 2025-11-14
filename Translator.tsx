import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, TranslationAnalysis, TtsProvider, FeatureId } from './types';
import SmartSuggestions from './SmartSuggestions';
import { languages } from './languages';
import { TranslationAnalysisCard } from './TranslationAnalysis';

const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.113-1.113l.448-.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5zM12 8.25a3.75 3.75 0 110 7.5 3.75 3.75 0 010-7.5z" /></svg>);


// Helper functions for audio decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-background-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface TranslatorProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
  ttsProvider: TtsProvider;
  setActiveFeature: (feature: FeatureId) => void;
}

const Translator: React.FC<TranslatorProps> = ({ nativeLanguage, learningLanguage, ttsProvider: globalTtsProvider, setActiveFeature }) => {
  const [sourceLang, setSourceLang] = useState(nativeLanguage);
  const [targetLang, setTargetLang] = useState(learningLanguage);
  const [sourceText, setSourceText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<TranslationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [ttsProvider, setTtsProvider] = useState<TtsProvider>(globalTtsProvider);

  // Sync with global language settings
  useEffect(() => {
    setSourceLang(nativeLanguage);
    setTargetLang(learningLanguage);
  }, [nativeLanguage, learningLanguage]);

  const handleSwapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
  };

  const generateTranslatorSuggestions = useCallback(async (): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `You are a creative assistant for a language learner. The user's source language is ${sourceLang.name} and target language is ${targetLang.name}. Generate 3 common but interesting phrases in ${sourceLang.name} to translate. Provide only a JSON array of strings.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });

    try {
        const suggestions = JSON.parse(response.text);
        return Array.isArray(suggestions) ? suggestions.map(String) : [];
    } catch (e) {
        console.error("Failed to parse suggestions JSON:", e);
        return [];
    }
  }, [sourceLang.name, targetLang.name]);

  const handleSuggestionClick = (suggestion: string) => {
    setSourceText(suggestion);
  };

  const handleAnalyze = async () => {
    if (!sourceText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const systemInstruction = `You are a world-class AI Language Coach. The user's native language is ${nativeLanguage.name}. When given text to translate from ${sourceLang.name} to ${targetLang.name}, you must provide a comprehensive analysis as a JSON object. All analysis fields (meaning, structure, etc.) MUST be in ${nativeLanguage.name} to ensure the user understands. Respond ONLY with the JSON object.`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Translate and provide a deep analysis of the following ${sourceLang.name} text: "${sourceText}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              professionalTranslation: { type: Type.STRING, description: `The phrase translated to ${targetLang.name}.` },
              translationConfidence: { type: Type.NUMBER, description: "A confidence score from 0-100 for the translation." },
              sound: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: `The original translated text in ${targetLang.name}.` },
                  ipa: { type: Type.STRING, description: `The International Phonetic Alphabet (IPA) transcription of the translated text.` },
                  syllables: { type: Type.STRING, description: "The syllable breakdown of the translated text." },
                },
                required: ['text', 'ipa', 'syllables'],
              },
              meaning: { type: Type.STRING, description: `A detailed explanation of the translated phrase's literal and nuanced meaning.` },
              structure: { type: Type.STRING, description: "A breakdown of the grammar, syntax, and sentence structure." },
              learningProcess: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable, step-by-step tips for a learner to internalize this phrase." },
              usage: { type: Type.STRING, description: "Examples of how the phrase is used in different contexts (e.g., formal, informal)." },
              advancedSummary: { type: Type.STRING, description: "A concise, advanced summary for a quick review." },
              alternativeTranslations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of other ways to express the same idea." },
            },
            required: ['professionalTranslation', 'translationConfidence', 'sound', 'meaning', 'structure', 'learningProcess', 'usage', 'advancedSummary', 'alternativeTranslations'],
          },
          thinkingConfig: { thinkingBudget: 32768 },
        },
      });

      const result = JSON.parse(response.text);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err?.toString().includes('quota') ? 'API quota exceeded.' : 'Failed to get analysis. The model may have had trouble with the request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    const textToSpeak = analysisResult?.sound.text;
    if (!textToSpeak || isTtsLoading) return;
    
    setIsTtsLoading(true);
    if (audioSource) audioSource.stop();

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        // Simulate ElevenLabs by using a specific, high-quality voice.
        const voiceName = ttsProvider === 'ElevenLabs' ? 'Zephyr' : 'Kore';
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) throw new Error("No audio data received.");

        const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
        
        const source = outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContext.destination);
        source.start();
        setAudioSource(source);

    } catch (err: any) {
        console.error("TTS failed:", err);
        setError(err?.toString().includes('quota') ? 'Could not play audio: API quota exceeded.' : 'Failed to play audio.');
    } finally {
        setIsTtsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-heading font-bold tracking-tight">AI Language Coach</h1>
          <p className="text-text-secondary mt-2 text-lg">Go beyond simple translation with deep linguistic analysis.</p>
        </div>
         <button 
            onClick={() => setActiveFeature('settings')}
            className="p-2 rounded-full text-text-secondary hover:bg-background-secondary hover:text-text-primary transition-colors"
            aria-label="Open settings"
            title="Settings"
        >
            <SettingsIcon />
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6 overflow-hidden">
        {/* Input & Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 flex flex-col gap-4 bg-background-secondary/50 p-6 rounded-lg border border-background-tertiary/50">
            <div className="flex items-center gap-4">
              <LanguageSelector selected={sourceLang} onChange={setSourceLang} isDisabled={isLoading} />
              <button onClick={handleSwapLanguages} disabled={isLoading} className="p-2 rounded-full hover:bg-background-tertiary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
              </button>
              <LanguageSelector selected={targetLang} onChange={setTargetLang} isDisabled={isLoading} />
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder={`Enter text in ${sourceLang.name}...`}
                className="w-full h-full bg-background-tertiary rounded-lg p-3 text-text-primary placeholder-text-secondary/70 focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none"
                disabled={isLoading}
              />
              <SmartSuggestions
                generateSuggestions={generateTranslatorSuggestions}
                onSuggestionClick={handleSuggestionClick}
                isDisabled={isLoading}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !sourceText.trim()}
              className="w-full bg-accent-primary text-background-primary font-bold py-3 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-lg"
            >
              {isLoading ? <Spinner /> : 'Analyze Translation'}
            </button>
          </div>
        </div>

        {/* Analysis Display */}
        <div className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-center text-red-400">
              <div>
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          ) : analysisResult ? (
            <TranslationAnalysisCard 
              analysis={analysisResult} 
              onPlayAudio={handlePlayAudio} 
              isTtsLoading={isTtsLoading} 
              ttsProvider={ttsProvider}
              onTtsProviderChange={setTtsProvider}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-background-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.375 3.375 0 0112 18.375a3.375 3.375 0 01-2.712-1.25l-.547-.547z" /></svg>
              <p className="mt-4">Your detailed translation analysis will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const LanguageSelector: React.FC<{ selected: Language, onChange: (lang: Language) => void, isDisabled: boolean }> = ({ selected, onChange, isDisabled }) => {
  return (
    <select
      value={selected.code}
      onChange={(e) => {
        const lang = languages.find(l => l.code === e.target.value);
        if (lang) onChange(lang);
      }}
      disabled={isDisabled}
      className="w-full bg-background-tertiary rounded-md p-2 text-sm text-text-primary border border-background-tertiary/80 focus:ring-1 focus:ring-accent-primary focus:outline-none"
    >
      {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
    </select>
  );
};

export default Translator;
