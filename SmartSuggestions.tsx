import React, { useState, useRef, useEffect, useCallback } from 'react';

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.693L7.985 2.985m0 0v4.992m0 0h4.992m-4.993 0l3.181-3.183a8.25 8.25 0 0111.664 0l3.181 3.183" />
    </svg>
);

interface SmartSuggestionsProps {
    generateSuggestions: () => Promise<string[]>;
    onSuggestionClick: (suggestion: string) => void;
    isDisabled?: boolean;
}

const SuggestionSkeleton = () => (
    <div className="h-7 w-36 bg-background-tertiary/50 rounded-full animate-pulse"></div>
);

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ generateSuggestions, onSuggestionClick, isDisabled }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchSuggestions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateSuggestions();
            setSuggestions(result);
        } catch (err: any) {
            console.error("Failed to fetch suggestions:", err);
            if (err?.toString().includes('quota')) {
                setError("API quota exceeded.");
            } else {
                setError("Couldn't get suggestions.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [generateSuggestions]);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);
    
    return (
        <div className="flex items-center gap-2 flex-wrap h-8">
            {isLoading ? (
                <>
                    <SuggestionSkeleton />
                    <SuggestionSkeleton />
                    <SuggestionSkeleton />
                </>
            ) : error ? (
                <p className="text-xs text-red-400">{error}</p>
            ) : (
                suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => onSuggestionClick(s)}
                        disabled={isDisabled}
                        title={`Use suggestion: "${s}"`}
                        className="px-3 py-1 text-xs text-text-primary bg-background-tertiary rounded-full hover:bg-background-tertiary/70 hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {s}
                    </button>
                ))
            )}
            <button
                onClick={fetchSuggestions}
                disabled={isDisabled || isLoading}
                className="p-1.5 bg-background-tertiary/50 rounded-full text-text-secondary hover:bg-background-tertiary hover:text-accent-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Refresh suggestions"
                title="Refresh suggestions"
            >
                <RefreshIcon />
            </button>
        </div>
    );
};

export default SmartSuggestions;
