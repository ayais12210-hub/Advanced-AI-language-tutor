

import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Language, GroundingChunk } from './types';
import SmartSuggestions from './SmartSuggestions';
import { PageHeader } from './PageHeader';

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface Message {
  text: string;
  isUser: boolean;
  sources?: GroundingChunk[];
}

interface GroundingProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
}

const Grounding: React.FC<GroundingProps> = ({ learningLanguage, nativeLanguage, setNativeLanguage, setLearningLanguage }) => {
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);

    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (err) => {
                console.warn("Could not get user location:", err.message);
            }
        );
    }, []);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const generateGroundingSuggestions = useCallback(async (): Promise<string[]> => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `You are a creative assistant for a language learner exploring the world. The user is learning ${learningLanguage.name}. Generate 3 interesting questions in ${learningLanguage.name} about geography, culture, or recent events. Provide only a JSON array of strings. Example: ["What are the most popular tourist attractions in Rome?", "Who won the latest world cup?"]`;

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
        setUserInput(suggestion);
    };

    const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setMessages(prev => [...prev, { text: userInput, isUser: true }]);
        setUserInput('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userInput,
                config: {
                    tools: [{ googleSearch: {} }, { googleMaps: {} }],
                    ...(userLocation && {
                        toolConfig: {
                            retrievalConfig: {
                                latLng: userLocation,
                            }
                        }
                    })
                },
            });

            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setMessages(prev => [...prev, { text: response.text, isUser: false, sources }]);
        } catch (err) {
            console.error(err);
            const errorMessage = 'Sorry, I encountered an error. Please try again.';
            setError(errorMessage);
            setMessages(prev => [...prev, { text: errorMessage, isUser: false }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderSources = (sources: GroundingChunk[]) => {
        const uniqueLinks = new Map<string, string>();
        sources.forEach(chunk => {
            if (chunk.web?.uri) uniqueLinks.set(chunk.web.uri, chunk.web.title || chunk.web.uri);
            if (chunk.maps?.uri) uniqueLinks.set(chunk.maps.uri, chunk.maps.title || chunk.maps.uri);
            // FIX: Extract and display review snippet links from grounding metadata.
            if (chunk.maps?.placeAnswerSources?.reviewSnippets) {
                chunk.maps.placeAnswerSources.reviewSnippets.forEach(snippet => {
                    if (snippet.uri) {
                        uniqueLinks.set(snippet.uri, snippet.title || snippet.uri);
                    }
                });
            }
        });

        if (uniqueLinks.size === 0) return null;

        return (
            <div className="mt-3 pt-3 border-t border-background-tertiary/30">
                <h4 className="text-xs font-semibold text-text-secondary mb-2">Sources:</h4>
                <div className="flex flex-wrap gap-2">
                    {Array.from(uniqueLinks.entries()).map(([uri, title], index) => (
                        <a href={uri} key={index} target="_blank" rel="noopener noreferrer"
                           className="text-xs bg-accent-secondary/20 text-accent-secondary px-2 py-1 rounded-md hover:bg-accent-secondary/40 transition-colors truncate max-w-[200px]">
                            {title}
                        </a>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <PageHeader
                title="Explore & Discover"
                description={`Ask questions about the world in ${learningLanguage.name} and get answers grounded in Google Search and Maps.`}
                nativeLanguage={nativeLanguage}
                learningLanguage={learningLanguage}
                setNativeLanguage={setNativeLanguage}
                setLearningLanguage={setLearningLanguage}
            />
            <div className="flex-1 flex flex-col bg-background-secondary/50 rounded-lg border border-background-tertiary/50 overflow-hidden mt-6">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.length === 0 && (
                        <div className="text-center text-text-secondary h-full flex items-center justify-center">
                            <p>Ask about recent events, nearby places, or any topic to get up-to-date info.</p>
                        </div>
                    )}
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-2xl px-5 py-3 rounded-2xl shadow-md ${message.isUser ? 'bg-accent-primary text-background-primary' : 'bg-background-tertiary text-text-primary'}`}>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{message.text}</ReactMarkdown>
                                </div>
                                {message.sources && renderSources(message.sources)}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xl px-5 py-3 rounded-2xl shadow-md bg-background-tertiary text-text-primary flex items-center">
                               <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse mr-2 delay-75"></div>
                               <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse mr-2 delay-150"></div>
                               <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse delay-300"></div>
                            </div>
                        </div>
                    )}
                    <div ref={endOfMessagesRef} />
                </div>
                <div className="border-t border-background-tertiary/50 p-4 bg-background-secondary">
                    <form onSubmit={handleSendMessage} className="flex items-start space-x-4">
                        <div className="flex-1 flex flex-col gap-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="e.g., What are some famous landmarks in Paris?"
                                className="w-full bg-background-tertiary rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-primary focus:outline-none"
                                disabled={isLoading}
                            />
                            <SmartSuggestions
                                generateSuggestions={generateGroundingSuggestions}
                                onSuggestionClick={handleSuggestionClick}
                                isDisabled={isLoading}
                            />
                        </div>
                        <button type="submit" disabled={isLoading || !userInput.trim()}
                            className="bg-accent-primary text-white font-semibold py-3 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center w-[58px] h-[48px]">
                            {isLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Grounding;