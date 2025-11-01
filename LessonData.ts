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
      { id: 'u1l1', title: 'The Alphabet', type: 'alphabet', description: 'Learn the letters and their unique sounds.' },
      { id: 'u1l2', title: 'Numbers 1-10', type: 'numbers', description: 'Master counting from one to ten.' },
      { id: 'u1l3', title: 'Basic Colors', type: 'colors', description: 'Describe the world with essential colors.' },
      { id: 'u1l4', title: 'Unit 1 Quiz', type: 'quiz', description: 'Test your knowledge of the basics.' },
    ],
  },
  {
    id: 'unit2',
    title: 'Unit 2: Greetings & Introductions',
    description: 'Learn how to meet people and start conversations.',
    lessons: [
      { id: 'u2l1', title: 'Common Greetings', type: 'phrases', description: 'Learn to say hello, goodbye, and how are you?' },
      { id: 'u2l2', title: 'Introducing Yourself', type: 'phrases', description: 'Share your name and where you are from.' },
      { id: 'u2l3', title: 'Simple Questions', type: 'grammar', description: 'Learn to ask "who, what, where, and when".' },
      { id: 'u2l4', title: 'Unit 2 Quiz', type: 'quiz', description: 'Practice your new conversational skills.' },
    ],
  },
    {
    id: 'unit3',
    title: 'Unit 3: Food & Drink',
    description: 'Talk about your favorite foods and order at a restaurant.',
    lessons: [
      { id: 'u3l1', title: 'Fruits & Vegetables', type: 'phrases', description: 'Learn the names of common produce.' },
      { id: 'u3l2', title: 'At the Restaurant', type: 'phrases', description: 'Practice ordering food and drinks.' },
      { id: 'u3l3', title: 'Expressing Likes/Dislikes', type: 'grammar', description: 'Talk about what you enjoy eating.' },
      { id: 'u3l4', title: 'Unit 3 Quiz', type: 'quiz', description: 'Test your culinary vocabulary.' },
    ],
  },
  {
    id: 'unit4',
    title: 'Unit 4: Grammar Essentials',
    description: 'Build a strong foundation with core grammar concepts.',
    lessons: [
      { id: 'u4l1', title: 'Common Nouns', type: 'nouns', description: 'Learn the names of everyday objects.' },
      { id: 'u4l2', title: 'Understanding Vowels', type: 'vowels', description: 'Master the vowel sounds.' },
      { id: 'u4l3', title: 'Mastering Consonants', type: 'consonants', description: 'Perfect your consonant pronunciation.' },
      { id: 'u4l4', title: 'Unit 4 Quiz', type: 'quiz', description: 'Test your grammar knowledge.' },
    ],
  },
  {
    id: 'unit5',
    title: 'Unit 5: Building Sentences',
    description: 'Learn to construct your own sentences from scratch.',
    lessons: [
      { id: 'u5l1', title: 'Subject-Verb-Object', type: 'grammar', description: 'Understand basic sentence structure.' },
      { id: 'u5l2', title: 'Sentence Scramble', type: 'sentenceScramble', description: 'Unscramble words to form correct sentences.' },
      { id: 'u5l3', title: 'Making Negative Sentences', type: 'grammar', description: 'Learn how to negate statements.' },
      { id: 'u5l4', title: 'Unit 5 Quiz', type: 'quiz', description: 'Practice your sentence building skills.' },
    ],
  },
  {
    id: 'unit6',
    title: 'Unit 6: Travel & Culture',
    description: 'Get ready for your travels and understand cultural nuances.',
    lessons: [
      { id: 'u6l1', title: 'At the Airport', type: 'phrases', description: 'Navigate the airport with confidence.' },
      { id: 'u6l2', title: 'Checking into a Hotel', type: 'phrases', description: 'Handle your accommodation needs.' },
      { id: 'u6l3', title: 'Common Idioms', type: 'phrases', description: 'Sound more like a native speaker.' },
      { id: 'u6l4', title: 'Unit 6 Quiz', type: 'quiz', description: 'Test your travel and cultural knowledge.' },
    ],
  },
];