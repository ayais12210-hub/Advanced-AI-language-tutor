import React, { useState, useRef, useCallback, useEffect, FormEvent } from 'react';
import { GoogleGenAI, Type, Modality, Chat as GeminiChat } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Language, SpeechAnalysisResult, WordFeedback, ChatMessage, FeatureId } from './types';
import { PageHeader } from './PageHeader';
import { useSpeechToText } from './useSpeechToText';

// --- ICONS ---
const MicIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 7.5v-1.5a6 6 0 00-6-6v-1.5a6 6 0 00-6 6v1.5m6 7.5a6 6 0 00-6-6" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a3 3 0 003-3v-3a3 3 0 00-6 0v3a3 3 0 003 3z" /></svg>);
const StopIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" /></svg>);
const RefreshIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.693L7.985 2.985m0 0v4.992m0 0h4.992m-4.993 0l3.181-3.183a8.25 8.25 0 0111.664 0l3.181 3.183" /></svg>);
const Spinner = ({text}: {text: string}) => (<div className="flex flex-col items-center justify-center h-full gap-4 text-text-secondary"><svg className="animate-spin h-10 w-10 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p>{text}</p></div>);
const SmallSpinner = () => (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-text-secondary"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A.75.75 0 008.5 13.5h.5a.75.75 0 00.744-.658l.459-2.067a.25.25 0 01.244-.304H11a.75.75 0 000-1.5H9z" clipRule="evenodd" /></svg>);
const SpeakerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28 .53v15.88a.75.75 0 01-1.28 .53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>);
const PlayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>);
const TranscribingSpinner = () => (<svg className="animate-spin h-6 w-6 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

// --- HOOKS & UTILS ---
function decode(base64: string) { const binaryString = atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); } return bytes; }
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { const dataInt16 = new Int16Array(data.buffer); const frameCount = dataInt16.length / numChannels; const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate); for (let channel = 0; channel < numChannels; channel++) { const channelData = buffer.getChannelData(channel); for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; } } return buffer; }
const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onloadend = () => resolve((reader.result as string).substring((reader.result as string).indexOf(',') + 1)); reader.onerror = reject; reader.readAsDataURL(blob); });

const useAudioRecorder = (onStop: (blob: Blob) => void) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const startRecording = useCallback(async () => { if (isRecording) return; try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const mr = new MediaRecorder(stream); mediaRecorderRef.current = mr; audioChunksRef.current = []; mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); }; mr.onstop = () => { onStop(new Blob(audioChunksRef.current, { type: 'audio/webm' })); stream.getTracks().forEach(t => t.stop()); }; mr.start(); setIsRecording(true); } catch (err) { console.error("Mic access denied:", err); throw err; } }, [isRecording, onStop]);
    const stopRecording = useCallback(() => { if (!isRecording || !mediaRecorderRef.current) return; mediaRecorderRef.current.stop(); setIsRecording(false); }, [isRecording]);
    return { isRecording, startRecording, stopRecording };
};

