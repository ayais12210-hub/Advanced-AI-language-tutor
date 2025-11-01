import React from 'react';
import { UserStats } from './types';

const LevelIcon: React.FC<{ level: number }> = ({ level }) => (
    <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full text-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M5 21v-4m-2 2h4m14-12v4m2-2h-4m-2 12v-4m2 2h-4M12 3v2m-2-2h4m-2 18v-2m-2 2h4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
        <span className="absolute font-bold text-background-primary text-sm">{level}</span>
    </div>
);


const UserStatsDisplay: React.FC<{ stats: UserStats }> = ({ stats }) => {
    const xpProgress = (stats.xp / stats.xpToNextLevel) * 100;
    
    return (
        <div className="mt-6 bg-background-secondary/50 rounded-lg border border-background-tertiary/50 p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
                <LevelIcon level={stats.level} />
                <div>
                    <h3 className="font-bold text-lg text-text-primary">Level {stats.level}</h3>
                    <p className="text-xs text-text-secondary">Language Master</p>
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
            <div className="hidden md:block">
                <p className="font-semibold text-text-primary">Achievements</p>
                <div className="flex gap-2 mt-1">
                    {/* Placeholder achievements */}
                    <span title="Tier 1 Complete" className="text-2xl">🏆</span>
                    <span title="First Steps" className="text-2xl">👣</span>
                </div>
            </div>
        </div>
    );
};

export default UserStatsDisplay;