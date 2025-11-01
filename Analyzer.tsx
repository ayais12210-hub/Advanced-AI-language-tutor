import React, { useState, useEffect, useRef, useMemo, FormEvent, useCallback } from 'react';
import { GoogleGenAI, Modality, Type, Chat as GeminiChat } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Notebook, Source, SourceType, ChatMessage, SubscriptionTier, FeatureId, TtsProvider } from './types';
import LockedFeatureGate from './LockedFeatureGate';


// --- ICONS ---
const Spinner = () => (<div className="w-full flex justify-center p-8"><svg className="animate-spin h-10 w-10 text-accent-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>);
const PlayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>);
const PauseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zm9 0a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>);
const BackIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>);
const PasteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>);

const sourceIcons: { [key in SourceType]: React.ReactElement } = {
  pdf: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  audio: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>,
  website: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0112 13.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0l-2.11 2.11m-2.11-2.11l2.11 2.11m0 0l-2.11 2.11m2.11-2.11l2.11 2.11M12 13.5a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" /></svg>,
  youtube: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>,
  text: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>,
  gdoc: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5h.008v.008H9v-.008z" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
};
const sourceButtons: { id: SourceType, name: string }[] = [{ id: 'pdf', name: 'PDF' }, { id: 'audio', name: 'Audio' }, { id: 'gdoc', name: 'Google Doc' }, { id: 'website', name: 'Website' }, { id: 'youtube', name: 'YouTube' }, { id: 'text', name: 'Copied text' }];

// --- A custom hook to manage state with localStorage persistence ---
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(`linguamate_${key}`);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage for key "${key}"`, error); return defaultValue;
        }
    });
    useEffect(() => {
        try {
            window.localStorage.setItem(`linguamate_${key}`, JSON.stringify(state));
        } catch (error) {
            console.error(`Error writing to localStorage for key "${key}"`, error);
        }
    }, [key, state]);
    return [state, setState];
}

// --- AUDIO HELPERS ---
function decode(base64: string) { const binaryString = atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); } return bytes; }
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { const dataInt16 = new Int16Array(data.buffer); const frameCount = dataInt16.length / numChannels; const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate); for (let channel = 0; channel < numChannels; channel++) { const channelData = buffer.getChannelData(channel); for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; } } return buffer; }

// --- CHILD COMPONENTS ---

const NotebookCard: React.FC<{ notebook: Notebook, onSelect: () => void }> = ({ notebook, onSelect }) => {
    return (
        <div onClick={onSelect} className="bg-background-secondary p-4 rounded-lg border border-background-tertiary/50 flex flex-col justify-between group cursor-pointer hover:border-accent-primary/50 transition-colors">
            <div>
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xl mb-3">
                    {sourceIcons.gdoc}
                </div>
                <h3 className="font-bold text-text-primary group-hover:text-accent-primary transition-colors">{notebook.title}</h3>
                <p className="text-xs text-text-secondary mt-1">{notebook.sources.length} sources • {new Date(notebook.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

const NotebooksDashboard: React.FC<{ notebooks: Notebook[], onSelect: (id: string) => void, onCreate: () => void }> = ({ notebooks, onSelect, onCreate }) => {
    return (
        <div className="p-4 sm:p-8 h-full">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold font-heading">Content Analyzer</h1>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {notebooks.map(nb => (
                    <NotebookCard key={nb.id} notebook={nb} onSelect={() => onSelect(nb.id)} />
                ))}
                <button onClick={onCreate} className="border-2 border-dashed border-background-tertiary rounded-lg flex flex-col items-center justify-center text-text-secondary hover:border-accent-primary hover:text-accent-primary transition-colors min-h-[200px]">
                    <PlusIcon />
                    <span className="mt-2 font-semibold">Create New</span>
                </button>
            </div>
        </div>
    );
};

// --- NOTEBOOK VIEW AND TABS ---
type NotebookViewTab = 'Summary' | 'Sources' | 'Chat' | 'Studio';

const NotebookView: React.FC<{notebook: Notebook, onUpdate: (nb: Notebook) => void, onBack: () => void}> = ({ notebook, onUpdate, onBack }) => {
    const [activeTab, setActiveTab] = useState<NotebookViewTab>('Summary');
    const tabs: NotebookViewTab[] = ['Summary', 'Sources', 'Chat', 'Studio'];

    const renderContent = () => {
        switch(activeTab) {
            case 'Summary': return <SummaryTab notebook={notebook} onUpdate={onUpdate} />;
            case 'Sources': return <SourcesTab notebook={notebook} onUpdate={onUpdate} />;
            case 'Chat': return <ChatTab notebook={notebook} onUpdate={onUpdate} />;
            case 'Studio': return <StudioTab notebook={notebook} onUpdate={onUpdate} />;
            default: return null;
        }
    }

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 rounded-full hover:bg-background-secondary"><BackIcon/></button>
                <input
                    type="text"
                    value={notebook.title}
                    onChange={(e) => onUpdate({ ...notebook, title: e.target.value })}
                    className="text-3xl font-bold font-heading bg-transparent focus:outline-none focus:bg-background-secondary rounded-md px-2 w-full"
                />
            </header>

            <div className="border-b border-background-tertiary/50 mb-6">
                <nav className="flex -mb-px space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-secondary'
                            }`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="flex-1 overflow-y-auto">{renderContent()}</div>
        </div>
    );
};

