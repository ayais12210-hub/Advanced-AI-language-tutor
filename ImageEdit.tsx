import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Language } from './types';
import SmartSuggestions from './SmartSuggestions';
import { PageHeader } from './PageHeader';

const Spinner = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin h-8 w-8 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-text-secondary">Applying AI magic...</p>
    </div>
);

const ImageIconPlaceholder = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-background-tertiary mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-text-secondary/60 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
)

interface ImageEditProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
}

const ImageEdit: React.FC<ImageEditProps> = ({ nativeLanguage, learningLanguage, setNativeLanguage, setLearningLanguage }) => {
    const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                // remove the data url prefix
                resolve(base64data.substring(base64data.indexOf(',') + 1));
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const generateEditSuggestions = useCallback(async (): Promise<string[]> => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const suggestionPrompt = `You are a creative visual assistant. Generate 3 simple but creative image editing instructions in English related to the culture of ${learningLanguage.name}. Provide only a JSON array of strings. Example: ["make the sky look like a van gogh painting", "add a small, curious robot in the corner", "change the season to autumn"]`;

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
            setOriginalImageFile(file);
            setOriginalImagePreview(URL.createObjectURL(file));
            setEditedImage(null); // Reset edited image on new upload
            setError(null);
        }
    };

    const handleEdit = async () => {
        if (!originalImageFile || !prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const base64Data = await blobToBase64(originalImageFile);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: originalImageFile.type } },
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            let foundImage = false;
            const candidate = response.candidates?.[0];
            if (candidate) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                        const base64ImageBytes: string = part.inlineData.data;
                        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                        setEditedImage(imageUrl);
                        foundImage = true;
                        break; // Stop after finding the first image
                    }
                }
            }

            if (!foundImage) {
                throw new Error("No image was generated. The model may have refused the prompt.");
            }

        } catch (err: any) {
            console.error(err);
            if (err?.toString().includes('quota')) {
                setError('API quota exceeded. Please check your plan or try again later.');
            } else {
                setError(err.message || 'Failed to edit image. Please try a different prompt or image.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <PageHeader
                title="Cultural Context"
                description="Edit images with AI to understand cultural nuances visually."
                nativeLanguage={nativeLanguage}
                learningLanguage={learningLanguage}
                setNativeLanguage={setNativeLanguage}
                setLearningLanguage={setLearningLanguage}
            />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Controls & Image Previews */}
                <div className="flex flex-col gap-6">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Original Image */}
                        <div 
                            onClick={() => !isLoading && fileInputRef.current?.click()}
                            className={`bg-background-secondary/50 rounded-lg border-2 border-dashed border-background-tertiary flex items-center justify-center p-4 transition-colors ${!isLoading ? 'cursor-pointer hover:border-accent-primary' : ''}`}
                        >
                            {originalImagePreview ? (
                                <img src={originalImagePreview} alt="Original" className="max-w-full max-h-full object-contain rounded-md" />
                            ) : (
                                <div className="text-center text-text-secondary/70 p-4">
                                    <UploadIcon />
                                    <p className="mt-2 font-semibold">Click to upload image</p>
                                    <p className="text-sm">PNG, JPG, WEBP</p>
                                </div>
                            )}
                        </div>
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" disabled={isLoading}/>
                        
                        {/* Edited Image */}
                        <div className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 flex items-center justify-center p-4">
                            {isLoading ? (
                                <Spinner />
                            ) : error ? (
                                <div className="text-center text-red-400 p-2">
                                    <p className="font-semibold">Error</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            ) : editedImage ? (
                                <img src={editedImage} alt="Edited result" className="max-w-full max-h-full object-contain rounded-md shadow-lg" />
                            ) : (
                                <div className="text-center text-text-secondary">
                                    <ImageIconPlaceholder />
                                    <p className="mt-4 text-sm">Your edited image will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 bg-background-secondary/50 p-6 rounded-lg border border-background-tertiary/50">
                        <div className="flex flex-col gap-2">
                            <textarea
                                rows={3}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., Add a steaming cup of matcha tea on the table"
                                className="w-full bg-background-tertiary rounded-lg p-3 text-text-primary placeholder-text-secondary/70 focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none"
                                disabled={isLoading || !originalImageFile}
                            />
                            <SmartSuggestions
                                generateSuggestions={generateEditSuggestions}
                                onSuggestionClick={handleSuggestionClick}
                                isDisabled={isLoading || !originalImageFile}
                            />
                        </div>
                        <button
                            onClick={handleEdit}
                            disabled={isLoading || !prompt.trim() || !originalImageFile}
                            className="w-full bg-accent-primary text-background-primary font-bold py-3 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-lg"
                        >
                            {isLoading ? 'Editing...' : 'Edit Image'}
                        </button>
                    </div>
                </div>

                {/* Placeholder/Instructions Panel */}
                <aside className="hidden lg:flex flex-col gap-6 bg-background-secondary/50 p-6 rounded-lg border border-background-tertiary/50 text-text-secondary">
                    <h2 className="text-2xl font-heading font-bold text-text-primary">How It Works</h2>
                    <ol className="list-decimal list-inside space-y-4 text-sm">
                        <li>
                            <strong className="text-text-primary">Upload an Image:</strong> Click the upload box to select a starting image from your device.
                        </li>
                        <li>
                            <strong className="text-text-primary">Write an Edit Prompt:</strong> Clearly describe the change you want to make. Be specific!
                        </li>
                        <li>
                            <strong className="text-text-primary">Generate:</strong> Our AI will interpret your prompt and edit the image. The result will appear in the right-hand panel.
                        </li>
                    </ol>
                     <h3 className="text-lg font-heading font-bold text-text-primary mt-4">Example Prompts:</h3>
                     <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>"Change the color of the car to a vibrant red."</li>
                        <li>"Add a majestic castle in the background mountains."</li>
                        <li>"Make it look like it's snowing."</li>
                        <li>"Remove the person on the left."</li>
                    </ul>
                </aside>
            </div>
        </div>
    );
};

export default ImageEdit;