// --- HELPER COMPONENTS ---
const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const radius = 50; const circumference = 2 * Math.PI * radius; const offset = circumference - (score / 100) * circumference;
    return ( <div className="relative w-40 h-40"> <svg className="w-full h-full" viewBox="0 0 120 120"> <circle className="text-background-tertiary" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" /> <circle className="text-green-400" strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" transform="rotate(-90 60 60)" /> </svg> <div className="absolute inset-0 flex flex-col items-center justify-center"> <span className="text-4xl font-bold">{score}</span> <span className="text-sm text-text-secondary">Overall Score</span> </div> </div> );
};
const WordFeedbackDisplay: React.FC<{ feedback: WordFeedback }> = ({ feedback }) => {
    const accuracyColors = { correct: 'text-green-400 border-green-400', minor_error: 'text-yellow-400 border-yellow-400', major_error: 'text-orange-400 border-orange-400', mispronounced: 'text-red-400 border-red-400' };
    return ( <div className="relative group"> <span className={`text-lg font-medium border-b-2 ${accuracyColors[feedback.accuracy]}`}>{feedback.word}</span> <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-background-tertiary text-text-primary text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"> <p className="font-bold capitalize">{feedback.accuracy.replace('_', ' ')}</p> <p className="text-xs text-text-secondary">{feedback.feedback}</p> {feedback.ipa && <p className="text-xs font-mono mt-1">IPA: {feedback.ipa}</p>} </div> </div> );
};

// --- MAIN COMPONENT ---
interface AccentCoachProps { 
    nativeLanguage: Language; 
    learningLanguage: Language; 
    setNativeLanguage: (l: Language) => void; 
    setLearningLanguage: (l: Language) => void; 
    setActiveFeature: (feature: FeatureId) => void;
}
const AccentCoach: React.FC<AccentCoachProps> = (props) => {
    const [mode, setMode] = useState<'practice' | 'conversation'>('practice');
    
    // Practice Mode State
    const [phrase, setPhrase] = useState('');
    const [phraseTranslation, setPhraseTranslation] = useState('');
    const [analysisResult, setAnalysisResult] = useState<SpeechAnalysisResult | null>(null);
    const [userAudioBlob, setUserAudioBlob] = useState<Blob | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingPhrase, setIsGeneratingPhrase] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [micError, setMicError] = useState<string | null>(null);
    const [ttsLoading, setTtsLoading] = useState(false);

    // Conversation Mode State
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatSessionRef = useRef<GeminiChat | null>(null);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    useEffect(() => { endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatLoading]);
    const { isRecording: isSttRecording, isTranscribing, transcript, error: sttError, startRecording: startStt, stopRecording: stopStt } = useSpeechToText();
    useEffect(() => { if (transcript) { setUserInput(prev => prev ? `${prev.trim()} ${transcript}`.trim() : transcript); } }, [transcript]);


    const handleAnalysis = useCallback(async (audioBlob: Blob) => {
        setIsLoading(true); setError(null); setAnalysisResult(null); setUserAudioBlob(audioBlob);
        try {
            const base64Audio = await blobToBase64(audioBlob); const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [{ text: `Analyze my pronunciation of the phrase: "${phrase}".` }, { inlineData: { mimeType: audioBlob.type, data: base64Audio } }] },
                config: { systemInstruction: `You are a world-class speech coach for a ${props.learningLanguage.name} learner. Analyze the user's audio against the provided text. Provide a structured JSON analysis.`, responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { overallScore: { type: Type.NUMBER }, transcription: { type: Type.STRING }, wordByWordFeedback: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, accuracy: { type: Type.STRING, enum: ['correct', 'minor_error', 'major_error', 'mispronounced'] }, feedback: { type: Type.STRING }, ipa: { type: Type.STRING } } } }, prosodyFeedback: { type: Type.OBJECT, properties: { rhythm: { type: Type.STRING }, intonation: { type: Type.STRING } } }, mainTip: { type: Type.STRING } } } }
            });
            setAnalysisResult(JSON.parse(response.text));
        } catch (err: any) { console.error(err); setError(err?.toString().includes('quota') ? 'API quota exceeded.' : 'Failed to analyze speech.'); } 
        finally { setIsLoading(false); }
    }, [phrase, props.learningLanguage.name]);

    const { isRecording, startRecording, stopRecording } = useAudioRecorder(handleAnalysis);
    
    const fetchNewPhrase = useCallback(async () => {
        setIsGeneratingPhrase(true); setError(null); setAnalysisResult(null); setUserAudioBlob(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate a common, beginner-level sentence in ${props.learningLanguage.name} (8-12 words) and its translation in ${props.nativeLanguage.name}. Provide a JSON object with "phrase" and "translation".`,
                config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { phrase: { type: Type.STRING }, translation: { type: Type.STRING } } } }
            });
            const { phrase, translation } = JSON.parse(response.text);
            setPhrase(phrase); setPhraseTranslation(translation);
        } catch (err: any) { console.error(err); setError(err?.toString().includes('quota') ? 'API quota exceeded.' : 'Could not fetch new phrase.'); } 
        finally { setIsGeneratingPhrase(false); }
    }, [props.learningLanguage.name, props.nativeLanguage.name]);

    useEffect(() => { fetchNewPhrase(); }, [fetchNewPhrase]);

    const playAudio = async (text: string, isUserAudio: boolean = false) => {
        if (ttsLoading) return;
        if (isUserAudio && userAudioBlob) {
            const audioUrl = URL.createObjectURL(userAudioBlob); const audio = new Audio(audioUrl); audio.play(); return;
        }
        setTtsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({ model: "gemini-2.5-flash-preview-tts", contents: [{ parts: [{ text }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } } });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("No audio data.");
            const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource(); source.buffer = buffer; source.connect(ctx.destination); source.start();
        } catch (err: any) { console.error(err); if (err.toString().includes('quota')) alert('Could not play audio: API quota exceeded.'); } 
        finally { setTtsLoading(false); }
    };

    const handleMicClick = async () => {
        if (isRecording) { stopRecording(); } else { setMicError(null); try { await startRecording(); } catch (err) { setMicError("Microphone access was denied. Please enable it in your browser settings."); } }
    };

    const handleSendMessage = async (e?: FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        if (!userInput.trim() || isChatLoading) return;
        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', parts: [{ text: userInput }] };
        setChatHistory(prev => [...prev, userMessage]);
        setIsChatLoading(true); setUserInput('');
        try {
            if (!chatSessionRef.current) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                chatSessionRef.current = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction: `You are Lumi, a friendly language tutor. The user is learning ${props.learningLanguage.name}. Engage in a simple, encouraging conversation in ${props.learningLanguage.name}. Keep your replies brief.` } });
            }
            const stream = await chatSessionRef.current.sendMessageStream({ message: userMessage.parts[0].text });
            let modelResponseText = ''; const modelMessageId = `model-${Date.now()}`;
            setChatHistory(prev => [...prev, { id: modelMessageId, role: 'model', parts: [{ text: '' }] }]);
            for await (const chunk of stream) { modelResponseText += chunk.text; setChatHistory(prev => prev.map(m => m.id === modelMessageId ? { ...m, parts: [{ text: modelResponseText }] } : m)); }
        } catch (err: any) { console.error(err); const errorMsg = err?.toString().includes('quota') ? "API quota exceeded." : "Chat failed."; setChatHistory(prev => [...prev, { id: `err-${Date.now()}`, role: 'model', parts: [{ text: errorMsg }] }]); } 
        finally { setIsChatLoading(false); }
    };

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <PageHeader title="Accent Coach" description="Practice pronunciation and conversation to perfect your accent." {...props} setActiveFeature={props.setActiveFeature} />
            
            <div className="flex justify-center my-6"><div className="flex bg-background-tertiary rounded-md p-1"><button onClick={() => setMode('practice')} className={`flex-1 px-6 py-2 text-sm rounded transition-colors ${mode === 'practice' ? 'bg-accent-primary text-background-primary font-semibold' : 'hover:bg-background-secondary/50'}`}>Phrase Practice</button><button onClick={() => setMode('conversation')} className={`flex-1 px-6 py-2 text-sm rounded transition-colors ${mode === 'conversation' ? 'bg-accent-primary text-background-primary font-semibold' : 'hover:bg-background-secondary/50'}`}>Conversation</button></div></div>
            
            {mode === 'practice' ? (
                 <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-6 bg-background-secondary/50 p-6 rounded-lg border border-background-tertiary/50">
                        <div className="flex justify-between items-center"><h2 className="text-xl font-bold font-heading">Practice Phrase</h2><button onClick={fetchNewPhrase} disabled={isRecording || isLoading || isGeneratingPhrase} className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-primary disabled:opacity-50"><RefreshIcon /> New Phrase</button></div>
                        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-background-tertiary rounded-lg text-center">
                            {isGeneratingPhrase ? <Spinner text="Generating phrase..." /> : (<>
                                <p className="text-2xl font-semibold leading-relaxed">{phrase}</p>
                                <p className="text-md text-text-secondary mt-2">"{phraseTranslation}"</p>
                            </>)}
                        </div>
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="flex items-center gap-4">
                                <button onClick={() => playAudio(phrase)} disabled={ttsLoading || isGeneratingPhrase} className="flex items-center gap-2 text-sm bg-background-tertiary px-4 py-2 rounded-lg hover:bg-background-tertiary/70 disabled:opacity-50"><SpeakerIcon /> Listen</button>
                                <button onClick={handleMicClick} disabled={isLoading || isGeneratingPhrase} className={`p-4 rounded-full transition-colors ${isRecording ? 'bg-red-500/80 text-white animate-pulse' : 'bg-accent-primary text-background-primary hover:bg-accent-primary-dark'}`}>{isRecording ? <StopIcon /> : <MicIcon />}</button>
                            </div>
                            <p className="text-sm text-text-secondary">{isRecording ? "Recording... Click to stop." : "Click to start recording"}</p>{micError && <p className="text-xs text-red-400 text-center">{micError}</p>}
                        </div>
                    </div>
                    <div className="bg-background-secondary/50 p-6 rounded-lg border border-background-tertiary/50">{isLoading ? <Spinner text="Analyzing speech..."/> : error ? <div className="flex items-center justify-center h-full text-red-400">{error}</div> : analysisResult ? (
                        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
                            <div className="flex flex-col sm:flex-row items-center gap-6"><ScoreCircle score={analysisResult.overallScore} /><div className="flex-1 text-center sm:text-left"><p className="text-lg font-bold">💡 Main Tip</p><p className="text-text-secondary">{analysisResult.mainTip}</p></div></div>
                            <div><h3 className="text-lg font-bold mb-2">Word-by-Word Feedback</h3><div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 bg-background-tertiary rounded-lg">{analysisResult.wordByWordFeedback.map((fb, i) => <WordFeedbackDisplay key={i} feedback={fb} />)}</div><p className="text-xs text-text-secondary mt-2 flex items-center gap-1"><InfoIcon /> Hover over words for details.</p></div>
                            <div><h3 className="text-lg font-bold mb-2">Your Audio</h3>
                                <div className="p-3 bg-background-tertiary rounded-lg flex justify-between items-center">
                                    <p className="text-sm italic">"{analysisResult.transcription}"</p>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => playAudio('', true)} className="p-1.5 rounded-full hover:bg-background-secondary"><PlayIcon/></button>
                                        <button onClick={() => playAudio(phrase)} disabled={ttsLoading} className="p-1.5 rounded-full hover:bg-background-secondary"><SpeakerIcon/></button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><h3 className="text-lg font-bold mb-2">Rhythm & Pacing</h3><p className="text-sm text-text-secondary">{analysisResult.prosodyFeedback?.rhythm || 'N/A'}</p></div><div><h3 className="text-lg font-bold mb-2">Intonation & Tone</h3><p className="text-sm text-text-secondary">{analysisResult.prosodyFeedback?.intonation || 'N/A'}</p></div></div>
                        </div>) : (<div className="flex flex-col items-center justify-center h-full text-text-secondary text-center"><svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-background-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" /></svg><p className="mt-4">Your analysis will appear here.</p></div>)}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col bg-background-secondary/50 rounded-lg border border-background-tertiary/50 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {chatHistory.length === 0 && <div className="text-center text-text-secondary h-full flex items-center justify-center"><p>Start a conversation by speaking into your mic.</p></div>}
                        {chatHistory.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-xl px-5 py-3 rounded-2xl flex items-center gap-2 ${msg.role === 'user' ? 'bg-accent-primary text-background-primary' : 'bg-background-tertiary text-text-primary'}`}>
                                    {msg.role === 'model' && msg.parts[0].text && <button onClick={() => playAudio(msg.parts[0].text)} className="flex-shrink-0"><SpeakerIcon /></button>}
                                    <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{msg.parts[0].text}</ReactMarkdown></div>
                                </div>
                            </div>
                        ))}
                        {isChatLoading && <div className="flex justify-start"><div className="px-5 py-3 rounded-2xl bg-background-tertiary flex items-center"><div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse mr-2"></div><div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse mr-2 delay-150"></div><div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse delay-300"></div></div></div>}
                        <div ref={endOfMessagesRef} />
                    </div>
                    <div className="border-t border-background-tertiary/50 p-4 bg-background-secondary">
                        <form onSubmit={handleSendMessage} className="flex items-end space-x-2 sm:space-x-4">
                            <div className="flex-1 flex flex-col gap-2">
                                <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any); } }} placeholder="Speak or type your message..." className="w-full bg-background-tertiary rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none" rows={1} disabled={isChatLoading || isSttRecording || isTranscribing} />
                                {sttError && <p role="alert" className="text-xs text-red-400 px-1">{sttError}</p>}
                            </div>
                            <button type="button" onClick={() => isSttRecording ? stopStt() : startStt(props.learningLanguage)} disabled={isChatLoading || isTranscribing} className={`p-3 rounded-lg transition-colors flex items-center justify-center self-stretch ${isSttRecording ? 'bg-red-500/80 text-white animate-pulse' : 'bg-background-tertiary text-text-secondary hover:bg-background-tertiary/70'}`}><MicIcon/></button>
                            <button type="submit" disabled={isChatLoading || !userInput.trim()} className="bg-accent-primary text-white font-semibold py-3 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:cursor-not-allowed transition-colors self-stretch">{isChatLoading ? <SmallSpinner/> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccentCoach;
