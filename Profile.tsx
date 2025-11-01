import React, { useState, useEffect } from 'react';
import { Language, ExperienceLevel, ProfileStats, Badge, FriendActivity, LeaderboardUser, User, JournalEntry, FeatureId } from './types';
import SignIn from './SignIn';

// --- MOCK DATA (Friends & Leaderboard are kept as mock as they require a backend) ---
const friendsActivityData: FriendActivity[] = [
    { id: 'fa1', friendName: 'Sarah Chen', friendAvatar: 'S', action: 'reached a 30-day streak', timestamp: '4 hours ago', xpGained: 100 },
    { id: 'fa2', friendName: 'Miguel Rodriguez', friendAvatar: 'M', action: 'completed the "Travel" lesson', timestamp: '2 hours ago', xpGained: 25 },
    { id: 'fa3', friendName: 'Emma Johnson', friendAvatar: 'E', action: 'earned a new badge', timestamp: '1 day ago', xpGained: 50 },
];

const leaderboardData: LeaderboardUser[] = [
    { rank: 1, name: 'Sarah Chen', avatar: 'S', xp: 15420, level: 13, streak: 47, },
    { rank: 2, name: 'Alex Rivera', avatar: 'A', xp: 14890, level: 12, streak: 32, isCurrentUser: true },
    { rank: 3, name: 'Miguel Rodriguez', avatar: 'M', xp: 14250, level: 11, streak: 32, },
    { rank: 4, name: 'Emma Johnson', avatar: 'E', xp: 13800, level: 11, streak: 25, },
    { rank: 5, name: 'Kenji Tanaka', avatar: 'K', xp: 12500, level: 10, streak: 15, },
];


// --- ICONS ---
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.113-1.113l.448-.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113-1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></svg>);
const CrownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-400"><path fillRule="evenodd" d="M11.233 2.302a.75.75 0 00-2.466 0l-3.25 3.015a.75.75 0 00.53 1.282h8.406a.75.75 0 00.53-1.282l-3.25-3.015zM4.75 8.75a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zM16.75 8.75a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zM8 12.75a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>);
const ConnectIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-purple-400"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 100-4 2 2 0 000 4zM1.5 13a3 3 0 00-3 3v.5a.75.75 0 00.75.75h11.5a.75.75 0 00.75-.75v-.5a3 3 0 00-3-3h-7zM14 8a2 2 0 100-4 2 2 0 000 4zm4.5 5a3 3 0 00-3-3h-7a3 3 0 00-3 3v.5a.75.75 0 00.75.75h11.5a.75.75 0 00.75-.75v-.5z" /></svg>);

