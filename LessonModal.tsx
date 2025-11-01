import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Lesson, Language, TranslationAnalysis, MasteryLevel } from './types';
import { TranslationAnalysisCard } from './TranslationAnalysis';

// --- AUDIO HELPERS ---
function decode(base64: string) { const binaryString = atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); } return bytes; }
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { const dataInt16 = new Int16Array(data.buffer); const frameCount = dataInt16.length / numChannels; const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate); for (let channel = 0; channel < numChannels; channel++) { const channelData = buffer.getChannelData(channel); for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; } } return buffer; }
const Spinner = () => (<svg className="animate-spin h-6 w-6 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

// --- LESSON CONTENT COMPONENTS ---

const PlaceholderLesson: React.FC<{lesson: Lesson | MasteryLevel}> = ({ lesson }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary">
        <div className="text-5xl mb-4">🚧</div>
        <h3 className="text-2xl font-bold text-text-primary">{lesson.title}</h3>
        <p className="mt-2">This interactive lesson is currently under construction.</p>
        <p>Check back soon for exciting new content!</p>
    </div>
);

// Generic component for grid-based lessons (Alphabet, Numbers, Colors)
const GridLesson: React.FC<{ title: string, itemType: string, language: Language, generateItems: (lang: Language) => Promise<any[]> }> = ({ title, itemType, language, generateItems }) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [ttsLoading, setTtsLoading] = useState<string | null>(null);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            setError(null);
            try {
                const generated = await generateItems(language);
                setItems(generated);
            } catch (err: any) {
                console.error(`Failed to fetch grid items for ${title}`, err);
                setError(err.toString().includes('quota') ? 'API quota exceeded.' : 'Could not load lesson content.');
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [language, generateItems, title]);

    const playSound = async (text: string) => {
        setTtsLoading(text);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: `In ${language.name}, say: ${text}` }] }],
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
        } catch (error: any) {
            console.error(`Failed to play TTS for "${text}"`, error);
            if (error.toString().includes('quota')) {
              alert('Could not play audio: API quota exceeded.');
            }
        } finally {
            setTtsLoading(null);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-48"><Spinner /></div>;
    if (error) return <div className="flex justify-center items-center h-48 text-red-400">{error}</div>;

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">{title} in {language.name}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {items.map((item, index) => {
                    const text = typeof item === 'object' ? item.name : item;
                    const display = typeof item === 'object' ? `${item.name} (${item.value})` : item;
                    return (
                        <button
                            key={index}
                            onClick={() => playSound(text)}
                            className="aspect-square flex items-center justify-center p-2 rounded-lg bg-background-tertiary hover:bg-accent-primary/20 transition-colors text-lg font-semibold"
                        >
                            {ttsLoading === text ? <Spinner /> : <span>{display}</span>}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};


const PhrasesLesson: React.FC<{ lesson: Lesson | MasteryLevel, nativeLanguage: Language, learningLanguage: Language }> = ({ lesson, nativeLanguage, learningLanguage }) => {
    const [phrases, setPhrases] = useState<any[]>([]);
    const [error, setError] = useState<string|null>(null);
    const [loading, setLoading] = useState(true);
    const [activeAnalysis, setActiveAnalysis] = useState<TranslationAnalysis | null>(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [ttsLoading, setIsTtsLoading] = useState(false);

    useEffect(() => {
        const fetchPhrases = async () => {
            setLoading(true);
            setError(null);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Generate a JSON array of 5 common phrases related to "${lesson.title}" for someone learning ${learningLanguage.name}. Each object should have a "phrase" in ${learningLanguage.name} and a "translation" in ${nativeLanguage.name}.`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    phrase: { type: Type.STRING },
                                    translation: { type: Type.STRING }
                                }
                            }
                        }
                    }
                });
                setPhrases(JSON.parse(response.text));
            } catch (err: any) {
                console.error('Failed to fetch phrases:', err);
                setError(err.toString().includes('quota') ? 'API quota exceeded.' : 'Could not load lesson content.');
            } finally {
                setLoading(false);
            }
        };
        fetchPhrases();
    }, [lesson.title, learningLanguage.name, nativeLanguage.name]);

    const handleDeepDive = async (phrase: string) => {
        setAnalysisLoading(true);
        setActiveAnalysis(null);
        const systemInstruction = `You are a world-class AI Language Coach. The user's native language is ${nativeLanguage.name} and they are learning ${learningLanguage.name}. When given text, provide a comprehensive analysis as a JSON object. All analysis fields MUST be in ${nativeLanguage.name} to ensure the user understands. Respond ONLY with the JSON object.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Please provide a deep analysis of the following phrase in ${learningLanguage.name}: "${phrase}"`,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: { /* Re-using schema from Translator.tsx */
                        type: Type.OBJECT,
                        properties: {
                            professionalTranslation: { type: Type.STRING, description: `The phrase translated to ${nativeLanguage.name}.` },
                            translationConfidence: { type: Type.NUMBER },
                            sound: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, ipa: { type: Type.STRING }, syllables: { type: Type.STRING } }, required: ['text', 'ipa', 'syllables'], },
                            meaning: { type: Type.STRING },
                            structure: { type: Type.STRING },
                            learningProcess: { type: Type.ARRAY, items: { type: Type.STRING } },
                            usage: { type: Type.STRING },
                            advancedSummary: { type: Type.STRING },
                            alternativeTranslations: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                         required: ['professionalTranslation', 'translationConfidence', 'sound', 'meaning', 'structure', 'learningProcess', 'usage', 'advancedSummary', 'alternativeTranslations'],
                    },
                },
            });
            const result = JSON.parse(response.text);
            // The professionalTranslation field in the schema should be from the target to native language.
            // But the model might get confused and translate the other way. Let's fix that here.
            result.professionalTranslation = phrases.find(p => p.phrase === phrase)?.translation || result.professionalTranslation;
            setActiveAnalysis(result);
        } catch (err: any) {
            console.error("Deep dive analysis failed:", err);
             if (err.toString().includes('quota')) {
                alert('Could not get deep dive: API quota exceeded.');
            } else {
                alert('Deep dive analysis failed.');
            }
        } finally {
            setAnalysisLoading(false);
        }
    };
    
    const playAudio = async () => {
        const textToSpeak = activeAnalysis?.sound.text;
        if (!textToSpeak || analysisLoading || ttsLoading) return;
        setIsTtsLoading(true);
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
        } catch(e: any) {
            console.error(e);
            if (e.toString().includes('quota')) {
                alert('Could not play audio: API quota exceeded.');
            }
        } finally {
            setIsTtsLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-48"><Spinner /></div>;
    if (error) return <div className="flex justify-center items-center h-48 text-red-400">{error}</div>;

    if (activeAnalysis || analysisLoading) {
        return (
            <div>
                <button onClick={() => setActiveAnalysis(null)} className="mb-4 text-sm text-accent-primary hover:underline">&larr; Back to Phrases</button>
                {analysisLoading ? <div className="flex justify-center items-center h-48"><Spinner /></div> : 
                 activeAnalysis && <TranslationAnalysisCard analysis={activeAnalysis} onPlayAudio={playAudio} isTtsLoading={ttsLoading} />
                }
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {phrases.map((p, i) => (
                <div key={i} className="bg-background-tertiary p-3 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-text-primary">{p.phrase}</p>
                        <p className="text-sm text-text-secondary">{p.translation}</p>
                    </div>
                    <button onClick={() => handleDeepDive(p.phrase)} className="text-sm font-semibold bg-accent-secondary/20 text-accent-secondary px-3 py-1 rounded-md hover:bg-accent-secondary/40 transition-colors">
                        Deep Dive
                    </button>
                </div>
            ))}
        </div>
    );
};


const QuizLesson: React.FC<{ lesson: Lesson | MasteryLevel, onComplete: () => void, learningLanguage: Language, nativeLanguage: Language }> = ({ lesson, onComplete, learningLanguage, nativeLanguage }) => {
    const [questions, setQuestions] = useState<any[]>([]);
    const [error, setError] = useState<string|null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    useEffect(() => {
        const generateQuiz = async () => {
            setLoading(true);
            setError(null);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                // For a real quiz, we'd want to make this prompt more robust, maybe based on previous lessons
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Generate a 4-question multiple choice quiz about basic ${learningLanguage.name} vocabulary (greetings, numbers). Provide a JSON array where each object has "question" (in ${nativeLanguage.name}), "options" (an array of 4 strings in ${learningLanguage.name}), and "answer" (the correct string from options).`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING } } } }
                    }
                });
                setQuestions(JSON.parse(response.text));
            } catch(err: any) {
                 console.error('Failed to generate quiz:', err);
                setError(err.toString().includes('quota') ? 'API quota exceeded.' : 'Could not load quiz.');
            } finally {
                setLoading(false);
            }
        };
        generateQuiz();
    }, [learningLanguage.name, nativeLanguage.name]);

    const handleAnswer = (option: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(option);
        setIsCorrect(option === questions[currentQ].answer);
    };

    const handleNext = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(q => q + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            onComplete();
        }
    };

    if (loading) return <div className="flex justify-center items-center h-48"><Spinner /></div>;
    if (error) return <div className="flex justify-center items-center h-48 text-red-400">{error}</div>;
    if (questions.length === 0) return <div>Could not load quiz.</div>

    const question = questions[currentQ];
    return (
        <div className="text-center">
            <p className="text-sm text-text-secondary">Question {currentQ + 1} of {questions.length}</p>
            <h3 className="text-2xl font-bold my-4">{question.question}</h3>
            <div className="grid grid-cols-2 gap-4 my-8">
                {question.options.map((opt: string, i: number) => (
                    <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        disabled={!!selectedAnswer}
                        className={`p-4 rounded-lg border-2 text-lg font-semibold transition-all
                            ${selectedAnswer === null ? 'border-background-tertiary hover:border-accent-primary' : ''}
                            ${selectedAnswer === opt && isCorrect ? 'bg-green-500/20 border-green-500 text-white' : ''}
                            ${selectedAnswer === opt && !isCorrect ? 'bg-red-500/20 border-red-500 text-white' : ''}
                            ${selectedAnswer !== null && opt === question.answer ? 'bg-green-500/20 border-green-500' : ''}
                        `}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            {selectedAnswer && (
                <div className="h-24">
                    <p className={`text-xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? 'Correct!' : `Not quite. The answer is ${question.answer}.`}
                    </p>
                    <button onClick={handleNext} className="mt-4 bg-accent-primary text-background-primary font-bold py-2 px-8 rounded-lg hover:bg-accent-primary-dark">
                        {currentQ < questions.length - 1 ? 'Next' : 'Finish'}
                    </button>
                </div>
            )}
        </div>
    );
};

