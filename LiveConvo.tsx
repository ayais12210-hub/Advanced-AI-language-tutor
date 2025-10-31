import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { Language } from './types';
import { PageHeader } from './PageHeader';

// Helper functions for audio encoding/decoding
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

interface LiveConvoProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
}

const LiveConvo: React.FC<LiveConvoProps> = ({ nativeLanguage, learningLanguage, setNativeLanguage, setLearningLanguage }) => {
    const [isLive, setIsLive] = useState(false);
    const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
    const [transcription, setTranscription] = useState<{ speaker: 'user' | 'model', text: string }[]>([]);
    
    const sessionRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const stopSession = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.then(session => session.close());
            sessionRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        audioContextRef.current = null;
        setIsLive(false);
        setStatus('idle');
    }, []);

    const startSession = async () => {
        if (isLive) stopSession();
        setStatus('connecting');
        setTranscription([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            let nextStartTime = 0;
            const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = outputAudioContext.createGain();
            outputNode.connect(outputAudioContext.destination);

            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        const inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                        audioContextRef.current = inputAudioContext;
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;

                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                        setIsLive(true);
                        setStatus('live');
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputTranscription.trim();
                            const fullOutput = currentOutputTranscription.trim();
                            if (fullInput) setTranscription(prev => [...prev, { speaker: 'user', text: fullInput }]);
                            if (fullOutput) setTranscription(prev => [...prev, { speaker: 'model', text: fullOutput }]);
                            currentInputTranscription = '';
                            currentOutputTranscription = '';
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session Error:', e);
                        setStatus('error');
                        stopSession();
                    },
                    onclose: (e: CloseEvent) => {
                        stopSession();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: `You are Lumi, a friendly and patient language tutor. The user's native language is ${nativeLanguage.name}, and they are learning ${learningLanguage.name}. Conduct a conversation in ${learningLanguage.name}. Keep your responses brief to encourage the user to speak more.`,
                },
            });
            sessionRef.current = sessionPromise;
        } catch (error) {
            console.error("Failed to start session:", error);
            setStatus('error');
        }
    };
    
    // Stop session if language changes
    useEffect(() => {
        stopSession();
    }, [learningLanguage, nativeLanguage, stopSession]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSession();
        };
    }, [stopSession]);

    const getStatusIndicator = () => {
        switch (status) {
            case 'idle':
                return <><div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>Disconnected</>;
            case 'connecting':
                return <><div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse mr-2"></div>Connecting...</>;
            case 'live':
                return <><div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-2"></div>Live Conversation</>;
            case 'error':
                return <><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>Error</>;
        }
    };

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <PageHeader
                title="Live Tutoring"
                description={`Speak directly with Gemini in ${learningLanguage.name} and get real-time audio responses.`}
                nativeLanguage={nativeLanguage}
                learningLanguage={learningLanguage}
                setNativeLanguage={setNativeLanguage}
                setLearningLanguage={setLearningLanguage}
            />
            <div className="flex-1 flex flex-col bg-background-secondary/50 rounded-lg border border-background-tertiary/50 overflow-hidden mt-6">
                <div className="flex items-center justify-between p-4 border-b border-background-tertiary/50">
                    <div className="flex items-center text-sm font-semibold">{getStatusIndicator()}</div>
                    <button
                        onClick={isLive ? stopSession : startSession}
                        className={`px-6 py-2 rounded-lg font-bold transition-colors ${isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-accent-primary hover:bg-accent-primary-dark'} text-background-primary`}
                    >
                        {isLive ? 'End Session' : 'Start Speaking'}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {transcription.length === 0 && (
                        <div className="text-center text-text-secondary h-full flex flex-col items-center justify-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-background-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                           <p className="mt-4">Click "Start Speaking" to begin your live tutoring session.</p>
                        </div>
                    )}
                    {transcription.map((entry, index) => (
                        <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl px-4 py-2 rounded-lg ${entry.speaker === 'user' ? 'bg-accent-primary text-background-primary' : 'bg-background-tertiary text-text-primary'}`}>
                                <p>{entry.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiveConvo;