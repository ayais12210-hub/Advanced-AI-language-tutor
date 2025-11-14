import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, Type, GenerateVideosOperation } from "@google/genai";
import { Language, AspectRatio, VideoAspectRatio, SubscriptionTier, FeatureId } from './types';
import SmartSuggestions from './SmartSuggestions';
import { PageHeader } from './PageHeader';
import LockedFeatureGate from './LockedFeatureGate';


const imageAspectRatios: { id: AspectRatio, name: string }[] = [
  { id: '1:1', name: 'Square' }, { id: '16:9', name: 'Landscape' }, { id: '9:16', name: 'Portrait' },
  { id: '4:3', name: 'Wide' }, { id: '3:4', name: 'Tall' },
];
const videoAspectRatios: { id: VideoAspectRatio, name:string }[] = [
  { id: '16:9', name: 'Landscape' }, { id: '9:16', name: 'Portrait' },
];
const loadingMessages = [
    "Warming up the AI engines...", "Consulting with the digital muse...", "Storyboarding your vision...",
    "Gathering pixels and light...", "Rendering the first few frames...",
    "This is a complex process, thank you for your patience.", "Almost there, adding the final polish...",
];


const Spinner = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
        <svg className="animate-spin h-8 w-8 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-text-secondary">{message}</p>
        {message.includes("patience") && <p className="text-sm text-text-secondary/70">Video generation can take several minutes.</p>}
    </div>
);

const PlaceholderIcon = ({mode}: {mode: 'generate' | 'edit' | 'video'}) => {
    const icons = {
        generate: <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-background-tertiary mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        edit: <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-background-tertiary mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        video: <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-background-tertiary mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
    }
    return icons[mode];
}

const UploadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-text-secondary/60 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> );

interface VisualStudioProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
  subscriptionTier: SubscriptionTier;
  setActiveFeature: (feature: FeatureId) => void;
}

