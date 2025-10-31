

import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Import the correct `GenerateVideosOperation` type and remove unused/incorrect ones.
import { GoogleGenAI, Type, GenerateVideosOperation } from "@google/genai";
import { VideoAspectRatio, Language } from './types';
import SmartSuggestions from './SmartSuggestions';
import { PageHeader } from './PageHeader';

const aspectRatios: { id: VideoAspectRatio, name:string }[] = [
  { id: '16:9', name: 'Landscape' },
  { id: '9:16', name: 'Portrait' },
];

const loadingMessages = [
    "Warming up the AI engines...",
    "Consulting with the digital muse...",
    "Storyboarding your vision...",
    "Gathering pixels and light...",
    "Rendering the first few frames...",
    "This is a complex process, thank you for your patience.",
    "Almost there, adding the final polish...",
];

const Spinner = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
        <svg className="animate-spin h-8 w-8 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-text-secondary">{message}</p>
        <p className="text-sm text-text-secondary/70">Video generation can take several minutes.</p>
    </div>
);

const VideoPlaceholder = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-background-tertiary mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-text-secondary/60 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

interface VideoGenProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
}

const VideoGen: React.FC<VideoGenProps> = ({ nativeLanguage, learningLanguage, setNativeLanguage, setLearningLanguage }) => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [selectedAspectRatio, setSelectedAspectRatio] = useState<VideoAspectRatio>('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const loadingIntervalRef = useRef<number | null>(null);

    const checkApiKey = async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        }
    };

    useEffect(() => {
        checkApiKey();
    }, []);
    
    useEffect(() => {
        if (isLoading) {
            loadingIntervalRef.current = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 3000);
        } else if (loadingIntervalRef.current) {
            clearInterval(loadingIntervalRef.current);
            loadingIntervalRef.current = null;
        }
        return () => {
            if (loadingIntervalRef.current) {
                clearInterval(loadingIntervalRef.current);
            }
        };
    }, [isLoading]);

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                resolve(base64data.substring(base64data.indexOf(',') + 1));
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const generateVideoSuggestions = useCallback(async (): Promise<string[]> => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const suggestionPrompt = `You are a creative assistant for video generation. Generate 3 short, dynamic, and imaginative video generation prompts in English that could be interesting in the context of learning ${learningLanguage.name}. Provide only a JSON array of strings. Example: ["A time-lapse of a bustling market in ${learningLanguage.name}", "The camera slowly zooms out, revealing the object is on a famous landmark"]`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: suggestionPrompt,
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
        setPrompt(suggestion);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setGeneratedVideoUrl(null);
            setError(null);
        }
    };

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
        }
    };

    const handleGenerate = async () => {
        if (!imageFile || !prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);
        setLoadingMessage(loadingMessages[0]);

        // FIX: Use the specific `GenerateVideosOperation` type instead of the generic `Operation` type.
        let operation: GenerateVideosOperation;

        try {
            const base64Data = await blobToBase64(imageFile);
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                image: {
                    imageBytes: base64Data,
                    mimeType: imageFile.type,
                },
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: selectedAspectRatio,
                }
            });

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation });
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!downloadLink) {
                throw new Error("Video generation completed, but no download link was found.");
            }
            
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) {
                throw new Error(`Failed to download video: ${videoResponse.statusText}`);
            }
            const videoBlob = await videoResponse.blob();
            const videoUrl = URL.createObjectURL(videoBlob);
            setGeneratedVideoUrl(videoUrl);

        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || 'An unknown error occurred during video generation.';
            if (errorMessage.includes("Requested entity was not found.")) {
                setError("API Key is invalid. Please select a valid key.");
                setApiKeySelected(false);
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!apiKeySelected) {
        return (
            <div className="p-8 h-full flex items-center justify-center bg-background-primary text-text-primary">
                <div className="text-center bg-background-secondary p-8 rounded-lg shadow-xl max-w-md border border-background-tertiary/50">
                    <h2 className="text-2xl font-bold mb-4">API Key Required for Veo</h2>
                    <p className="text-text-secondary mb-6">
                        Video generation with Veo is a powerful feature that requires you to select your own API key.
                        Please ensure your project has billing enabled. For more details, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">billing documentation</a>.
                    </p>
                    <button
                        onClick={handleSelectKey}
                        className="bg-accent-primary text-background-primary font-bold py-3 px-6 rounded-lg hover:bg-accent-primary-dark transition-colors duration-200"
                    >
                        Select API Key
                    </button>
                    {error && <p className="text-red-400 mt-4">{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <PageHeader
                title="Immersive Scenarios"
                description="Upload an image, describe a scene, and let Veo create a video."
                nativeLanguage={nativeLanguage}
                learningLanguage={learningLanguage}
                setNativeLanguage={setNativeLanguage}
                setLearningLanguage={setLearningLanguage}
            />
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Controls Panel */}
                <div className="flex flex-col gap-6 bg-background-secondary/50 p-6 rounded-lg border border-background-tertiary/50">
                     <div 
                        onClick={() => !isLoading && fileInputRef.current?.click()}
                        className={`flex-1 bg-background-secondary h-64 rounded-lg border-2 border-dashed border-background-tertiary flex items-center justify-center transition-colors ${!isLoading ? 'cursor-pointer hover:border-accent-primary' : ''}`}
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt="Uploaded preview" className="max-w-full max-h-full object-contain rounded-md p-2" />
                        ) : (
                            <div className="text-center text-text-secondary/70 p-4">
                                <UploadIcon />
                                <p className="mt-2 font-semibold">Click to upload starting image</p>
                                <p className="text-sm">PNG, JPG, WEBP</p>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" disabled={isLoading}/>
                    
                    <div className="flex flex-col gap-2">
                        <textarea
                            rows={3}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A neon hologram of a cat driving at top speed"
                            className="w-full bg-background-tertiary rounded-lg p-3 text-text-primary placeholder-text-secondary/70 focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none"
                            disabled={isLoading || !imageFile}
                        />
                         <SmartSuggestions
                            generateSuggestions={generateVideoSuggestions}
                            onSuggestionClick={handleSuggestionClick}
                            isDisabled={isLoading || !imageFile}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-text-secondary">Aspect Ratio:</label>
                        <div className="flex gap-3">
                            {aspectRatios.map(({ id, name }) => (
                                <button key={id} onClick={() => setSelectedAspectRatio(id)} disabled={isLoading}
                                    className={`py-2 px-4 text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-secondary focus:ring-accent-primary ${selectedAspectRatio === id ? 'bg-accent-primary text-background-primary font-semibold' : 'bg-background-tertiary hover:bg-background-tertiary/50'}`}>
                                    {name} ({id})
                                </button>
                            ))}
                        </div>
                    </div>
            
                    <button onClick={handleGenerate} disabled={isLoading || !prompt.trim() || !imageFile}
                        className="w-full bg-accent-primary text-background-primary font-bold py-3 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-lg mt-auto">
                        {isLoading ? 'Generating Video...' : 'Generate Video'}
                    </button>
                </div>

                {/* Video Display Area */}
                <div className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 flex items-center justify-center p-6">
                    {isLoading ? (
                        <Spinner message={loadingMessage} />
                    ) : error ? (
                        <div className="text-center text-red-400 p-4">
                            <p className="font-semibold">Generation Failed</p>
                            <p>{error}</p>
                        </div>
                    ) : generatedVideoUrl ? (
                        <video src={generatedVideoUrl} controls autoPlay loop className="max-w-full max-h-full rounded-md shadow-lg" />
                    ) : (
                        <div className="text-center text-text-secondary">
                            <VideoPlaceholder />
                            <p className="mt-4">Your generated video will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoGen;