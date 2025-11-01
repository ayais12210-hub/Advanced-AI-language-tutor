import React, { useState, useMemo } from 'react';
import { Language, Lesson, UserLessonStats } from './types';
import { PageHeader } from './PageHeader';
import LearningPath from './LearningPath';
import LessonModal from './LessonModal';
import { lessonData } from './LessonData';
import LessonStats from './LessonStats';

// Helper to calculate level based on total XP
const calculateLevel = (totalXp: number) => {
    let level = 1;
    let requiredXp = 100;
    let cumulativeXp = 0;
    
    while (totalXp >= requiredXp) {
        totalXp -= requiredXp;
        cumulativeXp += requiredXp;
        level++;
        requiredXp = Math.floor(requiredXp * 1.2); // Increase XP for next level
    }
    return { level, xp: totalXp, xpToNextLevel: requiredXp, totalXp: cumulativeXp + totalXp };
};


interface LessonsProps {
  nativeLanguage: Language;
  learningLanguage: Language;
  setNativeLanguage: (language: Language) => void;
  setLearningLanguage: (language: Language) => void;
  addXp: (amount: number) => void;
}

const Lessons: React.FC<LessonsProps> = ({ nativeLanguage, learningLanguage, setNativeLanguage, setLearningLanguage, addXp }) => {
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [userStats, setUserStats] = useState<UserLessonStats>({
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        streak: 1, // Assuming a default streak
    });
    
    const allLessons = useMemo(() => lessonData.flatMap(unit => unit.lessons), []);

    const handleLessonClick = (lesson: Lesson) => {
        const lessonIndex = allLessons.findIndex(l => l.id === lesson.id);
        const completedCount = completedLessons.size;
        
        if (lessonIndex <= completedCount) {
            setActiveLesson(lesson);
        }
    };
    
    const handleCompleteLesson = (lessonId: string) => {
        const lesson = allLessons.find(l => l.id === lessonId);
        if (!lesson || completedLessons.has(lessonId)) {
            setActiveLesson(null);
            return;
        }

        const newCompleted = new Set(completedLessons).add(lessonId);
        setCompletedLessons(newCompleted);
        addXp(lesson.xp); // Update global stats

        // Update local stats for this page's display
        const currentTotalXp = userStats.xp + (userStats.level > 1 ? allLessons.filter(l => completedLessons.has(l.id)).reduce((sum, l) => sum + l.xp, 0) : 0);
        const newTotalXp = currentTotalXp + lesson.xp;
        const { level, xp, xpToNextLevel } = calculateLevel(newTotalXp);
        
        setUserStats(prev => ({
            ...prev,
            level,
            xp,
            xpToNextLevel,
        }));

        setActiveLesson(null);
    };

    const handleCloseModal = () => {
        setActiveLesson(null);
    };
    
    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <PageHeader
                title="Your Learning Path"
                description={`Master ${learningLanguage.name} one step at a time. Complete lessons to unlock new challenges.`}
                nativeLanguage={nativeLanguage}
                learningLanguage={learningLanguage}
                setNativeLanguage={setNativeLanguage}
                setLearningLanguage={setLearningLanguage}
            />

            <LessonStats stats={userStats} />

            <div className="flex-1 overflow-y-auto mt-4">
                <LearningPath
                    units={lessonData}
                    completedLessons={completedLessons}
                    onLessonClick={handleLessonClick}
                />
            </div>

            {activeLesson && (
                <LessonModal
                    lesson={activeLesson}
                    onClose={handleCloseModal}
                    onComplete={handleCompleteLesson}
                    nativeLanguage={nativeLanguage}
                    learningLanguage={learningLanguage}
                />
            )}
        </div>
    );
};

export default Lessons;
