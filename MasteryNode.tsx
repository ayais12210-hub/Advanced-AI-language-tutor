import React from 'react';
import { MasteryLevel, LessonType } from './types';

type NodeStatus = 'locked' | 'active' | 'completed';

const LevelIcon: React.FC<{ type: LessonType }> = ({ type }) => {
    const icons: { [key in LessonType]?: string } = {
        phonetics: '🗣️', highFrequencyVocab: '📈', essentialGrammar: '📝', comprehensionCore: '👂', speakingFundamentals: '💬',
        extendedVocab: '📚', intermediateGrammar: '🖋️', listeningForMeaning: '🎧', conversationalPatterns: '🔄', culturalCompetence: '🌍',
        readingMastery: '📖', writingCompetence: '✍️', pronunciationRefinement: '🎤', idiomaticMastery: '😎', cognitiveFlexibility: '🧠',
        linguisticNuance: '🎨', culturalImmersion: '🎭', creativeExpression: '💡', sociolinguisticAwareness: '🤝', selfIdentityIntegration: '🧘',
        etymology: '📜', comparativeLinguistics: '🌐', linguisticPhilosophy: '🤔', languageMaintenance: '🛠️', polyglotSystems: '🧩',
    };
    return <span className="text-3xl">{icons[type] || '⭐'}</span>;
};

interface MasteryNodeProps {
    level: MasteryLevel;
    status: NodeStatus;
    onClick: () => void;
}

const MasteryNode: React.FC<MasteryNodeProps> = ({ level, status, onClick }) => {
    const statusClasses = {
        locked: 'bg-background-tertiary/50 border-background-tertiary text-text-secondary/50 cursor-not-allowed',
        active: 'bg-cyan-500/20 border-accent-primary text-text-primary cursor-pointer hover:bg-cyan-500/30 shadow-lg shadow-cyan-500/20',
        completed: 'bg-yellow-400/20 border-accent-secondary text-accent-secondary cursor-pointer hover:bg-yellow-400/30',
    };

    return (
        <button
            onClick={onClick}
            disabled={status === 'locked'}
            className={`relative w-32 h-32 rounded-lg border-4 flex flex-col items-center justify-center p-2 text-center transition-all duration-300 transform hover:scale-105 z-10 ${statusClasses[status]}`}
            aria-label={`${level.title}, Status: ${status}`}
        >
            <LevelIcon type={level.type} />
            <span className="text-xs font-bold mt-1 leading-tight">{level.title}</span>
            <div className="absolute -top-3 -right-3 bg-accent-secondary text-background-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {level.xp} XP
            </div>
        </button>
    );
};

export default MasteryNode;