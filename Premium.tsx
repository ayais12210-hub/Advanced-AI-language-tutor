import React from 'react';
import { SubscriptionTier } from './types';

interface PremiumProps {
    subscriptionTier: SubscriptionTier;
    setSubscriptionTier: (tier: SubscriptionTier) => void;
}

type PlanFeature = {
    text: string;
    included: boolean;
};

type Plan = {
    id: SubscriptionTier;
    name: string;
    price: string;
    description: string;
    features: PlanFeature[];
    highlight?: boolean;
};

const plans: Plan[] = [
    {
        id: 'Free',
        name: 'Free',
        price: '£0',
        description: 'Start your journey with the essentials.',
        features: [
            { text: 'Basic XP System', included: true },
            { text: 'Daily Lesson Limit', included: true },
            { text: 'Standard AI Tutor (Smart Mode)', included: true },
            { text: 'AI Fluency Coach (3/day)', included: false },
            { text: 'Smart XP Engine & Analytics', included: false },
            { text: 'Voice Conversation Simulations', included: false },
            { text: 'Immersive Worlds', included: false },
            { text: 'AI Companions', included: false },
        ]
    },
    {
        id: 'Plus',
        name: 'Linguamate+',
        price: '£7.99',
        description: 'Unlock the core cognitive learning engine.',
        features: [
            { text: 'Everything in Free', included: true },
            { text: 'Unlimited AI Tutor Sessions', included: true },
            { text: 'AI Fluency Coach', included: true },
            { text: 'Smart XP Engine & Analytics', included: true },
            { text: 'Voice Conversation Simulations', included: true },
            { text: 'Language DNA Graph', included: true },
            { text: 'AI Mirror Mode', included: true },
            { text: 'Immersive Worlds', included: false },
            { text: 'Creator Studio', included: false },
        ]
    },
    {
        id: 'Pro',
        name: 'Linguamate Pro',
        price: '£14.99',
        description: 'For the dedicated learner seeking deep immersion.',
        features: [
            { text: 'Everything in Plus', included: true },
            { text: 'Genius Mode AI Tutor', included: true },
            { text: 'Immersive Worlds', included: true },
            { text: 'Cultural Intelligence Packs', included: true },
            { text: 'Interactive Story Mode', included: true },
            { text: 'Cinematic AI Tutor', included: true },
            { text: 'Grammar Neural Analyzer', included: true },
            { text: 'AI Translator Pro', included: true },
            { text: 'AI Companions', included: false },
        ],
        highlight: true,
    },
    {
        id: 'Infinite',
        name: 'Linguamate Infinite',
        price: '£29.99',
        description: 'Mastery tools for power users and creators.',
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'AI Language Companions', included: true },
            { text: 'Creator Studio (Sell Lessons)', included: true },
            { text: 'Professional & Business Tools', included: true },
            { text: 'Mindful Language Flow', included: true },
            { text: 'Peer Learning Circles', included: true },
            { text: 'Omni-Integration Layer (API)', included: true },
            { text: 'Priority Support', included: true },
        ]
    },
];

const Premium: React.FC<PremiumProps> = ({ subscriptionTier, setSubscriptionTier }) => {
    return (
        <div className="p-4 sm:p-8 h-full flex flex-col bg-background-primary text-text-primary overflow-y-auto">
            <header className="text-center">
                <h1 className="text-5xl font-heading font-bold tracking-tight">Unlock Your Full Potential</h1>
                <p className="text-text-secondary mt-4 text-lg max-w-2xl mx-auto">
                    From conversational fluency to cognitive mastery, our premium plans are designed to accelerate your learning with an AI-immersive ecosystem.
                </p>
            </header>

            <main className="flex-1 flex items-center justify-center mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`flex flex-col rounded-xl border-2 p-6 ${plan.highlight ? 'border-accent-primary bg-background-secondary shadow-2xl shadow-accent-primary/10' : 'border-background-tertiary/50 bg-background-secondary/50'}`}>
                            <h2 className="text-2xl font-bold font-heading">{plan.name}</h2>
                            <p className="text-4xl font-bold my-4">{plan.price}<span className="text-lg font-medium text-text-secondary">/mo</span></p>
                            <p className="text-sm text-text-secondary min-h-[40px]">{plan.description}</p>
                            
                            <ul className="space-y-3 my-6">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className={`flex items-start gap-3 text-sm ${feature.included ? 'text-text-primary' : 'text-text-secondary/60'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 mt-0.5 flex-shrink-0 ${feature.included ? 'text-green-400' : 'text-text-secondary/50'}`}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={feature.included ? "M4.5 12.75l6 6 9-13.5" : "M6 18L18 6M6 6l12 12"} />
                                        </svg>
                                        <span>{feature.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => setSubscriptionTier(plan.id)}
                                disabled={subscriptionTier === plan.id}
                                className={`w-full mt-auto font-bold py-3 px-5 rounded-lg transition-colors duration-200 text-lg ${
                                    subscriptionTier === plan.id 
                                        ? 'bg-background-tertiary text-text-secondary cursor-default'
                                        : plan.highlight 
                                        ? 'bg-accent-primary text-background-primary hover:bg-accent-primary-dark'
                                        : 'bg-accent-secondary text-background-primary hover:bg-yellow-500'
                                }`}
                            >
                                {subscriptionTier === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Premium;