const VisualStudio: React.FC<VisualStudioProps> = (props) => {
    const [mode, setMode] = useState<'generate' | 'edit' | 'video'>('generate');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
    
    // Mode-specific state
    const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('1:1');
    const [selectedVideoAspectRatio, setSelectedVideoAspectRatio] = useState<VideoAspectRatio>('16:9');
    const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const loadingIntervalRef = useRef<number | null>(null);

    const checkApiKey = async () => { if (window.aistudio) setApiKeySelected(await window.aistudio.hasSelectedApiKey()); };
    useEffect(() => { if(mode === 'video') checkApiKey(); }, [mode]);

    useEffect(() => {
        if (isLoading && mode === 'video') {
            loadingIntervalRef.current = window.setInterval(() => setLoadingMessage(prev => loadingMessages[(loadingMessages.indexOf(prev) + 1) % loadingMessages.length]), 3000);
        } else if (loadingIntervalRef.current) {
            clearInterval(loadingIntervalRef.current);
            loadingIntervalRef.current = null;
        }
        return () => { if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current); };
    }, [isLoading, mode]);

    const handleModeChange = (newMode: 'generate' | 'edit' | 'video') => {
        if (isLoading) return;
        const oldMode = mode;
        setMode(newMode);
        setError(null);
        setPrompt('');
        
        // If switching from generate to edit/video with a result image, carry it over
        if ((newMode === 'edit' || newMode === 'video') && resultImage && oldMode === 'generate') {
             fetch(resultImage).then(res => res.blob()).then(blob => {
                const file = new File([blob], "generated-image.jpeg", { type: "image/jpeg" });
                setOriginalImageFile(file);
                setOriginalImagePreview(URL.createObjectURL(file));
             });
        } else if (newMode !== oldMode) {
            setOriginalImageFile(null);
            setOriginalImagePreview(null);
        }
        setResultImage(null);
        setResultVideoUrl(null);
    };
    
    const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onloadend = () => resolve((reader.result as string).substring((reader.result as string).indexOf(',') + 1)); reader.onerror = reject; reader.readAsDataURL(blob); });

    const generateSuggestions = useCallback(async (): Promise<string[]> => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        let suggestionPrompt = '';
        if (mode === 'generate') suggestionPrompt = `You are a creative visual assistant. Generate 3 visually interesting and imaginative image generation prompts in English for a user learning ${props.learningLanguage.name}. The prompts should be related to the culture, landmarks, or common vocabulary of that language. Provide only a JSON array of strings. Example: ["a photorealistic image of a flamenco dancer in Seville", "a vibrant watercolor painting of Machu Picchu at sunrise"]`;
        else if (mode === 'edit') suggestionPrompt = `You are a creative visual assistant. Generate 3 simple but creative image editing instructions in English related to the culture of ${props.learningLanguage.name}. Provide only a JSON array of strings. Example: ["make the sky look like a van gogh painting", "add a small, curious robot in the corner", "change the season to autumn"]`;
        else if (mode === 'video') suggestionPrompt = `You are a creative assistant for video generation. Generate 3 short, dynamic, and imaginative video generation prompts in English that could be interesting in the context of learning ${props.learningLanguage.name}. Provide only a JSON array of strings. Example: ["A time-lapse of a bustling market in ${props.learningLanguage.name}", "The camera slowly zooms out, revealing the object is on a famous landmark"]`;

        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: suggestionPrompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } } });
        try { return JSON.parse(response.text); } catch (e) { console.error("Failed to parse suggestions JSON:", e); return []; }
    }, [props.learningLanguage, mode]);

    const handleSuggestionClick = (suggestion: string) => { setPrompt(suggestion); };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { setOriginalImageFile(file); setOriginalImagePreview(URL.createObjectURL(file)); setResultImage(null); setResultVideoUrl(null); setError(null); } };
    const handleSelectKey = async () => { if (window.aistudio) { await window.aistudio.openSelectKey(); setApiKeySelected(true); } };
    
    const handleGenerateImage = async () => {
        if (!prompt.trim() || isLoading) return;
        setIsLoading(true); setError(null); setResultImage(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateImages({ model: 'imagen-4.0-generate-001', prompt, config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: selectedAspectRatio }});
            setResultImage(`data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`);
        } catch (err: any) { console.error(err); setError(err?.toString().includes('quota') ? 'API quota exceeded.' : 'Failed to generate image.');
        } finally { setIsLoading(false); }
    };

    const handleEditImage = async () => {
        if (!originalImageFile || !prompt.trim() || isLoading) return;
        setIsLoading(true); setError(null); setResultImage(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const base64Data = await blobToBase64(originalImageFile);
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: [{ inlineData: { data: base64Data, mimeType: originalImageFile.type } }, { text: prompt }] }, config: { responseModalities: [Modality.IMAGE] } });
            const part = response.candidates?.[0]?.content.parts.find(p => p.inlineData);
            if (part?.inlineData) setResultImage(`data:image/png;base64,${part.inlineData.data}`); else throw new Error("No image was generated.");
        } catch (err: any) { console.error(err); setError(err?.toString().includes('quota') ? 'API quota exceeded.' : err.message || 'Failed to edit image.');
        } finally { setIsLoading(false); }
    };

    const handleGenerateVideo = async () => {
        if (!originalImageFile || !prompt.trim() || isLoading) return;
        setIsLoading(true); setError(null); setResultVideoUrl(null); setLoadingMessage(loadingMessages[0]);
        let operation: GenerateVideosOperation;
        try {
            const base64Data = await blobToBase64(originalImageFile);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            operation = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt, image: { imageBytes: base64Data, mimeType: originalImageFile.type }, config: { numberOfVideos: 1, resolution: '720p', aspectRatio: selectedVideoAspectRatio } });
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation });
            }
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!downloadLink) throw new Error("Video generation completed, but no download link was found.");
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) throw new Error(`Failed to download video: ${videoResponse.statusText}`);
            setResultVideoUrl(URL.createObjectURL(await videoResponse.blob()));
        } catch (err: any) {
            console.error(err); const errorMessage = err.message || 'An unknown error occurred.';
            if (err?.toString().includes('quota')) setError('API quota exceeded. Please check your plan or billing details.');
            else if (errorMessage.includes("Requested entity was not found.")) { setError("API Key is invalid. Please select a valid key."); setApiKeySelected(false); }
            else setError(errorMessage);
        } finally { setIsLoading(false); }
    };

    const handleSubmit = () => {
        if (mode === 'generate') handleGenerateImage();
        else if (mode === 'edit') handleEditImage();
        else handleGenerateVideo();
    };

    const isSubmitDisabled = isLoading || !prompt.trim() || ((mode === 'edit' || mode === 'video') && !originalImageFile);
    
    const renderApiKeyPrompt = () => (
        <div className="text-center bg-background-secondary p-8 rounded-lg shadow-xl max-w-md border border-background-tertiary/50">
            <h2 className="text-2xl font-bold mb-4">API Key Required for Veo</h2>
            <p className="text-text-secondary mb-6">Video generation requires you to select your own API key. Ensure your project has billing enabled. See the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">billing documentation</a> for details.</p>
            <button onClick={handleSelectKey} className="bg-accent-primary text-background-primary font-bold py-3 px-6 rounded-lg hover:bg-accent-primary-dark transition-colors duration-200">Select API Key</button>
            {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
    );
    
    if (mode === 'video' && !apiKeySelected) {
        return <div className="p-8 h-full flex items-center justify-center">{renderApiKeyPrompt()}</div>
    }

    return (
        <LockedFeatureGate featureName="Video Generation" requiredTier="Pro" currentTier={props.subscriptionTier} setActiveFeature={props.setActiveFeature}>
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <PageHeader title="Visual Studio" description="Create images, videos, and edit visuals with AI." {...props} setActiveFeature={props.setActiveFeature}/>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <div className="flex flex-col gap-6 bg-background-secondary/50 p-6 rounded-lg border border-background-tertiary/50">
                    <div className="flex bg-background-tertiary rounded-md p-1">
                        <button onClick={() => handleModeChange('generate')} disabled={isLoading} className={`flex-1 p-2 text-sm rounded transition-colors ${mode === 'generate' ? 'bg-accent-primary text-background-primary font-semibold' : 'hover:bg-background-secondary/50'}`}>Generate</button>
                        <button onClick={() => handleModeChange('edit')} disabled={isLoading} className={`flex-1 p-2 text-sm rounded transition-colors ${mode === 'edit' ? 'bg-accent-primary text-background-primary font-semibold' : 'hover:bg-background-secondary/50'}`}>Edit</button>
                        <button onClick={() => handleModeChange('video')} disabled={isLoading} className={`flex-1 p-2 text-sm rounded transition-colors ${mode === 'video' ? 'bg-accent-primary text-background-primary font-semibold' : 'hover:bg-background-secondary/50'}`}>Video</button>
                    </div>

                    {(mode === 'edit' || mode === 'video') && (
                        <div onClick={() => !isLoading && fileInputRef.current?.click()} className={`flex-1 bg-background-secondary h-48 rounded-lg border-2 border-dashed border-background-tertiary flex items-center justify-center transition-colors ${!isLoading ? 'cursor-pointer hover:border-accent-primary' : ''}`}>
                            {originalImagePreview ? <img src={originalImagePreview} alt="Original" className="max-w-full max-h-full object-contain rounded-md p-1" /> : <div className="text-center text-text-secondary/70"><UploadIcon /><p className="mt-2 font-semibold text-sm">Click to upload starting image</p></div>}
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" disabled={isLoading}/>
          
                    <div className="flex flex-col gap-2">
                        <label htmlFor="prompt" className="block text-sm font-medium text-text-secondary">Your Prompt</label>
                        <textarea id="prompt" rows={mode === 'generate' ? 5 : 3} value={prompt} onChange={(e) => setPrompt(e.target.value)}
                            placeholder={mode === 'generate' ? "e.g., A majestic lion wearing a crown" : mode === 'edit' ? "e.g., Add a steaming cup of matcha" : "e.g., A neon hologram of a cat driving"}
                            className="w-full bg-background-tertiary rounded-lg p-3 placeholder-text-secondary/70 focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none" disabled={isSubmitDisabled || isLoading}
                        />
                        <SmartSuggestions generateSuggestions={generateSuggestions} onSuggestionClick={handleSuggestionClick} isDisabled={isLoading || (mode !== 'generate' && !originalImageFile)} />
                    </div>

                    {mode === 'generate' && <div><label className="block text-sm font-medium text-text-secondary mb-2">Aspect Ratio</label><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">{imageAspectRatios.map(({ id, name }) => <button key={id} onClick={() => setSelectedAspectRatio(id)} disabled={isLoading} className={`py-2 px-3 text-sm rounded-md transition-all ${selectedAspectRatio === id ? 'bg-accent-primary text-background-primary font-semibold' : 'bg-background-tertiary hover:bg-background-tertiary/50'}`}>{name}</button>)}</div></div>}
                    {mode === 'video' && <div><label className="block text-sm font-medium text-text-secondary mb-2">Aspect Ratio</label><div className="flex gap-3">{videoAspectRatios.map(({ id, name }) => <button key={id} onClick={() => setSelectedVideoAspectRatio(id)} disabled={isLoading} className={`py-2 px-4 text-sm rounded-md transition-all ${selectedVideoAspectRatio === id ? 'bg-accent-primary text-background-primary font-semibold' : 'bg-background-tertiary hover:bg-background-tertiary/50'}`}>{name} ({id})</button>)}</div></div>}
            
                    <button onClick={handleSubmit} disabled={isSubmitDisabled} className="w-full bg-accent-primary text-background-primary font-bold py-3 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-colors text-lg mt-auto">
                        {isLoading ? (mode === 'generate' ? 'Generating...' : mode === 'edit' ? 'Editing...' : 'Generating Video...') : (mode === 'generate' ? 'Generate Image' : mode === 'edit' ? 'Edit Image' : 'Generate Video')}
                    </button>
                </div>

                <div className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 flex items-center justify-center p-6 aspect-square">
                    {isLoading ? <Spinner message={mode === 'video' ? loadingMessage : 'Applying AI magic...'} />
                        : error ? <div className="text-center text-red-400"><p className="font-semibold">Error</p><p>{error}</p></div>
                        : resultVideoUrl ? <video src={resultVideoUrl} controls autoPlay loop className="max-w-full max-h-full rounded-md shadow-lg" />
                        : resultImage ? <img src={resultImage} alt="Generated art" className="max-w-full max-h-full object-contain rounded-md shadow-lg" />
                        : <div className="text-center text-text-secondary"><PlaceholderIcon mode={mode}/><p className="mt-4">Your result will appear here</p></div>
                    }
                </div>
            </div>
        </div>
        </LockedFeatureGate>
    );
};

export default VisualStudio;
