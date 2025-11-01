import React from 'react';
import { MasteryTier, MasteryLevel } from './types';
import MasteryNode from './MasteryNode';

const getStatus = (levelIndex: number, completedCount: number): 'locked' | 'active' | 'completed' => {
    if (levelIndex < completedCount) return 'completed';
    if (levelIndex === completedCount) return 'active';
    return 'locked';
};

const TierSection: React.FC<{ tier: MasteryTier, levelOffset: number, completedCount: number, onLevelClick: (level: MasteryLevel) => void }> = ({ tier, levelOffset, completedCount, onLevelClick }) => {
    return (
        <div className="bg-background-secondary/30 rounded-xl p-6 mb-8 border border-background-tertiary/50 relative">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold font-heading text-accent-primary">{tier.title}</h2>
                <p className="text-text-secondary">{tier.description}</p>
            </div>
            <div className="flex justify-center items-center flex-wrap gap-x-12 gap-y-10">
                 {/* Render connecting lines */}
                 <div className="absolute top-1/2 left-0 right-0 h-1 bg-background-tertiary/50 -translate-y-1/2 z-0"></div>
                {tier.levels.map((level, index) => (
                    <MasteryNode
                        key={level.id}
                        level={level}
                        status={getStatus(levelOffset + index, completedCount)}
                        onClick={() => onLevelClick(level)}
                    />
                ))}
            </div>
        </div>
    );
};

interface MasteryPathProps {
    tiers: MasteryTier[];
    completedLevels: Set<string>;
    onLevelClick: (level: MasteryLevel) => void;
}

const MasteryPath: React.FC<MasteryPathProps> = ({ tiers, completedLevels, onLevelClick }) => {
    let levelCounter = 0;
    const completedCount = completedLevels.size;

    return (
        <div className="w-full max-w-5xl mx-auto py-8">
            {tiers.map((tier, index) => {
                const offset = levelCounter;
                levelCounter += tier.levels.length;
                return (
                    <React.Fragment key={tier.id}>
                        <TierSection
                            tier={tier}
                            levelOffset={offset}
                            completedCount={completedCount}
                            onLevelClick={onLevelClick}
                        />
                        {index < tiers.length - 1 && (
                            <div className="flex justify-center my-4">
                                <svg width="24" height="48" viewBox="0 0 24 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0V48" stroke="#3f3f46" strokeWidth="2" strokeDasharray="4 4"/>
                                </svg>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default MasteryPath;