import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Language } from './types';

const SmallSpinner = () => (<svg className="animate-spin h-4 w-4 text-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

interface HoverTranslateProps {
    word: string;
    nativeLanguage: Language;
    learningLanguage: Language;
}

const HoverTranslate: React.FC<HoverTranslateProps> = ({ word, nativeLanguage, learningLanguage }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [translation, setTranslation] = useState<string | null>(null);
    const hasFetched = useRef(false);

    const handleMouseEnter = useCallback(async () => {
        setIsHovering(true);
        if (hasFetched.current || !word) return;

        hasFetched.current = true;
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Translate "${word}" from ${learningLanguage.name} to ${nativeLanguage.name}. Respond with only the single translated word or short phrase, nothing else.`
            });
            setTranslation(response.text.trim().replace(/["'.]/g, ''));
        } catch (error) {
            console.error("Translation failed:", error);
            // Fail silently in the UI
            setTranslation(null);
        } finally {
            setIsLoading(false);
        }
    }, [word, nativeLanguage.name, learningLanguage.name]);

    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    return (
        <span 
            className="relative inline-block cursor-pointer border-b border-dotted border-accent-primary/50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {word}
            {isHovering && (
                <div 
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-background-tertiary text-text-primary text-xs font-semibold rounded-md shadow-lg z-10"
                    style={{
                        transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
                        opacity: isHovering ? 1 : 0,
                        transform: `translateX(-50%) translateY(${isHovering ? '0' : '5px'})`,
                    }}
                >
                    {isLoading ? <SmallSpinner /> : translation || '...'}
                </div>
            )}
        </span>
    );
};

export default HoverTranslate;
