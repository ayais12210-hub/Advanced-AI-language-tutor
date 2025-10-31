import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Language } from './types';
import SmartSuggestions from './SmartSuggestions';
import { PageHeader } from './PageHeader';

const voices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

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

interface TTSProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
}

const TTS: React.FC<TTSProps> = ({ learningLanguage, nativeLanguage, setNativeLanguage, setLearningLanguage }) => {
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('Kore');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);

    // Clean up audio context when component unmounts or audio finishes
    useEffect(() => {
        return () => {
            if (audioSource) {
                audioSource.stop();
            }
        };
    }, [audioSource]);

    const generateTTSSuggestions = useCallback(async (): Promise<string[]> => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `You are a creative assistant for a language learner. The user is learning ${learningLanguage.name}. Generate 3 tongue twisters or phonetically challenging sentences in ${learningLanguage.name}. Keep them short. Provide only a JSON array of strings.`;

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
        setText(suggestion);
    };

    const handleGenerateSpeech = async () => {
        if (!text.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        if (audioSource) {
            audioSource.stop();
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: `In ${learningLanguage.name}, say: ${text}` }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: selectedVoice },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) {
                throw new Error("No audio data received from the API.");
            }

            const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
            
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.start();

            setAudioSource(source);

        } catch (err) {
            console.error(err);
            setError('Failed to generate speech. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <PageHeader
                title="Pronunciation Practice"
                description={`Type any text in ${learningLanguage.name} to hear it spoken aloud.`}
                nativeLanguage={nativeLanguage}
                learningLanguage={learningLanguage}
                setNativeLanguage={setNativeLanguage}
                setLearningLanguage={setLearningLanguage}
            />
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-2xl bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-8 shadow-lg">
                    <div className="flex flex-col gap-2">
                        <textarea
                            rows={6}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="e.g., ¿Dónde está la biblioteca?"
                            className="w-full bg-background-tertiary rounded-lg p-4 text-text-primary placeholder-text-secondary/70 focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none"
                            disabled={isLoading}
                        />
                        <SmartSuggestions
                            generateSuggestions={generateTTSSuggestions}
                            onSuggestionClick={handleSuggestionClick}
                            isDisabled={isLoading}
                        />
                    </div>
                    <div className="mt-6">
                        <label htmlFor="voice-select" className="block text-sm font-medium text-text-secondary mb-2">
                            Select a Voice
                        </label>
                        <select
                            id="voice-select"
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-background-tertiary rounded-md p-3 text-sm text-text-primary focus:ring-1 focus:ring-accent-primary focus:outline-none"
                        >
                            {voices.map(voice => <option key={voice} value={voice}>{voice}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
                    <button
                        onClick={handleGenerateSpeech}
                        disabled={isLoading || !text.trim()}
                        className="w-full mt-6 bg-accent-primary text-background-primary font-bold py-4 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-lg"
                    >
                        {isLoading ? 'Generating...' : 'Speak Text'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TTS;