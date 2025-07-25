import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Agent2Content, Resume } from '../types';
import { listResumes, renameResume, downloadResume } from '../services/resumeService';
import { LoadingSpinner, ResumeCenterIcon, XIcon, UploadIcon, PencilIcon, TrashIcon, ChevronDownIcon, CheckIcon, DownloadIcon, DocumentTextIcon } from './icons';
import UploadResumeModal from './UploadResumeModal';
import { Agent2Display } from './AgentDisplays';

type Tab = 'default' | 'curated';

interface ResumeCenterProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  userId: string;
  onUploadClick: () => void;
  setHasNewRequestNotification: (value: boolean) => void;
}

const StatusDot: React.FC<{ hasJson: boolean; tab: Tab }> = ({ hasJson, tab }) => {
    const isReviewed = hasJson;
    
    let tooltip = '';
    if (isReviewed) {
        tooltip = "AI Reviewed & Summary Available";
    } else {
        if (tab === 'default') {
            tooltip = "Pending Review - Summary will be generated soon.";
        } else {
            tooltip = "Curated resume, no separate summary.";
        }
    }

    return (
        <div className="relative group flex items-center">
            <span
                className={`w-3 h-3 rounded-full ${isReviewed ? 'bg-green-400 animate-pulse-green' : 'bg-slate-500'}`}
            ></span>
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                {tooltip}
            </div>
        </div>
    );
};

// Define ResumeItem component here to solve the conditional hook issue
interface ResumeItemProps {
    resume: Resume;
    activeTab: Tab;
    renamingState: { id: string; name: string } | null;
    isRenaming: boolean;
    isDownloading: string | null;
    onRenameClick: (resume: Resume) => void;
    onRenameCancel: () => void;
    onRenameSubmit: () => Promise<void>;
    setRenamingState: React.Dispatch<React.SetStateAction<{ id: string; name: string } | null>>;
    onDownloadClick: (resume: Resume) => void;
    onReuploadClick: (resume: Resume) => void;
    onViewAnalysis: (content: Agent2Content) => void;
}

