import React from 'react';
import { UserLessonStats } from './types';

const LevelIcon: React.FC<{ level: number }> = ({ level }) => (
    <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.789-2.731 9.566l-2.73-9.566A9.006 9.006 0 0112 2a9.006 9.006 0 015.462 9.566l-2.73 9.566C13.009 17.789 12 14.517 12 11z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21v-1m0-10a2 2 0 00-2 2v3a2 2 0 002 2h.01a2 2 0 002-2v-3a2 2 0 00-2-2h-.01z" />
        </svg>
        <span className="absolute font-bold text-background-primary text-sm">{level}</span>
    </div>
);

const StreakIcon: React.FC<{ streak: number }> = ({ streak }) => (
     <div className="flex items-center gap-2 text-orange-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        <span className="font-bold text-lg">{streak} Day Streak</span>
    </div>
);


const LessonStats: React.FC<{ stats: UserLessonStats }> = ({ stats }) => {
    const xpProgress = (stats.xp / stats.xpToNextLevel) * 100;
    
    return (
        <div className="mt-6 bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
                <LevelIcon level={stats.level} />
                <div>
                    <h3 className="font-bold text-lg text-text-primary">Level {stats.level}</h3>
                    <p className="text-xs text-text-secondary">Pathfinder</p>
                </div>
            </div>
            <div className="flex-1 w-full sm:w-auto">
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-text-secondary">XP Progress</span>
                    <span className="text-sm font-bold text-accent-secondary">{stats.xp} / {stats.xpToNextLevel}</span>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-cyan-500 to-yellow-400 h-2.5 rounded-full" style={{ width: `${xpProgress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
            </div>
            <div className="pl-4 border-l border-background-tertiary/50">
                <StreakIcon streak={stats.streak} />
            </div>
        </div>
    );
};

export default LessonStats;
