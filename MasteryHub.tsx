import React, { useState, useMemo } from 'react';
import { Language, MasteryLevel, UserStats } from './types';
import { PageHeader } from './PageHeader';
import MasteryPath from './MasteryPath';
import UserStatsDisplay from './UserStats';
import LessonModal from './LessonModal';
import { masteryData } from './MasteryPathData';

const calculateLevel = (totalXp: number) => {
    let level = 1;
    let requiredXp = 100;
    let currentXpInLevel = totalXp;

    while (currentXpInLevel >= requiredXp) {
        currentXpInLevel -= requiredXp;
        level++;
        requiredXp = Math.floor(requiredXp * 1.5);
    }
    return { level, xp: currentXpInLevel, xpToNextLevel: requiredXp };
};

interface LearningHubProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
  addXp: (amount: number) => void;
  stats: { xpPoints: number }; // Receive total XP from App
}

const LearningHub: React.FC<LearningHubProps> = ({ nativeLanguage, learningLanguage, setNativeLanguage, setLearningLanguage, addXp, stats }) => {
    const [completedLevels, setCompletedLevels] = useState<Set<string>>(new Set());
    const [activeLevel, setActiveLevel] = useState<MasteryLevel | null>(null);

    const userDisplayStats = useMemo(() => {
        const { level, xp, xpToNextLevel } = calculateLevel(stats.xpPoints);
        return {
            level,
            xp,
            xpToNextLevel,
            achievements: [], // Achievements are managed globally now
        };
    }, [stats.xpPoints]);

    const allLevels = useMemo(() => masteryData.flatMap(tier => tier.levels), []);

    const handleLevelClick = (level: MasteryLevel) => {
        const levelIndex = allLevels.findIndex(l => l.id === level.id);
        const completedCount = completedLevels.size;

        if (levelIndex <= completedCount) {
            setActiveLevel(level);
        }
    };

    const handleCompleteLevel = (levelId: string) => {
        const levelData = allLevels.find(l => l.id === levelId);
        if (!levelData || completedLevels.has(levelId)) {
            setActiveLevel(null);
            return; 
        }

        setCompletedLevels(prev => new Set(prev).add(levelId));
        addXp(levelData.xp); // Update global XP
        
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

            <UserStatsDisplay stats={userDisplayStats} />

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
