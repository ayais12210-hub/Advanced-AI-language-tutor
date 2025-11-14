import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { GoogleGenAI, Chat as GeminiChat, Type, Modality, LiveServerMessage, Blob } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Language, TutorStyle, ModelId, GroundingChunk, SubscriptionTier, FeatureId, TtsProvider, Emotion, ThinkingPreset, TranscriptionTurn } from './types';
import SmartSuggestions from './SmartSuggestions';
import { PageHeader } from './PageHeader';
import { ChatSettings } from './TutorStyleSelector';
import { useSpeechToText } from './useSpeechToText';
import { languages } from './languages';
import HoverTranslate from './HoverTranslate';
import { tierLevels } from './LockedFeatureGate';

// --- ICONS ---
const Spinner = () => ( <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> );
const SmallSpinner = () => (<svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> );
const SettingsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.113-1.113l.448-.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /> </svg> );
const MicIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 7.5v-1.5a6 6 0 00-6-6v-1.5a6 6 0 00-6 6v1.5m6 7.5a6 6 0 00-6-6" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a3 3 0 003-3v-3a3 3 0 00-6 0v3a3 3 0 003 3z" /></svg>);
const StopIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3-3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" /></svg>);
const TranscribingSpinner = () => (<svg className="animate-spin h-6 w-6 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const LockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M8 1a3.5 3.5 0 00-3.5 3.5V7A1.5 1.5 0 006 8.5h4A1.5 1.5 0 0011.5 7V4.5A3.5 3.5 0 008 1zM5.5 4.5a2.5 2.5 0 015 0V7H5.5V4.5z" clipRule="evenodd" /><path d="M2 8.5A1.5 1.5 0 013.5 7h9A1.5 1.5 0 0114 8.5v3A1.5 1.5 0 0112.5 13h-9A1.5 1.5 0 012 11.5v-3z" /></svg>);

// --- AUDIO HELPERS ---
function encode(bytes: Uint8Array) { let binary = ''; const len = bytes.byteLength; for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); } return btoa(binary); }
function decode(base64: string) { const binaryString = atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); } return bytes; }
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { const dataInt16 = new Int16Array(data.buffer); const frameCount = dataInt16.length / numChannels; const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate); for (let channel = 0; channel < numChannels; channel++) { const channelData = buffer.getChannelData(channel); for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; } } return buffer; }

// --- DYNAMIC SYSTEM PROMPT ---
const getSystemInstruction = (nativeLanguage: Language, learningLanguage: Language, tutorStyle: TutorStyle, isGrounded: boolean, emotionMode: 'Auto' | 'Manual') => {
  let styleInstruction = '';
  switch (tutorStyle) {
    case 'Patient': styleInstruction = 'You are especially patient and provide very detailed, step-by-step explanations in the "Advanced Insights" section. You often give positive reinforcement.'; break;
    case 'Concise': styleInstruction = 'You are direct and to the point. Your conversational replies are shorter, and your "Advanced Insights" focus only on the most critical correction or learning point.'; break;
    default: styleInstruction = 'You are friendly, encouraging, and an expert linguist.'; break;
  }
  let groundingInstruction = isGrounded ? "If the user asks about recent events, facts, or real-world information, you MUST use the provided Google Search tool to find an accurate, up-to-date answer. After providing the answer, cite your sources clearly." : "";
  const emotions: Emotion[] = ['neutral', 'warm', 'encouraging', 'excited', 'calm', 'serious', 'playful', 'empathetic'];
  let emotionInstruction = '';
  if (emotionMode === 'Auto') {
      emotionInstruction = `At the very end of your entire response, on a new line, suggest an appropriate emotion for your spoken reply from this list: [${emotions.join(', ')}]. Format it precisely like this: **Emotion:** _Warm_`;
  }
  return `You are Lumi, an expert language tutor AI from Linguamate.ai. ${styleInstruction} ${groundingInstruction} The user's native language is ${nativeLanguage.name} and they are learning ${learningLanguage.name}. Your task is to engage in a practice conversation while providing deep, insightful feedback. 
  Follow this response structure precisely for every message, unless using the search tool prevents it:
1.  **Conversational Reply:** First, respond directly to the user's message in ${learningLanguage.name}. Keep it natural and engaging to move the conversation forward. If using search, provide the grounded answer here.
2.  **Translation:** After your reply, add a horizontal rule (---) and then provide a clear translation of your reply in ${nativeLanguage.name}, formatted in italics. For example: *(${nativeLanguage.name}: [Your translation here])*.
3.  **Advanced Insights:** Finally, add a section titled "💡 **Advanced Insights**". This section MUST be in ${nativeLanguage.name} to ensure the user understands the complex details. In this section, analyze the USER's most recent message and provide one or more of the following: Corrections, Grammar Deep Dive, Vocabulary Enrichment, Cultural Context, or Alternative Phrasings.
Use markdown (bolding, italics, lists) to make your response structured, clear, and easy to read. Your primary goal is to not just chat, but to actively teach and deepen the user's understanding of ${learningLanguage.name} with every interaction.
${emotionInstruction}`;
};


