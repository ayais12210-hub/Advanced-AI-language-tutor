import React from 'react';
import { TutorStyle, ConversationMode } from './types';

const styles: { id: TutorStyle; name: string; description: string }[] = [
    { id: 'Standard', name: 'Standard Tutor', description: 'A friendly, encouraging, and balanced approach.' },
    { id: 'Patient', name: 'Patient & Explanatory', description: 'Gives detailed, step-by-step explanations.' },
    { id: 'Concise', name: 'Concise & Quick', description: 'Direct and to-the-point for faster practice.' },
];

const modes: { id: ConversationMode; name: string; description: string }[] = [
    { id: 'Fast', name: 'Fast Mode', description: 'Low-latency for quick replies (gemini-2.5-flash-lite).' },
    { id: 'Smart', name: 'Smart Mode', description: 'Balanced quality and speed (gemini-2.5-flash).' },
    { id: 'Genius', name: 'Genius Mode', description: 'Highest reasoning for complex queries (gemini-2.5-pro).' }
];

interface ChatSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    currentStyle: TutorStyle;
    onStyleChange: (style: TutorStyle) => void;
    currentMode: ConversationMode;
    onModeChange: (mode: ConversationMode) => void;
    isGrounded: boolean;
    onGroundedChange: (grounded: boolean) => void;
}

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

export const ChatSettings: React.FC<ChatSettingsProps> = ({ 
    isOpen, onClose, 
    currentStyle, onStyleChange,
    currentMode, onModeChange,
    isGrounded, onGroundedChange
}) => {
    if (!isOpen) return null;

    const handleModeChange = (mode: ConversationMode) => {
        onModeChange(mode);
        if (mode === 'Fast') {
            onGroundedChange(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} aria-hidden="true"></div>
            <div className="absolute bottom-full left-0 mb-2 w-80 bg-background-secondary border border-background-tertiary/50 rounded-lg shadow-2xl z-50 p-4 transform transition-all"
                 role="dialog" aria-modal="true" aria-labelledby="settings-heading">
                <div className="flex justify-between items-center mb-4">
                    <h3 id="settings-heading" className="font-semibold text-text-primary">Conversation Settings</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-background-tertiary transition-colors" aria-label="Close settings">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                {/* Mode Selection */}
                <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium text-text-secondary block mb-2">Conversation Mode</label>
                    {modes.map(mode => (
                        <button key={mode.id} onClick={() => handleModeChange(mode.id)}
                            className={`w-full text-left p-2 rounded-md transition-colors flex items-start gap-3 ${ currentMode === mode.id ? 'bg-accent-primary/10' : 'hover:bg-background-tertiary/50'}`}>
                             <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${currentMode === mode.id ? 'border-accent-primary bg-accent-primary' : 'border-text-secondary'}`}>
                                {currentMode === mode.id && <div className="w-1.5 h-1.5 rounded-full bg-background-secondary"></div>}
                            </div>
                            <div>
                                <p className="font-medium text-text-primary text-sm">{mode.name}</p>
                                <p className="text-text-secondary text-xs">{mode.description}</p>
                            </div>
                        </button>
                    ))}
                </div>

                 {/* Grounding Toggle */}
                 <div className="border-t border-background-tertiary/50 pt-4 mb-4">
                     <div className="flex justify-between items-center">
                         <div>
                            <label htmlFor="grounding-toggle" className="font-medium text-text-primary text-sm">Grounding with Google Search</label>
                            <p className="text-text-secondary text-xs">Get up-to-date, real-world info. {currentMode === 'Fast' ? 'Not available in Fast mode.' : ''}</p>
                         </div>
                         <ToggleSwitch
                            checked={isGrounded}
                            onChange={onGroundedChange}
                            disabled={currentMode === 'Fast'}
                         />
                     </div>
                 </div>

                {/* Style Selection */}
                <div className="space-y-2 border-t border-background-tertiary/50 pt-4">
                    <label className="text-sm font-medium text-text-secondary block mb-2">Tutor Style</label>
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
        </>
    );
};
