
import React, { useState } from 'react';
import { LoadingSpinner } from './icons';

interface JobParserFormProps {
    onParse: (jobUrl: string, jobDescription: string, extraInfo: string) => void;
    isLoading: boolean;
}

const JobParserForm: React.FC<JobParserFormProps> = ({ onParse, isLoading }) => {
    const [jobUrl, setJobUrl] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [extraInfo, setExtraInfo] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onParse(jobUrl, jobDescription, extraInfo);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="jobUrl" className="block text-sm font-medium text-silver-light mb-1">Job Posting URL</label>
                <input
                    type="url"
                    id="jobUrl"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                />
            </div>
             <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-silver-light mb-1">Job Description Text</label>
                <textarea
                    id="jobDescription"
                    rows={12}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full text of the job description here..."
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition font-mono text-sm"
                />
            </div>
             <div>
                <label htmlFor="extraInfo" className="block text-sm font-medium text-silver-light mb-1">Optional Extra Info</label>
                <textarea
                    id="extraInfo"
                    rows={3}
                    value={extraInfo}
                    onChange={(e) => setExtraInfo(e.target.value)}
                    placeholder="e.g., company_size = 50-200, location is remote"
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                />
            </div>
            <div>
                 <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-b from-primary/60 to-primary-dark/60 hover:from-primary-dark/60 hover:to-primary-dark/60 disabled:bg-slate-700/50 disabled:from-slate-700/50 disabled:to-slate-700/50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-primary/10 hover:shadow-primary/20 text-lg"
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner className="w-6 h-6" />
                            Parsing...
                        </>
                    ) : (
                        'Parse Job Posting'
                    )}
                </button>
            </div>
        </form>
    );
};

export default JobParserForm;