

import React, { useState } from 'react';
import { DocumentTextIcon, UploadIcon, ResumeCenterIcon, ArrowUpRightIcon, XIcon } from './icons';
import UploadResumeModal from './UploadResumeModal';
import ResumeCenter from './ResumeCenter';

interface ResumeFABProps {
  apiUrl: string;
  userId: string;
  setHasNewRequestNotification: (value: boolean) => void;
}

const ResumeFAB: React.FC<ResumeFABProps> = ({ apiUrl, userId, setHasNewRequestNotification }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isResumeCenterOpen, setIsResumeCenterOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  const closeAll = () => {
    setIsOpen(false);
  }

  const handleUploadClick = () => {
    closeAll();
    setIsUploadModalOpen(true);
  };

  const handleResumeCenterClick = () => {
    closeAll();
    setIsResumeCenterOpen(true);
  };

  const handleUploadFromCenter = () => {
    setIsResumeCenterOpen(false);
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    // A notification is now triggered from the modal itself.
    // This function can be used for other side effects, like refreshing a list.
    console.log("Resume uploaded successfully! A data refresh could be triggered here.");
  };

  const optionContainerClasses = `
    flex flex-col items-start gap-4 transition-all duration-300 ease-in-out
    ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
  `;

  const optionButtonClasses = `
    flex w-full items-center justify-between px-4 py-3 bg-slate-800/30 backdrop-blur-lg border 
    border-white/10 rounded-2xl shadow-lg text-silver-light font-medium whitespace-nowrap 
    hover:bg-slate-800/50 transition-colors
  `;

  return (
    <>
      <div className="fixed bottom-6 left-6 z-30 flex flex-col items-start gap-4">
        {/* Options Container */}
        <div id="resume-menu" className={optionContainerClasses} role="menu" aria-orientation="vertical" aria-labelledby="resume-fab-button" hidden={!isOpen}>
          <button
            role="menuitem"
            className={optionButtonClasses}
            onClick={handleResumeCenterClick}
            tabIndex={isOpen ? 0 : -1}
          >
            <div className="flex items-center gap-4">
              <ResumeCenterIcon className="w-6 h-6 text-primary" />
              <span>Open Resume Center</span>
            </div>
            <ArrowUpRightIcon className="w-4 h-4 text-silver-medium" />
          </button>
          
          <button
            role="menuitem"
            className={optionButtonClasses}
            onClick={handleUploadClick}
            tabIndex={isOpen ? 0 : -1}
          >
            <div className="flex items-center gap-4">
              <UploadIcon className="w-6 h-6 text-primary" />
              <span>Upload Resume</span>
            </div>
          </button>
        </div>

        {/* Main FAB */}
        <button
          id="resume-fab-button"
          onClick={handleToggle}
          className="flex items-center gap-4 px-5 py-3 bg-primary/20 backdrop-blur-lg border border-white/10 hover:bg-primary/30 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls="resume-menu"
          aria-label={isOpen ? 'Close resume options' : 'Open resume options'}
        >
          <div className="relative w-6 h-6">
              <DocumentTextIcon className={`absolute inset-0 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0 transform scale-50 rotate-[-45deg]' : 'opacity-100 transform scale-100 rotate-0'}`} />
              <XIcon className={`absolute inset-0 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 transform scale-100 rotate-0' : 'opacity-0 transform scale-50 rotate-45'}`} />
          </div>
          <span>Resume Menu</span>
        </button>
      </div>
      
      <UploadResumeModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        apiUrl={apiUrl}
        userId={userId}
        setHasNewRequestNotification={setHasNewRequestNotification}
      />

      <ResumeCenter
        isOpen={isResumeCenterOpen}
        onClose={() => setIsResumeCenterOpen(false)}
        apiUrl={apiUrl}
        userId={userId}
        onUploadClick={handleUploadFromCenter}
        setHasNewRequestNotification={setHasNewRequestNotification}
      />
    </>
  );
};

export default ResumeFAB;