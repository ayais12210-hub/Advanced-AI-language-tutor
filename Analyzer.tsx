import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, TextAnalysis } from './types';
import SmartSuggestions from './SmartSuggestions';
import { PageHeader } from './PageHeader';
import { TextAnalysisCard } from './TextAnalysisCard';

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
    <div className="flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin h-8 w-8 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-text-secondary">Analyzing your text...</p>
    </div>
);

const ButtonSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-background-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface AnalyzerProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
}

const Analyzer: React.FC<AnalyzerProps> = ({ learningLanguage, nativeLanguage, setNativeLanguage, setLearningLanguage }) => {
    const [inputText, setInputText] = useState('');
    const [analysisResult, setAnalysisResult] = useState<TextAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isTtsLoading, setIsTtsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
    
    useEffect(() => {
        return () => {
            if (audioSource) audioSource.stop();
        };
    }, [audioSource]);

    const generateAnalyzerSuggestions = useCallback(async (): Promise<string[]> => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `You are a creative assistant for a language learner. The user is learning ${learningLanguage.name}. Generate 3 short, sample sentences in ${learningLanguage.name} that contain common grammatical mistakes for learners of this language. Provide only a JSON array of strings.`;

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
    }, [learningLanguage]);

    const handleSuggestionClick = (suggestion: string) => {
        setInputText(suggestion);
    };

    const handleAnalyze = async () => {
        if (!inputText.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        const systemInstruction = `You are a world-class AI Language Coach. The user is writing in ${learningLanguage.name}. Their native language is ${nativeLanguage.name}. Your task is to analyze the provided text and give comprehensive feedback. Respond ONLY with a JSON object with the following schema.
- correctedText: The user's text, corrected for grammar, spelling, and style to sound natural and fluent in ${learningLanguage.name}.
- keyFeedbackPoints: A list of 2-3 brief, high-level summaries of the main corrections or improvements made.
- sound: A phonetic breakdown of the correctedText (IPA, syllables, stress).
- meaningAnalysis: Analyze the meaning, nuance, register (formal/informal), and any potential ambiguities in the user's original text.
- structureAnalysis: Analyze the grammar and syntax of the user's original text, explaining any errors.
- usageAnalysis: Explain the typical context, situations, and patterns where the corrected phrase would be used.
- advancedSummary: A detailed synthesis of all feedback for advanced learners.
- alternativePhrasings: A list of other valid ways to express the original idea.
All analysis fields (except correctedText and sound) MUST be in ${nativeLanguage.name} to ensure the user understands.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Please analyze the following text written in ${learningLanguage.name}: "${inputText}"`,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            correctedText: { type: Type.STRING },
                            keyFeedbackPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                            sound: {
                                type: Type.OBJECT,
                                properties: { text: { type: Type.STRING }, ipa: { type: Type.STRING }, syllables: { type: Type.STRING } },
                                required: ['text', 'ipa', 'syllables'],
                            },
                            meaningAnalysis: { type: Type.STRING },
                            structureAnalysis: { type: Type.STRING },
                            usageAnalysis: { type: Type.STRING },
                            advancedSummary: { type: Type.STRING },
                            alternativePhrasings: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ['correctedText', 'keyFeedbackPoints', 'sound', 'meaningAnalysis', 'structureAnalysis', 'usageAnalysis', 'advancedSummary', 'alternativePhrasings'],
                    },
                },
            });
            
            const result = JSON.parse(response.text);
            setAnalysisResult(result);

        } catch (err) {
            console.error(err);
            setError('An error occurred during analysis. The model might not be able to process this specific text. Please try again with a different input.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePlayAudio = async () => {
        const textToSpeak = analysisResult?.correctedText;
        if (!textToSpeak || isLoading || isTtsLoading) return;

        setIsTtsLoading(true);
        setError(null);
        if (audioSource) audioSource.stop();

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: textToSpeak }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
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

        } catch (err) {
            console.error(err);
            setError('Failed to generate speech.');
        } finally {
            setIsTtsLoading(false);
        }
    };


    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <PageHeader
                title="Text Analyzer"
                description={`Get feedback on your ${learningLanguage.name} writing to improve grammar, style, and clarity.`}
                nativeLanguage={nativeLanguage}
                learningLanguage={learningLanguage}
                setNativeLanguage={setNativeLanguage}
                setLearningLanguage={setLearningLanguage}
            />
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="flex flex-col gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={`Paste your ${learningLanguage.name} text here...`}
                            className="flex-1 w-full bg-background-secondary rounded-lg border border-background-tertiary/50 p-4 text-text-primary placeholder-text-secondary/70 focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none"
                            disabled={isLoading}
                        />
                         <SmartSuggestions
                            generateSuggestions={generateAnalyzerSuggestions}
                            onSuggestionClick={handleSuggestionClick}
                            isDisabled={isLoading}
                        />
                    </div>
                     <button onClick={handleAnalyze} disabled={isLoading || !inputText.trim()} className="w-full bg-accent-primary text-background-primary font-bold py-3 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-lg">
                        {isLoading ? <ButtonSpinner /> : 'Analyze Text'}
                    </button>
                </div>
                <div className="bg-background-secondary rounded-lg border border-background-tertiary/50 p-4 overflow-y-auto">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="h-full flex items-center justify-center text-red-400 p-4 text-center">{error}</div>
                    ) : analysisResult ? (
                        <TextAnalysisCard 
                            analysis={analysisResult}
                            onPlayAudio={handlePlayAudio}
                            isTtsLoading={isTtsLoading}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-text-secondary text-center">
                            <p>Analysis results will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analyzer;