import { Unit } from './types';

/**
 * @fileoverview
 * This file contains the structured data for all language lessons.
 * It's designed to be easily extensible for new units and lessons.
 * In a real-world application, this data would likely be fetched from a CMS or database.
 *
 * TODO:
 * - Implement a system to fetch this data from a backend.
 * - Add more diverse lesson types like 'sentence_building', 'flashcards', etc.
 * - Localize titles and descriptions based on the user's native language.
 */

export const lessonData: Unit[] = [
  {
    id: 'unit1',
    title: 'Unit 1: The Basics',
    description: 'Start your journey with the building blocks of the language.',
    lessons: [
      { id: 'u1l1', title: 'The Alphabet', type: 'alphabet', description: 'Learn the letters and their unique sounds.', xp: 50, difficulty: 'Easy' },
      { id: 'u1l2', title: 'Numbers 1-10', type: 'numbers', description: 'Master counting from one to ten.', xp: 50, difficulty: 'Easy' },
      { id: 'u1l3', title: 'Basic Colors', type: 'colors', description: 'Describe the world with essential colors.', xp: 50, difficulty: 'Easy' },
      { id: 'u1l4', title: 'Unit 1 Quiz', type: 'quiz', description: 'Test your knowledge of the basics.', xp: 100, difficulty: 'Easy' },
    ],
  },
  {
    id: 'unit2',
    title: 'Unit 2: Greetings & Introductions',
    description: 'Learn how to meet people and start conversations.',
    lessons: [
      { id: 'u2l1', title: 'Common Greetings', type: 'phrases', description: 'Learn to say hello, goodbye, and how are you?', xp: 50, difficulty: 'Easy' },
      { id: 'u2l2', title: 'Introducing Yourself', type: 'phrases', description: 'Share your name and where you are from.', xp: 50, difficulty: 'Easy' },
      { id: 'u2l3', title: 'Simple Questions', type: 'grammar', description: 'Learn to ask "who, what, where, and when".', xp: 50, difficulty: 'Easy' },
      { id: 'u2l4', title: 'Unit 2 Quiz', type: 'quiz', description: 'Practice your new conversational skills.', xp: 100, difficulty: 'Easy' },
    ],
  },
    {
    id: 'unit3',
    title: 'Unit 3: Food & Drink',
    description: 'Talk about your favorite foods and order at a restaurant.',
    lessons: [
      { id: 'u3l1', title: 'Fruits & Vegetables', type: 'phrases', description: 'Learn the names of common produce.', xp: 50, difficulty: 'Easy' },
      { id: 'u3l2', title: 'At the Restaurant', type: 'phrases', description: 'Practice ordering food and drinks.', xp: 50, difficulty: 'Easy' },
      { id: 'u3l3', title: 'Expressing Likes/Dislikes', type: 'grammar', description: 'Talk about what you enjoy eating.', xp: 50, difficulty: 'Easy' },
      { id: 'u3l4', title: 'Unit 3 Quiz', type: 'quiz', description: 'Test your culinary vocabulary.', xp: 100, difficulty: 'Easy' },
    ],
  },
  {
    id: 'unit4',
    title: 'Unit 4: Grammar Essentials',
    description: 'Build a strong foundation with core grammar concepts.',
    lessons: [
      { id: 'u4l1', title: 'Common Nouns', type: 'nouns', description: 'Learn the names of everyday objects.', xp: 50, difficulty: 'Medium' },
      { id: 'u4l2', title: 'Understanding Vowels', type: 'vowels', description: 'Master the vowel sounds.', xp: 50, difficulty: 'Medium' },
      { id: 'u4l3', title: 'Mastering Consonants', type: 'consonants', description: 'Perfect your consonant pronunciation.', xp: 50, difficulty: 'Medium' },
      { id: 'u4l4', title: 'Unit 4 Quiz', type: 'quiz', description: 'Test your grammar knowledge.', xp: 100, difficulty: 'Medium' },
    ],
  },
  {
    id: 'unit5',
    title: 'Unit 5: Building Sentences',
    description: 'Learn to construct your own sentences from scratch.',
    lessons: [
      { id: 'u5l1', title: 'Subject-Verb-Object', type: 'grammar', description: 'Understand basic sentence structure.', xp: 50, difficulty: 'Medium' },
      { id: 'u5l2', title: 'Sentence Scramble', type: 'sentenceScramble', description: 'Unscramble words to form correct sentences.', xp: 75, difficulty: 'Medium' },
      { id: 'u5l3', title: 'Making Negative Sentences', type: 'grammar', description: 'Learn how to negate statements.', xp: 50, difficulty: 'Medium' },
      { id: 'u5l4', title: 'Unit 5 Quiz', type: 'quiz', description: 'Practice your sentence building skills.', xp: 100, difficulty: 'Medium' },
    ],
  },
  {
    id: 'unit6',
    title: 'Unit 6: Travel & Culture',
    description: 'Get ready for your travels and understand cultural nuances.',
    lessons: [
      { id: 'u6l1', title: 'At the Airport', type: 'phrases', description: 'Navigate the airport with confidence.', xp: 50, difficulty: 'Medium' },
      { id: 'u6l2', title: 'Checking into a Hotel', type: 'phrases', description: 'Handle your accommodation needs.', xp: 50, difficulty: 'Medium' },
      { id: 'u6l3', title: 'Common Idioms', type: 'phrases', description: 'Sound more like a native speaker.', xp: 50, difficulty: 'Medium' },
      { id: 'u6l4', title: 'Unit 6 Quiz', type: 'quiz', description: 'Test your travel and cultural knowledge.', xp: 100, difficulty: 'Medium' },
    ],
  },
  {
    id: 'unit7',
    title: 'Unit 7: Professional Life',
    description: 'Learn vocabulary and phrases for career and the workplace.',
    lessons: [
      { id: 'u7l1', title: 'Jobs & Professions', type: 'phrases', description: 'Talk about what you and others do for work.', xp: 50, difficulty: 'Hard' },
      { id: 'u7l2', title: 'In the Office', type: 'nouns', description: 'Learn the names of common office items.', xp: 50, difficulty: 'Hard' },
      { id: 'u7l3', title: 'Business Talk', type: 'phrases', description: 'Practice phrases for meetings and emails.', xp: 50, difficulty: 'Hard' },
      { id: 'u7l4', title: 'Unit 7 Quiz', type: 'quiz', description: 'Test your professional vocabulary.', xp: 100, difficulty: 'Hard' },
    ],
  },
  {
    id: 'unit8',
    title: 'Unit 8: Academic World',
    description: 'Navigate school and university settings with ease.',
    lessons: [
      { id: 'u8l1', title: 'School Subjects', type: 'nouns', description: 'Learn to talk about what you are studying.', xp: 50, difficulty: 'Hard' },
      { id: 'u8l2', title: 'Classroom Conversations', type: 'phrases', description: 'Phrases for interacting with teachers and classmates.', xp: 50, difficulty: 'Hard' },
      { id: 'u8l3', title: 'Studying & Learning', type: 'grammar', description: 'Discuss study habits and learning strategies.', xp: 50, difficulty: 'Hard' },
      { id: 'u8l4', title: 'Unit 8 Quiz', type: 'quiz', description: 'Test your knowledge of academic language.', xp: 100, difficulty: 'Hard' },
    ],
  },
  {
    id: 'unit9',
    title: 'Unit 9: Entertainment & Hobbies',
    description: 'Discuss your interests in sports, movies, music, and more.',
    lessons: [
      { id: 'u9l1', title: 'Talking about Sports', type: 'phrases', description: 'Share your favorite sports and teams.', xp: 50, difficulty: 'Hard' },
      { id: 'u9l2', title: 'Movies & TV Shows', type: 'phrases', description: 'Discuss plots, characters, and genres.', xp: 50, difficulty: 'Hard' },
      { id: 'u9l3', title: 'Music & Art', type: 'phrases', description: 'Express your opinions on different art forms.', xp: 50, difficulty: 'Hard' },
      { id: 'u9l4', title: 'Unit 9 Quiz', type: 'quiz', description: 'Test your entertainment vocabulary.', xp: 100, difficulty: 'Hard' },
    ],
  },
  {
    id: 'unit10',
    title: 'Unit 10: Science & Technology',
    description: 'Explore topics related to the modern world.',
    lessons: [
      { id: 'u10l1', title: 'The Natural World', type: 'phrases', description: 'Talk about animals, plants, and the environment.', xp: 50, difficulty: 'Hard' },
      { id: 'u10l2', title: 'Tech & Gadgets', type: 'nouns', description: 'Learn vocabulary for computers and smartphones.', xp: 50, difficulty: 'Hard' },
      { id: 'u10l3', title: 'Discussing History', type: 'grammar', description: 'Learn to talk about past events.', xp: 50, difficulty: 'Hard' },
      { id: 'u10l4', title: 'Unit 10 Quiz', type: 'quiz', description: 'Test your knowledge of science and history.', xp: 100, difficulty: 'Hard' },
    ],
  },
];