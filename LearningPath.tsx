import React from 'react';
import { Unit, Lesson, LessonStatus } from './types';

const getStatus = (lessonIndex: number, completedCount: number): LessonStatus => {
    if (lessonIndex < completedCount) return 'completed';
    if (lessonIndex === completedCount) return 'active';
    return 'locked';
};

const LessonIcon: React.FC<{ type: Lesson['type'] }> = ({ type }) => {
    // FIX: Changed the type to make properties optional (`?`), so it doesn't require every single
    // LessonType to be defined. This component is only for the original lessons, not the Mastery Hub.
    const icons: { [key in Lesson['type']]?: string } = {
        alphabet: '🔤',
        numbers: '🔢',
        colors: '🎨',
        phrases: '🗣️',
        grammar: '📝',
        quiz: '⭐',
        nouns: '🍎',
        vowels: '🎤',
        consonants: '🗣️',
        sentenceScramble: '🔄',
    };
    return <span className="text-3xl">{icons[type] || '📚'}</span>;
};

const LessonNode: React.FC<{ lesson: Lesson, status: LessonStatus, onClick: () => void }> = ({ lesson, status, onClick }) => {
    const statusClasses = {
        locked: 'bg-background-tertiary/50 border-background-tertiary text-text-secondary/50 cursor-not-allowed',
        active: 'bg-cyan-500/20 border-accent-primary text-text-primary cursor-pointer hover:bg-cyan-500/30 shadow-lg shadow-cyan-500/20',
        completed: 'bg-yellow-400/20 border-accent-secondary text-accent-secondary cursor-pointer hover:bg-yellow-400/30',
    };

    return (
        <button
            onClick={onClick}
            disabled={status === 'locked'}
            className={`relative w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center p-2 text-center transition-all duration-300 transform hover:scale-105 ${statusClasses[status]}`}
            aria-label={`${lesson.title}, Status: ${status}`}
        >
            <LessonIcon type={lesson.type} />
            <span className="text-xs font-bold mt-1 leading-tight">{lesson.title}</span>
        </button>
    );
};

const UnitSection: React.FC<{ unit: Unit, lessonOffset: number, completedCount: number, onLessonClick: (lesson: Lesson) => void }> = ({ unit, lessonOffset, completedCount, onLessonClick }) => {
    return (
        <div className="bg-background-secondary/30 rounded-xl p-6 mb-12 border border-background-tertiary/50">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-heading text-accent-primary">{unit.title}</h2>
                <p className="text-text-secondary">{unit.description}</p>
            </div>
            <div className="flex justify-center items-center flex-wrap gap-8">
                {unit.lessons.map((lesson, index) => (
                    <LessonNode
                        key={lesson.id}
                        lesson={lesson}
                        status={getStatus(lessonOffset + index, completedCount)}
                        onClick={() => onLessonClick(lesson)}
                    />
                ))}
            </div>
        </div>
    );
};

interface LearningPathProps {
    units: Unit[];
    completedLessons: Set<string>;
    onLessonClick: (lesson: Lesson) => void;
}

const LearningPath: React.FC<LearningPathProps> = ({ units, completedLessons, onLessonClick }) => {
    let lessonCounter = 0;
    const completedCount = completedLessons.size;

    return (
        <div className="w-full max-w-4xl mx-auto py-8">
            {units.map(unit => {
                const offset = lessonCounter;
                lessonCounter += unit.lessons.length;
                return (
                    <UnitSection
                        key={unit.id}
                        unit={unit}
                        lessonOffset={offset}
                        completedCount={completedCount}
                        onLessonClick={onLessonClick}
                    />
                );
            })}
        </div>
    );
};

export default LearningPath;