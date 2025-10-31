import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { GoogleGenAI, Chat as GeminiChat, Type, Modality } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Language, TutorStyle, ConversationMode, GroundingChunk } from './types';
import SmartSuggestions from './SmartSuggestions';
import { PageHeader } from './PageHeader';
import { ChatSettings } from './TutorStyleSelector';

// --- ICONS ---
const Spinner = () => ( <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> );
const SettingsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.113-1.113l.448-.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113-1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /> </svg> );

// --- AUDIO HELPERS ---
function decode(base64: string) { const binaryString = atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); } return bytes; }
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { const dataInt16 = new Int16Array(data.buffer); const frameCount = dataInt16.length / numChannels; const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate); for (let channel = 0; channel < numChannels; channel++) { const channelData = buffer.getChannelData(channel); for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; } } return buffer; }

// --- DYNAMIC SYSTEM PROMPT ---
const getSystemInstruction = (nativeLanguage: Language, learningLanguage: Language, tutorStyle: TutorStyle, isGrounded: boolean) => {
  let styleInstruction = '';
  switch (tutorStyle) {
    case 'Patient':
      styleInstruction = 'You are especially patient and provide very detailed, step-by-step explanations in the "Advanced Insights" section. You often give positive reinforcement.';
      break;
    case 'Concise':
      styleInstruction = 'You are direct and to the point. Your conversational replies are shorter, and your "Advanced Insights" focus only on the most critical correction or learning point.';
      break;
    case 'Standard':
    default:
      styleInstruction = 'You are friendly, encouraging, and an expert linguist.';
      break;
  }
  
  let groundingInstruction = '';
  if (isGrounded) {
    groundingInstruction = "If the user asks about recent events, facts, or real-world information, you MUST use the provided Google Search tool to find an accurate, up-to-date answer. After providing the answer, cite your sources clearly."
  }

  return `You are Lumi, an expert language tutor AI from Linguamate.ai. ${styleInstruction} ${groundingInstruction} The user's native language is ${nativeLanguage.name} and they are learning ${learningLanguage.name}. Your task is to engage in a practice conversation while providing deep, insightful feedback. 
  
  Follow this response structure precisely for every message, unless using the search tool prevents it:
1.  **Conversational Reply:** First, respond directly to the user's message in ${learningLanguage.name}. Keep it natural and engaging to move the conversation forward. If using search, provide the grounded answer here.
2.  **Translation:** After your reply, add a horizontal rule (---) and then provide a clear translation of your reply in ${nativeLanguage.name}, formatted in italics. For example: *(${nativeLanguage.name}: [Your translation here])*.
3.  **Advanced Insights:** Finally, add a section titled "💡 **Advanced Insights**". This section MUST be in ${nativeLanguage.name} to ensure the user understands the complex details. In this section, analyze the USER's most recent message and provide one or more of the following: Corrections, Grammar Deep Dive, Vocabulary Enrichment, Cultural Context, or Alternative Phrasings.
Use markdown (bolding, italics, lists) to make your response structured, clear, and easy to read. Your primary goal is to not just chat, but to actively teach and deepen the user's understanding of ${learningLanguage.name} with every interaction.`;
};


interface ChatProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
}

