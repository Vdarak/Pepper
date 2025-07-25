import React from 'react';
import { Agent2Content, Agent5Content, ResumeChange } from '../types';
import { DocumentTextIcon, CheckIcon, SparklesIcon } from './icons';

export const Agent2Display: React.FC<{ details: Agent2Content }> = ({ details }) => {
    const hasContent = details.title_impression || (details.strengths && details.strengths.length > 0) || (details.section_analysis && Object.keys(details.section_analysis).length > 0);

    if (!hasContent) {
        return <div className="p-4 text-center italic text-silver-medium">No analysis content is available for this agent yet.</div>;
    }
    
    const hasSectionAnalysis = details.section_analysis && Object.keys(details.section_analysis).length > 0;

    return (
        <div>
            <h4 className="text-lg font-semibold text-silver-light mb-4">Here’s the analysis of your uploaded resume:</h4>
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Left Section */}
                <div className="md:w-1/2 space-y-6">
                    {details.title_impression && (
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-silver-medium uppercase tracking-wider mb-2">
                                <DocumentTextIcon className="w-5 h-5" />
                                AI Title Impression
                            </h4>
                            <p className="text-xl font-bold text-primary">{details.title_impression}</p>
                        </div>
                    )}
                    {hasSectionAnalysis && (
                         <div className="pt-6 border-t border-slate-700/50">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-silver-medium uppercase tracking-wider mb-3">
                                <CheckIcon className="w-5 h-5" />
                                Section-by-Section Analysis
                            </h4>
                            <div className="space-y-3 pl-2 border-l-2 border-slate-700">
                               {Object.entries(details.section_analysis!).map(([section, analysis]) => (
                                   <div key={section} className="pl-4">
                                       <h5 className="font-bold text-silver-light">{section.toUpperCase()}</h5>
                                       <p className="text-silver-medium">{analysis}</p>
                                   </div>
                               ))}
                           </div>
                        </div>
                    )}
                </div>

                {/* Separator */}
                <div className="hidden md:block w-px bg-slate-700"></div>

                {/* Right Section */}
                <div className="md:w-1/2 space-y-6">
                     {details.strengths && details.strengths.length > 0 && (
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-silver-medium uppercase tracking-wider mb-3">
                                <SparklesIcon className="w-5 h-5 text-yellow-400" />
                                Key Strengths
                            </h4>
                            <ul className="space-y-2 list-inside">
                                {details.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-primary mr-2 mt-1">&#8227;</span>
                                        <span className="text-silver-light">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DiffView: React.FC<{ change: ResumeChange }> = ({ change }) => {
    return (
        <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-bold text-silver-light mb-3">{change.section.replace(/_/g, ' ').toUpperCase()}</h4>
            <div className="space-y-3 font-mono text-sm leading-relaxed">
                <div className="bg-red-900/40 p-3 rounded-md border-l-4 border-red-500/50 relative">
                    <div className="absolute top-1 right-2 text-xs font-sans uppercase font-bold text-red-400/60">Original</div>
                    <p className="text-red-300/80">{change.replace.original}</p>
                </div>
                <div className="bg-green-900/40 p-3 rounded-md border-l-4 border-green-500/50 relative">
                    <div className="absolute top-1 right-2 text-xs font-sans uppercase font-bold text-green-400/60">Updated</div>
                    <p className="text-green-300/90">{change.replace.updated}</p>
                </div>
            </div>
        </div>
    );
};

export const Agent5Display: React.FC<{ details: Agent5Content }> = ({ details }) => {
    if (!details.resume_changes || details.resume_changes.length === 0) {
        return (
            <div className="text-center p-4">
                <p className="text-lg font-semibold text-green-400">Curation Complete!</p>
                <p className="text-silver-medium">The final resume is ready for download. The AI did not log specific text changes.</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-semibold text-silver-light mb-4">Final Resume Changes Applied by AI</h3>
            <p className="text-sm text-silver-medium mb-6">The AI has made the following edits to tailor your resume. Review the changes below. You can download the final `.docx` file using the button at the bottom right.</p>
            <div className="space-y-4">
                {details.resume_changes.map((change, index) => (
                    <DiffView key={index} change={change} />
                ))}
            </div>
        </div>
    );
};
