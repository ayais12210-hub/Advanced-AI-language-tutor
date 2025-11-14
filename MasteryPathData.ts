import { MasteryTier } from './types';

export const masteryData: MasteryTier[] = [
  {
    id: 1,
    title: 'Tier 1: Core Foundations',
    description: 'Survival to Basic Fluency',
    levels: [
      { id: 't1l1', tierId: 1, title: 'Phonetics & Pronunciation', description: 'Master the sound system.', type: 'phonetics', xp: 50, difficulty: 'Easy' },
      { id: 't1l2', tierId: 1, title: 'High Frequency Vocab', description: 'Learn the top 500-1000 words.', type: 'highFrequencyVocab', xp: 75, difficulty: 'Easy' },
      { id: 't1l3', tierId: 1, title: 'Essential Grammar', description: 'Understand basic sentence structure.', type: 'essentialGrammar', xp: 75, difficulty: 'Easy' },
      { id: 't1l4', tierId: 1, title: 'Comprehension Core', description: 'Decode real-world text and speech.', type: 'comprehensionCore', xp: 50, difficulty: 'Easy' },
      { id: 't1l5', tierId: 1, title: 'Speaking Fundamentals', description: 'Learn core conversation patterns.', type: 'speakingFundamentals', xp: 100, difficulty: 'Easy' },
    ],
  },
  {
    id: 2,
    title: 'Tier 2: Functional Communication',
    description: 'Conversational Fluency',
    levels: [
      { id: 't2l1', tierId: 2, title: 'Extended Vocabulary', description: 'Expand your lexicon to 2k-5k words.', type: 'extendedVocab', xp: 100, difficulty: 'Easy' },
      { id: 't2l2', tierId: 2, title: 'Intermediate Grammar', description: 'Tackle complex sentences.', type: 'intermediateGrammar', xp: 125, difficulty: 'Easy' },
      { id: 't2l3', tierId: 2, title: 'Listening for Meaning', description: 'Comprehend native-speed speech.', type: 'listeningForMeaning', xp: 100, difficulty: 'Medium' },
      { id: 't2l4', tierId: 2, title: 'Conversational Patterns', description: 'Learn to tell stories and express opinions.', type: 'conversationalPatterns', xp: 125, difficulty: 'Medium' },
      { id: 't2l5', tierId: 2, title: 'Cultural Competence', description: 'Understand politeness, gestures, and norms.', type: 'culturalCompetence', xp: 150, difficulty: 'Medium' },
    ],
  },
  {
    id: 3,
    title: 'Tier 3: Fluency & Expression',
    description: 'Upper Intermediate → Advanced',
    levels: [
      { id: 't3l1', tierId: 3, title: 'Reading Mastery', description: 'Understand nuance in fiction and non-fiction.', type: 'readingMastery', xp: 150, difficulty: 'Medium' },
      { id: 't3l2', tierId: 3, title: 'Writing Competence', description: 'Structure paragraphs and differentiate styles.', type: 'writingCompetence', xp: 150, difficulty: 'Medium' },
      { id: 't3l3', tierId: 3, title: 'Pronunciation Refinement', description: 'Develop native-like rhythm and intonation.', type: 'pronunciationRefinement', xp: 175, difficulty: 'Hard' },
      { id: 't3l4', tierId: 3, title: 'Idiomatic Mastery', description: 'Learn slang, expressions, and cultural humor.', type: 'idiomaticMastery', xp: 200, difficulty: 'Hard' },
      { id: 't3l5', tierId: 3, title: 'Cognitive Flexibility', description: 'Start thinking in the target language.', type: 'cognitiveFlexibility', xp: 250, difficulty: 'Hard' },
    ],
  },
  {
    id: 4,
    title: 'Tier 4: Intellectual & Emotional Depth',
    description: 'Advanced → Native-like',
    levels: [
      { id: 't4l1', tierId: 4, title: 'Linguistic Nuance', description: 'Grasp literary, poetic, and technical registers.', type: 'linguisticNuance', xp: 250, difficulty: 'Hard' },
      { id: 't4l2', tierId: 4, title: 'Cultural Immersion', description: 'Understand dialects, media references, and history.', type: 'culturalImmersion', xp: 250, difficulty: 'Hard' },
      { id: 't4l3', tierId: 4, title: 'Creative & Academic Expression', description: 'Practice essays, presentations, and public speaking.', type: 'creativeExpression', xp: 300, difficulty: 'Hard' },
      { id: 't4l4', tierId: 4, title: 'Sociolinguistic Awareness', description: 'Adjust tone to different audiences.', type: 'sociolinguisticAwareness', xp: 300, difficulty: 'Hard' },
      { id: 't4l5', tierId: 4, title: 'Self-Identity Integration', description: 'Journal, dream, and think natively.', type: 'selfIdentityIntegration', xp: 400, difficulty: 'Hard' },
    ],
  },
  {
    id: 5,
    title: 'Tier 5: Technical & Meta-Linguistic Mastery',
    description: 'Beyond Fluency',
    levels: [
      { id: 't5l1', tierId: 5, title: 'Etymology & Word Origins', description: 'Explore roots, prefixes, and suffixes.', type: 'etymology', xp: 400, difficulty: 'Expert' },
      { id: 't5l2', tierId: 5, title: 'Comparative Linguistics', description: 'Analyze cross-language similarities.', type: 'comparativeLinguistics', xp: 400, difficulty: 'Expert' },
      { id: 't5l3', tierId: 5, title: 'Linguistic Philosophy', description: 'Study how language shapes thought.', type: 'linguisticPhilosophy', xp: 500, difficulty: 'Expert' },
      { id: 't5l4', tierId: 5, title: 'Language Maintenance', description: 'Develop long-term retention strategies.', type: 'languageMaintenance', xp: 500, difficulty: 'Expert' },
      { id: 't5l5', tierId: 5, title: 'Polyglot Systems Thinking', description: 'Design your lifelong language architecture.', type: 'polyglotSystems', xp: 1000, difficulty: 'Expert' },
    ],
  },
];