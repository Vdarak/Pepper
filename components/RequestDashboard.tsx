


import React, { useState, useCallback, useEffect, Fragment, useMemo, useRef } from 'react';
import { fetchUserRequests, fetchRequestState, approveCurationStep } from '../services/requestService';
import { downloadResume } from '../services/resumeService';
import { UserRequest, AllAgentsContent, Agent2Content, Agent3Content, Agent4Content, Agent5Content, Agent4SectionFeedback } from '../types';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, LoadingSpinner, DocumentTextIcon, SparklesIcon, PencilIcon, XIcon, DownloadIcon, CopyIcon } from './icons';
import { Agent2Display, Agent5Display } from './AgentDisplays';

const N_ENTRIES_PER_PAGE = 10;

const safeJsonParse = (jsonString: string | null | undefined) => {
    if (!jsonString || jsonString === 'None') {
        return null;
    }
    try {
        if (typeof jsonString === 'object') return jsonString;
        return JSON.parse(jsonString);
    } catch (e) {
        console.error(`Failed to parse JSON:`, jsonString, e);
        return { raw: jsonString }; // Return raw string in a known format on error
    }
};

// --- Sub-components for Curation Pipeline ---

const Agent3Display: React.FC<{ details: Agent3Content }> = ({ details }) => (
    <div>
        <h4 className="text-lg font-semibold text-silver-light mb-4">Based on the job description, these are the suggestions from a Recruiter’s POV and ATS.</h4>
        <div className="space-y-8">
            <div>
                <h4 className="text-sm font-semibold text-silver-medium uppercase tracking-wider mb-4 text-center md:text-left">Recruiter Priorities</h4>
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Must Haves */}
                    <div className="md:w-1/2">
                        <h5 className="font-bold text-lg text-silver-light mb-2">Must-Haves</h5>
                        <ul className="space-y-1.5 pl-5 list-disc text-silver-light">
                            {details.recruiter.must_haves.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    {/* Good to Haves */}
                    <div className="md:w-1/2">
                        <h5 className="font-bold text-lg text-silver-medium mb-2">Good-to-Haves</h5>
                        <ul className="space-y-1.5 pl-5 list-disc text-silver-medium">
                            {details.recruiter.good_to_haves.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="pt-6 border-t border-slate-700/50">
                <h4 className="text-sm font-semibold text-silver-medium uppercase tracking-wider mb-3">ATS Keywords</h4>
                <div className="flex flex-wrap gap-2">
                    {details.ats.map((keyword, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-700 text-silver-light text-xs font-medium rounded-full">{keyword}</span>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const InstructionDisplay: React.FC<{ instruction: any }> = ({ instruction }) => {
    // If it's a string, render it. This is the base case.
    if (typeof instruction === 'string') {
        return <>{instruction}</>;
    }

    // Handle arrays by mapping over them and recursing
    if (Array.isArray(instruction)) {
        return (
            <ul className="space-y-1">
                {instruction.map((item, index) => (
                    <li key={index}>
                        <InstructionDisplay instruction={item} />
                    </li>
                ))}
            </ul>
        );
    }

    // If it is not a string or array, it must be an object to be processed further.
    if (typeof instruction !== 'object' || !instruction) {
        // This handles null, undefined, number, boolean, etc.
        // We'll render nothing for these unexpected cases.
        return null;
    }

    // Now we know instruction is an object.
    // If it's a suggestion object, render it with styling and recurse on the suggestion.
    if ('suggestion' in instruction && 'type' in instruction) {
        return (
            <div>
                <span className={`font-bold uppercase text-xs mr-2 ${instruction.type === 'remove' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {String(instruction.type) || 'Suggestion'}
                </span>
                <span>
                    <InstructionDisplay instruction={instruction.suggestion} />
                </span>
            </div>
        );
    }
    
    // For any other kind of object, stringify it to be safe.
    return <pre className="text-xs whitespace-pre-wrap font-mono bg-slate-950 p-2 rounded">{JSON.stringify(instruction, null, 2)}</pre>;
};


const Agent4Display: React.FC<{ details: Agent4Content | { raw: string } }> = ({ details }) => {
    if ('raw' in details && typeof details.raw === 'string') {
        return <div className="p-4"><pre className="text-xs whitespace-pre-wrap font-mono bg-slate-950 p-2 rounded">{details.raw}</pre></div>;
    }
    return (
        <div>
            <h4 className="text-lg font-semibold text-silver-light mb-4">Based on Agent 2 and Agent 3 feedback, here are the suggested changes for tailoring your resume.</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Object.entries(details).map(([section, feedback]) => (
                    <div key={section} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 flex flex-col">
                        <div className="flex items-center justify-between gap-3">
                            <h5 className="font-bold text-lg text-silver-light">{section.replace(/_/g, ' ').toUpperCase()}</h5>
                            
                            {feedback.needs_editing 
                              ? (
                                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300">
                                    <PencilIcon className="w-3 h-3" />
                                    Needs Editing
                                  </span>
                              )
                              : (
                                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300">
                                    <CheckIcon className="w-3.5 h-3.5" />
                                    Looks Good
                                  </span>
                              )
                            }
                        </div>
                        
                        <p className="mt-2 text-silver-medium flex-grow">
                            {feedback.reason}
                        </p>

                        {feedback.needs_editing && Array.isArray(feedback.edit_instructions) && feedback.edit_instructions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                <h6 className="text-sm font-semibold text-silver-medium uppercase tracking-wider mb-2">Suggestions:</h6>
                                <div className="border-l-2 border-slate-600 pl-4">
                                    <ul className="space-y-2.5 text-silver-light">
                                        {feedback.edit_instructions.map((inst, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="text-primary mr-2 mt-1">&#8227;</span>
                                                <div className="flex-1"><InstructionDisplay instruction={inst} /></div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};


const CurationPipelineDisplay: React.FC<{
    initialAgentData: AllAgentsContent;
    requestId: string;
    apiUrl: string;
    onRefresh: () => void;
}> = ({ initialAgentData, requestId, apiUrl, onRefresh }) => {
    const [activeAgentKey, setActiveAgentKey] = useState<string | null>(null);
    const [isApproving, setIsApproving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [editedAgent4Json, setEditedAgent4Json] = useState<string>('');
    const [customInstructions, setCustomInstructions] = useState<string>('');
    const [isInstructionJsonCopied, setIsInstructionJsonCopied] = useState(false);
    const populatedForRequestId = useRef<string | null>(null);

    const handleCopyInstructionJson = () => {
        if (isInstructionJsonCopied) return;
        navigator.clipboard.writeText(editedAgent4Json).then(() => {
            setIsInstructionJsonCopied(true);
            setTimeout(() => setIsInstructionJsonCopied(false), 2000);
        }).catch(err => console.error('Failed to copy instructions JSON: ', err));
    };

    const agentData = useMemo(() => ({
        Agent2: safeJsonParse(initialAgentData.Agent2),
        Agent3: safeJsonParse(initialAgentData.Agent3),
        Agent4: safeJsonParse(initialAgentData.Agent4),
        Agent5: safeJsonParse(initialAgentData.Agent5),
    }), [initialAgentData]);
    
    useEffect(() => {
        // When switching to a new request, or on first load, reset the editable fields.
        // This ensures the user sees the latest data from the server.
        // This is a trade-off: it will overwrite user edits if they hit "Refresh",
        // but it guarantees the data they are editing is not stale.
        if (requestId !== populatedForRequestId.current) {
            setEditedAgent4Json(agentData.Agent4 ? JSON.stringify(agentData.Agent4, null, 2) : '');
            setCustomInstructions('');
            populatedForRequestId.current = requestId;
        } else {
             setEditedAgent4Json(agentData.Agent4 ? JSON.stringify(agentData.Agent4, null, 2) : '');
        }
    }, [agentData.Agent4, requestId]);


    const isReadyForApproval = !!agentData.Agent4 && !agentData.Agent5;
    const isApproved = !!agentData.Agent5;

    const agentTitles: Record<string, string> = {
        Agent2: 'Resume Feedback',
        Agent3: 'Recruiter POV',
        Agent4: 'Resume Coach',
        Approval: 'Approve?',
        Agent5: 'Tailor/Darji',
    };

    const handleApprove = async () => {
        setIsApproving(true);
        setError(null);
        try {
            const result = await approveCurationStep(apiUrl, requestId, editedAgent4Json, customInstructions);
            if (!result.success) throw new Error(result.error || 'Approval failed.');
            onRefresh(); 
        } catch (e: any) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during approval.');
        } finally {
            setIsApproving(false);
        }
    };
    
    const handleDownload = async () => {
        const agent5Data = agentData.Agent5 as Agent5Content | null;
        if (!agent5Data) return;
        setIsDownloading(true);
        setError(null);
        try {
            const result = await downloadResume(apiUrl, agent5Data.resume_id, agent5Data.file_name);
            if (!result.success) throw new Error(result.error || 'Download failed.');
        } catch (e: any) {
             setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsDownloading(false);
        }
    }

    const checkpoints = ['Agent2', 'Agent3', 'Agent4', 'Approval', 'Agent5'];
    
    let progressWidth = '0%';
    if (agentData.Agent5) progressWidth = '100%';
    else if (isApproved) progressWidth = '87.5%'; // Mid-point for post-approval
    else if (agentData.Agent4) progressWidth = '75%';
    else if (agentData.Agent3) progressWidth = '50%';
    else if (agentData.Agent2) progressWidth = '25%';

    return (
        <div className="p-4 bg-slate-900/70 rounded-lg border border-slate-800 space-y-4">
            <div className="relative pt-2 px-4">
                {/* Pipeline Track */}
                <div className="absolute bottom-[1.5rem] left-8 right-8 h-0.5 bg-slate-700 -translate-y-1/2 -z-10"></div>
                {/* Progress Track */}
                <div 
                    className="absolute bottom-[1.5rem] left-8 h-0.5 bg-primary shadow-[0_0_8px_theme(colors.primary)] transition-all duration-1000 ease-in-out -translate-y-1/2 -z-10"
                    style={{ width: `calc(${progressWidth} - 4rem)` }}
                ></div>
                
                {/* Checkpoints */}
                <div className="relative w-full flex justify-between items-end">
                    {checkpoints.map((key) => {
                        const isComplete = key === 'Approval' ? !!agentData.Agent4 : !!agentData[key as keyof typeof agentData];
                        const isActive = activeAgentKey === key;
                        const title = agentTitles[key] || '';

                        const checkpointContent = () => {
                             if (key === 'Approval') {
                                return (
                                    <div className="relative z-10 w-12 h-12 flex items-center justify-center">
                                        <div className="group relative flex items-center justify-center filter-goo">
                                            {/* Approve button (slides left) */}
                                            <button
                                                onClick={handleApprove}
                                                disabled={isApproving || !isReadyForApproval}
                                                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center 
                                                            bg-green-600/80 backdrop-blur-sm border border-green-500/50 text-white rounded-full
                                                            transition-all duration-300 ease-out opacity-0
                                                            ${isReadyForApproval ? 'group-hover:opacity-100 group-hover:left-[calc(50%-2.5rem)]' : 'pointer-events-none'}`}
                                                style={{ willChange: 'left, transform, opacity' }}
                                                aria-label="Approve"
                                            >
                                                {isApproving ? <LoadingSpinner className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                                            </button>

                                            {/* Reject button (slides right) */}
                                            <button
                                                disabled={!isReadyForApproval || isApproving}
                                                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center 
                                                            bg-red-600/80 backdrop-blur-sm border border-red-500/50 text-white rounded-full
                                                            transition-all duration-300 ease-out opacity-0
                                                            ${isReadyForApproval ? 'group-hover:opacity-100 group-hover:left-[calc(50%+2.5rem)]' : 'pointer-events-none'}`}
                                                style={{ willChange: 'left, transform, opacity' }}
                                                aria-label="Reject"
                                            >
                                                <XIcon className="w-4 h-4" />
                                            </button>
                                            
                                            {/* Central Checkpoint Icon - always visible */}
                                            <div 
                                                className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full border-2 
                                                            transition-all duration-200 
                                                            ${isReadyForApproval ? 'bg-slate-900 border-slate-700 animate-pulse-primary group-hover:bg-slate-700 cursor-pointer' : ''}
                                                            ${isApproved ? 'bg-primary border-primary cursor-default' : ''}
                                                            ${!isReadyForApproval && !isApproved ? 'bg-slate-800 border-slate-700 cursor-not-allowed' : ''}`}
                                            >
                                                <CheckIcon className={`w-4 h-4 transition-colors ${
                                                    isApproved ? 'text-white' : 'text-slate-500'
                                                }`} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            
                            const agentNumber = parseInt(key.replace('Agent', ''), 10);
                            const agentLabel = `A${agentNumber}`;

                            return (
                                <button
                                    onClick={() => setActiveAgentKey(prev => prev === key ? null : key)}
                                    disabled={!isComplete}
                                    style={{ willChange: 'transform' }}
                                    className={`relative z-10 w-12 h-12 flex items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-4 ${
                                        isActive
                                        ? 'bg-primary border-teal-300 text-white scale-110 shadow-lg shadow-primary/30 ring-primary/30'
                                        : isComplete
                                        ? 'bg-slate-700 border-slate-600 text-silver-light hover:bg-slate-600 hover:border-slate-500'
                                        : 'bg-slate-800 border-slate-700 text-silver-medium'
                                    }`}
                                >
                                    {agentLabel}
                                </button>
                            );
                        };

                        return (
                            <div key={key} className="flex flex-col items-center gap-2 w-24 text-center">
                                <div className="text-xs font-semibold text-silver-medium h-8 flex items-center justify-center">
                                    {title}
                                </div>
                                {checkpointContent()}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Details Popup */}
            {activeAgentKey && (
                <div className="relative mt-2">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-h-[48rem] overflow-y-auto">
                        {activeAgentKey === 'Agent2' && agentData.Agent2 && <Agent2Display details={agentData.Agent2 as Agent2Content} />}
                        {activeAgentKey === 'Agent3' && agentData.Agent3 && <Agent3Display details={agentData.Agent3 as Agent3Content} />}
                        {activeAgentKey === 'Agent4' && agentData.Agent4 && (
                            <>
                                <Agent4Display details={agentData.Agent4 as Agent4Content | { raw: string }} />
                                <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
                                    <h4 className="text-lg font-bold text-silver-light">
                                        Fine-tune Curation (Optional)
                                    </h4>
                                    <p className="text-sm text-silver-medium">
                                        You can directly edit the JSON instructions for the next agent or provide additional text-based guidance before approving.
                                    </p>
                                    <div>
                                        <label htmlFor="agent4-json-editor" className="block text-sm font-medium text-silver-light mb-2">
                                            JSON Edit Instructions
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                id="agent4-json-editor"
                                                value={editedAgent4Json}
                                                onChange={(e) => setEditedAgent4Json(e.target.value)}
                                                className="w-full h-80 bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-sm text-green-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                                spellCheck="false"
                                            />
                                            <button
                                                onClick={handleCopyInstructionJson}
                                                disabled={isInstructionJsonCopied}
                                                title={isInstructionJsonCopied ? "Copied!" : "Copy JSON Instructions"}
                                                aria-label="Copy JSON Instructions"
                                                className="absolute top-3 right-3 p-1.5 bg-slate-800/60 hover:bg-slate-700/80 backdrop-blur-sm rounded-md transition-colors text-silver-light disabled:cursor-default"
                                            >
                                                {isInstructionJsonCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="custom-instructions" className="block text-sm font-medium text-silver-light mb-2">
                                            Additional Custom Instructions
                                        </label>
                                        <textarea
                                            id="custom-instructions"
                                            rows={5}
                                            value={customInstructions}
                                            onChange={(e) => setCustomInstructions(e.target.value)}
                                            placeholder="e.g., 'Emphasize the project management skills from the Zeta project.' or 'Make the tone more aggressive.'"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {activeAgentKey === 'Agent5' && agentData.Agent5 && (
                           <Agent5Display details={agentData.Agent5 as Agent5Content} />
                        )}
                         {!agentData[activeAgentKey as keyof typeof agentData] && activeAgentKey !== 'Approval' &&(
                            <div className="p-4 text-center italic text-silver-medium">Details are not available for this agent.</div>
                         )}
                    </div>
                </div>
            )}
            {error && <div className="text-red-400 text-sm p-2 bg-red-500/10 rounded-md">Error: {error}</div>}

            {/* Final Download */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleDownload}
                    disabled={!agentData.Agent5 || isDownloading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors shadow-md disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    {isDownloading ? <LoadingSpinner className="w-5 h-5"/> : <DownloadIcon className="w-5 h-5"/>}
                    Download Curated Resume
                </button>
            </div>
        </div>
    );
};


const getTaskName = (endpoint: string): string => {
  if (endpoint.includes('tailor') || endpoint.includes('curate')) {
    return 'Resume Tailoring';
  }
  if (endpoint.includes('parse') || endpoint.includes('upload')) {
    return 'Resume Analysis';
  }
  return endpoint;
};

const StatusBadge: React.FC<{ status: UserRequest['status'] }> = ({ status }) => {
  if (status === 'Finished') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 shadow-[0_0_10px_rgba(74,222,128,0.5)]">
        <CheckIcon className="w-3.5 h-3.5" />
        Finished
      </span>
    );
  }
  
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300">
        Pending
      </span>
    );
  }

  const queueNumber = Number(status);
  if (isNaN(queueNumber)) return null;

  let colorClasses = '';
  if (queueNumber <= 10) {
    colorClasses = 'bg-yellow-500/20 text-yellow-300';
  } else if (queueNumber <= 20) {
    colorClasses = 'bg-orange-500/20 text-orange-300';
  } else {
    colorClasses = 'bg-red-500/20 text-red-300';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
      Queued - #{queueNumber}
    </span>
  );
};

const RequestDetailsDisplay: React.FC<{
    details: Agent2Content | null;
}> = ({ details }) => {
    if (!details) {
        return <div className="p-4 text-silver-medium text-center">No details available for this request.</div>;
    }
    const content = typeof details === 'object' && Object.keys(details).length > 0 ? details : null;
    if (!content) {
        return <div className="p-4 text-silver-medium text-center">Could not parse details for this request.</div>;
    }
    return <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-800"><Agent2Display details={content} /></div>;
};

interface RequestDashboardProps {
  apiUrl: string;
  userId: string;
  hasNewRequestNotification: boolean;
  onDashboardOpen: () => void;
}

const RequestDashboard: React.FC<RequestDashboardProps> = ({ apiUrl, userId, hasNewRequestNotification, onDashboardOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState<AllAgentsContent | null>(null);

  const loadRequests = useCallback(async (page: number) => {
    if (!apiUrl) {
      setError("Please configure your API URL in settings to view requests.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setExpandedRequestId(null);
    try {
      const data = await fetchUserRequests(apiUrl, userId, page);
      setRequests(data);
      setCurrentPage(page);
      setHasNextPage(data.length === N_ENTRIES_PER_PAGE);
    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : 'Could not fetch requests.';
      setError(errorMessage);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, userId]);

  useEffect(() => {
    if (isOpen && apiUrl && requests.length === 0 && !error) {
      loadRequests(1);
    }
  }, [isOpen, apiUrl, requests.length, error, loadRequests]);

  const handleRowClick = async (req: UserRequest, forceOpen = false) => {
      if (expandedRequestId === req.RequestId && !forceOpen) {
          setExpandedRequestId(null);
          return;
      }
      
      setExpandedRequestId(req.RequestId);
      setDetailsLoading(true);
      setDetailsError(null);
      setRequestDetails(null);

      try {
          const result = await fetchRequestState(apiUrl, req.RequestId);
          setRequestDetails(result.agents);
      } catch (e: any) {
          const errorMessage = e instanceof Error ? e.message : 'Could not fetch request details.';
          setDetailsError(errorMessage);
      } finally {
          setDetailsLoading(false);
      }
  };
  
  const handleRefresh = () => {
    if(expandedRequestId) {
        const currentReq = requests.find(r => r.RequestId === expandedRequestId);
        if(currentReq) handleRowClick(currentReq, true);
    } else {
        loadRequests(currentPage);
    }
  }

  const handleToggle = () => {
    if (!isOpen) {
        onDashboardOpen();
    }
    setIsOpen(prev => !prev);
  };
  
  const panelClasses = `fixed inset-x-4 top-[8rem] sm:top-[7.5rem] bottom-4 z-40 bg-slate-950/50 backdrop-blur-sm transform transition-all duration-500 ease-in-out rounded-b-2xl border-b border-x border-slate-800 shadow-2xl shadow-black/50 flex flex-col ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-[110%] opacity-0 pointer-events-none'}`;
  const backdropClasses = `fixed inset-0 top-[4.5rem] z-30 bg-black/60 transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`;

  return (
    <>
      <div className="sticky top-[4.25rem] z-20 py-1">
        <div className="flex justify-center">
          <button onClick={handleToggle} className="relative flex gap-1 flex-col items-center px-4 py-2 bg-primary/20 backdrop-blur-lg border border-white/10 hover:bg-primary/30 rounded-2xl shadow-lg shadow-primary/20 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 ring-offset-slate-950 ring-offset-2 focus:ring-primary" aria-expanded={isOpen} aria-controls="request-dashboard-panel" aria-label={isOpen ? 'Close Request Dashboard' : 'Open Request Dashboard'}>
            {hasNewRequestNotification && (
              <span id="request-notification-badge" className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-dot-bounce"></span>
            )}
            <span className="text-xs font-semibold text-silver-light">Request Dashboard</span>
            <ChevronDownIcon className={`w-4 h-4 text-cyan-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} ${!isOpen && !hasNewRequestNotification ? 'animate-pull-hint' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className={backdropClasses} onClick={handleToggle} aria-hidden="true"></div>

      <div id="request-dashboard-panel" className={panelClasses} role="dialog" aria-modal="true" aria-labelledby="request-dashboard-title">
        <header className="flex justify-between items-center p-4 md:p-6 border-b border-slate-800 flex-shrink-0">
          <h3 id="request-dashboard-title" className="text-xl font-bold text-primary">Request Dashboard</h3>
          <button onClick={handleRefresh} disabled={isLoading} className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50">{isLoading ? 'Refreshing...' : 'Refresh'}</button>
        </header>
        
        <main className="flex-grow p-4 md:p-6 overflow-y-auto">
          {error && <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-md">{error}</div>}
          {isLoading && requests.length === 0 ? (
             <div className="flex justify-center items-center h-full"><LoadingSpinner className="w-8 h-8 text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-slate-700 sticky top-0 bg-slate-950/95">
                  <tr>
                    <th className="p-3 font-semibold text-silver-light w-1/4">Request ID</th>
                    <th className="p-3 font-semibold text-silver-light">Task</th>
                    <th className="p-3 font-semibold text-silver-light">Status</th>
                    <th className="p-3 font-semibold text-silver-light">Resume Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {requests.length > 0 ? requests.map(req => {
                    const isExpanded = expandedRequestId === req.RequestId;
                    return (
                        <Fragment key={req.RequestId}>
                            <tr className={`transition-colors cursor-pointer hover:bg-slate-800/50 ${isExpanded ? 'bg-slate-800/50' : ''}`} onClick={() => handleRowClick(req)} role="button" aria-expanded={isExpanded}>
                              <td className="p-3 text-silver-light font-mono text-xs max-w-0 truncate" title={req.RequestId}>{req.RequestId}</td>
                              <td className="p-3 text-silver-medium">{getTaskName(req.endpoint)}</td>
                              <td className="p-3"><StatusBadge status={req.status} /></td>
                              <td className="p-3 text-silver-light font-medium">{req.resumeName ?? <span className="text-silver-medium italic">N/A</span>}</td>
                            </tr>
                            {isExpanded && (
                                <tr>
                                    <td colSpan={4} className="p-2 pt-0">
                                        {detailsLoading && <div className="flex justify-center items-center p-8"><LoadingSpinner className="w-6 h-6 text-primary" /></div>}
                                        {detailsError && <div className="p-4 bg-red-500/10 text-red-300 rounded-lg m-2">{detailsError}</div>}
                                        {requestDetails && !detailsLoading && !detailsError && (
                                            getTaskName(req.endpoint) === 'Resume Tailoring' ? (
                                                <CurationPipelineDisplay
                                                    requestId={req.RequestId}
                                                    apiUrl={apiUrl}
                                                    initialAgentData={requestDetails}
                                                    onRefresh={() => handleRowClick(req, true)}
                                                />
                                            ) : (
                                                <RequestDetailsDisplay
                                                    details={safeJsonParse(requestDetails.Agent2) as Agent2Content | null}
                                                />
                                            )
                                        )}
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    )
                  }) : (
                     <tr><td colSpan={4} className="text-center p-8 text-silver-medium">{!error ? 'No requests found.' : ''}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
        
        <footer className="p-4 border-t border-slate-800 flex-shrink-0 flex flex-col">
          <div className="flex justify-between items-center">
            <span className="text-sm text-silver-medium">Page {currentPage}</span>
            <div className="flex gap-2">
              <button onClick={() => loadRequests(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeftIcon className="w-4 h-4" /> Prev</button>
              <button onClick={() => loadRequests(currentPage + 1)} disabled={!hasNextPage || isLoading} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Next <ChevronRightIcon className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex justify-center pt-3">
              <button
                  onClick={handleToggle}
                  className="w-16 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 text-silver-medium hover:text-white transition-all focus:outline-none focus:ring-2 ring-offset-slate-950 ring-offset-2 focus:ring-primary"
                  aria-label="Close Request Dashboard"
              >
                  <ChevronUpIcon className="w-5 h-5" />
              </button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default RequestDashboard;