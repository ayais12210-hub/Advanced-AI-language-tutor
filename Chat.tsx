import React, { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { GoogleGenAI, Chat as GeminiChat, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Language } from './types';
import SmartSuggestions from './SmartSuggestions';
import { PageHeader } from './PageHeader';

// Loading spinner component
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

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

  const chatRef = useRef<GeminiChat | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);
  
  // When language context changes, reset the chat to start a new session
  useEffect(() => {
    chatRef.current = null;
    setChatHistory([]);
  }, [nativeLanguage, learningLanguage]);

    const generateChatSuggestions = useCallback(async (): Promise<string[]> => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `You are a creative assistant for a language learner. The user is learning ${learningLanguage.name}. Generate 3 interesting and engaging conversation starters in ${learningLanguage.name} to help them practice. Provide only a JSON array of strings. Example: ["Hello! How was your day?", "What is your favorite food?"]`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
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
        setUserInput(suggestion);
    };


  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: userInput }] };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      if (!chatRef.current) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: `You are Lumi, an expert language tutor AI from Linguamate.ai. You are friendly, encouraging, and an expert linguist. The user's native language is ${nativeLanguage.name} and they are learning ${learningLanguage.name}.

Your task is to engage in a practice conversation while providing deep, insightful feedback. Follow this response structure precisely for every message:

1.  **Conversational Reply:** First, respond directly to the user's message in ${learningLanguage.name}. Keep it natural and engaging to move the conversation forward.

2.  **Translation:** After your reply, add a horizontal rule (---) and then provide a clear translation of your reply in ${nativeLanguage.name}, formatted in italics. For example: *(${nativeLanguage.name}: [Your translation here])*.

3.  **Advanced Insights:** Finally, add a section titled "💡 **Advanced Insights**". This section MUST be in ${nativeLanguage.name} to ensure the user understands the complex details. In this section, analyze the USER's most recent message and provide one or more of the following:
    *   **Corrections:** Gently correct any grammatical errors or unnatural phrasing. Show the original and the corrected version.
    *   **Grammar Deep Dive:** Explain the 'why' behind a grammatical rule relevant to their sentence.
    *   **Vocabulary Enrichment:** Suggest more advanced or idiomatic words/phrases they could have used.
    *   **Cultural Context:** If their message touches on something with cultural significance, explain it.
    *   **Alternative Phrasings:** Offer different ways to express their idea (e.g., more formal, more casual).

Use markdown (bolding, italics, lists, blockquotes) to make your response structured, clear, and easy to read. Your primary goal is to not just chat, but to actively teach and deepen the user's understanding of ${learningLanguage.name} with every interaction.`,
          },
        });
      }

      const stream = await chatRef.current.sendMessageStream({ message: userInput });
      setUserInput(''); // Clear input after sending

      let modelResponse = '';
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].parts[0].text = modelResponse;
          return newHistory;
        });
      }

    } catch (err) {
      const errorMessage = 'Sorry, something went wrong. Please try again.';
      setError(errorMessage);
       setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: errorMessage }] }]);
      console.error(err);
    } finally {
      setIsLoading(false);
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
          {chatHistory.length === 0 && (
            <div className="text-center text-text-secondary h-full flex items-center justify-center">
              <p>Start the conversation in {learningLanguage.name}!</p>
            </div>
          )}
          {chatHistory.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl px-5 py-3 rounded-2xl shadow-md ${message.role === 'user' ? 'bg-accent-primary text-background-primary' : 'bg-background-tertiary text-text-primary'}`}>
                 <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
                </div>
              </div>
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
          <form onSubmit={handleSendMessage} className="flex items-start space-x-4">
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
                <SmartSuggestions
                    generateSuggestions={generateChatSuggestions}
                    onSuggestionClick={handleSuggestionClick}
                    isDisabled={isLoading}
                />
            </div>
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="bg-accent-primary text-white font-semibold py-3 px-5 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center w-[58px] h-[48px]"
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

export default Chat;