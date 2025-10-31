import React from 'react';
import ReactMarkdown from 'react-markdown';
import { TranslationAnalysis } from './types';

// Icons for different analysis sections
const SoundIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28 .53v15.88a.75.75 0 01-1.28 .53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>;
const MeaningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a15.045 15.045 0 01-7.5 0C4.508 19.659 2.25 17.159 2.25 14.255S4.508 8.851 7.5 7.462m7.5 1.393A15.045 15.045 0 0119.5 14.255c0 2.904-2.258 5.404-5.25 6.841" /></svg>;
const StructureIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>;
const LearningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const UsageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h8.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h8.25m-8.25 5.25h8.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
const SummaryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.474-4.474c-.048-.58-.188-1.193-.343-1.743m-14.484 0a4.5 4.5 0 00-4.474 4.474c.048.58.188 1.193.343 1.743m14.484 0l-2.496 3.03" /></svg>;
const AlternativesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const SpeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28 .53v15.88a.75.75 0 01-1.28 .53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>;
const TtsSpinner = () => <svg className="animate-spin h-5 w-5 text-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

interface TranslationAnalysisCardProps {
    analysis: TranslationAnalysis;
    onPlayAudio: () => void;
    isTtsLoading: boolean;
}

const AnalysisSection: React.FC<{ icon: React.ReactElement, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="border-t border-background-tertiary/50 pt-4">
        <h3 className="flex items-center gap-2 font-semibold text-text-primary text-md mb-2">
            {icon}
            <span>{title}</span>
        </h3>
        <div className="pl-7 text-sm text-text-secondary">{children}</div>
    </div>
);

export const TranslationAnalysisCard: React.FC<TranslationAnalysisCardProps> = ({ analysis, onPlayAudio, isTtsLoading }) => {
    return (
        <div className="h-full space-y-4">
            {/* Main Translation */}
            <div className="bg-background-tertiary p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider">Professional Translation</span>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span>Confidence:</span>
                        <span className="font-bold text-text-primary">{analysis.translationConfidence}%</span>
                    </div>
                </div>
                <div className="flex justify-between items-start gap-2">
                    <p className="text-lg text-text-primary">{analysis.professionalTranslation}</p>
                    <button onClick={onPlayAudio} disabled={isTtsLoading} className="p-2 rounded-full text-text-secondary hover:bg-accent-primary hover:text-background-primary disabled:opacity-50 disabled:cursor-wait transition-all">
                        {isTtsLoading ? <TtsSpinner /> : <SpeakerIcon />}
                    </button>
                </div>
            </div>

            {/* AI Coach Insights */}
            <h2 className="text-xl font-heading font-bold text-text-primary pt-2">AI Coach Insights</h2>
            <div className="space-y-4">
                <AnalysisSection icon={<SoundIcon />} title="Sound (Advanced Pronunciation)">
                    <div className="space-y-1 font-mono text-xs">
                        <p><strong className="font-sans text-text-primary font-medium">Text:</strong> {analysis.sound.text}</p>
                        <p><strong className="font-sans text-text-primary font-medium">IPA:</strong> {analysis.sound.ipa}</p>
                        <p><strong className="font-sans text-text-primary font-medium">Syllables:</strong> {analysis.sound.syllables}</p>
                    </div>
                </AnalysisSection>

                <AnalysisSection icon={<MeaningIcon />} title="Meaning (Translation Analysis)">
                    <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{analysis.meaning}</ReactMarkdown></div>
                </AnalysisSection>

                <AnalysisSection icon={<StructureIcon />} title="Structure (Grammar & Syntax)">
                    <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{analysis.structure}</ReactMarkdown></div>
                </AnalysisSection>

                <AnalysisSection icon={<LearningIcon />} title="Learning Process">
                    <ul className="space-y-2">
                        {analysis.learningProcess.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-accent-secondary pt-1">💡</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </AnalysisSection>

                <AnalysisSection icon={<UsageIcon />} title="Usage (Context & Patterns)">
                    <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{analysis.usage}</ReactMarkdown></div>
                </AnalysisSection>

                <AnalysisSection icon={<SummaryIcon />} title="Advanced Summary">
                    <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{analysis.advancedSummary}</ReactMarkdown></div>
                </AnalysisSection>

                <AnalysisSection icon={<AlternativesIcon />} title="Alternative Translations">
                    <ul className="list-disc list-inside space-y-1">
                        {analysis.alternativeTranslations.map((alt, index) => (
                            <li key={index}>{alt}</li>
                        ))}
                    </ul>
                </AnalysisSection>
            </div>
        </div>
    );
};