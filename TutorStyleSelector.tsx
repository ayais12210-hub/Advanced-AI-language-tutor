import React, { useState } from 'react';
import { TutorStyle, ModelId, ModelProvider, SubscriptionTier, FeatureId, TtsProvider, ThinkingPreset } from './types';
import { tierLevels } from './LockedFeatureGate';

interface Model {
    id: ModelId;
    name: string;
    description: string;
    provider: ModelProvider | 'Google' | 'OpenAI' | 'Anthropic'; // Allow specific providers
    requiredTier: SubscriptionTier;
    isLegacy?: boolean;
}

const models: Model[] = [
    // Auto
    { id: 'auto', name: 'Auto', description: 'Decides the best model for the task.', provider: 'Auto', requiredTier: 'Free' },
    // Google
    { id: 'gemini-2.5-pro', name: '2.5 Pro', description: 'Reasoning, maths and code.', provider: 'Google', requiredTier: 'Pro' },
    { id: 'gemini-2.5-flash', name: '2.5 Flash', description: 'Fast all-round help.', provider: 'Google', requiredTier: 'Free' },
    // OpenAI
    { id: 'gpt-5', name: 'GPT-5', description: 'Advanced reasoning & creativity.', provider: 'OpenAI', requiredTier: 'Pro' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Fast, capable model for general tasks.', provider: 'OpenAI', requiredTier: 'Free' },
    { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Legacy model.', provider: 'OpenAI', requiredTier: 'Free', isLegacy: true },
    { id: 'o3', name: 'o3', description: 'Legacy model.', provider: 'OpenAI', requiredTier: 'Free', isLegacy: true },
    { id: 'o4-mini', name: 'o4-mini', description: 'Legacy model.', provider: 'OpenAI', requiredTier: 'Free', isLegacy: true },
    // Anthropic
    { id: 'claude-opus-4.1', name: 'Opus 4.1', description: 'Deep brainstorming model.', provider: 'Anthropic', requiredTier: 'Pro' },
    { id: 'claude-sonnet-4.5', name: 'Sonnet 4.5', description: 'Smartest for everyday tasks.', provider: 'Anthropic', requiredTier: 'Free' },
    { id: 'claude-haiku-4.5', name: 'Haiku 4.5', description: 'Fastest for quick answers.', provider: 'Anthropic', requiredTier: 'Free' },
    { id: 'claude-opus-4', name: 'Opus 4', description: 'Legacy model.', provider: 'Anthropic', requiredTier: 'Free', isLegacy: true },
    { id: 'claude-sonnet-4', name: 'Sonnet 4', description: 'Legacy model.', provider: 'Anthropic', requiredTier: 'Free', isLegacy: true },
    { id: 'claude-sonnet-3.7', name: 'Sonnet 3.7', description: 'Legacy model.', provider: 'Anthropic', requiredTier: 'Free', isLegacy: true },
    { id: 'claude-opus-3', name: 'Opus 3', description: 'Legacy model.', provider: 'Anthropic', requiredTier: 'Free', isLegacy: true },
    { id: 'claude-haiku-3.5', name: 'Haiku 3.5', description: 'Legacy model.', provider: 'Anthropic', requiredTier: 'Free', isLegacy: true },
];


const styles: { id: TutorStyle; name: string; description: string }[] = [
    { id: 'Standard', name: 'Standard Tutor', description: 'A friendly, encouraging, and balanced approach.' },
    { id: 'Patient', name: 'Patient & Explanatory', description: 'Gives detailed, step-by-step explanations.' },
    { id: 'Concise', name: 'Concise & Quick', description: 'Direct and to-the-point for faster practice.' },
];

const ttsProviders: { id: TtsProvider; name: string, description: string }[] = [
    { id: 'Gemini', name: 'Gemini', description: 'High-quality, clear voices from Google.'},
    { id: 'ElevenLabs', name: 'ElevenLabs', description: 'Expressive and versatile voices (Simulated).'},
];

const thinkingPresets: {id: ThinkingPreset, name: string, description: string}[] = [
    {id: 'auto', name: 'Auto', description: 'Decides how long to think'},
    {id: 'instant', name: 'Instant', description: 'Answers right away'},
    {id: 'mini', name: 'Thinking mini', description: 'Thinks quickly'},
    {id: 'thinking', name: 'Thinking', description: 'Thinks longer for better answers'},
]

interface ChatSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    currentStyle: TutorStyle;
    onStyleChange: (style: TutorStyle) => void;
    currentModel: ModelId;
    onModelChange: (mode: ModelId) => void;
    isGrounded: boolean;
    onGroundedChange: (grounded: boolean) => void;
    ttsProvider: TtsProvider;
    onTtsProviderChange: (provider: TtsProvider) => void;
    subscriptionTier: SubscriptionTier;
    setActiveFeature: (feature: FeatureId) => void;
}

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-accent-secondary">
        <path fillRule="evenodd" d="M8 1a3.5 3.5 0 00-3.5 3.5V7A1.5 1.5 0 006 8.5h4A1.5 1.5 0 0011.5 7V4.5A3.5 3.5 0 008 1zM5.5 4.5a2.5 2.5 0 015 0V7H5.5V4.5z" clipRule="evenodd" />
        <path d="M2 8.5A1.5 1.5 0 013.5 7h9A1.5 1.5 0 0114 8.5v3A1.5 1.5 0 0112.5 13h-9A1.5 1.5 0 012 11.5v-3z" />
    </svg>
);

const ChevronDownIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transition-transform duration-200"> <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /> </svg> );


const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background-tertiary ${
        checked ? 'bg-accent-primary' : 'bg-background-tertiary/70'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left text-sm font-medium text-text-secondary p-2 rounded-md hover:bg-background-tertiary/50">
                <span>{title}</span>
                <span className={isOpen ? 'rotate-180' : ''}><ChevronDownIcon /></span>
            </button>
            {isOpen && <div className="pl-2 pt-2 space-y-1">{children}</div>}
        </div>
    );
};

export const ChatSettings: React.FC<ChatSettingsProps> = ({ 
    isOpen, onClose, 
    currentStyle, onStyleChange,
    currentModel, onModelChange,
    isGrounded, onGroundedChange,
    ttsProvider, onTtsProviderChange,
    subscriptionTier, setActiveFeature
}) => {
    const [thinkingPreset, setThinkingPreset] = useState<ThinkingPreset>('auto');

    if (!isOpen) return null;

    const handleModelChange = (model: Model) => {
        const hasAccess = tierLevels[subscriptionTier] >= tierLevels[model.requiredTier];
        if (!hasAccess) {
            setActiveFeature('premium');
            onClose();
            return;
        }

        onModelChange(model.id);
        if (model.id === 'claude-haiku-4.5' || model.id === 'claude-haiku-3.5') {
            onGroundedChange(false);
        }
    };

    const modelProviders = ['Auto', 'Google', 'OpenAI', 'Anthropic'] as const;
    
    const legacyModelsByProvider = {
        OpenAI: models.filter(m => m.provider === 'OpenAI' && m.isLegacy),
        Anthropic: models.filter(m => m.provider === 'Anthropic' && m.isLegacy),
    };

    const mainModelsByProvider = modelProviders.map(provider => ({
        provider,
        models: models.filter(m => m.provider === provider && !m.isLegacy)
    })).filter(group => group.models.length > 0);
    
    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} aria-hidden="true"></div>
            <div className="absolute bottom-full left-0 mb-2 w-96 bg-background-secondary border border-background-tertiary/50 rounded-lg shadow-2xl z-50 p-4 transform transition-all max-h-[70vh] flex flex-col"
                 role="dialog" aria-modal="true" aria-labelledby="settings-heading">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 id="settings-heading" className="font-semibold text-text-primary">Conversation Settings</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-background-tertiary transition-colors" aria-label="Close settings">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="overflow-y-auto pr-2 -mr-2 space-y-4">
                    {mainModelsByProvider.map(group => (
                         <div key={group.provider}>
                             {group.provider !== 'Auto' && <label className="text-sm font-medium text-text-secondary block mb-2 px-2">{group.provider} Models</label>}
                             <div className="space-y-1">
                                {group.models.map(model => {
                                    const isSelected = currentModel === model.id;
                                    return (
                                        <button key={model.id} onClick={() => handleModelChange(model)} className={`w-full text-left p-2 rounded-md transition-colors flex items-center gap-3 ${isSelected ? 'bg-accent-primary/10 ring-1 ring-inset ring-accent-primary/50' : 'hover:bg-background-tertiary/50'}`}>
                                            <div className="w-5 flex justify-center">
                                                 {isSelected && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-accent-primary"><path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.35 2.35 4.493-6.74a.75.75 0 0 1 1.04-.207z" clipRule="evenodd" /></svg>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-text-primary text-sm">{model.name}</p>
                                                    {model.requiredTier !== 'Free' && 
                                                        <span className="text-xs font-bold text-accent-secondary bg-accent-secondary/20 px-1.5 py-0.5 rounded-sm">PRO</span>
                                                    }
                                                </div>
                                                <p className="text-text-secondary text-xs">{model.description}</p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                    
                    {currentModel === 'gpt-5' && (
                        <div>
                             <label className="text-sm font-medium text-text-secondary block mb-2 px-2">Thinking Time</label>
                             {thinkingPresets.map(preset => {
                                const isSelected = thinkingPreset === preset.id;
                                return (
                                <button key={preset.id} onClick={() => setThinkingPreset(preset.id)} className={`w-full text-left p-2 rounded-md transition-colors flex items-center gap-3 ${isSelected ? 'bg-accent-primary/10' : 'hover:bg-background-tertiary/50'}`}>
                                     <div className="w-5 flex justify-center">
                                         {isSelected && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-accent-primary"><path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.35 2.35 4.493-6.74a.75.75 0 0 1 1.04-.207z" clipRule="evenodd" /></svg>}
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary text-sm">{preset.name}</p>
                                        <p className="text-text-secondary text-xs">{preset.description}</p>
                                    </div>
                                </button>
                             )})}
                        </div>
                    )}

                    <CollapsibleSection title="Legacy Models">
                         {Object.entries(legacyModelsByProvider).map(([provider, models]) => (
                            <div key={provider}>
                                <label className="text-xs font-medium text-text-secondary/70 block mb-1 px-2">{provider}</label>
                                {models.map(model => {
                                    const isSelected = currentModel === model.id;
                                    return (
                                        <button key={model.id} onClick={() => handleModelChange(model)} className={`w-full text-left p-2 rounded-md transition-colors flex items-center gap-3 ${isSelected ? 'bg-accent-primary/10' : 'hover:bg-background-tertiary/50'}`}>
                                            <div className="w-5 flex justify-center">
                                                {isSelected && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-accent-primary"><path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.35 2.35 4.493-6.74a.75.75 0 0 1 1.04-.207z" clipRule="evenodd" /></svg>}
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-primary text-sm">{model.name}</p>
                                                <p className="text-text-secondary text-xs">{model.description}</p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                         ))}
                    </CollapsibleSection>


                    <div className="border-t border-background-tertiary/50 pt-4">
                         <div className="flex justify-between items-center px-2">
                             <div>
                                <label htmlFor="grounding-toggle" className="font-medium text-text-primary text-sm">Grounding with Google Search</label>
                                <p className="text-text-secondary text-xs">Get up-to-date, real-world info. {currentModel === 'claude-haiku-4.5' ? 'Not available.' : ''}</p>
                             </div>
                             <ToggleSwitch
                                checked={isGrounded}
                                onChange={onGroundedChange}
                                disabled={currentModel === 'claude-haiku-4.5' || currentModel === 'claude-haiku-3.5'}
                             />
                         </div>
                    </div>

                    <div className="space-y-2 border-t border-background-tertiary/50 pt-4">
                        <label className="text-sm font-medium text-text-secondary block mb-2 px-2">Voice Provider (TTS)</label>
                        {ttsProviders.map(provider => (
                            <button key={provider.id} onClick={() => onTtsProviderChange(provider.id)}
                                className={`w-full text-left p-2 rounded-md transition-colors flex items-start gap-3 ${ ttsProvider === provider.id ? 'bg-accent-primary/10' : 'hover:bg-background-tertiary/50'}`}>
                                 <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${ttsProvider === provider.id ? 'border-accent-primary bg-accent-primary' : 'border-text-secondary'}`}>
                                    {ttsProvider === provider.id && <div className="w-1.5 h-1.5 rounded-full bg-background-secondary"></div>}
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary text-sm">{provider.name}</p>
                                    <p className="text-text-secondary text-xs">{provider.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2 border-t border-background-tertiary/50 pt-4">
                        <label className="text-sm font-medium text-text-secondary block mb-2 px-2">Tutor Style</label>
                        {styles.map(style => (
                            <button key={style.id} onClick={() => onStyleChange(style.id)}
                                className={`w-full text-left p-2 rounded-md transition-colors flex items-start gap-3 ${ currentStyle === style.id ? 'bg-accent-primary/10' : 'hover:bg-background-tertiary/50'}`}>
                                 <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${currentStyle === style.id ? 'border-accent-primary bg-accent-primary' : 'border-text-secondary'}`}>
                                    {currentStyle === style.id && <div className="w-1.5 h-1.5 rounded-full bg-background-secondary"></div>}
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary text-sm">{style.name}</p>
                                    <p className="text-text-secondary text-xs">{style.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};