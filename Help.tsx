import React, { useState, useMemo } from 'react';
import { faqData, FaqCategory, FaqItem } from './faqData';
import { FeatureId } from './types';

// --- ICONS ---
const BackIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>);
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-text-secondary"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>);
const ChevronDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>);

const categoryIcons: { [key: string]: React.ReactElement } = {
    'All Topics': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>,
    'Getting Started': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>,
    'Learning Features': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 013.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 013.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /></svg>,
    'Premium Features': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.321l5.478.398a.562.562 0 01.31.956l-4.2 3.548a.562.562 0 00-.192.558l1.287 5.345a.562.562 0 01-.82.634l-4.79-2.848a.563.563 0 00-.58 0l-4.79 2.848a.562.562 0 01-.82-.634l1.287-5.345a.562.562 0 00-.192-.558l-4.2-3.548a.562.562 0 01.31-.956l5.478-.398a.563.563 0 00.475-.321L11.48 3.5z" /></svg>,
    'Settings & Account': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.113-1.113l.448-.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113l.064.383a2.25 2.25 0 01-1.248 2.51l-.507.254a2.25 2.25 0 00-1.248 2.51l.064.383c.09.542.56 1.007 1.113 1.113l.448.113a2.25 2.25 0 012.11 0l.448.113c.553.106 1.023.571 1.113 1.113M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5zM12 8.25a3.75 3.75 0 110 7.5 3.75 3.75 0 010-7.5z" /></svg>,
    'Technical Support': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
};
const categories = ['All Topics', ...Object.keys(categoryIcons).slice(1)] as const;

// --- SUB-COMPONENTS ---
const FaqAccordionItem: React.FC<{ faq: FaqItem; isOpen: boolean; onClick: () => void }> = ({ faq, isOpen, onClick }) => (
    <div className="bg-background-secondary rounded-lg border border-background-tertiary/50 overflow-hidden">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-4 font-medium"
            aria-expanded={isOpen}
        >
            <span>{faq.question}</span>
            <span className={isOpen ? 'rotate-180' : ''}><ChevronDownIcon /></span>
        </button>
        {isOpen && (
            <div className="p-4 pt-0 text-text-secondary">
                <p>{faq.answer}</p>
            </div>
        )}
    </div>
);

// --- MAIN COMPONENT ---
interface HelpProps {
  setActiveFeature: (feature: FeatureId) => void;
}

const Help: React.FC<HelpProps> = ({ setActiveFeature }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('All Topics');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filteredFaqs = useMemo(() => {
        return faqData.filter(faq => {
            const matchesCategory = activeCategory === 'All Topics' || faq.category === activeCategory;
            const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, activeCategory]);

    const handleToggle = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="h-full flex flex-col bg-background-primary text-text-primary">
            <header className="flex items-center p-4 border-b border-background-tertiary/50">
                <button
                    onClick={() => setActiveFeature('settings')}
                    className="p-2 rounded-full hover:bg-background-secondary"
                    aria-label="Back to settings"
                >
                    <BackIcon />
                </button>
                <h1 className="text-xl font-bold ml-4">Help & FAQ</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search help topics..."
                            className="w-full bg-background-secondary border border-background-tertiary/50 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    activeCategory === category
                                        ? 'bg-accent-primary text-background-primary'
                                        : 'bg-background-secondary hover:bg-background-tertiary'
                                }`}
                            >
                                {categoryIcons[category]}
                                <span>{category}</span>
                            </button>
                        ))}
                    </div>

                    {/* FAQ List */}
                    <div className="space-y-3">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map(faq => (
                                <FaqAccordionItem
                                    key={faq.id}
                                    faq={faq}
                                    isOpen={expandedId === faq.id}
                                    onClick={() => handleToggle(faq.id)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 text-text-secondary">
                                <p className="font-semibold">No results found</p>
                                <p>Try adjusting your search or category.</p>
                            </div>
                        )}
                    </div>

                    {/* Support Section */}
                    <div className="mt-12 text-center bg-background-secondary rounded-lg p-8 border border-background-tertiary/50">
                        <h2 className="text-xl font-bold">Still need help?</h2>
                        <p className="text-text-secondary mt-2 mb-6">Can't find what you're looking for? Our support team is here to help!</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-accent-primary text-background-primary font-semibold py-3 px-6 rounded-lg hover:bg-accent-primary-dark transition-colors">
                                Contact Support
                            </button>
                             <button className="bg-background-tertiary text-text-primary font-semibold py-3 px-6 rounded-lg hover:bg-background-tertiary/70 transition-colors">
                                Visit Website
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Help;