const SummaryTab: React.FC<{notebook: Notebook, onUpdate: (nb: Notebook) => void}> = ({ notebook, onUpdate }) => {
    type AnalysisType = 'summary' | 'points' | 'faq';
    const [loading, setLoading] = useState<AnalysisType | null>(null);

    const generateAnalysis = async (type: AnalysisType) => {
        setLoading(type);
        const textContent = notebook.sources.map(s => `Source: ${s.title}\n${s.content}`).join('\n\n');
        if (!textContent) {
            alert("Add text-based sources first.");
            setLoading(null);
            return;
        }

        let prompt = '';
        switch(type) {
            case 'summary': prompt = `Provide a detailed, well-structured summary of the following content:\n\n${textContent}`; break;
            case 'points': prompt = `Extract the most important key points from the following content as a markdown bulleted list:\n\n${textContent}`; break;
            case 'faq': prompt = `Based on the following content, generate a list of 5-7 frequently asked questions and their answers in a markdown Q&A format:\n\n${textContent}`; break;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: { thinkingConfig: { thinkingBudget: 32768 } },
            });
            const resultText = response.text;

            const updatedNotebook = { ...notebook };
            if (type === 'summary') updatedNotebook.textSummary = resultText;
            if (type === 'points') updatedNotebook.keyPoints = resultText;
            if (type === 'faq') updatedNotebook.faq = resultText;
            onUpdate(updatedNotebook);
        } catch (error: any) {
            console.error("Analysis failed", error);
            if (error?.toString().includes('quota')) {
                alert("Failed to generate analysis: API quota exceeded. Please check your plan or try again later.");
            } else {
                alert("Failed to generate analysis.");
            }
        } finally {
            setLoading(null);
        }
    };

    const renderContent = (type: AnalysisType, content?: string) => (
        <div className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-4 min-h-[200px]">
            {loading === type ? <Spinner /> : content ? 
                <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{content}</ReactMarkdown></div> :
                <div className="flex items-center justify-center h-full text-text-secondary">
                    <button onClick={() => generateAnalysis(type)} className="bg-accent-primary/80 text-background-primary font-semibold py-2 px-4 rounded-lg hover:bg-accent-primary transition-colors">
                        Generate {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                </div>
            }
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold mb-2">Summary</h3>
                {renderContent('summary', notebook.textSummary)}
            </div>
             <div>
                <h3 className="text-xl font-bold mb-2">Key Points</h3>
                {renderContent('points', notebook.keyPoints)}
            </div>
             <div>
                <h3 className="text-xl font-bold mb-2">FAQ</h3>
                {renderContent('faq', notebook.faq)}
            </div>
        </div>
    );
};

const PasteTextModal: React.FC<{ onClose: () => void, onAddSource: (type: SourceType, title: string, content: string) => void }> = ({ onClose, onAddSource }) => {
    const [pastedText, setPastedText] = useState('');

    const handleAdd = () => {
        if (!pastedText.trim()) return;
        onAddSource('text', `${pastedText.substring(0, 30)}...`, pastedText);
        onClose();
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setPastedText(text);
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            alert('Could not paste from clipboard. Please make sure you have granted the necessary permissions.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-secondary w-full max-w-2xl rounded-xl border border-background-tertiary/50 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-background-tertiary/50">
                    <h2 className="font-heading text-xl font-bold">Add Text Source</h2>
                </header>
                <div className="p-6">
                    <div className="relative">
                        <textarea
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="Paste your text content here..."
                            rows={10}
                            className="w-full bg-background-tertiary rounded-lg p-3 pr-12 text-sm text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none"
                            autoFocus
                        />
                        <button 
                            type="button" 
                            onClick={handlePaste}
                            className="absolute top-3 right-3 p-1 rounded-md text-text-secondary hover:bg-background-tertiary/70 hover:text-text-primary transition-colors"
                            aria-label="Paste text from clipboard"
                            title="Paste from clipboard"
                        >
                            <PasteIcon />
                        </button>
                    </div>
                </div>
                <footer className="p-4 bg-background-tertiary/30 flex justify-end items-center gap-4">
                    <button onClick={onClose} className="py-2 px-5 rounded-md text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleAdd} disabled={!pastedText.trim()} className="bg-accent-primary text-background-primary font-bold py-2 px-6 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:text-text-secondary/50 transition-colors">
                        Add Source
                    </button>
                </footer>
            </div>
        </div>
    );
};

const PasteUrlModal: React.FC<{
  onClose: () => void;
  onAddSource: (type: SourceType, title: string, content: string) => void;
  sourceType: 'website' | 'youtube';
}> = ({ onClose, onAddSource, sourceType }) => {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAdd = () => {
    if (!url.trim()) return;
    try {
      new URL(url); // Simple validation
      onAddSource(sourceType, url, url);
      onClose();
    } catch (_) {
      alert('Please enter a valid URL.');
    }
  };
  
  const handlePaste = async () => {
    try {
        const text = await navigator.clipboard.readText();
        setUrl(text);
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        alert('Could not paste from clipboard.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background-secondary w-full max-w-lg rounded-xl border border-background-tertiary/50 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-background-tertiary/50">
          <h2 className="font-heading text-xl font-bold capitalize">Add {sourceType} Source</h2>
        </header>
        <div className="p-6">
          <label htmlFor="url-input" className="text-sm font-medium text-text-secondary mb-2 block">
            Paste the URL below
          </label>
          <div className="relative">
             <input
                ref={inputRef}
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={`e.g., https://www.${sourceType}.com/...`}
                className="w-full bg-background-tertiary rounded-lg p-3 pr-12 text-sm text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-primary focus:outline-none"
              />
              <button 
                  type="button" 
                  onClick={handlePaste}
                  className="absolute top-1/2 right-3 -translate-y-1/2 p-1 rounded-md text-text-secondary hover:bg-background-tertiary/70 hover:text-text-primary transition-colors"
                  aria-label="Paste URL from clipboard"
                  title="Paste from clipboard"
              >
                  <PasteIcon />
              </button>
          </div>
        </div>
        <footer className="p-4 bg-background-tertiary/30 flex justify-end items-center gap-4">
          <button onClick={onClose} className="py-2 px-5 rounded-md text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </button>
          <button onClick={handleAdd} disabled={!url.trim()} className="bg-accent-primary text-background-primary font-bold py-2 px-6 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:text-text-secondary/50 transition-colors">
            Add Source
          </button>
        </footer>
      </div>
    </div>
  );
};


const SourcesTab: React.FC<{notebook: Notebook, onUpdate: (nb: Notebook) => void}> = ({ notebook, onUpdate }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
    const [urlModalInfo, setUrlModalInfo] = useState<{ open: boolean, type: 'website' | 'youtube' | null }>({ open: false, type: null });
    const [uploadSourceType, setUploadSourceType] = useState<SourceType | null>(null);

    const addSource = (type: SourceType, title: string, content: string = '') => {
        if (notebook.sources.length >= 50) return;
        const newSource: Source = { id: `source-${Date.now()}`, type, title, content, timestamp: new Date().toISOString() };
        onUpdate({ ...notebook, sources: [...notebook.sources, newSource] });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && uploadSourceType) {
            addSource(uploadSourceType, file.name);
        }
        // Reset file input to allow uploading the same file again
        if (e.target) {
            e.target.value = '';
        }
        setUploadSourceType(null);
    };
    
    const handleButtonClick = (id: SourceType) => {
        if (id === 'pdf' || id === 'audio' || id === 'gdoc') {
            setUploadSourceType(id);
            let acceptTypes = '';
            switch (id) {
                case 'pdf':
                    acceptTypes = '.pdf';
                    break;
                case 'audio':
                    acceptTypes = 'audio/*';
                    break;
                case 'gdoc':
                    // Common formats for downloaded Google Docs
                    acceptTypes = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.odt';
                    break;
            }
            if (fileInputRef.current) {
                fileInputRef.current.setAttribute('accept', acceptTypes);
                fileInputRef.current.click();
            }
        } else if (id === 'website' || id === 'youtube') {
            setUrlModalInfo({ open: true, type: id });
        } else if (id === 'text') {
            setIsPasteModalOpen(true);
        }
    };
    
    const deleteSource = (id: string) => {
        onUpdate({ ...notebook, sources: notebook.sources.filter(s => s.id !== id) });
    };

    return (
        <>
            {isPasteModalOpen && <PasteTextModal onClose={() => setIsPasteModalOpen(false)} onAddSource={addSource} />}
            {urlModalInfo.open && urlModalInfo.type && (
                <PasteUrlModal 
                    sourceType={urlModalInfo.type}
                    onClose={() => setUrlModalInfo({ open: false, type: null })} 
                    onAddSource={addSource} 
                />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-4 flex flex-col">
                    <h2 className="text-xl font-bold mb-4">Sources ({notebook.sources.length}/50)</h2>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {notebook.sources.map(source => (
                            <div key={source.id} className="bg-background-tertiary p-3 rounded-lg flex items-center gap-3 justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-text-secondary">{sourceIcons[source.type]}</span>
                                    <p className="text-sm text-text-primary truncate">{source.title}</p>
                                </div>
                                <button onClick={() => deleteSource(source.id)} className="text-text-secondary hover:text-red-500 flex-shrink-0">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-6 flex flex-col">
                     <h2 className="text-xl font-bold mb-4">Add a new source</h2>
                     <p className="text-sm text-text-secondary mb-6">Build your notebook by adding documents, links, or text.</p>
                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {sourceButtons.map(btn => (
                            <button key={btn.id} onClick={() => handleButtonClick(btn.id)} className="flex flex-col items-center justify-center gap-2 p-4 bg-background-tertiary rounded-lg border border-background-tertiary/70 hover:border-accent-primary hover:text-accent-primary transition-all group">
                                <span className="text-text-secondary group-hover:text-accent-primary transition-colors">{sourceIcons[btn.id as SourceType]}</span>
                                <span className="text-sm font-medium">{btn.name}</span>
                            </button>
                        ))}
                     </div>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>
            </div>
        </>
    );
};

const ChatTab: React.FC<{notebook: Notebook, onUpdate: (nb: Notebook) => void}> = ({ notebook, onUpdate }) => {
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<GeminiChat | null>(null);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [notebook.chatHistory, isLoading]);

    const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        setIsLoading(true);
        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', parts: [{ text: userInput }] };
        const updatedHistory = [...(notebook.chatHistory || []), userMessage];
        onUpdate({ ...notebook, chatHistory: updatedHistory });
        setUserInput('');

        try {
            if (!chatRef.current) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const sourceContext = notebook.sources.map(s => `Source: ${s.title}\n${s.content}`).join('\n\n---\n\n');
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: `You are an expert AI assistant. Your knowledge base is strictly limited to the following documents. Answer the user's questions based only on this information. If the answer isn't in the documents, say so.\n\nDOCUMENTS:\n${sourceContext}`,
                    },
                    history: notebook.chatHistory?.map(m => ({
                        role: m.role,
                        parts: m.parts,
                    })),
                });
            }

            const stream = await chatRef.current.sendMessageStream({ message: userInput });
            let modelResponseText = '';
            const modelMessageId = `model-${Date.now()}`;
            
            // Add a placeholder for the model's response
            onUpdate({ ...notebook, chatHistory: [...updatedHistory, { id: modelMessageId, role: 'model', parts: [{ text: '' }] }] });

            for await (const chunk of stream) {
                modelResponseText += chunk.text;
                onUpdate({ 
                    ...notebook, 
                    chatHistory: notebook.chatHistory?.map(m => m.id === modelMessageId ? { ...m, parts: [{ text: modelResponseText }] } : m) 
                });
            }
        } catch (error: any) {
            console.error("Chat failed:", error);
            let errorMessage = "Sorry, the chat encountered an error.";
            if (error?.toString().includes('quota')) {
                errorMessage = "API quota exceeded for today. Please check your plan or try again later.";
            }
            // Add error message to chat history
            const finalHistory = notebook.chatHistory || [];
            onUpdate({ ...notebook, chatHistory: [...finalHistory, { id: `error-${Date.now()}`, role: 'model', parts: [{ text: errorMessage }] }] });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-background-secondary/50 rounded-lg border border-background-tertiary/50 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {(!notebook.chatHistory || notebook.chatHistory.length === 0) && (
                    <div className="text-center text-text-secondary h-full flex items-center justify-center">
                        <p>Ask questions about your sources.</p>
                    </div>
                 )}
                 {notebook.chatHistory?.map((message) => (
                    <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-xl px-5 py-3 rounded-2xl ${message.role === 'user' ? 'bg-accent-primary text-background-primary' : 'bg-background-tertiary text-text-primary'}`}>
                            <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{message.parts[0].text}</ReactMarkdown></div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-5 py-3 rounded-2xl bg-background-tertiary flex items-center">
                           <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse mr-2 delay-75"></div>
                           <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse mr-2 delay-150"></div>
                           <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse delay-300"></div>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>
            <div className="border-t border-background-tertiary/50 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                    <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ask a follow-up..."
                        className="w-full bg-background-tertiary rounded-lg p-3 text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-primary focus:outline-none" disabled={isLoading} />
                    <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-accent-primary text-white font-semibold p-3 rounded-lg hover:bg-accent-primary-dark disabled:bg-background-tertiary disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

const StudioTab: React.FC<{notebook: Notebook, onUpdate: (nb: Notebook) => void}> = ({ notebook, onUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [ttsProvider, setTtsProvider] = useState<TtsProvider>('Gemini');
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);

    useEffect(() => {
        const prepareAudio = async () => {
            if (!notebook.audioData) return;
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            const decodedBuffer = await decodeAudioData(decode(notebook.audioData), audioContextRef.current, 24000, 1);
            audioBufferRef.current = decodedBuffer;
        };
        prepareAudio();
        return () => { audioSourceRef.current?.stop(); audioContextRef.current?.close(); }
    }, [notebook.audioData]);

    const handleGenerateOverview = async () => {
        setIsLoading(true);
        const textContent = notebook.sources.map(s => `Source: ${s.title}\n${s.content}`).join('\n\n');
        if (!textContent) { alert("Add text-based sources first."); setIsLoading(false); return; }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const summaryResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Create a cohesive audio script summarizing the key points from:\n\n${textContent}`,
                config: { tools: [{ googleSearch: {} }] },
            });
            const summaryText = summaryResponse.text;
            const voiceName = ttsProvider === 'ElevenLabs' ? 'Zephyr' : 'Kore';
       
            const ttsResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: summaryText }] }],
                config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } },
            });

            const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("No audio data received.");

            onUpdate({ ...notebook, audioSummary: summaryText, audioData: base64Audio });
        } catch (err: any) { 
            console.error(err); 
            if (err?.toString().includes('quota')) {
                alert('Failed to generate audio overview: API quota exceeded. Please check your plan or try again later.');
            } else {
                alert('Failed to generate audio overview.'); 
            }
        } 
        finally { setIsLoading(false); }
    };

    const togglePlayback = () => {
        if (!audioContextRef.current || !audioBufferRef.current) return;
        if (isPlaying) {
            audioSourceRef.current?.stop();
            setIsPlaying(false);
        } else {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBufferRef.current;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsPlaying(false);
            source.start();
            audioSourceRef.current = source;
            setIsPlaying(true);
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full max-w-2xl bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-6 flex flex-col text-center">
                <h2 className="text-2xl font-bold font-heading mb-2">Audio Overview</h2>
                <p className="text-text-secondary mb-6">Listen to an AI-generated summary of your sources.</p>
                {notebook.audioData ? (
                    <>
                        <div className="flex-1 bg-background-tertiary p-4 rounded-md max-h-[40vh] overflow-y-auto prose prose-invert prose-sm max-w-none mb-6 text-left">
                            <ReactMarkdown>{notebook.audioSummary || "No summary available."}</ReactMarkdown>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <button onClick={togglePlayback} className="p-3 bg-accent-primary text-background-primary rounded-full hover:bg-accent-primary-dark transition-colors">
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="mb-4 w-full max-w-xs">
                            <label className="block text-xs font-medium text-text-secondary mb-1">Voice Provider</label>
                            <select value={ttsProvider} onChange={e => setTtsProvider(e.target.value as TtsProvider)} className="w-full bg-background-tertiary rounded-md p-2 text-sm focus:ring-1 focus:ring-accent-primary focus:outline-none">
                                <option value="Gemini">Gemini</option>
                                <option value="ElevenLabs">ElevenLabs (Simulated)</option>
                            </select>
                        </div>
                        <button onClick={handleGenerateOverview} className="bg-accent-primary text-background-primary font-bold py-3 px-6 rounded-lg hover:bg-accent-primary-dark transition-colors">
                            Generate Audio Overview
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- MAIN ANALYZER COMPONENT ---
interface ContentAnalyzerProps {
    subscriptionTier: SubscriptionTier;
    setActiveFeature: (feature: FeatureId) => void;
}

const ContentAnalyzer: React.FC<ContentAnalyzerProps> = ({ subscriptionTier, setActiveFeature }) => {
  const [notebooks, setNotebooks] = usePersistentState<Notebook[]>('content_analyzer_notebooks', []);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const activeNotebook = useMemo(() => notebooks.find(nb => nb.id === activeNotebookId), [notebooks, activeNotebookId]);

  const handleCreateNotebook = () => {
    const newNotebook: Notebook = { id: `notebook-${Date.now()}`, title: 'Untitled Notebook', sources: [], createdAt: new Date().toISOString(), chatHistory: [] };
    setNotebooks(prev => [newNotebook, ...prev]);
    setActiveNotebookId(newNotebook.id);
  };

  const handleSelectNotebook = (id: string) => setActiveNotebookId(id);

  const handleUpdateNotebook = (updatedNotebook: Notebook) => {
    setNotebooks(notebooks.map(nb => nb.id === updatedNotebook.id ? updatedNotebook : nb));
  };
  
  const handleBackToDashboard = () => setActiveNotebookId(null);

  return (
    <LockedFeatureGate
        featureName="Content Analyzer"
        requiredTier="Pro"
        currentTier={subscriptionTier}
        setActiveFeature={setActiveFeature}
    >
        {activeNotebook ? (
            <NotebookView notebook={activeNotebook} onUpdate={handleUpdateNotebook} onBack={handleBackToDashboard} />
        ) : (
            <NotebooksDashboard notebooks={notebooks} onSelect={handleSelectNotebook} onCreate={handleCreateNotebook} />
        )}
    </LockedFeatureGate>
  );
};

export default ContentAnalyzer;