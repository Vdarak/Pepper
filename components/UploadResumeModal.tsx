import React, { useState, useCallback, useRef, useEffect } from 'react';
import { uploadResume } from '../services/resumeService';
import { truncateFileName } from '../services/apiUtils';
import { UploadCloudIcon, DocumentTextIcon, XIcon, LoadingSpinner } from './icons';

interface UploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  apiUrl: string;
  userId: string;
  setHasNewRequestNotification: (value: boolean) => void;
  resumeToUpdate?: { ResumeId: string; Name: string } | null;
}

const UploadResumeModal: React.FC<UploadResumeModalProps> = ({ isOpen, onClose, onUploadSuccess, apiUrl, userId, setHasNewRequestNotification, resumeToUpdate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUpdateMode = !!resumeToUpdate;

  const resetState = useCallback(() => {
    setFile(null);
    setResumeName('');
    setIsLoading(false);
    setError(null);
    setSuccessMessage(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (resumeToUpdate) {
        setResumeName(resumeToUpdate.Name);
      }
    } else {
        // Delay reset to allow for closing animation to complete
        const timer = setTimeout(() => {
            resetState();
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [isOpen, resumeToUpdate, resetState]);


  const handleClose = useCallback(() => {
    if (isLoading) return;
    onClose();
  }, [isLoading, onClose]);

  const handleFileSelect = (selectedFile: File | null) => {
    setError(null);
    setSuccessMessage(null);
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || selectedFile.name.toLowerCase().endsWith('.docx')) {
        setFile(selectedFile);
        if (!isUpdateMode) { // Only auto-fill name on new upload
          setResumeName(selectedFile.name);
        }
      } else {
        setError('Invalid file type. Please upload a .docx file.');
        setFile(null);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Necessary to allow drop
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!file || !resumeName.trim()) {
      setError('Please provide a file and a name for the resume.');
      return;
    }
    
    const finalResumeName = truncateFileName(resumeName);

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const result = await uploadResume(apiUrl, userId, file, finalResumeName, resumeToUpdate?.ResumeId);

    setIsLoading(false);
    if (result.success) {
      setSuccessMessage(result.message || (isUpdateMode ? 'Resume updated successfully!' : 'Resume uploaded successfully!'));
      onUploadSuccess();
      setHasNewRequestNotification(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } else {
      setError(result.error || 'An unknown error occurred during upload.');
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose} aria-modal="true" role="dialog">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 border border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">{isUpdateMode ? 'Re-upload Resume' : 'Upload New Resume'}</h2>
            <button onClick={handleClose} disabled={isLoading} className="p-1.5 rounded-full hover:bg-slate-700 text-silver-medium transition-colors" aria-label="Close dialog">
                <XIcon className="w-5 h-5"/>
            </button>
        </div>
        
        <div className="space-y-6">
            {!file ? (
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={handleBrowseClick}
                    className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'}`}
                    role="button"
                    tabIndex={0}
                    aria-label="File upload area. Drag and drop a .docx file or click to browse."
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
                    />
                    <UploadCloudIcon className="w-12 h-12 text-slate-500 mb-4" />
                    <p className="text-silver-light font-semibold">Drag & drop or <span className="text-primary">browse</span></p>
                    <p className="text-sm text-silver-medium mt-1">.docx files only</p>
                </div>
            ) : (
                <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <DocumentTextIcon className="w-8 h-8 text-primary flex-shrink-0" />
                        <div className="overflow-hidden">
                           <p className="font-medium text-silver-light truncate" title={file.name}>{file.name}</p>
                           <p className="text-sm text-silver-medium">{Math.round(file.size / 1024)} KB</p>
                        </div>
                    </div>
                    <button onClick={() => setFile(null) } disabled={isLoading} className="p-1.5 rounded-full hover:bg-slate-700 text-silver-medium transition-colors flex-shrink-0" aria-label="Remove selected file">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </div>
            )}

            {file && (
                <div>
                    <label htmlFor="resumeName" className="block text-sm font-medium text-silver-light mb-1">Resume Name</label>
                    <input
                        type="text"
                        id="resumeName"
                        value={resumeName}
                        onChange={(e) => setResumeName(e.target.value)}
                        placeholder="e.g., Software_Engineer_Resume.docx"
                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                        disabled={isLoading}
                        required
                    />
                </div>
            )}
            
            {error && (
              <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-sm">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            )}
            
             {successMessage && (
              <div role="alert" className="p-3 bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg text-sm">
                <p className="font-bold">Success!</p>
                <p>{successMessage}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
                <button onClick={handleClose} disabled={isLoading} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50">Cancel</button>
                <button 
                    onClick={handleSubmit}
                    disabled={!file || isLoading || !resumeName.trim()}
                    className="flex min-w-[140px] items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner className="w-5 h-5" />
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <span>{isUpdateMode ? 'Update and Parse' : 'Save and Parse'}</span>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResumeModal;