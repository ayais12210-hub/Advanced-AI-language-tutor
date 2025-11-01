export type FaqCategory = 'Getting Started' | 'Learning Features' | 'Premium Features' | 'Settings & Account' | 'Technical Support';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
}

export const faqData: FaqItem[] = [
  // Getting Started
  {
    id: 'gs1',
    question: 'How do I get started with Linguamate?',
    answer: 'Welcome! The best way to start is by completing the onboarding flow to personalize your experience. Then, head to the "Learning Hub" to see your recommended starting point, or jump into a "Practice Conversation" to start chatting with our AI tutor, Lumi.',
    category: 'Getting Started',
  },
  {
    id: 'gs2',
    question: 'Which languages does Linguamate support?',
    answer: 'Linguamate supports over 100 languages for translation and practice. You can select your native and learning languages from the dropdown menus at the top of most feature pages or in the Settings.',
    category: 'Getting Started',
  },
  {
    id: 'gs3',
    question: 'How do I set my learning goals?',
    answer: 'You can set your learning goals during the initial onboarding process. If you need to change them later, you can do so in the "Settings" page under "Learning Preferences". This helps us tailor content and suggestions to you.',
    category: 'Getting Started',
  },
  
  // Learning Features
  {
    id: 'lf1',
    question: 'How does the AI chat feature work?',
    answer: 'Our AI tutor, Lumi, engages you in natural conversation. After each message you send, Lumi replies and provides "Advanced Insights" which include corrections, grammar tips, cultural context, and alternative ways to phrase your sentences. It\'s like having a personal tutor available 24/7!',
    category: 'Learning Features',
  },
  {
    id: 'lf2',
    question: 'What learning modules are available?',
    answer: 'We offer two main learning paths: "Interactive Lessons" for a structured, guided experience from beginner to advanced, and the "Learning Hub" for a skill-based approach where you can focus on specific areas like phonetics, high-frequency vocabulary, or cultural competence.',
    category: 'Learning Features',
  },
  {
    id: 'lf3',
    question: 'How does the AI Language Coach (Translator) work?',
    answer: 'Our advanced translator doesn\'t just give you a one-to-one translation. It provides a comprehensive "AI Coach" analysis, including a breakdown of pronunciation (IPA), grammar structure, cultural nuances, alternative translations, and actionable learning tips.',
    category: 'Learning Features',
  },

  // Premium Features
  {
    id: 'pf1',
    question: 'How do I track my learning progress?',
    answer: 'Your progress is tracked automatically! In the "Learning Hub" and "Interactive Lessons" sections, you can see your current level, XP (experience points), and progress towards the next level. Completed lessons are marked so you always know where you left off.',
    category: 'Premium Features',
  },
  {
    id: 'pf2',
    question: 'What does Premium include?',
    answer: 'Linguamate Premium offers unlimited access to all features, including Genius Mode for conversations, Live Tutoring sessions, advanced AI Coach analysis, and special content in the Learning Hub. It provides the most comprehensive and accelerated learning experience.',
    category: 'Premium Features',
  },
  {
    id: 'pf3',
    question: 'How does family sharing work?',
    answer: 'Our Family Plan allows you to add up to 5 family members to your Premium subscription. Each member gets their own separate profile and learning path, all under one simple billing.',
    category: 'Premium Features',
  },

  // Settings & Account
  {
    id: 'sa1',
    question: 'Can I download lessons for offline use?',
    answer: 'Offline mode is a Premium feature currently in development. We hope to launch it soon, allowing you to download lessons and continue learning even without an internet connection.',
    category: 'Settings & Account',
  },
  {
    id: 'sa2',
    question: 'How do I change my learning language?',
    answer: 'You can easily switch your learning or native language at any time using the dropdown menus located at the top right of most feature pages. You can also set your default languages in the "Settings" page.',
    category: 'Settings & Account',
  },
  {
    id: 'sa3',
    question: 'How do I customize notifications and reminders?',
    answer: 'Go to the "Settings" page and scroll down to the "Notifications" section. There, you can enable or disable push notifications and set a custom time for your daily study reminders to help you stay on track.',
    category: 'Settings & Account',
  },

  // Technical Support
  {
    id: 'ts1',
    question: 'The app is running slow. What can I do?',
    answer: 'If you experience performance issues, please try the following: 1) Ensure you have a stable internet connection. 2) Close other browser tabs or applications that may be using a lot of resources. 3) Clear your browser\'s cache. If the problem persists, please contact our support team.',
    category: 'Technical Support',
  },
  {
    id: 'ts2',
    question: 'Why is the microphone not working in Live Tutoring?',
    answer: 'Please ensure you have granted microphone permissions to your browser and this website. When you first use a feature that requires the microphone, your browser should prompt you for access. You can usually manage these permissions in your browser\'s settings under "Privacy and Security" > "Site Settings".',
    category: 'Technical Support',
  },
];