const Chat: React.FC<ChatProps> = ({ nativeLanguage, learningLanguage, setNativeLanguage, setLearningLanguage }) => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [tutorStyle, setTutorStyle] = useState<TutorStyle>('Standard');
  const [conversationMode, setConversationMode] = useState<ConversationMode>('Smart');
  const [isGrounded, setIsGrounded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [ttsLoadingMessageId, setTtsLoadingMessageId] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);


  const chatRef = useRef<GeminiChat | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);
  
  useEffect(() => {
    chatRef.current = null;
    setChatHistory([]);
  }, [nativeLanguage, learningLanguage, tutorStyle, conversationMode, isGrounded]);

  useEffect(() => {
    return () => {
      if (audioSource) audioSource.stop();
    };
  }, [audioSource]);


  const generateChatSuggestions = useCallback(async (): Promise<string[]> => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const isNewConversation = chatHistory.length === 0;
      let prompt: string;

      if (isNewConversation) {
          prompt = `You are a creative assistant for a language learner. The user is learning ${learningLanguage.name}. Generate 3 interesting and engaging conversation starters in ${learningLanguage.name} to help them practice. Provide only a JSON array of strings. Example: ["Hello! How was your day?", "What is your favorite food?"]`;
      } else {
          const conversationContext = chatHistory
              .slice(-4) // Get last 4 messages for context
              .map(m => {
                  const prefix = m.role === 'user' ? 'User' : 'Lumi';
                  let text = m.parts[0]?.text || '';
                  // For model responses, only take the conversational part before "---"
                  if (m.role === 'model') {
                      text = text.split('---')[0].trim();
                  }
                  return `${prefix}: ${text}`;
              })
              .join('\n');

          prompt = `You are a creative assistant for a language learner. The user is learning ${learningLanguage.name}.
Based on the following recent conversation history between the user and an AI tutor named Lumi:
---
${conversationContext}
---
Generate 3 natural, engaging, and contextually relevant follow-up questions or replies in ${learningLanguage.name} that the user could say next. The suggestions should help continue the conversation. Provide only a JSON array of strings.`;
      }
      
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
      });
      
      try {
          const suggestions = JSON.parse(response.text);
          return Array.isArray(suggestions) ? suggestions.map(String) : [];
      } catch (e) {
          console.error("Failed to parse suggestions JSON:", e);
          return [];
      }
  }, [learningLanguage, chatHistory]);

  const handleSuggestionClick = (suggestion: string) => { setUserInput(suggestion); };

  const handleSendMessage = async (e?: FormEvent<HTMLFormElement>, messageOverride?: string) => {
    if (e) e.preventDefault();
    const messageToSend = messageOverride || userInput;
    if (!messageToSend.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', parts: [{ text: messageToSend }] };
    setChatHistory(prev => [...prev, userMessage]);
    
    if (!messageOverride) {
      setUserInput('');
    }

    try {
      if (!chatRef.current) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        let modelName = 'gemini-2.5-flash';
        const config: any = {
            systemInstruction: getSystemInstruction(nativeLanguage, learningLanguage, tutorStyle, isGrounded),
        };

        switch (conversationMode) {
            case 'Fast':
                modelName = 'gemini-2.5-flash-lite';
                break;
            case 'Genius':
                modelName = 'gemini-2.5-pro';
                config.thinkingConfig = { thinkingBudget: 32768 };
                break;
            case 'Smart':
            default:
                modelName = 'gemini-2.5-flash';
                break;
        }

        if (isGrounded && conversationMode !== 'Fast') {
            config.tools = [{ googleSearch: {} }];
        }

        chatRef.current = ai.chats.create({
          model: modelName,
          config: config,
        });
      }

      const stream = await chatRef.current.sendMessageStream({ message: messageToSend });
      
      let modelResponseText = '';
      let modelResponseSources: GroundingChunk[] = [];
      const modelMessageId = `model-${Date.now()}`;
      setChatHistory(prev => [...prev, { id: modelMessageId, role: 'model', parts: [{ text: '' }], sources: [] }]);

      for await (const chunk of stream) {
        modelResponseText += chunk.text;
        const sources = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (sources) {
            modelResponseSources = sources;
        }

        setChatHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage && lastMessage.id === modelMessageId) {
            lastMessage.parts[0].text = modelResponseText;
            lastMessage.sources = modelResponseSources;
          }
          return newHistory;
        });
      }

    } catch (err) {
      const errorMessage = 'Sorry, something went wrong. Please try again.';
      setError(errorMessage);
       setChatHistory(prev => [...prev, { id: `error-${Date.now()}`, role: 'model', parts: [{ text: errorMessage }] }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    const lastUserMessage = [...chatHistory].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;

    setChatHistory(prev => prev.filter(m => m.id !== chatHistory[chatHistory.length - 1].id));
    await handleSendMessage(undefined, lastUserMessage.parts[0].text);
  };
  
  const handlePlayTTS = async (messageId: string, text: string) => {
    if (ttsLoadingMessageId) return;
    setTtsLoadingMessageId(messageId);
    setError(null);
    if (audioSource) audioSource.stop();

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        // Extract only the part in the learning language for TTS
        const conversationalPart = text.split('---')[0].trim();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: conversationalPart }] }],
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
        setAudioSource(source);

    } catch (err) {
        console.error(err);
        setError('Failed to generate speech.');
    } finally {
        setTtsLoadingMessageId(null);
    }
  };


  return (
    <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
      <PageHeader
        title="Practice Conversation"
        description={`Practice your ${learningLanguage.name} with your AI partner, Lumi.`}
        nativeLanguage={nativeLanguage}
        learningLanguage={learningLanguage}
        setNativeLanguage={setNativeLanguage}
        setLearningLanguage={setLearningLanguage}
      />
      <div className="flex-1 flex flex-col bg-background-secondary/50 rounded-lg border border-background-tertiary/50 overflow-hidden mt-6">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatHistory.length === 0 && !isLoading && (
            <div className="text-center text-text-secondary h-full flex items-center justify-center">
              <p>Start the conversation in {learningLanguage.name}!</p>
            </div>
          )}
          {chatHistory.map((message, index) => (
            <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-xl px-5 py-3 rounded-2xl shadow-md ${message.role === 'user' ? 'bg-accent-primary text-background-primary' : 'bg-background-tertiary text-text-primary'}`}>
                 <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
                </div>
              </div>
               {message.role === 'model' && (
                  <div className="w-full max-w-xl">
                     {message.parts[0].text && (
                       <MessageToolbar 
                          message={message} 
                          isLastModelMessage={index === chatHistory.length - 1}
                          onPlayTTS={handlePlayTTS}
                          onRegenerate={handleRegenerate}
                          ttsLoadingMessageId={ttsLoadingMessageId}
                       />
                     )}
                     {message.sources && message.sources.length > 0 && <RenderSources sources={message.sources} />}
                  </div>
               )}
            </div>
          ))}
          {isLoading && chatHistory[chatHistory.length - 1]?.role === 'user' && (
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
          <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
              <div className="relative">
                <button type="button" onClick={() => setIsSettingsOpen(true)} className="p-2 text-text-secondary hover:text-accent-primary transition-colors" aria-label="Tutor Style Settings">
                    <SettingsIcon />
                </button>
                <ChatSettings 
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    currentStyle={tutorStyle}
                    onStyleChange={setTutorStyle}
                    currentMode={conversationMode}
                    onModeChange={setConversationMode}
                    isGrounded={isGrounded}
                    onGroundedChange={setIsGrounded}
                />
              </div>
              <div className="text-xs bg-background-tertiary px-2 py-1 rounded-full text-text-secondary capitalize">{conversationMode}</div>


            <div className="flex-1 flex flex-col gap-2">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  placeholder={`Type in ${learningLanguage.name}...`}
                  className="w-full bg-background-tertiary rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none transition-all duration-200"
                  rows={2}
                  disabled={isLoading}
                />
                {!isLoading && (
                  <SmartSuggestions
                      generateSuggestions={generateChatSuggestions}
                      onSuggestionClick={handleSuggestionClick}
                      isDisabled={isLoading}
                  />
                )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-accent-primary text-white font-semibold py-3 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center self-stretch"
              aria-label="Send message"
            >
              {isLoading ? <Spinner/> : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


// --- SUB-COMPONENTS ---

interface MessageToolbarProps {
    message: ChatMessage;
    isLastModelMessage: boolean;
    onPlayTTS: (messageId: string, text: string) => void;
    onRegenerate: () => void;
    ttsLoadingMessageId: string | null;
}

const MessageToolbar: React.FC<MessageToolbarProps> = ({ message, isLastModelMessage, onPlayTTS, onRegenerate, ttsLoadingMessageId }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.parts[0].text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-1 mt-2 ml-2">
            <button onClick={handleCopy} title="Copy" className="p-1.5 rounded-md text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors">
                {isCopied ? <CheckIcon /> : <CopyIcon />}
            </button>
            <button onClick={() => onPlayTTS(message.id, message.parts[0].text)} title="Read aloud" disabled={!!ttsLoadingMessageId} className="p-1.5 rounded-md text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors disabled:opacity-50">
                {ttsLoadingMessageId === message.id ? <Spinner/> : <SpeakerIcon />}
            </button>
            {isLastModelMessage && (
                 <button onClick={onRegenerate} title="Regenerate response" className="p-1.5 rounded-md text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors">
                    <RefreshIcon />
                </button>
            )}
        </div>
    );
};


const RenderSources: React.FC<{sources: GroundingChunk[]}> = ({ sources }) => {
    const uniqueLinks = new Map<string, string>();
    sources.forEach(chunk => {
        if (chunk.web?.uri) uniqueLinks.set(chunk.web.uri, chunk.web.title || chunk.web.uri);
    });

    if (uniqueLinks.size === 0) return null;

    return (
        <div className="mt-2 pt-2 border-t border-background-tertiary/30 ml-2">
            <h4 className="text-xs font-semibold text-text-secondary mb-1">Sources:</h4>
            <div className="flex flex-wrap gap-1">
                {Array.from(uniqueLinks.entries()).map(([uri, title], index) => (
                    <a href={uri} key={index} target="_blank" rel="noopener noreferrer"
                       className="text-xs bg-accent-secondary/20 text-accent-secondary px-2 py-0.5 rounded-md hover:bg-accent-secondary/40 transition-colors truncate max-w-[200px]">
                        {title}
                    </a>
                ))}
            </div>
        </div>
    );
};

// Toolbar Icons
const CopyIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /> </svg> );
const CheckIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-400"> <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> </svg> );
const SpeakerIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"> <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28 .53v15.88a.75.75 0 01-1.28 .53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /> </svg> );
const RefreshIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.693L7.985 2.985m0 0v4.992m0 0h4.992m-4.993 0l3.181-3.183a8.25 8.25 0 0111.664 0l3.181 3.183" /> </svg> );

export default Chat;