// --- TAB COMPONENTS ---
const StatsTab: React.FC<{ stats: ProfileStats, journalEntries: JournalEntry[], onJournalSave: (content: string) => void }> = ({ stats, journalEntries, onJournalSave }) => {
    const [journalText, setJournalText] = useState('');
    
    const handleSave = () => {
        if (!journalText.trim()) return;
        onJournalSave(journalText);
        setJournalText('');
    };

    return (
        <div className="space-y-6">
            <section>
                <h2 className="text-xl font-bold mb-4">Your Progress</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-background-secondary p-4 rounded-lg border border-background-tertiary/50">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">🗣️</div>
                        <p className="text-2xl font-bold">{stats.totalChats}</p>
                        <p className="text-sm text-text-secondary">Total Chats</p>
                    </div>
                     <div className="bg-background-secondary p-4 rounded-lg border border-background-tertiary/50">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-2">🔥</div>
                        <p className="text-2xl font-bold">{stats.currentStreak} <span className="text-lg">days</span></p>
                        <p className="text-sm text-text-secondary">Current Streak</p>
                    </div>
                     <div className="bg-background-secondary p-4 rounded-lg border border-background-tertiary/50">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-2">📚</div>
                        <p className="text-2xl font-bold">{stats.wordsLearned}</p>
                        <p className="text-sm text-text-secondary">Words Learned</p>
                    </div>
                     <div className="bg-background-secondary p-4 rounded-lg border border-background-tertiary/50">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-2">⚡️</div>
                        <p className="text-2xl font-bold">{stats.xpPoints.toLocaleString()}</p>
                        <p className="text-sm text-text-secondary">XP Points</p>
                    </div>
                </div>
            </section>
            <section>
                <h2 className="text-xl font-bold mb-4">Personal Journal</h2>
                <div className="bg-background-secondary p-4 rounded-lg border border-background-tertiary/50">
                     <p className="text-sm text-text-secondary mb-3">Reflect on what you learned today. Entries are saved privately on this device.</p>
                     <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} placeholder="What did you practice, discover, or struggle with today?" rows={4} className="w-full bg-background-tertiary rounded-lg p-3 text-sm text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none"></textarea>
                     <button onClick={handleSave} className="w-full mt-3 bg-accent-primary text-background-primary font-semibold py-2 px-4 rounded-lg hover:bg-accent-primary-dark transition-colors disabled:opacity-50" disabled={!journalText.trim()}>Save Entry</button>
                </div>
                {journalEntries.length > 0 && (
                    <div className="mt-4 space-y-3 max-h-48 overflow-y-auto pr-2">
                        {journalEntries.map(entry => (
                            <div key={entry.id} className="bg-background-secondary p-3 rounded-lg border border-background-tertiary/50">
                                <p className="text-xs text-text-secondary mb-1">{new Date(entry.date).toLocaleString()}</p>
                                <p className="text-sm text-text-primary whitespace-pre-wrap">{entry.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
};

const AchievementsTab: React.FC<{ badges: Badge[] }> = ({ badges }) => (
    <div className="space-y-6">
        <section>
            <h2 className="text-xl font-bold mb-4">Earned Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.filter(b => b.earned).map(badge => (
                    <div key={badge.id} className="bg-background-secondary p-4 rounded-lg border border-background-tertiary/50 text-center">
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <p className="font-semibold">{badge.name}</p>
                        <p className="text-xs text-text-secondary">Earned {badge.earnedDate}</p>
                    </div>
                ))}
            </div>
        </section>
        <section>
            <h2 className="text-xl font-bold mb-4">Available Badges</h2>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.filter(b => !b.earned).map(badge => (
                    <div key={badge.id} className="bg-background-secondary p-4 rounded-lg border border-background-tertiary/50 text-center opacity-60">
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <p className="font-semibold">{badge.name}</p>
                        <p className="text-xs text-text-secondary">{badge.description}</p>
                    </div>
                ))}
            </div>
        </section>
    </div>
);

const FriendsTab: React.FC = () => (
     <div className="space-y-6">
        <section className="bg-gradient-to-br from-purple-500/20 to-background-secondary text-center p-6 rounded-lg border border-purple-400/30">
            <ConnectIcon />
            <h2 className="text-xl font-bold mt-2">Connect with Friends</h2>
            <p className="text-text-secondary text-sm mt-1 mb-4">Add friends to compete and motivate each other! (Note: This is a demo feature)</p>
            <button className="bg-purple-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-purple-600 transition-colors">Find Friends</button>
        </section>
        <section>
            <h2 className="text-xl font-bold mb-4">Friend Activity</h2>
            <div className="space-y-3">
                {friendsActivityData.map(activity => (
                    <div key={activity.id} className="bg-background-secondary p-3 rounded-lg flex items-center justify-between gap-4 border border-background-tertiary/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-background-tertiary flex-shrink-0 flex items-center justify-center font-bold">{activity.friendAvatar}</div>
                            <div>
                                <p className="text-sm"><span className="font-semibold text-text-primary">{activity.friendName}</span> <span className="text-text-secondary">{activity.action}.</span></p>
                                <p className="text-xs text-text-secondary">{activity.timestamp}</p>
                            </div>
                        </div>
                        <div className="text-sm font-bold text-accent-secondary whitespace-nowrap">+{activity.xpGained} XP</div>
                    </div>
                ))}
            </div>
        </section>
     </div>
);

const LeaderboardTab: React.FC = () => (
    <div className="space-y-6">
        <div className="bg-background-secondary p-4 rounded-lg border border-background-tertiary/50">
            <div className="space-y-2">
                {leaderboardData.map(u => (
                    <div key={u.rank} className={`p-3 rounded-md flex items-center gap-4 ${u.isCurrentUser ? 'bg-accent-primary/10 border border-accent-primary/50' : ''}`}>
                        <div className="text-lg font-bold w-6 text-center">{u.rank}</div>
                        <div className="w-10 h-10 rounded-full bg-background-tertiary flex-shrink-0 flex items-center justify-center font-bold text-lg">{u.avatar}</div>
                        <div className="flex-1">
                            <p className="font-bold flex items-center gap-2">{u.name} {u.rank === 1 && <CrownIcon />}</p>
                            <p className="text-sm text-text-secondary">{u.xp.toLocaleString()} XP • {u.streak} day streak</p>
                        </div>
                        <div className="bg-background-tertiary text-accent-primary font-bold text-xs px-2 py-1 rounded-md">
                            LVL {u.level}
                        </div>
                    </div>
                ))}
            </div>
        </div>
         <p className="text-xs text-text-secondary text-center">Leaderboard is for demonstration purposes only.</p>
    </div>
);


// --- MAIN PROFILE COMPONENT ---
interface ProfileProps {
    learningLanguage: Language;
    experienceLevel: ExperienceLevel;
    isLoggedIn: boolean;
    onSignIn: () => void;
    onSignOut: () => void;
    user: User | null;
    stats: ProfileStats;
    badges: Badge[];
    journalEntries: JournalEntry[];
    onJournalSave: (content: string) => void;
    setActiveFeature: (feature: FeatureId) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
    learningLanguage, 
    isLoggedIn, 
    onSignIn, 
    onSignOut,
    user,
    stats,
    badges,
    journalEntries,
    onJournalSave,
    setActiveFeature,
}) => {
    const [activeTab, setActiveTab] = useState('Stats');
    const tabs = ['Stats', 'Achievements', 'Friends', 'Leaderboard'];

    if (!isLoggedIn || !user) {
        return <SignIn onSignIn={onSignIn} />;
    }
    
    // Calculate user level from total XP
    const calculateLevel = (xp: number) => {
        let level = 1;
        let requiredXp = 100;
        while (xp >= requiredXp) {
            xp -= requiredXp;
            level++;
            requiredXp = Math.floor(requiredXp * 1.5);
        }
        return level;
    };
    const userLevel = calculateLevel(stats.xpPoints);

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary">
            <header className="text-center bg-background-secondary p-6 rounded-xl border border-background-tertiary/50">
                <div className="flex justify-end">
                     <button onClick={() => setActiveFeature('settings')} className="text-text-secondary hover:text-text-primary"><SettingsIcon/></button>
                </div>
                <div className="flex flex-col items-center -mt-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-yellow-400 flex items-center justify-center text-4xl font-bold text-background-primary mb-3 ring-4 ring-background-secondary">{user.avatarInitial}</div>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-text-secondary">{user.email}</p>
                    <p className="text-sm text-text-secondary mt-2">Level {userLevel} • Learning {learningLanguage.name}</p>
                    <div className="flex gap-2 mt-4">
                        <button className="bg-accent-primary text-background-primary font-semibold py-2 px-5 rounded-lg text-sm hover:bg-accent-primary-dark transition-colors">Upgrade to Premium</button>
                        <button onClick={onSignOut} className="bg-background-tertiary text-text-primary font-semibold py-2 px-5 rounded-lg text-sm hover:bg-background-tertiary/70 transition-colors">Sign Out</button>
                    </div>
                </div>
            </header>

            <div className="border-b border-background-tertiary/50 my-6">
                <nav className="flex justify-center -mb-px space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab
                                ? 'border-accent-primary text-accent-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-secondary'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            
            <main className="flex-1 overflow-y-auto">
                 <div className="max-w-4xl mx-auto">
                    {activeTab === 'Stats' && <StatsTab stats={stats} journalEntries={journalEntries} onJournalSave={onJournalSave} />}
                    {activeTab === 'Achievements' && <AchievementsTab badges={badges} />}
                    {activeTab === 'Friends' && <FriendsTab />}
                    {activeTab === 'Leaderboard' && <LeaderboardTab />}
                </div>
            </main>
        </div>
    );
};

export default Profile;