type WordToken = { id: number; word: string };

const SentenceScrambleLesson: React.FC<{ lesson: Lesson | MasteryLevel, onComplete: () => void, learningLanguage: Language, nativeLanguage: Language }> = ({ lesson, onComplete, learningLanguage, nativeLanguage }) => {
    const [data, setData] = useState<{ sentence: string, translation: string, scrambled: WordToken[] } | null>(null);
    const [error, setError] = useState<string|null>(null);
    const [loading, setLoading] = useState(true);
    const [userAnswer, setUserAnswer] = useState<WordToken[]>([]);
    const [status, setStatus] = useState<'playing' | 'correct' | 'incorrect'>('playing');

    const fetchSentence = useCallback(async () => {
        setLoading(true);
        setError(null);
        setStatus('playing');
        setUserAnswer([]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate a simple, beginner-level sentence in ${learningLanguage.name} (5-7 words) for a sentence scramble exercise. Provide a JSON object with "sentence" and its "translation" in ${nativeLanguage.name}.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { type: Type.OBJECT, properties: { sentence: { type: Type.STRING }, translation: { type: Type.STRING } } }
                }
            });
            const { sentence, translation } = JSON.parse(response.text);
            const words: WordToken[] = sentence.split(' ').map((word, id) => ({ id, word }));
            const scrambled = [...words].sort(() => Math.random() - 0.5);
            setData({ sentence, translation, scrambled });
        } catch (err: any) {
            console.error('Failed to fetch sentence:', err);
            setError(err.toString().includes('quota') ? 'API quota exceeded.' : 'Could not load exercise.');
        } finally {
            setLoading(false);
        }
    }, [learningLanguage, nativeLanguage]);

    useEffect(() => {
        fetchSentence();
    }, [fetchSentence]);

    const handleWordClick = (token: WordToken, source: 'scrambled' | 'answer') => {
        if (status !== 'playing') return;
        if (source === 'scrambled') {
            setUserAnswer([...userAnswer, token]);
            setData(d => ({...d!, scrambled: d!.scrambled.filter(t => t.id !== token.id)}));
        } else { // source === 'answer'
            setUserAnswer(userAnswer.filter(t => t.id !== token.id));
            setData(d => ({...d!, scrambled: [...d!.scrambled, token]}));
        }
    };

    const handleCheck = () => {
        if (userAnswer.map(t => t.word).join(' ') === data?.sentence) {
            setStatus('correct');
        } else {
            setStatus('incorrect');
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-48"><Spinner /></div>;
    if (error) return <div className="flex justify-center items-center h-48 text-red-400">{error}</div>;
    if (!data) return <div>Could not load exercise.</div>;

    const getStatusMessage = () => {
        if (status === 'correct') return <p className="text-xl font-bold text-green-400">Excellent! You got it right.</p>;
        if (status === 'incorrect') return <p className="text-xl font-bold text-red-400">Not quite. Try again!</p>;
        return <p className="text-lg text-text-secondary">{data.translation}</p>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold">Unscramble the Sentence</h3>
                <p className="text-text-secondary">Click the words in the correct order.</p>
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="min-h-[6rem] bg-background-tertiary rounded-lg p-3 flex flex-wrap gap-2 items-center justify-center border-2 border-dashed border-background-tertiary/50">
                        {userAnswer.map((token) => (
                            <button key={token.id} onClick={() => handleWordClick(token, 'answer')} className="bg-accent-primary text-background-primary font-semibold px-4 py-2 rounded-lg text-lg">
                                {token.word}
                            </button>
                        ))}
                    </div>
                    <div className="min-h-[6rem] p-3 flex flex-wrap gap-2 items-center justify-center mt-4">
                         {data.scrambled.map((token) => (
                            <button key={token.id} onClick={() => handleWordClick(token, 'scrambled')} className="bg-background-tertiary hover:bg-background-tertiary/70 font-semibold px-4 py-2 rounded-lg text-lg">
                                {token.word}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-center h-24 flex items-center justify-center">
                    {getStatusMessage()}
                </div>

                <div className="flex gap-4 mt-auto">
                    {status === 'playing' ? (
                        <button onClick={handleCheck} disabled={userAnswer.length === 0} className="w-full bg-accent-secondary text-background-primary font-bold py-3 px-8 rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition-colors">Check</button>
                    ) : (
                         <button onClick={status === 'correct' ? onComplete : fetchSentence} className="w-full bg-accent-primary text-background-primary font-bold py-3 px-8 rounded-lg hover:bg-accent-primary-dark transition-colors">{status === 'correct' ? 'Complete Lesson' : 'Try Another'}</button>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- MAIN MODAL COMPONENT ---

interface LessonModalProps {
    lesson: Lesson | MasteryLevel;
    onClose: () => void;
    onComplete: (lessonId: string) => void;
    nativeLanguage: Language;
    learningLanguage: Language;
}

const LessonModal: React.FC<LessonModalProps> = ({ lesson, onClose, onComplete, nativeLanguage, learningLanguage }) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const generateAlphabet = useCallback(async (lang: Language) => {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Generate the alphabet for ${lang.name} as a JSON array of uppercase strings.`, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } } });
        return JSON.parse(response.text);
    }, [ai]);

    const generateNumbers = useCallback(async (lang: Language) => {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Generate numbers 1-10 for a learner of ${lang.name}. Provide a JSON array of objects, each with "value" (number) and "name" (string).`, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, name: { type: Type.STRING } } } } } });
        return JSON.parse(response.text);
    }, [ai]);

    const generateColors = useCallback(async (lang: Language) => {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Generate 8 basic colors (e.g., red, blue, green) for a learner of ${lang.name}. Provide a JSON array of objects, each with "value" (hex code string) and "name" (string).`, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { value: { type: Type.STRING }, name: { type: Type.STRING } } } } } });
        return JSON.parse(response.text);
    }, [ai]);
    
    const generateNouns = useCallback(async (lang: Language) => {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Generate 12 common, simple nouns in ${lang.name} as a JSON array of strings.`, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } } });
        return JSON.parse(response.text);
    }, [ai]);

    const generateVowels = useCallback(async (lang: Language) => {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `List the main vowel letters or characters for ${lang.name} as a JSON array of strings.`, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } } });
        return JSON.parse(response.text);
    }, [ai]);

    const generateConsonants = useCallback(async (lang: Language) => {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `List the main consonant letters or characters for ${lang.name} as a JSON array of strings.`, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } } });
        return JSON.parse(response.text);
    }, [ai]);
    
    const generateHighFrequencyVocab = useCallback(async (lang: Language) => {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Generate 12 high-frequency words (nouns, verbs, adjectives) in ${lang.name} as a JSON array of strings.`, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } } });
        return JSON.parse(response.text);
    }, [ai]);

    const renderContent = () => {
        switch (lesson.type) {
            // Original Lesson Types
            case 'alphabet':
                return <GridLesson title="Alphabet" itemType="letter" language={learningLanguage} generateItems={generateAlphabet} />;
            case 'numbers':
                return <GridLesson title="Numbers" itemType="number" language={learningLanguage} generateItems={generateNumbers} />;
            case 'colors':
                return <GridLesson title="Colors" itemType="color" language={learningLanguage} generateItems={generateColors} />;
            case 'phrases':
            case 'grammar':
                return <PhrasesLesson lesson={lesson} nativeLanguage={nativeLanguage} learningLanguage={learningLanguage} />;
            case 'quiz':
                return <QuizLesson lesson={lesson} onComplete={() => onComplete(lesson.id)} nativeLanguage={nativeLanguage} learningLanguage={learningLanguage} />;
            case 'nouns':
                return <GridLesson title="Common Nouns" itemType="noun" language={learningLanguage} generateItems={generateNouns} />;
            case 'vowels':
                return <GridLesson title="Vowels" itemType="vowel" language={learningLanguage} generateItems={generateVowels} />;
            case 'consonants':
                return <GridLesson title="Consonants" itemType="consonant" language={learningLanguage} generateItems={generateConsonants} />;
            case 'sentenceScramble':
                return <SentenceScrambleLesson lesson={lesson} onComplete={() => onComplete(lesson.id)} nativeLanguage={nativeLanguage} learningLanguage={learningLanguage} />;
            
            // New Mastery Hub Types
            case 'highFrequencyVocab':
                return <GridLesson title="High Frequency Words" itemType="vocab" language={learningLanguage} generateItems={generateHighFrequencyVocab} />;
            case 'conversationalPatterns':
            case 'idiomaticMastery':
            case 'essentialGrammar':
            case 'intermediateGrammar':
                return <PhrasesLesson lesson={lesson} nativeLanguage={nativeLanguage} learningLanguage={learningLanguage} />;
            
            // Default to placeholder for other new types
            default:
                return <PlaceholderLesson lesson={lesson} />;
        }
    };

    // Check if the lesson is interactive and requires a "Complete" button
    const isInteractive = lesson.type === 'quiz' || lesson.type === 'sentenceScramble';

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-background-secondary w-full max-w-4xl h-[90vh] rounded-xl border border-background-tertiary/50 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-background-tertiary/50 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="font-heading text-xl font-bold">{lesson.title}</h2>
                        <p className="text-sm text-text-secondary">{lesson.description}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background-tertiary transition-colors" aria-label="Close lesson">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12" /></svg>
                    </button>
                </header>
                <div className="flex-1 p-6 overflow-y-auto">
                    {renderContent()}
                </div>
                {!isInteractive && (
                    <footer className="p-4 bg-background-tertiary/30 flex-shrink-0">
                        <button onClick={() => onComplete(lesson.id)} className="w-full bg-accent-primary text-background-primary font-bold py-3 px-8 rounded-lg hover:bg-accent-primary-dark transition-colors">
                            Complete Lesson
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default LessonModal;