const ResumeItem: React.FC<ResumeItemProps> = ({
    resume,
    activeTab,
    renamingState,
    isRenaming,
    isDownloading,
    onRenameClick,
    onRenameCancel,
    onRenameSubmit,
    setRenamingState,
    onDownloadClick,
    onReuploadClick,
    onViewAnalysis,
}) => {
    const agent2Content: Agent2Content | null = useMemo(() => {
        if (!resume.ResumeJson) return null;
        try {
            return JSON.parse(resume.ResumeJson);
        } catch (e) {
            console.error("Failed to parse ResumeJson for resume " + resume.ResumeId, e);
            return null;
        }
    }, [resume.ResumeJson, resume.ResumeId]);

    const formattedDate = useMemo(() => {
        if (!resume.CreatedOn || resume.CreatedOn.length !== 8) {
            return null;
        }
        const year = resume.CreatedOn.slice(0, 4);
        const monthIndex = parseInt(resume.CreatedOn.slice(4, 6), 10) - 1;
        const day = resume.CreatedOn.slice(6, 8);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        if (monthIndex < 0 || monthIndex > 11) {
            return null;
        }
        return `${monthNames[monthIndex]} ${day}, ${year}`;
    }, [resume.CreatedOn]);


    const isRenamingThis = renamingState?.id === resume.ResumeId;

    return (
        <li className="relative bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-5 transition-colors min-h-[120px]">
            <div className="flex-shrink-0 self-stretch flex items-center justify-center">
                <DocumentTextIcon className="w-14 h-14 text-slate-600" />
            </div>
            <div className="flex-grow flex flex-col self-stretch min-w-0">
                {isRenamingThis ? (
                    <>
                        <input
                            type="text"
                            value={renamingState!.name}
                            onChange={(e) => setRenamingState({ ...renamingState!, name: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onRenameSubmit();
                                if (e.key === 'Escape') onRenameCancel();
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-silver-light font-bold text-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                            autoFocus
                            disabled={isRenaming}
                        />
                        <div className="flex items-center gap-1 mt-auto self-end">
                            <button onClick={onRenameSubmit} disabled={isRenaming} className="p-2 rounded-md text-green-400 hover:bg-green-500/20 hover:text-green-300 disabled:text-slate-500 disabled:bg-transparent transition-colors" title="Save changes">
                                {isRenaming ? <LoadingSpinner className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                            </button>
                            <button onClick={onRenameCancel} disabled={isRenaming} className="p-2 rounded-md text-red-400/80 hover:bg-red-500/20 hover:text-red-300 disabled:text-slate-500 disabled:bg-transparent transition-colors" title="Cancel">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="font-bold text-lg text-silver-light truncate pr-8" title={resume.Name}>{resume.Name}</h3>
                        <div className="text-sm text-silver-medium mt-2 mb-2 leading-relaxed flex-grow flex items-center pr-8">
                            {activeTab === 'default' ? (
                                resume.HasJson && agent2Content?.title_impression ? (
                                    <button
                                        onClick={() => onViewAnalysis(agent2Content)}
                                        className="text-left w-full p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <span className="font-semibold text-primary block mb-1">AI Analysis Available</span>
                                        <span className="text-silver-light" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{agent2Content.title_impression}</span>
                                    </button>
                                ) : resume.HasJson ? (
                                    <span className="italic px-3">Processing... AI analysis will be available soon.</span>
                                ) : (
                                    <span className="italic px-3">This resume has not been analyzed by AI.</span>
                                )
                            ) : (
                                <span className="italic px-3">Curated resume. View analysis in the Request Dashboard.</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-auto w-full">
                            {formattedDate ? (
                                <p className="text-sm text-silver-medium">Uploaded on: {formattedDate}</p>
                            ) : <div />}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => onDownloadClick(resume)}
                                    disabled={isDownloading === resume.ResumeId}
                                    className="p-2 rounded-md text-silver-medium hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait" title="Download">
                                    {isDownloading === resume.ResumeId ? <LoadingSpinner className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />}
                                </button>
                                {activeTab === 'default' && (
                                    <button
                                        onClick={() => onReuploadClick(resume)}
                                        className="p-2 rounded-md text-silver-medium hover:bg-slate-800 hover:text-white transition-colors" title="Re-upload">
                                        <UploadIcon className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => onRenameClick(resume)} className="p-2 rounded-md text-silver-medium hover:bg-slate-800 hover:text-white transition-colors" title="Rename">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button className="p-2 rounded-md text-red-400/70 hover:bg-red-500/20 hover:text-red-300 transition-colors" title="Delete">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="absolute top-5 right-5">
                <StatusDot hasJson={resume.HasJson} tab={activeTab} />
            </div>
        </li>
    );
}

const ResumeCenter: React.FC<ResumeCenterProps> = ({ isOpen, onClose, apiUrl, userId, onUploadClick, setHasNewRequestNotification }) => {
  const [activeTab, setActiveTab] = useState<Tab>('default');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reuploadTarget, setReuploadTarget] = useState<Resume | null>(null);
  const [renamingState, setRenamingState] = useState<{ id: string; name: string } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [viewingAnalysis, setViewingAnalysis] = useState<Agent2Content | null>(null);


  const loadResumes = useCallback(async (tab: Tab) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedResumes = await listResumes(apiUrl, userId, tab);
      setResumes(fetchedResumes);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : `Failed to load ${tab} resumes.`;
      setError(errorMessage);
      setResumes([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, userId]);

  useEffect(() => {
    if (isOpen) {
      loadResumes(activeTab);
    } else {
      // Reset state when closed
      setTimeout(() => {
        setActiveTab('default');
        setResumes([]);
        setError(null);
        setRenamingState(null);
        setViewingAnalysis(null);
      }, 300); // delay to allow for closing animation
    }
  }, [isOpen, activeTab, loadResumes]);

  
  const handleTabClick = (tab: Tab) => {
    if (tab !== activeTab) {
        setRenamingState(null); // Cancel rename on tab switch
        setActiveTab(tab);
    }
  };
  
  const handleReuploadClick = (resume: Resume) => {
    setReuploadTarget(resume);
  };

  const handleReuploadSuccess = () => {
    setReuploadTarget(null); // Close modal
    loadResumes(activeTab); // Refresh list
  };

  const handleRenameClick = (resume: Resume) => {
    setRenamingState({ id: resume.ResumeId, name: resume.Name });
  };
  
  const handleRenameCancel = () => {
    setRenamingState(null);
    setError(null);
  };

  const handleRenameSubmit = async () => {
    if (!renamingState || !renamingState.name.trim()) {
        setError("Resume name cannot be empty.");
        return;
    }

    let finalName = renamingState.name.trim();
    if (!finalName.toLowerCase().endsWith('.docx')) {
      finalName += '.docx';
    }

    setIsRenaming(true);
    setError(null);
    const result = await renameResume(apiUrl, renamingState.id, finalName);
    setIsRenaming(false);

    if (result.success) {
      setRenamingState(null);
      await loadResumes(activeTab);
    } else {
      setError(result.error || 'An unexpected error occurred during rename.');
    }
  };

  const handleDownloadClick = async (resume: Resume) => {
    setIsDownloading(resume.ResumeId);
    setError(null);
    const result = await downloadResume(apiUrl, resume.ResumeId, resume.Name);
    setIsDownloading(null);

    if (!result.success) {
      setError(result.error || 'Failed to download resume.');
    }
  };


  const panelClasses = `
    fixed inset-x-4 bottom-0 top-[5rem] z-40 bg-slate-950/95 backdrop-blur-sm
    transform transition-transform duration-500 ease-in-out
    rounded-t-2xl border-t border-x border-slate-800 shadow-2xl shadow-black/50
    ${isOpen ? 'translate-y-0' : 'translate-y-[110%]'}
  `;
  const backdropClasses = `
    fixed inset-0 top-[4.5rem] z-30 bg-black/60 transition-opacity duration-500 ease-in-out
    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `;

  return (
    <>
      <div className={backdropClasses} onClick={onClose} aria-hidden="true"></div>
      <div className={panelClasses} role="dialog" aria-modal="true" aria-labelledby="resume-center-title">
        <div className="h-full flex flex-col">
            {/* Close Handle */}
            <div className="w-full text-center py-2 flex-shrink-0">
                <button
                    onClick={onClose}
                    className="inline-flex items-center justify-center w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-silver-medium hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Close Resume Center"
                >
                    <ChevronDownIcon className="w-5 h-5" />
                </button>
            </div>
            {/* Header */}
            <header className="flex items-center justify-between px-4 pb-4 border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <ResumeCenterIcon className="w-7 h-7 text-primary"/>
                    <h2 id="resume-center-title" className="text-xl font-bold text-silver-light">Resume Center</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onUploadClick}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-silver-light hover:text-white rounded-lg transition-all duration-200"
                        aria-label="Upload a new resume"
                    >
                        <UploadIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Upload</span>
                    </button>
                </div>
            </header>
            
            {/* Tabs */}
            <nav className="flex items-center p-2 gap-2 border-b border-slate-800 flex-shrink-0">
                <button 
                    onClick={() => handleTabClick('default')}
                    role="tab"
                    aria-selected={activeTab === 'default'}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'default' ? 'bg-primary/20 text-primary' : 'text-silver-medium hover:bg-slate-800'}`}
                >
                    Default Resumes
                </button>
                <button 
                    onClick={() => handleTabClick('curated')}
                    role="tab"
                    aria-selected={activeTab === 'curated'}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'curated' ? 'bg-primary/20 text-primary' : 'text-silver-medium hover:bg-slate-800'}`}
                >
                    Curated Resumes
                </button>
            </nav>
            
            {/* Content */}
            <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                {isLoading && (
                    <div className="flex justify-center items-center h-full pt-16">
                        <LoadingSpinner className="w-8 h-8 text-primary"/>
                    </div>
                )}
                
                {error && (
                    <div className="p-4 my-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && (
                    resumes.length > 0 ? (
                        <ul className="space-y-4">
                            {resumes.map(resume => (
                                <ResumeItem
                                    key={resume.ResumeId}
                                    resume={resume}
                                    activeTab={activeTab}
                                    renamingState={renamingState}
                                    isRenaming={isRenaming}
                                    isDownloading={isDownloading}
                                    onRenameClick={handleRenameClick}
                                    onRenameCancel={handleRenameCancel}
                                    onRenameSubmit={handleRenameSubmit}
                                    setRenamingState={setRenamingState}
                                    onDownloadClick={handleDownloadClick}
                                    onReuploadClick={handleReuploadClick}
                                    onViewAnalysis={setViewingAnalysis}
                                />
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-silver-medium">No {activeTab} resumes found.</p>
                        </div>
                    )
                )}
            </main>
        </div>
      </div>
      {viewingAnalysis && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewingAnalysis(null)}>
            <div 
                className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-700" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-800 flex-shrink-0">
                    <h3 className="text-xl font-bold text-primary">Resume Analysis</h3>
                    <button onClick={() => setViewingAnalysis(null)} className="p-1.5 rounded-full hover:bg-slate-700 text-silver-medium transition-colors" aria-label="Close analysis">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    <Agent2Display details={viewingAnalysis} />
                </main>
            </div>
        </div>
      )}
      <UploadResumeModal
        isOpen={!!reuploadTarget}
        onClose={() => setReuploadTarget(null)}
        onUploadSuccess={handleReuploadSuccess}
        apiUrl={apiUrl}
        userId={userId}
        resumeToUpdate={reuploadTarget}
        setHasNewRequestNotification={setHasNewRequestNotification}
      />
    </>
  );
};

export default ResumeCenter;