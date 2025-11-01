import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, TranslationAnalysis, TtsProvider } from './types';
import SmartSuggestions from './SmartSuggestions';
import { languages } from './languages';
import { TranslationAnalysisCard } from './TranslationAnalysis';

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
}

const Translator: React.FC<TranslatorProps> = ({ nativeLanguage, learningLanguage }) => {
  const [sourceLang, setSourceLang] = useState(nativeLanguage);
  const [targetLang, setTargetLang] = useState(learningLanguage);
  const [sourceText, setSourceText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<TranslationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [ttsProvider, setTtsProvider] = useState<TtsProvider>('Gemini');

  useEffect(() => {
    const isSourceStillValid = sourceLang.code === learningLanguage.code || sourceLang.code === nativeLanguage.code;
    const isTargetStillValid = targetLang.code === learningLanguage.code || targetLang.code === nativeLanguage.code;

    if (!isSourceStillValid || !isTargetStillValid || nativeLanguage.code === learningLanguage.code) {
        setSourceLang(nativeLanguage);
        setTargetLang(learningLanguage);
    } else {
        setSourceLang(languages.find(l => l.code === sourceLang.code) || nativeLanguage);
        setTargetLang(languages.find(l => l.code === targetLang.code) || learningLanguage);
    }
  }, [nativeLanguage, learningLanguage, sourceLang.code, targetLang.code]);

  useEffect(() => {
    return () => {
      if (audioSource) audioSource.stop();
    };
  }, [audioSource]);

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(analysisResult?.professionalTranslation || '');
    setAnalysisResult(null);
  };
  
  const generateTranslatorSuggestions = useCallback(async (): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `You are a creative assistant. The user wants to translate from ${sourceLang.name}. Generate 3 common, useful phrases in ${sourceLang.name}. Provide only a JSON array of strings.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });

    try {
        const suggestions = JSON.parse(response.text);
        return Array.isArray(suggestions) ? suggestions.map(String) : [];
    } catch (e) {
        console.error("Failed to parse suggestions JSON:", e);
        return [];
    }
  }, [sourceLang]);

  const handleSuggestionClick = (suggestion: string) => {
    setSourceText(suggestion);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const systemInstruction = `You are a world-class AI Language Coach. The user's native language is ${sourceLang.name} and they are learning ${targetLang.name}. When given text, provide a comprehensive analysis as a JSON object.
- professionalTranslation: The most accurate, natural translation in ${targetLang.name}.
- translationConfidence: Your confidence from 0-100.
- sound: Phonetic breakdown of the TRANSLATED text (IPA, syllables, stress).
- meaning: Analyze translation nuances, cultural context, and dialectal differences.
- structure: Analyze grammar and syntax of the TRANSLATED text.
- learningProcess: Provide 3-4 actionable, bulleted learning tips.
- usage: Explain context and regional variations for the translated phrase.
- advancedSummary: A detailed synthesis for advanced learners.
- alternativeTranslations: A list of other valid ways to express the original idea.
All analysis fields MUST be in ${sourceLang.name} to ensure the user understands. Respond ONLY with the JSON object.`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Please translate and analyze the following text from ${sourceLang.name} to ${targetLang.name}: "${sourceText}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              professionalTranslation: { type: Type.STRING },
              translationConfidence: { type: Type.NUMBER },
              sound: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  syllables: { type: Type.STRING },
                },
                required: ['text', 'ipa', 'syllables'],
              },
              meaning: { type: Type.STRING },
              structure: { type: Type.STRING },
              learningProcess: { type: Type.ARRAY, items: { type: Type.STRING } },
              usage: { type: Type.STRING },
              advancedSummary: { type: Type.STRING },
              alternativeTranslations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['professionalTranslation', 'translationConfidence', 'sound', 'meaning', 'structure', 'learningProcess', 'usage', 'advancedSummary', 'alternativeTranslations'],
          },
        },
      });
      
      const result = JSON.parse(response.text);
      setAnalysisResult(result);

    } catch (err: any) {
      console.error(err);
       if (err?.toString().includes('quota')) {
            setError('API quota exceeded. Please check your plan or try again later.');
       } else {
            setError('Sorry, the AI Coach analysis failed. The model may not have been able to provide a detailed breakdown for this text. Please try different wording or a more common phrase.');
       }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    const textToSpeak = analysisResult?.professionalTranslation;
    if (!textToSpeak || isLoading || isTtsLoading) return;

    setIsTtsLoading(true);
    setError(null);
    if (audioSource) audioSource.stop();

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const voiceName = ttsProvider === 'ElevenLabs' ? 'Zephyr' : 'Kore';
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `In ${targetLang.name}, say: ${textToSpeak}` }] }],
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
        console.error(err);
        if (err?.toString().includes('quota')) {
            setError('Could not generate speech: API quota exceeded.');
        } else {
            setError('Failed to generate speech.');
        }
    } finally {
        setIsTtsLoading(false);
    }
  };
  
  const handleSourceLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSourceCode = e.target.value;
    if (newSourceCode === targetLang.code) setTargetLang(sourceLang);
    setSourceLang(languages.find(l => l.code === newSourceCode) || sourceLang);
  };

  const handleTargetLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTargetCode = e.target.value;
    if (newTargetCode === sourceLang.code) setSourceLang(targetLang);
    setTargetLang(languages.find(l => l.code === newTargetCode) || targetLang);
  };

  const currentLangs = [nativeLanguage, learningLanguage];
  const otherLangs = languages.filter(l => !currentLangs.some(cl => cl.code === l.code));

  const LanguageOptions = () => (
    <>
      {currentLangs.map(lang => (
        <option key={lang.code} value={lang.code} className="font-bold">
            {lang.name} ({lang.code === nativeLanguage.code ? 'Native' : 'Learning'})
        </option>
      ))}
      <option disabled>──────────</option>
      {otherLangs.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
    </>
  );

  return (
    <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
      <header className="mb-6">
        <h1 className="text-4xl font-heading font-bold tracking-tight">AI Language Coach</h1>
        <p className="text-text-secondary mt-2 text-lg">Get advanced feedback on pronunciation, grammar, and cultural context.</p>
      </header>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
        
        <div className="flex flex-col bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-4">
          <div className="flex items-center mb-2">
            <select id="source-lang-select" value={sourceLang.code} onChange={handleSourceLangChange} className="w-full bg-transparent font-semibold text-text-primary focus:outline-none">
                <LanguageOptions />
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              id="source-text"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={`Enter text in ${sourceLang.name}...`}
              className="w-full flex-1 bg-background-tertiary rounded-lg p-3 text-text-primary placeholder-text-secondary/70 focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none"
              disabled={isLoading}
            />
            <SmartSuggestions
                generateSuggestions={generateTranslatorSuggestions}
                onSuggestionClick={handleSuggestionClick}
                isDisabled={isLoading}
            />
          </div>
        </div>

        <div className="flex flex-row lg:flex-col items-center justify-center gap-4">
           <button onClick={handleSwapLanguages} title="Swap languages" className="p-3 rounded-full bg-background-tertiary hover:bg-background-tertiary/70 transition-colors disabled:opacity-50" aria-label="Swap languages" disabled={isLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-text-secondary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
           </button>
        </div>

        <div className="flex flex-col bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-4">
            <div className="flex items-center mb-2">
                 <select id="target-lang-select" value={targetLang.code} onChange={handleTargetLangChange} className="w-full bg-transparent font-semibold text-text-primary focus:outline-none">
                    <LanguageOptions />
                 </select>
            </div>
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-secondary text-center">
                        <svg className="animate-spin h-8 w-8 text-accent-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className="font-semibold">AI Coach is analyzing...</p>
                        <p className="text-sm">This may take a moment.</p>
                    </div>
                ) : error ? (
                    <div className="h-full flex items-center justify-center text-red-400 p-4 text-center">{error}</div>
                ) : analysisResult ? (
                    <TranslationAnalysisCard 
                        analysis={analysisResult} 
                        onPlayAudio={handlePlayAudio}
                        isTtsLoading={isTtsLoading}
                        ttsProvider={ttsProvider}
                        onTtsProviderChange={setTtsProvider}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-text-secondary text-center">
                        <p>Your translation and AI analysis will appear here.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
       <div className="flex justify-center mt-4">
         <button onClick={handleTranslate} disabled={isLoading || !sourceText.trim()} className="bg-accent-primary text-background-primary font-bold py-3 px-12 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-lg">
             {isLoading ? <Spinner /> : 'Analyze'}
          </button>
       </div>
    </div>
  );
};

export default Translator;