interface ChatProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
  incrementChatCount: () => void;
  subscriptionTier: SubscriptionTier;
  setActiveFeature: (feature: FeatureId) => void;
  globalModel: ModelId;
  thinkingPreset: ThinkingPreset;
  ttsProvider: TtsProvider;
}

const Chat: React.FC<ChatProps> = ({ nativeLanguage, learningLanguage, setNativeLanguage, setLearningLanguage, incrementChatCount, subscriptionTier, setActiveFeature, globalModel, thinkingPreset: globalThinkingPreset, ttsProvider: globalTtsProvider }) => {
  const [mode, setMode] = useState<'text' | 'live'>('text');
  
  // Text Mode State
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorStyle, setTutorStyle] = useState<TutorStyle>('Standard');
  const [selectedModel, setSelectedModel] = useState<ModelId>(globalModel);
  const [isGrounded, setIsGrounded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [ttsProvider, setTtsProvider] = useState<TtsProvider>(globalTtsProvider);
  const [thinkingPreset, setThinkingPreset] = useState<ThinkingPreset>(globalThinkingPreset);
  const [emotionMode, setEmotionMode] = useState<'Auto' | 'Manual'>('Auto');
  const [manualEmotion, setManualEmotion] = useState<Emotion>('neutral');
  const [sttLanguageCode, setSttLanguageCode] = useState('auto');
  const [ttsLoadingMessageId, setTtsLoadingMessageId] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const { isRecording: isSttRecording, isTranscribing, transcript, error: sttError, startRecording: startSttRecording, stopRecording: stopSttRecording } = useSpeechToText();

  // Live Mode State
  const [liveStatus, setLiveStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
  const [liveErrorMessage, setLiveErrorMessage] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionTurn[]>([]);
  const sessionRef = useRef<Promise<any> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isLoading, transcription]);
  // Reset history on config change
  useEffect(() => { setChatHistory([]); setTranscription([]); }, [nativeLanguage, learningLanguage, tutorStyle, selectedModel, isGrounded, emotionMode, thinkingPreset]);
  useEffect(() => { return () => { if (audioSource) audioSource.stop(); }; }, [audioSource]);
  useEffect(() => { if (transcript) { setUserInput(prev => prev ? `${prev.trim()} ${transcript}`.trim() : transcript); } }, [transcript]);

  // Combined Cleanup
  const stopLiveSession = useCallback(() => {
    if (sessionRef.current) { sessionRef.current.then(session => session.close()); sessionRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(track => track.stop()); mediaStreamRef.current = null; }
    if (scriptProcessorRef.current) { scriptProcessorRef.current.disconnect(); scriptProcessorRef.current = null; }
    if (mediaStreamSourceRef.current) { mediaStreamSourceRef.current.disconnect(); mediaStreamSourceRef.current = null; }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') { audioContextRef.current.close(); }
    audioContextRef.current = null;
    setLiveStatus('idle');
  }, []);

  useEffect(() => { if (mode === 'text') stopLiveSession(); }, [mode, stopLiveSession]);
  useEffect(() => () => stopLiveSession(), [stopLiveSession]);


  const handleMicClick = () => {
    if (isSttRecording) stopSttRecording();
    else { const lang = sttLanguageCode === 'auto' ? undefined : languages.find(l => l.code === sttLanguageCode); startSttRecording(lang); }
  };

  const handleModeChange = (newMode: 'text' | 'live') => {
      const hasPlusAccess = tierLevels[subscriptionTier] >= tierLevels['Plus'];
      if (newMode === 'live' && !hasPlusAccess) {
          setActiveFeature('premium');
          return;
      }
      setMode(newMode);
  };
  
  const generateChatSuggestions = useCallback(async (): Promise<string[]> => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const isNewConversation = chatHistory.length === 0;
      let prompt: string;
      if (isNewConversation) {
          prompt = `You are a creative assistant for a language learner. The user is learning ${learningLanguage.name}. Generate 3 interesting and engaging conversation starters in ${learningLanguage.name} to help them practice. Provide only a JSON array of strings. Example: ["Hello! How was your day?", "What is your favorite food?"]`;
      } else {
          const conversationContext = chatHistory.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'Lumi'}: ${m.parts[0]?.text?.split('---')[0].trim()}`).join('\n');
          prompt = `You are a creative assistant for a language learner. Based on the following recent conversation, generate 3 natural, engaging, and contextually relevant follow-up replies in ${learningLanguage.name} that the user could say next.\n---\n${conversationContext}\n---\nProvide only a JSON array of strings.`;
      }
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } } });
      try { const suggestions = JSON.parse(response.text); return Array.isArray(suggestions) ? suggestions.map(String) : []; } catch (e: any) { console.error("Failed to parse suggestions JSON:", e); if (e?.toString().includes('quota')) { throw new Error("API quota exceeded."); } return []; }
  }, [learningLanguage, chatHistory]);

  const handleSuggestionClick = (suggestion: string) => { setUserInput(suggestion); };
  
  const getModelName = (modelId: ModelId): string => {
    switch (modelId) {
        case 'auto': case 'gemini-2.5-pro': case 'gpt-5': case 'claude-opus-4.1': case 'claude-opus-4': case 'claude-opus-3': return 'gemini-2.5-pro';
        case 'gemini-2.5-flash': case 'gpt-4o': case 'gpt-4.1': case 'o3': case 'o4-mini': case 'claude-sonnet-4.5': case 'claude-sonnet-4': case 'claude-sonnet-3.7': return 'gemini-2.5-flash';
        case 'claude-haiku-4.5': case 'claude-haiku-3.5': return 'gemini-flash-lite-latest';
        default: return 'gemini-2.5-flash';
    }
  };

  const handleSendMessage = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    const messageToSend = userInput;
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', parts: [{ text: messageToSend }] };
    const historyForApi = chatHistory.map(m => ({ role: m.role, parts: m.parts }));
    setChatHistory(prev => [...prev, userMessage]); setUserInput(''); incrementChatCount(); setIsLoading(true); setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const modelName = getModelName(selectedModel);
      const config: any = { systemInstruction: getSystemInstruction(nativeLanguage, learningLanguage, tutorStyle, isGrounded, emotionMode) };
      if (modelName.startsWith('gemini-2.5')) {
          switch (thinkingPreset) {
              case 'instant': config.thinkingConfig = { thinkingBudget: 0 }; break;
              case 'mini': config.thinkingConfig = { thinkingBudget: 8192 }; break;
              case 'thinking': config.thinkingConfig = { thinkingBudget: modelName === 'gemini-2.5-pro' ? 32768 : 24576 }; break;
              case 'auto': default: break;
          }
      }
      if (isGrounded && modelName !== 'gemini-flash-lite-latest') { config.tools = [{ googleSearch: {} }]; }
      const chat = ai.chats.create({ model: modelName, config, history: historyForApi });
      const stream = await chat.sendMessageStream({ message: messageToSend });
      let modelResponseText = ''; let modelResponseSources: GroundingChunk[] = []; const modelMessageId = `model-${Date.now()}`;
      setChatHistory(prev => [...prev, { id: modelMessageId, role: 'model', parts: [{ text: '' }], sources: [] }]);
      for await (const chunk of stream) {
        modelResponseText += chunk.text;
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) { modelResponseSources = chunk.candidates[0].groundingMetadata.groundingChunks; }
        setChatHistory(prev => prev.map(m => m.id === modelMessageId ? { ...m, parts: [{ text: modelResponseText }], sources: modelResponseSources } : m));
      }
    } catch (err: any) { console.error(err); let errorMessage = err?.toString().includes('quota') ? "API quota exceeded. Please check your plan or try again tomorrow." : 'Sorry, something went wrong. Please try again.'; setError(errorMessage); setChatHistory(prev => [...prev, { id: `error-${Date.now()}`, role: 'model', parts: [{ text: errorMessage }] }]);
    } finally { setIsLoading(false); }
  };

  const handleRegenerate = async () => {
    const lastUserMessageIndex = chatHistory.findLastIndex(m => m.role === 'user');
    if (lastUserMessageIndex === -1 || isLoading) return;
    const lastUserMessage = chatHistory[lastUserMessageIndex];
    const messageToSend = lastUserMessage.parts[0].text;
    const historyForApi = chatHistory.slice(0, lastUserMessageIndex).map(m => ({ role: m.role, parts: m.parts }));
    setChatHistory(prev => prev.slice(0, lastUserMessageIndex + 1));
    setIsLoading(true); setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const modelName = getModelName(selectedModel);
      const config: any = { systemInstruction: getSystemInstruction(nativeLanguage, learningLanguage, tutorStyle, isGrounded, emotionMode) };
      if (modelName.startsWith('gemini-2.5')) {
          switch (thinkingPreset) {
              case 'instant': config.thinkingConfig = { thinkingBudget: 0 }; break;
              case 'mini': config.thinkingConfig = { thinkingBudget: 8192 }; break;
              case 'thinking': config.thinkingConfig = { thinkingBudget: modelName === 'gemini-2.5-pro' ? 32768 : 24576 }; break;
              case 'auto': default: break;
          }
      }
      if (isGrounded && modelName !== 'gemini-flash-lite-latest') { config.tools = [{ googleSearch: {} }]; }
      const chat = ai.chats.create({ model: modelName, config, history: historyForApi });
      const stream = await chat.sendMessageStream({ message: messageToSend });
      let modelResponseText = ''; let modelResponseSources: GroundingChunk[] = []; const modelMessageId = `model-${Date.now()}`;
      setChatHistory(prev => [...prev, { id: modelMessageId, role: 'model', parts: [{ text: '' }], sources: [] }]);
      for await (const chunk of stream) {
        modelResponseText += chunk.text;
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) { modelResponseSources = chunk.candidates[0].groundingMetadata.groundingChunks; }
        setChatHistory(prev => prev.map(m => m.id === modelMessageId ? { ...m, parts: [{ text: modelResponseText }], sources: modelResponseSources } : m));
      }
    } catch (err: any) { console.error(err); let errorMessage = err?.toString().includes('quota') ? "API quota exceeded. Please check your plan or try again tomorrow." : 'Sorry, something went wrong. Please try again.'; setError(errorMessage); setChatHistory(prev => [...prev, { id: `error-${Date.now()}`, role: 'model', parts: [{ text: errorMessage }] }]);
    } finally { setIsLoading(false); }
  };
  
  const handlePlayTTS = async (messageId: string, text: string) => {
    if (ttsLoadingMessageId) return;
    setTtsLoadingMessageId(messageId); setError(null); if (audioSource) audioSource.stop();
    const parseEmotionFromText = (responseText: string): Emotion | null => { const match = responseText.match(/\*\*Emotion:\*\*\s*_([a-zA-Z]+)_/); return match ? match[1].toLowerCase() as Emotion : null; };
    const emotionToVoiceMap: Record<Emotion, string> = { neutral: 'Kore', warm: 'Zephyr', encouraging: 'Puck', excited: 'Puck', calm: 'Charon', serious: 'Fenrir', playful: 'Zephyr', empathetic: 'Kore' };
    let emotionToUse: Emotion = manualEmotion;
    if (emotionMode === 'Auto') { emotionToUse = parseEmotionFromText(text) || 'neutral'; }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const conversationalPart = text.split('---')[0].trim();
        const voiceName = ttsProvider === 'ElevenLabs' ? 'Zephyr' : emotionToVoiceMap[emotionToUse];
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash-preview-tts", contents: [{ parts: [{ text: conversationalPart }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } } });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data; if (!base64Audio) throw new Error("No audio data received.");
        const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
        const source = outputAudioContext.createBufferSource(); source.buffer = audioBuffer; source.connect(outputAudioContext.destination); source.start(); setAudioSource(source);
    } catch (err: any) { console.error(err); setError(err?.toString().includes('quota') ? 'Could not generate speech: API quota exceeded.' : 'Failed to generate speech.');
    } finally { setTtsLoadingMessageId(null); }
  };

  // --- LIVE MODE FUNCTIONS ---
  const getLiveFeedback = async (turnId: string, text: string) => {
    setTranscription(prev => prev.map(t => t.id === turnId ? { ...t, isFeedbackLoading: true } : t));
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `You are an expert language coach. A user whose native language is ${nativeLanguage.name} is learning ${learningLanguage.name}. Provide concise, helpful, and encouraging feedback on the following sentence they spoke: "${text}"
        Structure your feedback in markdown with these sections:
        - **Overall:** A brief, positive comment.
        - **Correction:** If there are errors, provide a corrected version. If not, omit this.
        - **Tip:** A single, actionable tip about grammar, vocabulary, or phrasing.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setTranscription(prev => prev.map(t => t.id === turnId ? { ...t, feedback: response.text, isFeedbackLoading: false } : t));
    } catch (error: any) { console.error("Failed to get feedback:", error); let errorMessage = 'Sorry, an error occurred while getting feedback.'; if (error?.toString().includes('quota')) { errorMessage = 'API quota exceeded.'; } setTranscription(prev => prev.map(t => t.id === turnId ? { ...t, feedback: errorMessage, isFeedbackLoading: false } : t)); }
  };

  const startLiveSession = async () => {
    if (liveStatus !== 'idle' && liveStatus !== 'error') stopLiveSession();
    setLiveStatus('connecting'); setLiveErrorMessage(null); setTranscription([]);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); mediaStreamRef.current = stream;
        let nextStartTime = 0; const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        const outputNode = outputAudioContext.createGain(); outputNode.connect(outputAudioContext.destination);
        let currentInputTranscription = ''; let currentOutputTranscription = '';
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const voiceName = ttsProvider === 'ElevenLabs' ? 'Zephyr' : 'Kore';
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    const inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 }); audioContextRef.current = inputAudioContext;
                    const source = inputAudioContext.createMediaStreamSource(stream); mediaStreamSourceRef.current = source;
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1); scriptProcessorRef.current = scriptProcessor;
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0); const l = inputData.length; const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) { int16[i] = inputData[i] * 32768; }
                        const pcmBlob: Blob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
                        sessionPromise.then((session) => { session.sendRealtimeInput({ media: pcmBlob }); });
                    };
                    source.connect(scriptProcessor); scriptProcessor.connect(inputAudioContext.destination); setLiveStatus('live');
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) { currentInputTranscription += message.serverContent.inputTranscription.text; }
                    if (message.serverContent?.outputTranscription) { currentOutputTranscription += message.serverContent.outputTranscription.text; }
                    if (message.serverContent?.turnComplete) {
                        const fullInput = currentInputTranscription.trim(); const fullOutput = currentOutputTranscription.trim();
                        if (fullInput) setTranscription(prev => [...prev, { id: `user-${Date.now()}`, speaker: 'user', text: fullInput }]);
                        if (fullOutput) setTranscription(prev => [...prev, { id: `model-${Date.now()}`, speaker: 'model', text: fullOutput }]);
                        currentInputTranscription = ''; currentOutputTranscription = '';
                    }
                    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio) {
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        const source = outputAudioContext.createBufferSource(); source.buffer = audioBuffer; source.connect(outputNode);
                        source.start(nextStartTime); nextStartTime += audioBuffer.duration;
                    }
                },
                onerror: (e: ErrorEvent) => { console.error('Session Error:', e); setLiveStatus('error'); setLiveErrorMessage(`An error occurred: ${e.message}.`); stopLiveSession(); },
                onclose: (e: CloseEvent) => { if (!e.wasClean) { setLiveStatus('error'); setLiveErrorMessage("The connection was closed unexpectedly."); } stopLiveSession(); },
            },
            config: { responseModalities: [Modality.AUDIO], inputAudioTranscription: {}, outputAudioTranscription: {}, speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }, systemInstruction: `You are Lumi, a friendly and patient language tutor. The user's native language is ${nativeLanguage.name}, and they are learning ${learningLanguage.name}. Conduct a conversation in ${learningLanguage.name}. Keep your responses brief to encourage the user to speak more.` },
        });
        sessionRef.current = sessionPromise;
    } catch (error: any) { console.error("Failed to start session:", error); setLiveStatus('error'); if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') { setLiveErrorMessage("Microphone permission was denied."); } else { setLiveErrorMessage("Could not start session. Please ensure your microphone is connected."); } }
  };


  return (
    <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
      <PageHeader title="Practice Conversation" description={`Practice your ${learningLanguage.name} with your AI partner, Lumi.`} nativeLanguage={nativeLanguage} learningLanguage={learningLanguage} setNativeLanguage={setNativeLanguage} setLearningLanguage={setLearningLanguage} setActiveFeature={setActiveFeature} />
      <div className="flex-1 flex flex-col bg-background-secondary/50 rounded-lg border border-background-tertiary/50 overflow-hidden mt-6">
        <div id="chat-log" role="log" aria-live="polite" className="flex-1 overflow-y-auto p-6 space-y-6">
          {mode === 'text' ? (<>
              {chatHistory.length === 0 && !isLoading && ( <div className="text-center text-text-secondary h-full flex items-center justify-center" role="status"> <p>Start the conversation in {learningLanguage.name}!</p> </div> )}
              {chatHistory.map((message, index) => {
                const isLastModelMessage = message.role === 'model' && index === chatHistory.length - 1 && !isLoading;
                const [conversationalPart, ...rest] = message.parts[0].text.split('---');
                const insightsPart = rest.length > 0 ? '---' + rest.join('---') : null;
                const wordsAndSpaces = conversationalPart.split(/(\s+|[.,!?;:"])/g).filter(Boolean);
                return (
                    <div key={message.id} role="article" aria-label={message.role === 'user' ? 'Your message' : "Lumi's message"} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-xl px-5 py-3 rounded-2xl shadow-md ${message.role === 'user' ? 'bg-accent-primary text-background-primary' : 'bg-background-tertiary text-text-primary'}`}>
                          {message.role === 'user' ? ( <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{message.parts[0].text}</ReactMarkdown></div> ) : ( <>
                              <p>{wordsAndSpaces.map((segment, i) => segment.trim() && !/^[.,!?;:"]+$/.test(segment) ? (<HoverTranslate key={i} word={segment} nativeLanguage={nativeLanguage} learningLanguage={learningLanguage} />) : (<span key={i}>{segment}</span>) )}</p>
                              {insightsPart && (<div className="prose prose-invert prose-sm max-w-none pt-3 mt-3 border-t border-background-tertiary/30"><ReactMarkdown>{insightsPart}</ReactMarkdown></div>)}
                          </>)}
                      </div>
                      {message.role === 'model' && (<div className="w-full max-w-xl">
                          {message.parts[0].text && <MessageToolbar message={message} isLastModelMessage={isLastModelMessage} onPlayTTS={handlePlayTTS} onRegenerate={handleRegenerate} ttsLoadingMessageId={ttsLoadingMessageId} />}
                          {message.sources && message.sources.length > 0 && <RenderSources sources={message.sources} />}
                      </div>)}
                    </div>
                )
              })}
              {isLoading && chatHistory[chatHistory.length - 1]?.role === 'user' && ( <div className="flex justify-start"><div role="status" aria-label="Lumi is typing" className="max-w-xl px-5 py-3 rounded-2xl shadow-md bg-background-tertiary text-text-primary flex items-center"><div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse mr-2 delay-75"></div><div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse mr-2 delay-150"></div><div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse delay-300"></div></div></div> )}
              {!isLoading && (chatHistory.length === 0 || chatHistory[chatHistory.length - 1]?.role === 'model') && ( <div className="pt-2"> <SmartSuggestions generateSuggestions={generateChatSuggestions} onSuggestionClick={handleSuggestionClick} isDisabled={isLoading || isSttRecording || isTranscribing} /> </div> )}
          </>) : (<>
              {transcription.length === 0 && ( <div className="text-center text-text-secondary h-full flex flex-col items-center justify-center"> <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-background-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> <p className="mt-4">Click "Start Speaking" to begin your live conversation.</p> </div> )}
              {transcription.map((entry) => (
                  <div key={entry.id} className={`flex flex-col ${entry.speaker === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-xl px-4 py-2 rounded-lg ${entry.speaker === 'user' ? 'bg-accent-primary text-background-primary' : 'bg-background-tertiary text-text-primary'}`}>
                          <p>{entry.text}</p>
                      </div>
                      {entry.speaker === 'user' && (<div className="max-w-xl w-full mt-2"> {entry.isFeedbackLoading ? (<div className="flex items-center justify-end gap-2 text-sm text-text-secondary"><SmallSpinner /> Analyzing...</div>) : entry.feedback ? (<div className="bg-background-tertiary/50 p-3 rounded-lg border border-background-tertiary/70 text-sm"><h4 className="font-bold text-accent-secondary mb-1">💡 Fluency Coach</h4><div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{entry.feedback}</ReactMarkdown></div></div>) : (<div className="flex justify-end"><button onClick={() => getLiveFeedback(entry.id, entry.text)} className="text-xs font-semibold bg-accent-secondary/20 text-accent-secondary px-3 py-1 rounded-md hover:bg-accent-secondary/40 transition-colors">Get Feedback</button></div>)} </div>)}
                  </div>
              ))}
          </>)}
          <div ref={endOfMessagesRef} />
        </div>

        <div className="border-t border-background-tertiary/50 p-4 bg-background-secondary">
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex bg-background-tertiary rounded-md p-1">
                <button onClick={() => handleModeChange('text')} className={`px-3 py-1 text-xs rounded transition-colors ${mode === 'text' ? 'bg-accent-primary text-background-primary font-semibold' : 'hover:bg-background-secondary/50'}`}>Text Chat</button>
                <button onClick={() => handleModeChange('live')} disabled={tierLevels[subscriptionTier] < tierLevels['Plus']} className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${mode === 'live' ? 'bg-accent-primary text-background-primary font-semibold' : 'hover:bg-background-secondary/50'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                    Live Voice {tierLevels[subscriptionTier] < tierLevels['Plus'] && <LockIcon />}
                </button>
            </div>
            {mode === 'text' && <div className="relative"><button type="button" onClick={() => setIsSettingsOpen(true)} className="p-2 text-text-secondary hover:text-accent-primary transition-colors" aria-label="Tutor Style Settings" title="Conversation Settings"><SettingsIcon /></button><ChatSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentStyle={tutorStyle} onStyleChange={setTutorStyle} currentModel={selectedModel} onModelChange={setSelectedModel} isGrounded={isGrounded} onGroundedChange={setIsGrounded} ttsProvider={ttsProvider} onTtsProviderChange={setTtsProvider} subscriptionTier={subscriptionTier} setActiveFeature={setActiveFeature} emotionMode={emotionMode} onEmotionModeChange={setEmotionMode} manualEmotion={manualEmotion} onManualEmotionChange={setManualEmotion} sttLanguageCode={sttLanguageCode} onSttLanguageCodeChange={setSttLanguageCode} nativeLanguage={nativeLanguage} learningLanguage={learningLanguage} thinkingPreset={thinkingPreset} onThinkingPresetChange={setThinkingPreset} /></div>}
          </div>

          {mode === 'text' ? (
            <form onSubmit={handleSendMessage} className="flex items-end space-x-2 sm:space-x-4">
              <div className="flex-1 flex flex-col gap-2"><textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any); } }} aria-label={`Type or use the mic to speak in ${learningLanguage.name}`} title={`Type or use the mic to speak in ${learningLanguage.name}`} placeholder={`Type or use the mic to speak in ${learningLanguage.name}...`} className="w-full bg-background-tertiary rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none transition-all duration-200" rows={1} disabled={isLoading || isSttRecording || isTranscribing} />{sttError && <p role="alert" className="text-xs text-red-400 px-1">{sttError}</p>}</div>
              <button type="button" onClick={handleMicClick} disabled={isLoading || isTranscribing} className={`p-3 rounded-lg transition-colors duration-200 flex items-center justify-center self-stretch ${isSttRecording ? 'bg-red-500/80 text-white animate-pulse' : 'bg-background-tertiary text-text-secondary hover:bg-background-tertiary/70'}`} aria-label={isSttRecording ? 'Stop recording' : 'Start recording'} title={isSttRecording ? 'Stop recording' : 'Start recording'}>{isTranscribing ? <TranscribingSpinner /> : isSttRecording ? <StopIcon /> : <MicIcon />}</button>
              <button type="submit" disabled={isLoading || !userInput.trim() || isSttRecording || isTranscribing} className="bg-accent-primary text-white font-semibold py-3 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center self-stretch" aria-label="Send message" title="Send message">{isLoading ? <Spinner/> : ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"> <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /> </svg> )} </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center h-28">
                {liveStatus === 'live' ? (
                     <button onClick={stopLiveSession} className="px-6 py-3 rounded-lg font-bold transition-colors bg-red-500 hover:bg-red-600 text-background-primary flex items-center gap-2"> <div className="w-3 h-3 rounded-full bg-white/80 animate-pulse"></div> End Session </button>
                ) : (
                     <button onClick={startLiveSession} disabled={liveStatus === 'connecting'} className="px-6 py-3 rounded-lg font-bold transition-colors bg-accent-primary hover:bg-accent-primary-dark text-background-primary disabled:opacity-50"> {liveStatus === 'connecting' ? 'Connecting...' : 'Start Speaking'} </button>
                )}
                {liveErrorMessage && <p className="text-xs text-red-400 mt-2">{liveErrorMessage}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- SUB-COMPONENTS ---
interface MessageToolbarProps { message: ChatMessage; isLastModelMessage: boolean; onPlayTTS: (messageId: string, text: string) => void; onRegenerate: () => void; ttsLoadingMessageId: string | null; }
const MessageToolbar: React.FC<MessageToolbarProps> = ({ message, isLastModelMessage, onPlayTTS, onRegenerate, ttsLoadingMessageId }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => { navigator.clipboard.writeText(message.parts[0].text); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };
    return ( <div className="flex items-center gap-1 mt-2 ml-2"> <button onClick={handleCopy} aria-label="Copy message text" title="Copy message" className="p-1.5 rounded-md text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors"> {isCopied ? <CheckIcon /> : <CopyIcon />} </button> <button onClick={() => onPlayTTS(message.id, message.parts[0].text)} aria-label="Read message aloud" title="Read aloud" disabled={!!ttsLoadingMessageId} className="p-1.5 rounded-md text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors disabled:opacity-50"> {ttsLoadingMessageId === message.id ? <Spinner/> : <SpeakerIcon />} </button> {isLastModelMessage && ( <button onClick={onRegenerate} aria-label="Regenerate response" title="Regenerate response" className="p-1.5 rounded-md text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors"> <RefreshIcon /> </button> )} </div> );
};
const RenderSources: React.FC<{sources: GroundingChunk[]}> = ({ sources }) => {
    const uniqueLinks = new Map<string, string>();
    sources.forEach(chunk => { if (chunk.web?.uri) uniqueLinks.set(chunk.web.uri, chunk.web.title || chunk.web.uri); });
    if (uniqueLinks.size === 0) return null;
    return ( <div className="mt-2 pt-2 border-t border-background-tertiary/30 ml-2"> <h4 className="text-xs font-semibold text-text-secondary mb-1">Sources:</h4> <div className="flex flex-wrap gap-1"> {Array.from(uniqueLinks.entries()).map(([uri, title], index) => ( <a href={uri} key={index} target="_blank" rel="noopener noreferrer" className="text-xs bg-accent-secondary/20 text-accent-secondary px-2 py-0.5 rounded-md hover:bg-accent-secondary/40 transition-colors truncate max-w-[200px]"> {title} </a> ))} </div> </div> );
};
const CopyIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /> </svg> );
const CheckIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-400"> <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> </svg> );
const SpeakerIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"> <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28 .53v15.88a.75.75 0 01-1.28 .53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /> </svg> );
const RefreshIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.693L7.985 2.985m0 0v4.992m0 0h4.992m-4.993 0l3.181-3.183a8.25 8.25 0 0111.664 0l3.181 3.183" /> </svg> );

export default Chat;
