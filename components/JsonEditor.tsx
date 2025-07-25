



import React, { useState, useEffect, useRef } from 'react';
import { JobDetails, Resume } from '../types';
import { listResumes, uploadResume, curateResume } from '../services/resumeService';
import { truncateFileName } from '../services/apiUtils';
import { CopyIcon, CheckIcon, LoadingSpinner, DocumentTextIcon, UploadCloudIcon, XIcon } from './icons';

interface JsonEditorProps {
  jsonString: string;
  setJsonString: (value: string) => void;
  processingStatus: { message: string; type: 'success' | 'error' } | null;
  setProcessingStatus: (status: { message: string; type: 'success' | 'error' } | null) => void;
  onCurationSuccess: (e: React.MouseEvent<HTMLButtonElement>) => void;
  apiUrl: string;
  userId: string;
}

const EmbeddedUploader: React.FC<{
  onFileSelect: (file: File) => void;
  onCancel: () => void;
  currentFile: File | null;
}> = ({ onFileSelect, onCancel, currentFile }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File | null) => {
        if (selectedFile) {
            if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || selectedFile.name.toLowerCase().endsWith('.docx')) {
                onFileSelect(selectedFile);
            } else {
                // This component can't set processingStatus, but the parent will handle the error on submit.
                console.error('Invalid file type.');
            }
        }
    };

    const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    if (currentFile) {
        return (
             <div className="bg-slate-800 p-3 rounded-lg flex items-center justify-between transition-all">
                <div className="flex items-center gap-3 overflow-hidden">
                    <DocumentTextIcon className="w-7 h-7 text-primary flex-shrink-0" />
                    <div className="overflow-hidden">
                       <p className="font-medium text-silver-light truncate" title={currentFile.name}>{currentFile.name}</p>
                       <p className="text-sm text-silver-medium">{Math.round(currentFile.size / 1024)} KB</p>
                    </div>
                </div>
                <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-slate-700 text-silver-medium transition-colors flex-shrink-0" aria-label="Cancel upload">
                    <XIcon className="w-5 h-5"/>
                </button>
            </div>
        )
    }

    return (
        <div
            onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}`}
            role="button"
        >
            <input
                ref={fileInputRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden" onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
            />
            <UploadCloudIcon className="w-10 h-10 text-slate-500 mb-2" />
            <p className="text-silver-light font-semibold">Drag & drop or <span className="text-primary">browse</span> to upload</p>
            <p className="text-xs text-silver-medium mt-1">A new .docx file for this job</p>
        </div>
    );
};


const JsonEditor: React.FC<JsonEditorProps> = ({ jsonString, setJsonString, processingStatus, setProcessingStatus, onCurationSuccess, apiUrl, userId }) => {
  const [hasReferral, setHasReferral] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // New state for resume selection
  const [existingResumes, setExistingResumes] = useState<Resume[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [showUploadUI, setShowUploadUI] = useState(false);
  const [newResumeFile, setNewResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const data = JSON.parse(jsonString);
      setHasReferral(!!data.referral);
    } catch {
      // Ignore parse errors, UI will just be out of sync
    }
  }, [jsonString]);
  
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const resumes = await listResumes(apiUrl, userId, 'default');
        const parsedResumes = resumes.filter(resume => resume.HasJson);
        setExistingResumes(parsedResumes);
      } catch (e) {
        setFetchError(e instanceof Error ? e.message : 'Failed to load resumes.');
      }
    };
    fetchResumes();
  }, [apiUrl, userId]);
  
  const handleToggleUploadUI = () => {
    setShowUploadUI(prev => !prev);
    if (!showUploadUI) { // If turning on
        setSelectedResumeId(null);
    } else { // If turning off
        setNewResumeFile(null);
    }
  };

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(prev => (prev === resumeId ? null : resumeId));
    setShowUploadUI(false);
    setNewResumeFile(null);
  };
  
  const handleFileSelected = (file: File) => {
    setNewResumeFile(file);
    // Don't hide the UI, show the selected file instead
  };

  const handleReferralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setHasReferral(isChecked);

    try {
      const data: JobDetails = JSON.parse(jsonString);
      data.referral = isChecked;
      const { description, ...rest } = data;
      const reorderedData = { ...rest, description };
      setJsonString(JSON.stringify(reorderedData, null, 2));
    } catch (err) {
      console.error("Failed to update referral status in JSON:", err);
    }
  };

  const handleCopy = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(jsonString).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => console.error('Failed to copy text: ', err));
  };
  
  const handleCurate = async (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsSubmitting(true);
      setProcessingStatus({ message: 'Starting curation process...', type: 'success' });

      let jobData: JobDetails;
      try {
        jobData = JSON.parse(jsonString);
      } catch (parseErr) {
        setProcessingStatus({ message: 'The JSON is invalid. Please correct it before processing.', type: 'error' });
        setIsSubmitting(false);
        return;
      }
      
      let finalResumeId = selectedResumeId;

      try {
        if (newResumeFile) {
            setProcessingStatus({ message: 'Uploading new resume...', type: 'success' });
            const fileName = truncateFileName(newResumeFile.name);
            
            const uploadResult = await uploadResume(apiUrl, userId, newResumeFile, fileName, null);
            if (!uploadResult.success || !uploadResult.resume_id) {
                throw new Error(uploadResult.error || 'Failed to upload new resume.');
            }
            finalResumeId = uploadResult.resume_id;
        }

        if (!finalResumeId) {
            throw new Error('No resume has been selected or uploaded.');
        }

        setProcessingStatus({ message: 'Sending job and resume for curation...', type: 'success' });
        const curateResult = await curateResume(apiUrl, userId, finalResumeId, jobData);
        if (!curateResult.success) {
            throw new Error(curateResult.error || 'The curation request failed.');
        }
        
        setProcessingStatus({ message: 'Success! Your request has been queued.', type: 'success' });
        onCurationSuccess(e);

      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setProcessingStatus({ message: `Curation Failed: ${errorMessage}`, type: 'error' });
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-700">
      <h3 className="text-xl font-bold text-primary mb-2">Parsed Output</h3>
      <p className="text-silver-medium mb-4">
        Review the parsed JSON. Then, select an existing resume or upload a new one to begin curation.
      </p>
      
      <div className="relative">
        <textarea
          value={jsonString}
          onChange={(e) => setJsonString(e.target.value)}
          className="w-full h-96 bg-slate-950 border border-slate-700 rounded-lg p-4 font-mono text-sm text-green-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
          spellCheck="false"
        />
        <button
            onClick={handleCopy} disabled={isCopied} title={isCopied ? "Copied!" : "Copy JSON"} aria-label="Copy JSON"
            className="absolute top-3 right-3 p-1.5 bg-slate-800/60 hover:bg-slate-700/80 backdrop-blur-sm rounded-md transition-colors text-silver-light disabled:cursor-default"
        >
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
        </button>
      </div>

      <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-6">
        <div>
          <h4 className="text-lg font-bold text-silver-light mb-3">Select Resume to Curate</h4>
          <div className="space-y-3">
             {/* Select from existing */}
            <fieldset disabled={isSubmitting || showUploadUI}>
              <legend className="text-sm font-medium text-silver-medium mb-2">From your existing library</legend>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {existingResumes === null && <LoadingSpinner className="w-5 h-5 text-primary"/>}
                {fetchError && <p className="text-red-400 text-sm">{fetchError}</p>}
                {existingResumes && existingResumes.length === 0 && <p className="text-silver-medium text-sm italic">No AI-reviewed resumes found. New resumes will appear here after processing.</p>}
                {existingResumes && existingResumes.map(resume => (
                  <button
                    key={resume.ResumeId}
                    onClick={() => handleSelectResume(resume.ResumeId)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-md border-2 transition-colors ${selectedResumeId === resume.ResumeId ? 'bg-primary/10 border-primary' : 'bg-slate-800 border-transparent hover:bg-slate-800/50'}`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${selectedResumeId === resume.ResumeId ? 'border-primary bg-primary' : 'border-slate-500'}`}>
                      {selectedResumeId === resume.ResumeId && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <span className="font-medium">{resume.Name}</span>
                  </button>
                ))}
              </div>
            </fieldset>
             {/* OR separator */}
            <div className="flex items-center">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink mx-4 text-xs text-silver-medium">OR</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>
             {/* Upload new */}
            <div className="space-y-2">
                <EmbeddedUploader 
                    onFileSelect={handleFileSelected}
                    onCancel={() => setNewResumeFile(null)}
                    currentFile={newResumeFile}
                />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-slate-800/50 transition-colors">
          <input type="checkbox" checked={hasReferral} onChange={handleReferralChange}
            className="w-5 h-5 rounded bg-slate-900 border-slate-600 text-primary focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900"
          />
          <span className="text-silver-light font-medium select-none">I have a referral for this position (R)</span>
        </label>
      </div>
      
      {processingStatus && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${processingStatus.type === 'error' ? 'bg-red-500/10 text-red-300' : 'bg-green-500/10 text-green-300'}`}>
          {processingStatus.message}
        </div>
      )}

      <div className="mt-6 flex justify-end items-center gap-3">
        <button
          onClick={handleCurate}
          disabled={isSubmitting || (!selectedResumeId && !newResumeFile)}
          className="flex items-center justify-center min-w-[160px] px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors shadow-md disabled:bg-slate-700 disabled:cursor-not-allowed"
        >
           {isSubmitting ? (
              <><LoadingSpinner className="w-5 h-5 mr-2"/> Processing...</>
           ) : (
              'Resume Tailoring'
           )}
        </button>
      </div>
    </div>
  );
};

export default JsonEditor;