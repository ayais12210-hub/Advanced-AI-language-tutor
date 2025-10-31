import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, Language } from './types';
import SmartSuggestions from './SmartSuggestions';
import { PageHeader } from './PageHeader';

const aspectRatios: { id: AspectRatio, name: string }[] = [
  { id: '1:1', name: 'Square' },
  { id: '16:9', name: 'Landscape' },
  { id: '9:16', name: 'Portrait' },
  { id: '4:3', name: 'Wide' },
  { id: '3:4', name: 'Tall' },
];

const Spinner = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin h-8 w-8 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-text-secondary">Generating your masterpiece...</p>
    </div>
);

interface ImageGenProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
}

const ImageGen: React.FC<ImageGenProps> = ({ nativeLanguage, learningLanguage, setNativeLanguage, setLearningLanguage }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImageSuggestions = useCallback(async (): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const suggestionPrompt = `You are a creative visual assistant. Generate 3 visually interesting and imaginative image generation prompts in English for a user learning ${learningLanguage.name}. The prompts should be related to the culture, landmarks, or common vocabulary of that language. Provide only a JSON array of strings. Example: ["a photorealistic image of a flamenco dancer in Seville", "a vibrant watercolor painting of Machu Picchu at sunrise"]`;
    
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

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: selectedAspectRatio,
        },
      });
      
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      setGeneratedImage(imageUrl);

    } catch (err) {
        console.error(err);
        setError('Failed to generate image. Please try a different prompt.');
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
      <PageHeader
        title="Visual Vocabulary"
        description="Create stunning visuals from simple text prompts using Imagen."
        nativeLanguage={nativeLanguage}
        learningLanguage={learningLanguage}
        setNativeLanguage={setNativeLanguage}
        setLearningLanguage={setLearningLanguage}
      />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        
        {/* Controls Panel */}
        <div className="flex flex-col gap-6 bg-background-secondary/50 p-6 rounded-lg border border-background-tertiary/50">
          <div className="flex flex-col gap-2">
            <label htmlFor="prompt" className="block text-sm font-medium text-text-secondary">
              Your Prompt
            </label>
            <textarea
              id="prompt"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A majestic lion wearing a crown, cinematic lighting"
              className="w-full bg-background-tertiary rounded-lg p-3 text-text-primary placeholder-text-secondary/70 focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none"
              disabled={isLoading}
            />
             <SmartSuggestions 
                generateSuggestions={generateImageSuggestions}
                onSuggestionClick={handleSuggestionClick}
                isDisabled={isLoading}
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-text-secondary mb-2">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {aspectRatios.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => setSelectedAspectRatio(id)}
                  disabled={isLoading}
                  className={`py-2 px-3 text-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-secondary focus:ring-accent-primary ${
                    selectedAspectRatio === id ? 'bg-accent-primary text-background-primary font-semibold' : 'bg-background-tertiary hover:bg-background-tertiary/50'
                  }`}
                >
                  {name} ({id})
                </button>
              ))}
            </div>
          </div>
            
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-accent-primary text-background-primary font-bold py-3 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-lg mt-auto"
          >
             {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        {/* Image Display Area */}
        <div className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 flex items-center justify-center p-6 aspect-square">
            {isLoading ? (
                <Spinner />
            ) : error ? (
                <div className="text-center text-red-400">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            ) : generatedImage ? (
                <img src={generatedImage} alt="Generated art" className="max-w-full max-h-full object-contain rounded-md shadow-lg" />
            ) : (
                <div className="text-center text-text-secondary">
                    <ImageIconPlaceholder />
                    <p className="mt-4">Your generated image will appear here</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};


const ImageIconPlaceholder = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-background-tertiary mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);


export default ImageGen;