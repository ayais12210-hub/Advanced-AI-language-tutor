import React, { useState, useCallback, useRef, FormEvent, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Language, ChatMessage } from './types';
import SmartSuggestions from './SmartSuggestions';
import { PageHeader } from './PageHeader';

const Spinner = () => (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-text-secondary/60 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);

interface ContentAnalyzerProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
}

const ContentAnalyzer: React.FC<ContentAnalyzerProps> = ({ learningLanguage, nativeLanguage, setNativeLanguage, setLearningLanguage }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isLoading]);

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

    const generateAnalyzerSuggestions = useCallback(async (): Promise<string[]> => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `You are a creative assistant. The user has uploaded an image and is learning ${learningLanguage.name}. Generate 3 interesting, open-ended questions in ${learningLanguage.name} that someone could ask about an image. Provide only a JSON array of strings.`;

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
    }, [learningLanguage]);

    const handleSuggestionClick = (suggestion: string) => {
        setUserInput(suggestion);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setChatHistory([]);
            setError(null);
            setUserInput('');
        }
    };

    const handleClearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setChatHistory([]);
        setError(null);
    };

    const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userInput.trim() || !imageFile || isLoading) return;

        setIsLoading(true);
        setError(null);
        
        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', parts: [{ text: userInput }] };
        setChatHistory(prev => [...prev, userMessage]);
        setUserInput('');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const base64Data = await blobToBase64(imageFile);
            
            const imagePart = { inlineData: { mimeType: imageFile.type, data: base64Data } };
            const textPart = { text: `The user is a ${nativeLanguage.name} speaker learning ${learningLanguage.name}. Please respond in ${learningLanguage.name}, and provide a translation in ${nativeLanguage.name} like this: *(${nativeLanguage.name}: Your translation here)*. User's query: ${userInput}` };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });

            const modelMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', parts: [{ text: response.text }] };
            setChatHistory(prev => [...prev, modelMessage]);

        } catch (err) {
            console.error(err);
            const errorMessage = 'Sorry, I encountered an error analyzing the image.';
            setError(errorMessage);
            setChatHistory(prev => [...prev, { id: `error-${Date.now()}`, role: 'model', parts: [{ text: errorMessage }] }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <PageHeader
                title="Content Analyzer"
                description={`Upload an image and ask questions in ${learningLanguage.name} to understand it.`}
                nativeLanguage={nativeLanguage}
                learningLanguage={learningLanguage}
                setNativeLanguage={setNativeLanguage}
                setLearningLanguage={setLearningLanguage}
            />
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 overflow-hidden">
                {/* Left Column: Image Upload */}
                <div className="lg:col-span-1 flex flex-col gap-4 bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-4">
                    <div 
                        onClick={() => !isLoading && fileInputRef.current?.click()}
                        className={`flex-1 bg-background-secondary rounded-lg border-2 border-dashed border-background-tertiary flex items-center justify-center p-4 transition-colors ${!isLoading && !imagePreview ? 'cursor-pointer hover:border-accent-primary' : ''}`}
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt="Uploaded content" className="max-w-full max-h-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center text-text-secondary/70 p-4">
                                <UploadIcon />
                                <p className="mt-2 font-semibold">Click to upload an image</p>
                                <p className="text-sm">PNG, JPG, WEBP</p>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" disabled={isLoading}/>
                    {imagePreview && (
                        <button onClick={handleClearImage} disabled={isLoading} className="w-full bg-background-tertiary text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-background-tertiary/70 disabled:opacity-50 transition-colors">
                            Clear Image
                        </button>
                    )}
                </div>

                {/* Right Column: Chat */}
                <div className="lg:col-span-2 flex flex-col bg-background-secondary/50 rounded-lg border border-background-tertiary/50 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {!imagePreview ? (
                            <div className="text-center text-text-secondary h-full flex items-center justify-center">
                                <p>Please upload an image to begin the analysis.</p>
                            </div>
                        ) : chatHistory.length === 0 && (
                            <div className="text-center text-text-secondary h-full flex items-center justify-center">
                                <p>Ask a question about the image in {learningLanguage.name}.</p>
                            </div>
                        )}
                        {chatHistory.map((message) => (
                            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xl px-5 py-3 rounded-2xl shadow-md ${message.role === 'user' ? 'bg-accent-primary text-background-primary' : 'bg-background-tertiary text-text-primary'}`}>
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
                                    </div>
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
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder={imageFile ? `Ask about the image in ${learningLanguage.name}...` : "Upload an image first"}
                                    className="w-full bg-background-tertiary rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none"
                                    rows={2}
                                    disabled={isLoading || !imageFile}
                                />
                                {imageFile && (
                                    <SmartSuggestions
                                        generateSuggestions={generateAnalyzerSuggestions}
                                        onSuggestionClick={handleSuggestionClick}
                                        isDisabled={isLoading || !imageFile}
                                    />
                                )}
                            </div>
                            <button type="submit" disabled={isLoading || !userInput.trim() || !imageFile} className="bg-accent-primary text-white font-semibold py-3 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:cursor-not-allowed transition-colors duration-200 self-stretch flex items-center justify-center">
                                {isLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentAnalyzer;
