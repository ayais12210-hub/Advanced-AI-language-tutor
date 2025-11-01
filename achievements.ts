import { Badge } from './types';

// This is the master list of all achievable badges.
// The `earned` and `earnedDate` properties will be managed in App state.
export const badgeMasterList: Omit<Badge, 'earned' | 'earnedDate'>[] = [
  // Lesson & Learning Path Achievements
  { id: 'b1', name: 'First Steps', description: 'Complete your first lesson.', icon: '👣' },
  { id: 'b2', name: 'Apprentice', description: 'Complete an entire Unit in the Learning Path.', icon: '🎓' },
  { id: 'b3', name: 'Bookworm', description: 'Complete 10 lessons.', icon: '📚' },
  { id: 'b4', name: 'Pathfinder', description: 'Complete 25 lessons.', icon: '🗺️' },
  
  // Conversation & Interaction Achievements
  { id: 'c1', name: 'Icebreaker', description: 'Have your first conversation with Lumi.', icon: '👋' },
  { id: 'c2', name: 'Chatterbox', description: 'Send 50 messages in conversations.', icon: '💬' },
  { id: 'c3', name: 'Deep Diver', description: 'Use the AI Translator deep dive feature.', icon: '🔬' },
  
  // Streak & Consistency Achievements
  { id: 's1', name: '3-Day Streak', description: 'Maintain a 3-day streak.', icon: '🥉' },
  { id: 's2', name: 'Week Warrior', description: 'Maintain a 7-day streak.', icon: '⚔️' },
  { id: 's3', name: 'Monthly Master', description: 'Maintain a 30-day streak.', icon: '👑' },
  
  // XP & Leveling Achievements
  { id: 'x1', name: 'XP Explorer', description: 'Earn 1,000 XP.', icon: '✨' },
  { id: 'x2', name: 'XP Expert', description: 'Earn 10,000 XP.', icon: '🌟' },
  { id: 'x3', name: 'XP Legend', description: 'Earn 50,000 XP.', icon: '🏆' },
  
  // Feature Usage Achievements
  { id: 'f1', name: 'Visual Learner', description: 'Generate your first image.', icon: '🎨' },
  { id: 'f2', name: 'Creative Editor', description: 'Edit an image for the first time.', icon: '🪄' },
  { id: 'f3', name: 'Director', description: 'Generate your first video.', icon: '🎬' },
  { id: 'f4', name: 'Live Listener', description: 'Try Live Tutoring for the first time.', icon: '🎙️' },

  // Personalization & Other Achievements
  { id: 'p1', name: 'Journalist', description: 'Write your first journal entry.', icon: '✍️' },
  { id: 'p2', name: 'Polyglot in Training', description: 'Switch your learning language.', icon: '🌍' },
  { id: 'p3', name: 'Perfect Pronunciation', description: 'Use the Pronunciation Practice tool.', icon: '🎯'},
  { id: 'p4', name: 'Well-Rounded', description: 'Try 5 different features.', icon: ' BINGO '},
];
