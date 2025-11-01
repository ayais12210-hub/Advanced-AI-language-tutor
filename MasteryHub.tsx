import React, { useState, useMemo } from 'react';
import { Language, MasteryLevel, UserStats } from './types';
import { PageHeader } from './PageHeader';
import MasteryPath from './MasteryPath';
import UserStatsDisplay from './UserStats';
import LessonModal from './LessonModal';
import { masteryData } from './MasteryPathData';

const calculateLevel = (xp: number) => {
    let level = 1;
    let requiredXp = 100;
    while (xp >= requiredXp) {
        xp -= requiredXp;
        level++;
        requiredXp = Math.floor(requiredXp * 1.5);
    }
    return { level, xp, xpToNextLevel: requiredXp };
};

interface LearningHubProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
}

const LearningHub: React.FC<LearningHubProps> = ({ nativeLanguage, learningLanguage, setNativeLanguage, setLearningLanguage }) => {
    const [completedLevels, setCompletedLevels] = useState<Set<string>>(new Set());
    const [activeLevel, setActiveLevel] = useState<MasteryLevel | null>(null);
    const [userStats, setUserStats] = useState<UserStats>({
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        achievements: [],
    });

    const allLevels = useMemo(() => masteryData.flatMap(tier => tier.levels), []);

    const handleLevelClick = (level: MasteryLevel) => {
        const levelIndex = allLevels.findIndex(l => l.id === level.id);
        const completedCount = completedLevels.size;

        if (levelIndex <= completedCount) {
            setActiveLevel(level);
        }
    };

    const handleCompleteLevel = (levelId: string) => {
        if (completedLevels.has(levelId)) {
            setActiveLevel(null);
            return; 
        }

        const levelData = allLevels.find(l => l.id === levelId);
        if (!levelData) return;

        setCompletedLevels(prev => new Set(prev).add(levelId));
        
        const newTotalXp = userStats.xp + levelData.xp;
        const { level, xp, xpToNextLevel } = calculateLevel(userStats.level === 1 && userStats.xp === 0 ? levelData.xp : newTotalXp);

        setUserStats(prev => ({
            ...prev,
            level,
            xp: newTotalXp,
            xpToNextLevel,
        }));
        
        setActiveLevel(null);
    };

    const handleCloseModal = () => {
        setActiveLevel(null);
    };

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <PageHeader
                title="Your Learning Hub"
                description={`Unlock your potential in ${learningLanguage.name}. Master skills to gain XP and level up.`}
                nativeLanguage={nativeLanguage}
                learningLanguage={learningLanguage}
                setNativeLanguage={setNativeLanguage}
                setLearningLanguage={setLearningLanguage}
            />

            <UserStatsDisplay stats={userStats} />

            <div className="flex-1 overflow-y-auto mt-4">
                <MasteryPath
                    tiers={masteryData}
                    completedLevels={completedLevels}
                    onLevelClick={handleLevelClick}
                />
            </div>

            {activeLevel && (
                <LessonModal
                    lesson={activeLevel}
                    onClose={handleCloseModal}
                    onComplete={handleCompleteLevel}
                    nativeLanguage={nativeLanguage}
                    learningLanguage={learningLanguage}
                />
            )}
        </div>
    );
};

export default LearningHub;