import React from 'react';
import { SubscriptionTier, FeatureId } from './types';

interface LockedFeatureGateProps {
    children: React.ReactNode;
    featureName: string;
    requiredTier: SubscriptionTier;
    currentTier: SubscriptionTier;
    setActiveFeature: (feature: FeatureId) => void;
}

export const tierLevels: Record<SubscriptionTier, number> = {
    'Free': 0,
    'Plus': 1,
    'Pro': 2,
    'Infinite': 3,
};

const LockedFeatureGate: React.FC<LockedFeatureGateProps> = ({ children, featureName, requiredTier, currentTier, setActiveFeature }) => {
    const hasAccess = tierLevels[currentTier] >= tierLevels[requiredTier];

    if (hasAccess) {
        return <>{children}</>;
    }

    return (
        <div className="p-8 h-full flex items-center justify-center bg-background-primary text-text-primary">
            <div className="text-center bg-background-secondary p-8 rounded-lg shadow-xl max-w-md border border-background-tertiary/50">
                <div className="text-5xl mb-4">💎</div>
                <h2 className="text-2xl font-bold mb-4">Upgrade to Unlock {featureName}</h2>
                <p className="text-text-secondary mb-6">
                    This feature is part of the <span className="font-bold text-text-primary">Linguamate {requiredTier}</span> plan. Unlock it and many more advanced tools by upgrading your subscription.
                </p>
                <button
                    onClick={() => setActiveFeature('premium')}
                    className="bg-accent-primary text-background-primary font-bold py-3 px-6 rounded-lg hover:bg-accent-primary-dark transition-colors duration-200"
                >
                    View Premium Plans
                </button>
            </div>
        </div>
    );
};

export default LockedFeatureGate;
