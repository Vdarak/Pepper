
import React, { useState, useEffect, useCallback } from 'react';
import { JobDetails } from './types';
import { parseJobDetails } from './services/geminiService';
import Header from './components/Header';
import ConfigurationModal from './components/ConfigurationModal';
import JobParserForm from './components/JobParserForm';
import JsonEditor from './components/JsonEditor';
import LoginPage from './components/LoginPage';
import RequestDashboard from './components/RequestDashboard';
import { TAGLINES } from './constants/taglines';
import ResumeFAB from './components/ResumeFAB';
import ParticleBurst from './components/ParticleBurst';
import DarkVeil from './components/DarkVeil';

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const processRelativeDates = (jobDetails: JobDetails): JobDetails => {
  const postDateStr = jobDetails.post_date?.toLowerCase().trim();
  if (!postDateStr) {
    return jobDetails;
  }

  const now = new Date();
  let targetDate: Date | null = null;

  if (postDateStr.includes('today') || postDateStr.includes('just now') || postDateStr.includes('hour')) {
    targetDate = now;
  } 
  else if (postDateStr.includes('yesterday')) {
    const date = new Date(now);
    date.setDate(now.getDate() - 1);
    targetDate = date;
  } 
  else {
    const match = postDateStr.match(/(a|\d+)\s+(day|week|month)s?\s+ago/);
    
    if (match) {
        const quantity = match[1] === 'a' ? 1 : parseInt(match[1], 10);
        const unit = match[2];

        if (!isNaN(quantity)) {
            const date = new Date(now);
            if (unit.startsWith('day')) {
                date.setDate(now.getDate() - quantity);
            } else if (unit.startsWith('week')) {
                date.setDate(now.getDate() - quantity * 7);
            } else if (unit.startsWith('month')) {
                date.setMonth(now.getMonth() - quantity);
            }
            targetDate = date;
        }
    }
  }

  if (targetDate) {
    return {
      ...jobDetails,
      post_date: formatDate(targetDate),
    };
  }
  
  return jobDetails;
};

type AppConfig = {
  apiUrl: string;
};

type UserSession = {
  isLoggedIn: boolean;
  userId: string | null;
  userName: string | null;
}

export const App: React.FC = () => {
  // Auth and config state
  const [session, setSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('userSession');
    if (saved) {
      const { userId, userName } = JSON.parse(saved);
      return { isLoggedIn: !!userId, userId, userName };
    }
    return { isLoggedIn: false, userId: null, userName: null };
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    const savedConfig = localStorage.getItem('jobParserConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return { apiUrl: '' };
  });
  
  // App-specific state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedJson, setParsedJson] = useState<string>('');
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hasNewRequestNotification, setHasNewRequestNotification] = useState<boolean>(false);
  const [particleOrigin, setParticleOrigin] = useState<{ x: number; y: number; key: number } | null>(null);


  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('jobParserConfig', JSON.stringify(newConfig));
    setShowConfigModal(false);
  };

  const handleLoginSuccess = (userId: string, userName: string) => {
    const newSession = { isLoggedIn: true, userId, userName };
    setSession(newSession);
    localStorage.setItem('userSession', JSON.stringify({ userId, userName }));
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userSession');
    setSession({ isLoggedIn: false, userId: null, userName: null });
    // Also clear job-specific state on logout
    setParsedJson('');
    setError(null);
    setProcessingStatus(null);
  };

  const handleParse = useCallback(async (jobUrl: string, jobDescription: string, extraInfo: string) => {
    setIsLoading(true);
    setError(null);
    setParsedJson('');
    setProcessingStatus(null);
    
    if (!jobDescription.trim()) {
        setError('Job description text cannot be empty.');
        setIsLoading(false);
        return;
    }
    
    try {
      let result = await parseJobDetails(jobDescription, jobUrl, extraInfo);
      result = processRelativeDates(result);

      if (typeof result.referral === 'undefined') {
        result.referral = false;
      }
      
      const { description, ...rest } = result;
      const finalResult = { ...rest, description };

      setParsedJson(JSON.stringify(finalResult, null, 2));
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during parsing.';
      setError(`Failed to parse job details. ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCurationSuccess = (e: React.MouseEvent<HTMLButtonElement>) => {
    setHasNewRequestNotification(true);
    setParticleOrigin({
        x: e.clientX,
        y: e.clientY,
        key: Date.now(),
    });
    // Clear the form after a delay to allow particle animation to be seen
    setTimeout(() => {
        setParsedJson('');
    }, 1500);
  };

  return (
    <div className="min-h-screen font-sans text-silver-light flex flex-col relative isolate">
      <DarkVeil
        hueShift={45}
        noiseIntensity={0.0}
        scanlineIntensity={0.00}
        warpAmount={0.2}
        speed={0.5}
        resolutionScale={1.5}
      />
      <Header 
        onConfigureClick={() => setShowConfigModal(true)} 
        isProcessing={isLoading}
        isLoggedIn={session.isLoggedIn}
        userName={session.userName}
        onLogout={handleLogout}
        taglines={TAGLINES}
      />
      
      {!session.isLoggedIn ? (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess} 
          config={config} 
        />
      ) : (
        <div className="flex-grow flex flex-col relative">
          <RequestDashboard 
            apiUrl={config.apiUrl} 
            userId={session.userId!} 
            hasNewRequestNotification={hasNewRequestNotification}
            onDashboardOpen={() => setHasNewRequestNotification(false)}
          />
          <main className="container mx-auto max-w-4xl p-4 md:p-6 pt-8 flex-grow flex items-center">
            <div className="w-full bg-slate-750/25 backdrop-blur-xl rounded-2xl shadow-2xl shadow-white/25 p-6 md:p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-primary mb-2">Parse a New Job Posting</h2>
              <p className="text-sm mb-6">
                Paste the job URL and the full text of the job description below. The AI will extract the details into a structured JSON format.
              </p>
              
              <JobParserForm onParse={handleParse} isLoading={isLoading} />
              
              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg">
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
              )}

              {parsedJson && (
                <JsonEditor 
                  jsonString={parsedJson} 
                  setJsonString={setParsedJson} 
                  processingStatus={processingStatus}
                  setProcessingStatus={setProcessingStatus}
                  onCurationSuccess={handleCurationSuccess}
                  apiUrl={config.apiUrl}
                  userId={session.userId!}
                />
              )}
            </div>
          </main>
          <ResumeFAB 
            apiUrl={config.apiUrl} 
            userId={session.userId!} 
            setHasNewRequestNotification={setHasNewRequestNotification} 
          />
        </div>
      )}
      
      {showConfigModal && (
        <ConfigurationModal
          config={config}
          onSave={handleSaveConfig}
          onClose={() => setShowConfigModal(false)}
        />
      )}
      {particleOrigin && (
        <ParticleBurst
          key={particleOrigin.key}
          origin={particleOrigin}
          onComplete={() => setParticleOrigin(null)}
        />
      )}
    </div>
  );
};